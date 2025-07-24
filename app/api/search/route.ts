import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departure = searchParams.get('departure');
    const arrival = searchParams.get('arrival');
    const date = searchParams.get('date');
    const maxWeight = searchParams.get('maxWeight');
    const maxVolume = searchParams.get('maxVolume');
    const maxPrice = searchParams.get('maxPrice');

    // Validation des paramètres obligatoires
    if (!departure || !arrival) {
      return NextResponse.json({
        success: false,
        message: 'Les paramètres departure et arrival sont obligatoires'
      }, { status: 400 });
    }

    // Vérifier l'utilisateur connecté (optionnel)
    let userType = null;
    const token = extractTokenFromRequest(request);
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userType = payload.userType;
      }
    }

    let searchDate: Date | null = null;
    let nextDay: Date | null = null;
    
    if (date) {
      searchDate = new Date(date);
      nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
    }

    const results: {
      expeditions: unknown[];
      courses: unknown[];
    } = {
      expeditions: [],
      courses: []
    };

    // Recherche d'expéditions (pour transporteurs et admins)
    if (userType === 'TRANSPORTER' || userType === 'ADMIN' || !userType) {
      const expeditionFilters: Record<string, unknown> = {
        status: {
          in: ['PUBLISHED', 'OFFERS_RECEIVED']
        },
        isActive: true,
        ...(searchDate && nextDay && {
          departureDate: {
            gte: searchDate,
            lt: nextDay
          }
        }),
        OR: [
          { departureCity: { contains: departure, mode: 'insensitive' } },
          { departureAddress: { contains: departure, mode: 'insensitive' } }
        ],
        AND: [
          {
            OR: [
              { arrivalCity: { contains: arrival, mode: 'insensitive' } },
              { arrivalAddress: { contains: arrival, mode: 'insensitive' } }
            ]
          }
        ]
      };

      // Filtres optionnels
      if (maxWeight) {
        expeditionFilters.weight = { lte: parseFloat(maxWeight) };
      }
      if (maxVolume) {
        expeditionFilters.volume = { lte: parseFloat(maxVolume) };
      }
      if (maxPrice) {
        expeditionFilters.maxBudget = { lte: parseFloat(maxPrice) };
      }

      const expeditions = await prisma.expedition.findMany({
        where: expeditionFilters,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              rating: true,
              reviewCount: true
            }
          },
          offers: {
            where: {
              status: 'PENDING'
            }
          }
        },
        orderBy: [
          { urgency: 'desc' },
          { departureDate: 'asc' }
        ]
      });

      results.expeditions = expeditions.map(expedition => ({
        id: expedition.id,
        departureCity: expedition.departureCity,
        departureAddress: expedition.departureAddress,
        arrivalCity: expedition.arrivalCity,
        arrivalAddress: expedition.arrivalAddress,
        departureDate: expedition.departureDate,
        weight: expedition.weight,
        volume: expedition.volume,
        maxBudget: expedition.maxBudget,
        description: expedition.description,
        urgency: expedition.urgency,
        isFragile: expedition.isFragile,
        requiresPL: expedition.requiresPL,
        client: expedition.client,
        currentOffers: expedition.offers.length
      }));
    }

    // Recherche de trajets (pour expéditeurs et admins)
    if (userType === 'CLIENT' || userType === 'ADMIN' || !userType) {
      const courseFilters: Record<string, unknown> = {
        status: 'AVAILABLE',
        isActive: true,
        ...(searchDate && nextDay && {
          departureDate: {
            gte: searchDate,
            lt: nextDay
          }
        }),
        departure: { contains: departure, mode: 'insensitive' },
        OR: [
          { arrival: { contains: arrival, mode: 'insensitive' } },
          { stops: { has: arrival } }
        ]
      };

      // Filtres optionnels
      if (maxWeight) {
        courseFilters.maxWeight = { gte: parseFloat(maxWeight) };
      }
      if (maxVolume) {
        courseFilters.availableSpace = { gte: parseFloat(maxVolume) };
      }
      if (maxPrice && maxWeight) {
        // Calculer le prix total basé sur le poids
        const totalPrice = parseFloat(maxPrice);
        const weightKg = parseFloat(maxWeight);
        const maxPricePerKg = totalPrice / weightKg;
        courseFilters.pricePerKg = { lte: maxPricePerKg };
      }

      const courses = await prisma.course.findMany({
        where: courseFilters,
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
        },
        orderBy: [
          { departureDate: 'asc' },
          { pricePerKg: 'asc' }
        ]
      });

      results.courses = courses.map(course => ({
        id: course.id,
        departure: course.departure,
        arrival: course.arrival,
        stops: course.stops,
        departureDate: course.departureDate,
        estimatedArrival: course.estimatedArrival,
        maxWeight: course.maxWeight,
        availableSpace: course.availableSpace,
        pricePerKg: course.pricePerKg,
        vehicleType: course.vehicleType,
        description: course.description,
        transporter: course.transporter
      }));
    }

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        searchParams: {
          departure,
          arrival,
          date,
          maxWeight,
          maxVolume,
          maxPrice
        },
        userType,
        counts: {
          expeditions: results.expeditions.length,
          courses: results.courses.length
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 