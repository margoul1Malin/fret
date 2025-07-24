import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// Types d'utilisateurs
export enum UserType {
  CLIENT = 'CLIENT',
  TRANSPORTER = 'TRANSPORTER',
  ADMIN = 'ADMIN'
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  userType: UserType;
  iat?: number;
  exp?: number;
}

// Générer un token JWT
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token valide 7 jours
  });
}

// Vérifier un token JWT
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Erreur vérification token:', error);
    return null;
  }
}

// Hacher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Vérifier un mot de passe
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Extraire le token des headers
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Vérifier aussi les cookies
  const tokenCookie = request.cookies.get('token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  
  return null;
}

// Middleware pour vérifier l'authentification
export function requireAuth(allowedRoles?: UserType[]) {
  return async (request: NextRequest) => {
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      return { error: 'Token manquant', status: 401 };
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return { error: 'Token invalide', status: 401 };
    }
    
    // Vérifier les rôles si spécifiés
    if (allowedRoles && !allowedRoles.includes(payload.userType)) {
      return { error: 'Accès non autorisé', status: 403 };
    }
    
    return { user: payload };
  };
}

// Valider le format email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Valider la force du mot de passe
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  
  return { valid: true };
}

// Types pour les réponses API
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: UserType;
    isVerified: boolean;
  };
}

export interface ApiError {
  error: string;
  status: number;
} 