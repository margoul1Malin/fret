import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Extraire le token
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token manquant'
      }, { status: 401 });
    }

    // Vérifier le token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Token invalide'
      }, { status: 401 });
    }

    // Récupérer les informations utilisateur
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        phone: true,
        companyName: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Utilisateur non trouvé'
      }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Compte désactivé'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      user
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 