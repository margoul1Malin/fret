import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    }, { status: 200 });

    // Supprimer le cookie JWT
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immédiatement
    });

    return response;

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 