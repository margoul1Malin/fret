import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET /api/expeditions/[id] - Récupérer une expédition spécifique
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token d\'authentification manquant' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Récupérer l'utilisateur pour connaître son type
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { userType: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Utilisateur non trouvé' }, { status: 401 });
    }

    const expedition = await prisma.expedition.findUnique({
      where: {
        id: resolvedParams.id,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        offers: {
          include: {
            transporter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                rating: true,
                reviewCount: true,
                companyName: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!expedition) {
      return NextResponse.json({ success: false, message: 'Expédition non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a accès à cette expédition
    // Les clients peuvent voir leurs propres expéditions
    // Les transporteurs et admins peuvent voir toutes les expéditions
    if (user.userType === 'CLIENT' && expedition.clientId !== decoded.userId) {
      return NextResponse.json({ success: false, message: 'Accès non autorisé' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      expedition: {
        ...expedition,
        currentOffers: expedition.offers.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'expédition:', error);
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// PUT /api/expeditions/[id] - Modifier une expédition
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token d\'authentification manquant' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Vérifier que l'expédition existe et appartient à l'utilisateur
    const existingExpedition = await prisma.expedition.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!existingExpedition) {
      return NextResponse.json({ success: false, message: 'Expédition non trouvée' }, { status: 404 });
    }

    if (existingExpedition.clientId !== decoded.userId) {
      return NextResponse.json({ success: false, message: 'Accès non autorisé' }, { status: 403 });
    }

    // Vérifier que l'expédition peut être modifiée (seulement si DRAFT ou PUBLISHED)
    if (!['DRAFT', 'PUBLISHED'].includes(existingExpedition.status)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cette expédition ne peut plus être modifiée' 
      }, { status: 400 });
    }

    const body = await request.json();
    const {
      departureCity,
      arrivalCity,
      departureDate,
      weight,
      volume,
      description,
      value,
      isFragile,
      requiresPL,
      urgency,
      maxBudget,
      notes
    } = body;

    // Validation des données
    if (!departureCity || !arrivalCity || !departureDate || !weight || !volume || !description) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tous les champs obligatoires doivent être remplis' 
      }, { status: 400 });
    }

    if (weight <= 0 || volume < 0.00001) {
      return NextResponse.json({ 
        success: false, 
        message: 'Le poids doit être supérieur à 0 et le volume supérieur à 0.00001 m³' 
      }, { status: 400 });
    }

    // Mettre à jour l'expédition
    const updatedExpedition = await prisma.expedition.update({
      where: { id: resolvedParams.id },
      data: {
        departureCity,
        arrivalCity,
        departureDate: new Date(departureDate),
        weight: parseFloat(weight),
        volume: parseFloat(volume),
        description,
        value: value ? parseFloat(value) : null,
        isFragile: Boolean(isFragile),
        requiresPL: Boolean(requiresPL),
        urgency: urgency || 'normal',
        maxBudget: maxBudget ? parseFloat(maxBudget) : null,
        notes: notes || null,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Expédition modifiée avec succès',
      expedition: updatedExpedition
    });

  } catch (error) {
    console.error('Erreur lors de la modification de l\'expédition:', error);
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// DELETE /api/expeditions/[id] - Supprimer une expédition
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token d\'authentification manquant' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Vérifier que l'expédition existe et appartient à l'utilisateur
    const expedition = await prisma.expedition.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!expedition) {
      return NextResponse.json({ success: false, message: 'Expédition non trouvée' }, { status: 404 });
    }

    if (expedition.clientId !== decoded.userId) {
      return NextResponse.json({ success: false, message: 'Accès non autorisé' }, { status: 403 });
    }

    // Vérifier que l'expédition peut être supprimée (avant assignation)
    if (!['DRAFT', 'PUBLISHED'].includes(expedition.status)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cette expédition ne peut plus être supprimée car elle est déjà en cours de traitement' 
      }, { status: 400 });
    }

    // Supprimer l'expédition (les offres seront supprimées automatiquement grâce à onDelete: Cascade)
    await prisma.expedition.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Expédition supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'expédition:', error);
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 });
  }
} 