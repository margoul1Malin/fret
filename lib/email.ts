import nodemailer from 'nodemailer';

// Configuration du transporteur email pour PrivateEmail
const smtpConfig = {
  host: process.env.SMTP_HOST || 'mail.privateemail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER || 'contact@oxelya.com',
    pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || process.env.MAIL_PASSWORD || process.env.PRIVATEEMAIL_PASSWORD
  },
  // Options pour PrivateEmail
  tls: {
    rejectUnauthorized: false
  },
  debug: true,
  logger: true
};

// Log de débogage pour vérifier la configuration
console.log('🔧 Configuration SMTP:', {
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  user: smtpConfig.auth.user,
  hasPassword: !!smtpConfig.auth.pass,
  passwordLength: smtpConfig.auth.pass ? smtpConfig.auth.pass.length : 0
});

const transporter = nodemailer.createTransport(smtpConfig);

interface ContactRequestData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject: string;
  priority: string;
  message: string;
  createdAt: Date;
}

export async function sendContactRequestEmail(contactRequest: ContactRequestData) {
  try {
    // Test de connexion avant l'envoi
    console.log('🔄 Test de connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP OK');
    
    console.log('📧 Préparation de l\'email pour la demande:', contactRequest.id);
    const subjectMap = {
      TECHNICAL_SUPPORT: 'Support Technique',
      BILLING: 'Facturation',
      GENERAL_INQUIRY: 'Demande Générale',
      PARTNERSHIP: 'Partenariat',
      BUG_REPORT: 'Rapport de Bug',
      FEATURE_REQUEST: 'Demande de Fonctionnalité',
      OTHER: 'Autre'
    };

    const priorityMap = {
      LOW: 'Faible',
      NORMAL: 'Normale',
      HIGH: 'Élevée',
      URGENT: 'Urgente'
    };

    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #8B4513; color: #F5F5DC; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .footer { background-color: #8B4513; color: #F5F5DC; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #8B4513; }
    .priority-urgent { color: #dc3545; font-weight: bold; }
    .priority-high { color: #fd7e14; font-weight: bold; }
    .priority-normal { color: #28a745; }
    .priority-low { color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nouvelle Demande de Contact - SendUp</h1>
      <p>Référence: #${contactRequest.id}</p>
    </div>
    
    <div class="content">
      <div class="field">
        <span class="label">Nom complet:</span> ${contactRequest.firstName} ${contactRequest.lastName}
      </div>
      
      <div class="field">
        <span class="label">Email:</span> ${contactRequest.email}
      </div>
      
      ${contactRequest.phone ? `
      <div class="field">
        <span class="label">Téléphone:</span> ${contactRequest.phone}
      </div>
      ` : ''}
      
      ${contactRequest.company ? `
      <div class="field">
        <span class="label">Entreprise:</span> ${contactRequest.company}
      </div>
      ` : ''}
      
      <div class="field">
        <span class="label">Sujet:</span> ${subjectMap[contactRequest.subject as keyof typeof subjectMap] || contactRequest.subject}
      </div>
      
      <div class="field">
        <span class="label">Priorité:</span> 
        <span class="priority-${contactRequest.priority.toLowerCase()}">
          ${priorityMap[contactRequest.priority as keyof typeof priorityMap] || contactRequest.priority}
        </span>
      </div>
      
      <div class="field">
        <span class="label">Date de soumission:</span> ${contactRequest.createdAt.toLocaleString('fr-FR')}
      </div>
      
      <div class="field">
        <span class="label">Message:</span>
        <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #8B4513; margin-top: 10px;">
          ${contactRequest.message.replace(/\n/g, '<br>')}
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>SendUp - Plateforme de Transport Collaboratif</p>
      <p>Cette demande a été soumise via le formulaire de contact du site web.</p>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER || 'contact@oxelya.com',
      to: 'contact@oxelya.com',
      subject: `[SendUp] Nouvelle demande de contact - ${subjectMap[contactRequest.subject as keyof typeof subjectMap] || contactRequest.subject} (${priorityMap[contactRequest.priority as keyof typeof priorityMap] || contactRequest.priority})`,
      html: emailContent,
      replyTo: contactRequest.email
    };

    console.log('🚀 Envoi de l\'email en cours...');
    console.log('📤 Options d\'envoi:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      replyTo: mailOptions.replyTo
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de demande de contact envoyé avec succès!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📨 Détails de l\'envoi:', result);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de demande de contact:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

// Fonction de test de connexion SMTP
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('Connexion SMTP OK');
    return true;
  } catch (error) {
    console.error('Erreur de connexion SMTP:', error);
    return false;
  }
} 