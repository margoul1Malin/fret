import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const transporterId = resolvedParams.id;

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

    // Vérifier que l'utilisateur est un client
    if (payload.userType !== 'CLIENT') {
      return NextResponse.json({
        success: false,
        message: 'Seuls les expéditeurs peuvent laisser des avis'
      }, { status: 403 });
    }

    // Vérifier que le transporteur existe
    const transporter = await prisma.user.findUnique({
      where: {
        id: transporterId,
        userType: 'TRANSPORTER'
      }
    });

    if (!transporter) {
      return NextResponse.json({
        success: false,
        message: 'Transporteur introuvable'
      }, { status: 404 });
    }

    // Vérifier qu'on ne peut pas s'auto-évaluer
    if (payload.userId === transporterId) {
      return NextResponse.json({
        success: false,
        message: 'Vous ne pouvez pas vous évaluer vous-même'
      }, { status: 400 });
    }

    // Vérifier qu'on n'a pas déjà laissé un avis pour ce transporteur
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: payload.userId,
        reviewedId: transporterId
      }
    });

    if (existingReview) {
      return NextResponse.json({
        success: false,
        message: 'Vous avez déjà laissé un avis pour ce transporteur'
      }, { status: 400 });
    }

    // Récupérer les données de la requête
    const body = await request.json();
    const { rating, comment } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        message: 'La note doit être comprise entre 1 et 5'
      }, { status: 400 });
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        reviewerId: payload.userId,
        reviewedId: transporterId,
        rating: parseInt(rating),
        comment: comment || null
      },
      include: {
        reviewer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Recalculer et mettre à jour la note moyenne et le nombre d'avis du transporteur
    const allReviews = await prisma.review.findMany({
      where: {
        reviewedId: transporterId
      },
      select: {
        rating: true
      }
    });

    const totalReviews = allReviews.length;
    const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    await prisma.user.update({
      where: {
        id: transporterId
      },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Arrondir à 1 décimale
        reviewCount: totalReviews
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Avis publié avec succès',
      data: review
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 