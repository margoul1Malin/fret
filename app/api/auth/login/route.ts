import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken, isValidEmail, UserType, AuthResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation des champs obligatoires
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email et mot de passe requis'
      }, { status: 400 });
    }

    // Validation email
    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        message: 'Format d\'email invalide'
      }, { status: 400 });
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      }, { status: 401 });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Compte désactivé. Contactez l\'administrateur.'
      }, { status: 403 });
    }

    // Vérifier que l'utilisateur a un mot de passe
    if (!user.password) {
      return NextResponse.json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      }, { status: 401 });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      }, { status: 401 });
    }

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Générer le token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      userType: user.userType as UserType
    });

    // Préparer la réponse (sans le mot de passe)
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType as UserType,
      isVerified: user.isVerified
    };

    const response: AuthResponse = {
      success: true,
      message: 'Connexion réussie',
      token,
      user: userResponse
    };

    // Créer la réponse avec le cookie
    const nextResponse = NextResponse.json(response, { status: 200 });
    
    // Définir le cookie JWT
    nextResponse.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 jours
    });

    return nextResponse;

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 