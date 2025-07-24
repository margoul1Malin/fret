import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromRequest, verifyToken, UserType } from '@/lib/auth';

// GET - Récupérer les trajets du transporteur connecté
export async function GET(request: NextRequest) {
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
        message: 'Seuls les transporteurs peuvent accéder à cette ressource'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Construire les filtres
    const where: Record<string, unknown> = {
      transporterId: payload.userId
    };

    if (status) {
      where.status = status;
    }

    // Récupérer les trajets avec pagination
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          bookings: {
            select: {
              id: true,
              packageWeight: true,
              packageCount: true,
              totalPrice: true,
              status: true,
              createdAt: true,
              client: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  rating: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: {
          departureDate: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.course.count({ where })
    ]);

    // Calculer les statistiques pour chaque trajet
    const coursesWithStats = courses.map((course: { bookings: Array<{ status: string; packageWeight: number; totalPrice: number }>; maxWeight: number; [key: string]: unknown }) => {
      const activeBookings = course.bookings.filter((booking) => booking.status !== 'CANCELLED');
      const bookedWeight = activeBookings.reduce((sum: number, booking) => sum + booking.packageWeight, 0);
      const totalRevenue = activeBookings
        .filter((booking) => booking.status === 'DELIVERED')
        .reduce((sum: number, booking) => sum + booking.totalPrice, 0);
      
      const availableWeight = course.maxWeight - bookedWeight;
      const occupancyRate = (bookedWeight / course.maxWeight) * 100;

      return {
        ...course,
        stats: {
          totalBookings: activeBookings.length,
          bookedWeight,
          availableWeight,
          occupancyRate: Math.round(occupancyRate),
          totalRevenue,
          pendingBookings: course.bookings.filter((booking) => booking.status === 'PENDING').length
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        courses: coursesWithStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des trajets du transporteur:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 