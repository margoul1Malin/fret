'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  HiArrowLeft,
  HiMapPin,
  HiCurrencyEuro,
  HiTruck,
  HiStar,
  HiShieldCheck,
  HiUser,
  HiClock,
  HiUsers,
  HiPhone,
  HiEnvelope,
  HiDocumentText,
  HiCheckCircle,
  HiExclamationTriangle,
  HiFlag,
  HiEye,
  HiXMark as HiX
} from 'react-icons/hi2';

interface Course {
  id: string;
  departure: string;
  arrival: string;
  stops: string[];
  departureDate: string;
  estimatedArrival?: string;
  maxWeight: number;
  pricePerKg: number;
  minPackageWeight: number;
  maxPackageWeight?: number;
  description: string;
  vehicleType: string;
  status: string;
  availableSpace: number;
  bookedWeight: number;
  availableWeight: number;
  occupancyRate: number;
  createdAt: string;
  transporter: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    phone?: string;
    email?: string;
  };
  bookings: Array<{
    id: string;
    packageWeight: number;
    packageCount: number;
    totalPrice: number;
    pickupPoint: string;
    deliveryPoint: string;
    status: string;
    createdAt: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      rating: number;
    };
  }>;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const loadCourseDetails = async () => {
      try {
        // Vérifier l'authentification
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const authResponse = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if (authResponse.ok) {
              const authData = await authResponse.json();
              if (authData.success) {
                setIsAuthenticated(true);
                setUserType(authData.user.userType);
                setCurrentUserId(authData.user.id);
              }
            }
          } catch (error) {
            console.error('Erreur d\'authentification:', error);
          }
        }

        // Charger les détails du trajet
        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();

        if (data.success) {
          setCourse(data.data);
        } else {
          setError(data.message || 'Trajet non trouvé');
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setError('Erreur de connexion');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      loadCourseDetails();
    }
  }, [courseId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return { label: 'Disponible', color: 'bg-green-100 text-green-800', icon: HiCheckCircle };
      case 'FULL':
        return { label: 'Complet', color: 'bg-yellow-100 text-yellow-800', icon: HiExclamationTriangle };
      case 'IN_PROGRESS':
        return { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: HiClock };
      case 'COMPLETED':
        return { label: 'Terminé', color: 'bg-gray-100 text-gray-800', icon: HiFlag };
      case 'CANCELLED':
        return { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: HiFlag };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: HiFlag };
    }
  };

  const getBookingStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' };
      case 'CONFIRMED':
        return { label: 'Confirmée', color: 'bg-green-100 text-green-800' };
      case 'PICKED_UP':
        return { label: 'Ramassée', color: 'bg-blue-100 text-blue-800' };
      case 'DELIVERED':
        return { label: 'Livrée', color: 'bg-green-100 text-green-800' };
      case 'CANCELLED':
        return { label: 'Annulée', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    return type === 'VL' ? 'Véhicule Léger' : 'Poids Lourd';
  };

  const isOwner = currentUserId === course?.transporter.id;
  const canBook = isAuthenticated && userType === 'CLIENT' && course?.status === 'AVAILABLE' && course?.availableWeight > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-beige flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des détails du trajet...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-light-beige flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <HiExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Trajet non trouvé</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              variant="primary"
              onClick={() => router.back()}
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary p-2 flex items-center justify-center rounded-xl"
            >
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(course.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-light-beige">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-dark-bordeaux text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary p-2 flex items-center justify-center rounded-xl"
              >
                <HiArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold">
                  {course.departure} → {course.arrival}
                </h1>
                <p className="text-primary-beige">Détails du trajet</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color} bg-white/90`}>
                <StatusIcon className="w-4 h-4 inline mr-2" />
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Informations principales */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Itinéraire */}
            <Card className="shadow-lg p-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HiMapPin className="w-6 h-6 mr-2 text-primary" />
                  Itinéraire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-green-800">Départ</div>
                      <div className="text-sm text-gray-600">{course.departure}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-800">
                      {formatDate(course.departureDate)}
                    </div>
                  </div>
                </div>

                {course.stops.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Escales :</div>
                    {course.stops.map((stop, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="text-blue-800 font-medium">{stop}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-red-800">Arrivée</div>
                      <div className="text-sm text-gray-600">{course.arrival}</div>
                    </div>
                  </div>
                  {course.estimatedArrival && (
                    <div className="text-right">
                      <div className="font-medium text-red-800">
                        {formatDate(course.estimatedArrival)}
                      </div>
                      <div className="text-xs text-gray-500">Estimée</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Détails du transport */}
            <Card className="shadow-lg p-6 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HiTruck className="w-6 h-6 mr-2 text-primary" />
                  Détails du transport
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Type de véhicule</span>
                      <span className="font-medium">{getVehicleTypeLabel(course.vehicleType)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Capacité maximale</span>
                      <span className="font-medium">{course.maxWeight} kg</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Prix par kg</span>
                      <span className="font-medium text-primary">{course.pricePerKg}€</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Poids minimum</span>
                      <span className="font-medium">{course.minPackageWeight} kg</span>
                    </div>
                    
                    {course.maxPackageWeight && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Poids maximum par colis</span>
                        <span className="font-medium">{course.maxPackageWeight} kg</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Places disponibles</span>
                      <span className="font-medium">{course.availableSpace}</span>
                    </div>
                  </div>
                </div>

                {/* Occupation */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-blue-800">Occupation du trajet</span>
                    <span className="text-sm text-blue-600">{course.occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${course.occupancyRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>Réservé: {course.bookedWeight} kg</span>
                    <span>Disponible: {course.availableWeight} kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="shadow-lg p-6 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HiDocumentText className="w-6 h-6 mr-2 text-primary" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
                <div className="mt-4 text-sm text-gray-500">
                  Publié le {formatDate(course.createdAt)}
                </div>
              </CardContent>
            </Card>

            {/* Réservations (visible pour le propriétaire) */}
            {isOwner && course.bookings.length > 0 && (
              <Card className="shadow-lg p-6 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HiUsers className="w-6 h-6 mr-2 text-primary" />
                    Réservations ({course.bookings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.bookings.map((booking) => {
                      const bookingStatus = getBookingStatusInfo(booking.status);
                      return (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <HiUser className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {booking.client.firstName} {booking.client.lastName}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center">
                                  <HiStar className="w-4 h-4 mr-1 text-yellow-500" />
                                  {booking.client.rating.toFixed(1)}
                                </div>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${bookingStatus.color}`}>
                              {bookingStatus.label}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Poids :</span>
                              <div className="font-medium">{booking.packageWeight} kg</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Colis :</span>
                              <div className="font-medium">{booking.packageCount}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Prix :</span>
                              <div className="font-medium text-green-600">{booking.totalPrice}€</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Réservé le :</span>
                              <div className="font-medium">{new Date(booking.createdAt).toLocaleDateString('fr-FR')}</div>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-sm">
                            <div className="text-gray-600">
                              <span className="font-medium">Ramassage :</span> {booking.pickupPoint}
                            </div>
                            <div className="text-gray-600">
                              <span className="font-medium">Livraison :</span> {booking.deliveryPoint}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Transporteur */}
            <Card className="shadow-lg p-6 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HiUser className="w-6 h-6 mr-2 text-primary" />
                  Transporteur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HiUser className="w-10 h-10 text-primary" />
                  </div>
                  <button
                    onClick={() => router.push(`/transporters/${course.transporter.id}`)}
                    className="font-semibold text-lg flex items-center justify-center hover:text-primary transition-colors cursor-pointer"
                  >
                    {course.transporter.firstName} {course.transporter.lastName}
                    {course.transporter.isVerified && (
                      <HiShieldCheck className="w-5 h-5 ml-2 text-green-600" />
                    )}
                  </button>
                  {course.transporter.companyName && (
                    <div className="text-sm text-gray-600 mt-1">
                      {course.transporter.companyName}
                    </div>
                  )}
                  <div className="flex items-center justify-center mt-2">
                    <HiStar className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="font-medium">{course.transporter.rating.toFixed(1)}</span>
                    <span className="text-gray-600 ml-1">({course.transporter.reviewCount} avis)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer flex items-center justify-center space-x-2 hover:bg-primary hover:text-white rounded-xl"
                    onClick={() => router.push(`/transporters/${course.transporter.id}`)}
                  >
                    <HiUser className="w-4 h-4 mr-2" />
                    Voir le profil
                  </Button>
                  
                  {!isOwner && isAuthenticated && (course.transporter.phone || course.transporter.email) && (
                    <Button 
                      variant="outline" 
                      className="w-full cursor-pointer flex items-center justify-center space-x-2 hover:bg-primary hover:text-white rounded-xl"
                      onClick={() => setShowContactModal(true)}
                    >
                      <HiPhone className="w-4 h-4 mr-2" />
                      Contacter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-lg p-6 rounded-xl">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canBook && (
                  <Link href={`/courses/${course.id}/book`}>
                    <Button variant="primary" className="w-full p-2 flex items-center justify-center rounded-xl cursor-pointer hover:bg-primary hover:text-white">
                      <HiCheckCircle className="w-4 h-4 mr-2" />
                      Réserver ce trajet
                    </Button>
                  </Link>
                )}
                
                {!isAuthenticated && course.status === 'AVAILABLE' && (
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full p-2 flex items-center justify-center rounded-xl cursor-pointer hover:bg-primary hover:text-white">
                      Se connecter pour réserver
                    </Button>
                  </Link>
                )}

                {isOwner && (
                  <>
                    <Link href={`/courses/${course.id}/edit`}>
                      <Button variant="outline" className="w-full p-2 flex items-center justify-center rounded-xl cursor-pointer hover:bg-primary hover:text-white">
                        <HiDocumentText className="w-4 h-4 mr-2" />
                        Modifier le trajet
                      </Button>
                    </Link>
                    <Link href="/courses/my-courses">
                      <Button variant="outline" className="w-full p-2 flex items-center justify-center rounded-xl cursor-pointer hover:bg-primary hover:text-white">
                        <HiEye className="w-4 h-4 mr-2" />
                        Mes trajets
                      </Button>
                    </Link>
                  </>
                )}

                {course.status === 'AVAILABLE' && course.availableWeight === 0 && (
                  <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-yellow-800 font-medium">Trajet complet</div>
                    <div className="text-sm text-yellow-600">Plus de place disponible</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calcul rapide */}
            {!isOwner && course.status === 'AVAILABLE' && (
              <Card className="shadow-lg p-6 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HiCurrencyEuro className="w-6 h-6 mr-2 text-primary" />
                    Calculateur de prix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poids de votre colis (kg)
                      </label>
                      <input
                        type="number"
                        min={course.minPackageWeight}
                        max={course.maxPackageWeight || course.availableWeight}
                        step="0.1"
                        placeholder="Ex: 25"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        onChange={(e) => {
                          const weight = parseFloat(e.target.value) || 0;
                          const price = (weight * course.pricePerKg).toFixed(2);
                          const priceDisplay = e.target.parentElement?.parentElement?.querySelector('.price-result');
                          if (priceDisplay) {
                            priceDisplay.textContent = weight > 0 ? `${price}€` : '0€';
                          }
                        }}
                      />
                    </div>
                    <div className="bg-primary/10 p-4 rounded-lg text-center">
                      <div className="text-sm text-gray-600 mb-1">Prix estimé</div>
                      <div className="text-2xl font-bold text-primary price-result">0€</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Prix basé sur {course.pricePerKg}€/kg
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal de contact */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Informations de contact</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HiUser className="w-8 h-8 text-primary" />
                </div>
                <div className="font-semibold text-lg">
                  {course.transporter.firstName} {course.transporter.lastName}
                </div>
                {course.transporter.companyName && (
                  <div className="text-sm text-gray-600">
                    {course.transporter.companyName}
                  </div>
                )}
              </div>

              {course.transporter.phone && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <HiPhone className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-gray-600">Téléphone</div>
                    <a 
                      href={`tel:${course.transporter.phone}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {course.transporter.phone}
                    </a>
                  </div>
                </div>
              )}

              {course.transporter.email && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <HiEnvelope className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <a 
                      href={`mailto:${course.transporter.email}`}
                      className="font-medium text-primary hover:underline break-all"
                    >
                      {course.transporter.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 