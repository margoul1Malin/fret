import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const transporterId = resolvedParams.id;

    // Vérifier que l'utilisateur existe et est un transporteur
    const transporter = await prisma.user.findUnique({
      where: {
        id: transporterId,
        userType: 'TRANSPORTER'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
        userType: true,
        isActive: true,
        email: true,
        phone: true
      }
    });

    if (!transporter) {
      return NextResponse.json({
        success: false,
        message: 'Transporteur introuvable'
      }, { status: 404 });
    }

    // Récupérer les avis reçus par ce transporteur
    const reviews = await prisma.review.findMany({
      where: {
        reviewedId: transporterId
      },
      include: {
        reviewer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limiter à 20 avis les plus récents
    });

    // Récupérer les trajets récents du transporteur
    const courses = await prisma.course.findMany({
      where: {
        transporterId: transporterId,
        isActive: true
      },
      select: {
        id: true,
        departure: true,
        arrival: true,
        departureDate: true,
        pricePerKg: true,
        maxWeight: true,
        availableSpace: true,
        vehicleType: true,
        status: true
      },
      orderBy: {
        departureDate: 'desc'
      },
      take: 10 // Limiter à 10 trajets récents
    });

    return NextResponse.json({
      success: true,
      data: {
        transporter,
        reviews,
        courses
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil transporteur:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 