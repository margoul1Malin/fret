// Utilitaires pour les calculs de trajets

export function calculateTotalPrice(weight: number, pricePerKg: number): number {
  return Math.round((weight * pricePerKg) * 100) / 100; // Arrondir à 2 décimales
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${Math.round(distance)}km`;
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}min`;
  }
  if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h${m}min` : `${h}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return remainingHours > 0 ? `${days}j ${remainingHours}h` : `${days}j`;
}

export function estimateArrivalTime(departureDate: Date, distance: number, averageSpeed: number = 80): Date {
  const durationHours = distance / averageSpeed;
  const arrivalTime = new Date(departureDate);
  arrivalTime.setHours(arrivalTime.getHours() + durationHours);
  return arrivalTime;
}

export function getCourseStatus(course: { status: string; departureDate: string | Date }): {
  status: string;
  label: string;
  color: string;
  description: string;
} {
  const now = new Date();
  const departureDate = new Date(course.departureDate);
  
  switch (course.status) {
    case 'AVAILABLE':
      if (departureDate <= now) {
        return {
          status: 'EXPIRED',
          label: 'Expiré',
          color: 'gray',
          description: 'La date de départ est passée'
        };
      }
      return {
        status: 'AVAILABLE',
        label: 'Disponible',
        color: 'green',
        description: 'Trajet ouvert aux réservations'
      };
    case 'FULL':
      return {
        status: 'FULL',
        label: 'Complet',
        color: 'orange',
        description: 'Capacité maximale atteinte'
      };
    case 'IN_PROGRESS':
      return {
        status: 'IN_PROGRESS',
        label: 'En cours',
        color: 'blue',
        description: 'Trajet en cours de réalisation'
      };
    case 'COMPLETED':
      return {
        status: 'COMPLETED',
        label: 'Terminé',
        color: 'green',
        description: 'Trajet terminé avec succès'
      };
    case 'CANCELLED':
      return {
        status: 'CANCELLED',
        label: 'Annulé',
        color: 'red',
        description: 'Trajet annulé'
      };
    default:
      return {
        status: 'UNKNOWN',
        label: 'Inconnu',
        color: 'gray',
        description: 'Statut inconnu'
      };
  }
}

export function getBookingStatus(booking: { status: string }): {
  status: string;
  label: string;
  color: string;
  description: string;
} {
  switch (booking.status) {
    case 'PENDING':
      return {
        status: 'PENDING',
        label: 'En attente',
        color: 'yellow',
        description: 'En attente de confirmation du transporteur'
      };
    case 'CONFIRMED':
      return {
        status: 'CONFIRMED',
        label: 'Confirmé',
        color: 'blue',
        description: 'Réservation confirmée'
      };
    case 'PICKED_UP':
      return {
        status: 'PICKED_UP',
        label: 'Récupéré',
        color: 'orange',
        description: 'Colis récupéré, en cours de transport'
      };
    case 'DELIVERED':
      return {
        status: 'DELIVERED',
        label: 'Livré',
        color: 'green',
        description: 'Colis livré avec succès'
      };
    case 'CANCELLED':
      return {
        status: 'CANCELLED',
        label: 'Annulé',
        color: 'red',
        description: 'Réservation annulée'
      };
    default:
      return {
        status: 'UNKNOWN',
        label: 'Inconnu',
        color: 'gray',
        description: 'Statut inconnu'
      };
  }
}

export function canModifyCourse(course: { status: string; departureDate: string | Date }): boolean {
  return course.status === 'AVAILABLE' && new Date(course.departureDate) > new Date();
}

export function canCancelCourse(course: { status: string; bookings?: Array<{ status: string }> }): boolean {
  const hasActiveBookings = course.bookings?.some((booking) => 
    booking.status === 'CONFIRMED' || booking.status === 'PICKED_UP'
  );
  return !hasActiveBookings && course.status !== 'COMPLETED';
}

export function getVehicleTypeLabel(vehicleType: string): string {
  switch (vehicleType) {
    case 'VAN':
      return 'Camionnette';
    case 'TRUCK':
      return 'Camion';
    case 'MOTORCYCLE':
      return 'Moto';
    case 'CAR':
      return 'Voiture';
    default:
      return 'Non spécifié';
  }
}

export function formatWeight(weight: number): string {
  if (weight < 1) {
    return `${Math.round(weight * 1000)}g`;
  }
  return `${weight}kg`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidCourseData(courseData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!courseData.departure?.trim()) {
    errors.push('Le lieu de départ est requis');
  }

  if (!courseData.arrival?.trim()) {
    errors.push('Le lieu d\'arrivée est requis');
  }

  if (!courseData.departureDate) {
    errors.push('La date de départ est requise');
  } else {
    const depDate = new Date(courseData.departureDate);
    if (depDate <= new Date()) {
      errors.push('La date de départ doit être dans le futur');
    }
  }

  if (!courseData.maxWeight || courseData.maxWeight <= 0) {
    errors.push('Le poids maximum doit être positif');
  }

  if (!courseData.pricePerKg || courseData.pricePerKg <= 0) {
    errors.push('Le prix par kg doit être positif');
  }

  if (!courseData.description?.trim()) {
    errors.push('La description est requise');
  }

  if (courseData.maxPackageWeight && courseData.maxPackageWeight > courseData.maxWeight) {
    errors.push('Le poids maximum par colis ne peut pas dépasser le poids maximum total');
  }

  return {
    valid: errors.length === 0,
    errors
  };
} 