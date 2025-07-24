import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, isValidEmail, isValidPassword, UserType, AuthResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      userType, 
      phone,
      companyName // Optionnel pour les transporteurs
    } = body;

    // Validation des champs obligatoires
    if (!email || !password || !firstName || !lastName || !userType) {
      return NextResponse.json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      }, { status: 400 });
    }

    // Validation email
    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        message: 'Format d\'email invalide'
      }, { status: 400 });
    }

    // Validation mot de passe
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({
        success: false,
        message: passwordValidation.message
      }, { status: 400 });
    }

    // Validation type utilisateur
    if (!Object.values(UserType).includes(userType)) {
      return NextResponse.json({
        success: false,
        message: 'Type d\'utilisateur invalide'
      }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      }, { status: 409 });
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        userType,
        phone: phone || null,
        companyName: companyName || null,
        isVerified: false, // Par défaut non vérifié
        isActive: true
      }
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
      message: 'Inscription réussie',
      token,
      user: userResponse
    };

    // Créer la réponse avec le cookie
    const nextResponse = NextResponse.json(response, { status: 201 });
    
    // Définir le cookie JWT (optionnel, pour faciliter l'utilisation côté client)
    nextResponse.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 jours
    });

    return nextResponse;

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 