import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET /api/expeditions - Lister les expéditions de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token d\'authentification manquant' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const expeditions = await prisma.expedition.findMany({
      where: {
        clientId: decoded.userId,
      },
      include: {
        offers: {
          include: {
            transporter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                rating: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      expeditions: expeditions.map(expedition => ({
        ...expedition,
        currentOffers: expedition.offers.length
      }))
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des expéditions:', error);
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// POST /api/expeditions - Créer une nouvelle expédition
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Token d\'authentification manquant' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Vérifier que l'utilisateur est un CLIENT
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.userType !== 'CLIENT') {
      return NextResponse.json({ success: false, message: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const {
      departureAddress,
      departureCity,
      departurePostalCode,
      arrivalAddress,
      arrivalCity,
      arrivalPostalCode,
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
    if (!departureAddress || !departureCity || !arrivalAddress || !arrivalCity || !departureDate || !weight || !volume || !description) {
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

    // Créer l'expédition
    const expedition = await prisma.expedition.create({
      data: {
        clientId: decoded.userId,
        departureAddress,
        departureCity,
        departurePostalCode: departurePostalCode || null,
        arrivalAddress,
        arrivalCity,
        arrivalPostalCode: arrivalPostalCode || null,
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
        status: 'PUBLISHED' // Directement publié pour commencer à recevoir des offres
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Expédition créée avec succès',
      expedition
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de l\'expédition:', error);
    return NextResponse.json({ success: false, message: 'Erreur interne du serveur' }, { status: 500 });
  }
} 