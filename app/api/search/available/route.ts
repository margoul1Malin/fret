import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'utilisateur connecté (optionnel)
    let userType = null;
    const token = extractTokenFromRequest(request);
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userType = payload.userType;
      }
    }

    const today = new Date();
    const results: {
      expeditions: unknown[];
      courses: unknown[];
    } = {
      expeditions: [],
      courses: []
    };

    // Charger les expéditions disponibles (pour transporteurs et admins)
    if (userType === 'TRANSPORTER' || userType === 'ADMIN' || !userType) {
      const expeditions = await prisma.expedition.findMany({
        where: {
          status: {
            in: ['PUBLISHED', 'OFFERS_RECEIVED']
          },
          isActive: true,
          departureDate: {
            gte: today
          }
        },
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
        ],
        take: 20 // Limiter à 20 résultats pour les performances
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

    // Charger les trajets disponibles (pour expéditeurs et admins)
    if (userType === 'CLIENT' || userType === 'ADMIN' || !userType) {
      const courses = await prisma.course.findMany({
        where: {
          status: 'AVAILABLE',
          isActive: true,
          departureDate: {
            gte: today
          }
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
        },
        orderBy: [
          { departureDate: 'asc' },
          { pricePerKg: 'asc' }
        ],
        take: 20 // Limiter à 20 résultats pour les performances
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
        userType,
        counts: {
          expeditions: results.expeditions.length,
          courses: results.courses.length
        },
        message: 'Tous les trajets et expéditions disponibles'
      }
    });

  } catch (error) {
    console.error('Erreur lors du chargement des données disponibles:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 