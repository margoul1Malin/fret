import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth';

// GET - Récupérer une demande de contact spécifique (admin uniquement)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const contactId = resolvedParams.id;

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

    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id: contactId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            userType: true,
            phone: true,
            companyName: true
          }
        }
      }
    });

    if (!contactRequest) {
      return NextResponse.json({
        success: false,
        message: 'Demande de contact non trouvée'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: contactRequest
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la demande de contact:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// PUT - Mettre à jour une demande de contact (admin uniquement)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const contactId = resolvedParams.id;

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

    const body = await request.json();
    const {
      status,
      priority,
      assignedTo,
      adminNotes,
      resolvedAt
    } = body;

    // Vérifier que la demande existe
    const existingRequest = await prisma.contactRequest.findUnique({
      where: { id: contactId }
    });

    if (!existingRequest) {
      return NextResponse.json({
        success: false,
        message: 'Demande de contact non trouvée'
      }, { status: 404 });
    }

    // Préparer les données à mettre à jour
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };

    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    
    // Si on marque comme résolu, ajouter la date de résolution
    if (status === 'RESOLVED' && !existingRequest.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
    
    // Si on marque comme non-résolu, supprimer la date de résolution
    if (status && status !== 'RESOLVED') {
      updateData.resolvedAt = null;
    }

    // Si resolvedAt est explicitement fourni
    if (resolvedAt !== undefined) {
      updateData.resolvedAt = resolvedAt ? new Date(resolvedAt) : null;
    }

    // Mettre à jour la demande
    const updatedRequest = await prisma.contactRequest.update({
      where: { id: contactId },
      data: updateData,
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
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Demande de contact mise à jour avec succès',
      data: updatedRequest
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la demande de contact:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// DELETE - Supprimer une demande de contact (admin uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const contactId = resolvedParams.id;

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

    // Vérifier que la demande existe
    const existingRequest = await prisma.contactRequest.findUnique({
      where: { id: contactId }
    });

    if (!existingRequest) {
      return NextResponse.json({
        success: false,
        message: 'Demande de contact non trouvée'
      }, { status: 404 });
    }

    // Supprimer la demande
    await prisma.contactRequest.delete({
      where: { id: contactId }
    });

    return NextResponse.json({
      success: true,
      message: 'Demande de contact supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la demande de contact:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 