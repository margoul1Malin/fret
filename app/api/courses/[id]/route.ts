import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';

// GET - Récupérer un trajet spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        transporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            rating: true,
            reviewCount: true,
            isVerified: true,
            phone: true,
            email: true
          }
        },
        bookings: {
          select: {
            id: true,
            packageWeight: true,
            packageCount: true,
            totalPrice: true,
            pickupPoint: true,
            deliveryPoint: true,
            status: true,
            createdAt: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                rating: true
              }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({
        success: false,
        message: 'Trajet non trouvé'
      }, { status: 404 });
    }

    // Calculer les informations de disponibilité
    const bookedWeight = course.bookings
      .filter((booking: { status: string }) => booking.status !== 'CANCELLED')
      .reduce((sum: number, booking: { packageWeight: number }) => sum + booking.packageWeight, 0);
    
    const availableWeight = course.maxWeight - bookedWeight;
    const occupancyRate = (bookedWeight / course.maxWeight) * 100;

    return NextResponse.json({
      success: true,
      data: {
        ...course,
        bookedWeight,
        availableWeight,
        occupancyRate: Math.round(occupancyRate)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du trajet:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// PUT - Modifier un trajet (propriétaire uniquement)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    // Vérifier l'authentification
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token manquant'
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Token invalide'
      }, { status: 401 });
    }

    // Vérifier que le trajet existe et appartient à l'utilisateur
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        bookings: {
          where: {
            status: {
              not: 'CANCELLED'
            }
          }
        }
      }
    });

    if (!existingCourse) {
      return NextResponse.json({
        success: false,
        message: 'Trajet non trouvé'
      }, { status: 404 });
    }

    if (existingCourse.transporterId !== payload.userId) {
      return NextResponse.json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce trajet'
      }, { status: 403 });
    }

    // Vérifier que le trajet n'a pas encore commencé
    if (existingCourse.status === 'IN_PROGRESS' || existingCourse.status === 'COMPLETED') {
      return NextResponse.json({
        success: false,
        message: 'Impossible de modifier un trajet en cours ou terminé'
      }, { status: 400 });
    }

    const body = await request.json();
    const {
      departure,
      arrival,
      stops,
      departureDate,
      estimatedArrival,
      maxWeight,
      pricePerKg,
      minPackageWeight,
      maxPackageWeight,
      description,
      availableSpace,
      vehicleType,
      status
    } = body;

    // Si on modifie le poids maximum, vérifier qu'il reste suffisant pour les réservations existantes
    if (maxWeight !== undefined) {
      const bookedWeight = existingCourse.bookings.reduce((sum: number, booking: { packageWeight: number }) => {
        return sum + booking.packageWeight;
      }, 0);

      if (parseFloat(maxWeight) < bookedWeight) {
        return NextResponse.json({
          success: false,
          message: `Impossible de réduire le poids maximum en dessous de ${bookedWeight}kg (poids déjà réservé)`
        }, { status: 400 });
      }
    }

    // Préparer les données à mettre à jour
    const updateData: Record<string, unknown> = {};
    
    if (departure !== undefined) updateData.departure = departure.trim();
    if (arrival !== undefined) updateData.arrival = arrival.trim();
    if (stops !== undefined) updateData.stops = stops.map((stop: string) => stop.trim());
    if (departureDate !== undefined) {
      const depDate = new Date(departureDate);
      if (depDate <= new Date()) {
        return NextResponse.json({
          success: false,
          message: 'La date de départ doit être dans le futur'
        }, { status: 400 });
      }
      updateData.departureDate = depDate;
    }
    if (estimatedArrival !== undefined) updateData.estimatedArrival = estimatedArrival ? new Date(estimatedArrival) : null;
    if (maxWeight !== undefined) updateData.maxWeight = parseFloat(maxWeight);
    if (pricePerKg !== undefined) updateData.pricePerKg = parseFloat(pricePerKg);
    if (minPackageWeight !== undefined) updateData.minPackageWeight = parseFloat(minPackageWeight);
    if (maxPackageWeight !== undefined) updateData.maxPackageWeight = maxPackageWeight ? parseFloat(maxPackageWeight) : null;
    if (description !== undefined) updateData.description = description.trim();
    if (availableSpace !== undefined) updateData.availableSpace = parseInt(availableSpace);
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (status !== undefined) updateData.status = status;

    // Mettre à jour le trajet
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        transporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            rating: true,
            reviewCount: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Trajet mis à jour avec succès',
      data: updatedCourse
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du trajet:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// DELETE - Supprimer un trajet (propriétaire uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    // Vérifier l'authentification
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token manquant'
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Token invalide'
      }, { status: 401 });
    }

    // Vérifier que le trajet existe et appartient à l'utilisateur
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED']
            }
          }
        }
      }
    });

    if (!existingCourse) {
      return NextResponse.json({
        success: false,
        message: 'Trajet non trouvé'
      }, { status: 404 });
    }

    if (existingCourse.transporterId !== payload.userId) {
      return NextResponse.json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce trajet'
      }, { status: 403 });
    }

    // Vérifier qu'il n'y a pas de réservations actives
    if (existingCourse.bookings.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Impossible de supprimer un trajet avec des réservations actives'
      }, { status: 400 });
    }

    // Supprimer le trajet
    await prisma.course.delete({
      where: { id: courseId }
    });

    return NextResponse.json({
      success: true,
      message: 'Trajet supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du trajet:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 