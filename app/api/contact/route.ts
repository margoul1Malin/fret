import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';
import { sendContactRequestEmail } from '@/lib/email';

// GET - Lister les demandes de contact (admin uniquement)
export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token manquant'
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.userType !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Accès non autorisé'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const subject = searchParams.get('subject');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Construire les filtres
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (subject) where.subject = subject;
    if (priority) where.priority = priority;

    // Récupérer les demandes avec pagination
    const [contactRequests, total] = await Promise.all([
      prisma.contactRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              userType: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.contactRequest.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        contactRequests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de contact:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// POST - Créer une nouvelle demande de contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      subject,
      priority = 'NORMAL',
      message
    } = body;

    // Validation des champs requis
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      }, { status: 400 });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Adresse email invalide'
      }, { status: 400 });
    }

    // Vérifier si l'utilisateur est connecté (optionnel)
    let userId = null;
    const token = extractTokenFromRequest(request);
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    // Créer la demande de contact
    const contactRequest = await prisma.contactRequest.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        subject,
        priority,
        message: message.trim(),
        userId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Envoyer l'email de notification
    console.log('🔄 Début du processus d\'envoi d\'email pour la demande:', contactRequest.id);
    try {
      const emailResult = await sendContactRequestEmail({
        id: contactRequest.id,
        firstName: contactRequest.firstName,
        lastName: contactRequest.lastName,
        email: contactRequest.email,
        phone: contactRequest.phone,
        company: contactRequest.company,
        subject: contactRequest.subject,
        priority: contactRequest.priority,
        message: contactRequest.message,
        createdAt: contactRequest.createdAt
      });

      if (emailResult.success) {
        console.log('✅ Email de notification envoyé avec succès:', emailResult.messageId);
      } else {
        console.error('❌ Échec de l\'envoi de l\'email de notification:', emailResult.error);
        // On continue malgré l'échec de l'email car la demande est créée
      }
    } catch (emailError) {
      console.error('💥 Erreur lors de l\'envoi de l\'email de notification:', emailError);
      console.error('Stack trace:', emailError instanceof Error ? emailError.stack : emailError);
      // On continue malgré l'échec de l'email car la demande est créée
    }

    console.log('Nouvelle demande de contact créée:', contactRequest.id);

    return NextResponse.json({
      success: true,
      message: 'Votre demande de contact a été envoyée avec succès',
      data: {
        id: contactRequest.id,
        status: contactRequest.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la demande de contact:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 