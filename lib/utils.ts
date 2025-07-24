import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price / 100)
}

export function formatWeight(weight: number): string {
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(1)} t`
  }
  return `${weight} kg`
}

export function formatVolume(volume: number): string {
  return `${volume} m³`
}

export function formatDistance(distance: number): string {
  return `${distance} km`
}

export function calculateEstimatedPrice(
  weight: number,
  volume: number,
  distance: number,
  pricePerKm: number = 0.50,
  pricePerKg: number = 0.10,
  pricePerM3: number = 5.00
): number {
  const kmPrice = distance * pricePerKm
  const weightPrice = weight * pricePerKg
  const volumePrice = volume * pricePerM3
  
  const basePrice = Math.max(kmPrice, weightPrice, volumePrice)
  const commission = basePrice * (process.env.COMMISSION_RATE ? parseFloat(process.env.COMMISSION_RATE) : 0.20)
  
  return Math.round((basePrice + commission) * 100) // en centimes
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'badge-warning'
    case 'accepted':
    case 'available':
      return 'badge-info'
    case 'in_transit':
    case 'in_progress':
      return 'badge-primary'
    case 'delivered':
    case 'completed':
      return 'badge-success'
    case 'cancelled':
      return 'badge-error'
    default:
      return 'badge-info'
  }
}

export function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'En attente'
    case 'accepted':
      return 'Accepté'
    case 'in_transit':
      return 'En cours'
    case 'delivered':
      return 'Livré'
    case 'cancelled':
      return 'Annulé'
    case 'available':
      return 'Disponible'
    case 'full':
      return 'Complet'
    case 'in_progress':
      return 'En cours'
    case 'completed':
      return 'Terminé'
    default:
      return status
  }
}

export function generateTrackingNumber(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `SP${timestamp}${random}`.toUpperCase()
}

export function formatPhoneNumber(phone: string): string {
  // Format français: +33 X XX XX XX XX
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('33')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`
  }
  if (cleaned.startsWith('0')) {
    return `0${cleaned.slice(1, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`
  }
  return phone
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function getVehicleTypeLabel(type: string): string {
  switch (type) {
    case 'VL':
      return 'Véhicule Léger'
    case 'PL':
      return 'Poids Lourd'
    default:
      return type
  }
}

export function getUserTypeLabel(type: string): string {
  switch (type) {
    case 'CLIENT':
      return 'Client'
    case 'TRANSPORTER':
      return 'Transporteur'
    case 'ADMIN':
      return 'Administrateur'
    default:
      return type
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
} 