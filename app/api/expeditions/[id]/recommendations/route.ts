import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';

interface CourseRecommendation {
  id: string;
  departure: string;
  arrival: string;
  departureDate: string;
  estimatedArrival?: string;
  maxWeight: number;
  pricePerKg: number;
  vehicleType?: string;
  description: string;
  availableSpace: number;
  transporter: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    rating: number;
    reviewCount: number;
  };
  matchScore: number;
  estimatedPrice: number;
  reasons: string[];
}

// GET - Récupérer les recommandations de trajets pour une expédition
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token manquant'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Token invalide'
      }, { status: 401 });
    }

    const resolvedParams = await params;
    const expeditionId = resolvedParams.id;

    // Récupérer l'expédition
    const expedition = await prisma.expedition.findUnique({
      where: { id: expeditionId },
      select: {
        id: true,
        departureCity: true,
        arrivalCity: true,
        departureDate: true,
        weight: true,
        volume: true,
        requiresPL: true,
        maxBudget: true,
        clientId: true
      }
    });

    if (!expedition) {
      return NextResponse.json({
        success: false,
        message: 'Expédition introuvable'
      }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'expédition
    if (expedition.clientId !== decoded.userId) {
      return NextResponse.json({
        success: false,
        message: 'Accès non autorisé'
      }, { status: 403 });
    }

    // Récupérer tous les trajets disponibles
    const allCourses = await prisma.course.findMany({
      where: {
        status: 'AVAILABLE',
        isActive: true,
        // Date de départ pas trop éloignée (dans les 30 jours)
        departureDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours avant
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours après
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
      }
    });

    // Algorithme de scoring et de filtrage
    const recommendations: CourseRecommendation[] = [];

    for (const course of allCourses) {
      let matchScore = 0;
      const reasons: string[] = [];
      
      // === CRITÈRES OBLIGATOIRES ===
      
      // 1. Vérification des villes (obligatoire)
      const departureMatch = course.departure.toLowerCase().includes(expedition.departureCity.toLowerCase()) ||
                            expedition.departureCity.toLowerCase().includes(course.departure.toLowerCase());
      const arrivalMatch = course.arrival.toLowerCase().includes(expedition.arrivalCity.toLowerCase()) ||
                          expedition.arrivalCity.toLowerCase().includes(course.arrival.toLowerCase());
      
      if (!departureMatch || !arrivalMatch) {
        continue; // Skip ce trajet s'il ne correspond pas aux villes
      }
      
      matchScore += 100; // Base score pour correspondance villes
      reasons.push('Trajet compatible avec vos villes');

      // 2. Vérification du type de véhicule (obligatoire si PL requis)
      if (expedition.requiresPL && course.vehicleType !== 'PL') {
        continue; // Skip si PL requis mais trajet en VL
      }
      
      if (expedition.requiresPL && course.vehicleType === 'PL') {
        matchScore += 50;
        reasons.push('Poids lourd disponible');
      }

      // 3. Vérification de la capacité en poids (obligatoire)
      if (course.maxWeight < expedition.weight) {
        continue; // Skip si le trajet ne peut pas porter le poids
      }
      
      matchScore += 30;
      reasons.push('Capacité de poids suffisante');

      // === CRITÈRES DE SCORING ===

      // 4. Proximité de la date (scoring progressif)
      const expeditionDate = new Date(expedition.departureDate);
      const courseDate = new Date(course.departureDate);
      const dayDifference = Math.abs((courseDate.getTime() - expeditionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDifference === 0) {
        matchScore += 50;
        reasons.push('Date exacte');
      } else if (dayDifference <= 1) {
        matchScore += 40;
        reasons.push('Date très proche');
      } else if (dayDifference <= 3) {
        matchScore += 30;
        reasons.push('Date proche');
      } else if (dayDifference <= 7) {
        matchScore += 15;
        reasons.push('Date acceptable');
      }

      // 5. Capacité de poids supérieure (bonus pour marge)
      const weightMargin = (course.maxWeight - expedition.weight) / expedition.weight;
      if (weightMargin > 0.5) {
        matchScore += 20;
        reasons.push('Large capacité disponible');
      } else if (weightMargin > 0.2) {
        matchScore += 10;
        reasons.push('Bonne capacité disponible');
      }

      // 6. Espace disponible
      if (course.availableSpace > 1) {
        matchScore += 10;
        reasons.push('Plusieurs places disponibles');
      }

      // 7. Rating du transporteur
      if (course.transporter.rating >= 4.5) {
        matchScore += 20;
        reasons.push('Transporteur très bien noté');
      } else if (course.transporter.rating >= 4.0) {
        matchScore += 10;
        reasons.push('Transporteur bien noté');
      }

      // 8. Prix attractif (si budget défini)
      const estimatedPrice = expedition.weight * course.pricePerKg;
      if (expedition.maxBudget) {
        const priceRatio = estimatedPrice / expedition.maxBudget;
        if (priceRatio <= 0.7) {
          matchScore += 25;
          reasons.push('Prix très avantageux');
        } else if (priceRatio <= 0.9) {
          matchScore += 15;
          reasons.push('Prix attractif');
        } else if (priceRatio <= 1.0) {
          matchScore += 5;
          reasons.push('Dans votre budget');
        }
      }

      // Ajouter à la liste des recommandations
      recommendations.push({
        id: course.id,
        departure: course.departure,
        arrival: course.arrival,
        departureDate: course.departureDate.toISOString(),
        estimatedArrival: course.estimatedArrival?.toISOString(),
        maxWeight: course.maxWeight,
        pricePerKg: course.pricePerKg,
        vehicleType: course.vehicleType || undefined,
        description: course.description,
        availableSpace: course.availableSpace,
        transporter: {
          ...course.transporter,
          companyName: course.transporter.companyName || undefined
        },
        matchScore,
        estimatedPrice,
        reasons
      });
    }

    // Trier par score décroissant et prendre les 3 meilleurs
    const topRecommendations = recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      recommendations: topRecommendations,
      total: recommendations.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur serveur'
    }, { status: 500 });
  }
} 