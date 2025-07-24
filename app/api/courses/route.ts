import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromRequest, verifyToken, UserType } from '@/lib/auth';

// GET - Lister tous les trajets disponibles avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departure = searchParams.get('departure');
    const arrival = searchParams.get('arrival');
    const date = searchParams.get('date');
    const minWeight = searchParams.get('minWeight');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Construire les filtres
    const where: Record<string, unknown> = {
      isActive: true,
      status: 'AVAILABLE',
      departureDate: {
        gte: new Date() // Seulement les trajets futurs
      }
    };

    if (departure) {
      where.departure = {
        contains: departure,
        mode: 'insensitive'
      };
    }

    if (arrival) {
      where.arrival = {
        contains: arrival,
        mode: 'insensitive'
      };
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.departureDate = {
        gte: searchDate,
        lt: nextDay
      };
    }

    if (minWeight) {
      where.maxWeight = {
        gte: parseFloat(minWeight)
      };
    }

    if (maxPrice) {
      where.pricePerKg = {
        lte: parseFloat(maxPrice)
      };
    }

    // Récupérer les trajets avec pagination
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          transporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              rating: true,
              reviewCount: true,
              isVerified: true
            }
          },
          bookings: {
            select: {
              packageWeight: true,
              status: true
            }
          }
        },
        orderBy: {
          departureDate: 'asc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.course.count({ where })
    ]);

    // Calculer le poids disponible pour chaque trajet
    const coursesWithAvailability = courses.map((course: { bookings: Array<{ status: string; packageWeight: number }>; maxWeight: number; [key: string]: unknown }) => {
      const bookedWeight = course.bookings
        .filter((booking) => booking.status !== 'CANCELLED')
        .reduce((sum: number, booking) => sum + booking.packageWeight, 0);
      
      const availableWeight = course.maxWeight - bookedWeight;

      return {
        ...course,
        bookedWeight,
        availableWeight,
        bookings: undefined // Ne pas exposer les détails des réservations
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        courses: coursesWithAvailability,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des trajets:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// POST - Créer un nouveau trajet (transporteurs uniquement)
export async function POST(request: NextRequest) {
  try {
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

    // Vérifier que c'est un transporteur
    if (payload.userType !== UserType.TRANSPORTER) {
      return NextResponse.json({
        success: false,
        message: 'Seuls les transporteurs peuvent créer des trajets'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      departure,
      arrival,
      stops = [],
      departureDate,
      estimatedArrival,
      maxWeight,
      pricePerKg,
      minPackageWeight = 0,
      maxPackageWeight,
      description,
      availableSpace = 1,
      vehicleType
    } = body;

    // Validation des champs requis
    if (!departure || !arrival || !departureDate || !maxWeight || !pricePerKg || !description) {
      return NextResponse.json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      }, { status: 400 });
    }

    // Valider que la date de départ est dans le futur
    const depDate = new Date(departureDate);
    if (depDate <= new Date()) {
      return NextResponse.json({
        success: false,
        message: 'La date de départ doit être dans le futur'
      }, { status: 400 });
    }

    // Valider les poids
    if (maxWeight <= 0 || pricePerKg <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Le poids maximum et le prix doivent être positifs'
      }, { status: 400 });
    }

    if (maxPackageWeight && maxPackageWeight > maxWeight) {
      return NextResponse.json({
        success: false,
        message: 'Le poids maximum par colis ne peut pas dépasser le poids maximum total'
      }, { status: 400 });
    }

    // Traiter les escales (extraire seulement les noms de villes)
    const processedStops = stops.map((stop: string | { city: string }) => {
      if (typeof stop === 'string') {
        return stop.trim();
      } else if (stop && stop.city) {
        return stop.city.trim();
      }
      return '';
    }).filter((city: string) => city.length > 0);

    // Créer le trajet
    const course = await prisma.course.create({
      data: {
        transporterId: payload.userId,
        departure: departure.trim(),
        arrival: arrival.trim(),
        stops: processedStops,
        departureDate: depDate,
        estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
        maxWeight: parseFloat(maxWeight),
        pricePerKg: parseFloat(pricePerKg),
        minPackageWeight: parseFloat(minPackageWeight),
        maxPackageWeight: maxPackageWeight ? parseFloat(maxPackageWeight) : null,
        description: description.trim(),
        availableSpace: parseInt(availableSpace),
        vehicleType: vehicleType || null
      },
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
      message: 'Trajet créé avec succès',
      data: course
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création du trajet:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 