'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  HiArrowLeft, 
  HiMapPin, 
  HiCalendar, 
  HiScale, 
  HiCube, 
  HiCurrencyEuro,
  HiExclamationTriangle,
  HiTruck,
  HiStar,
  HiEnvelope,
  HiPhone,
  HiCheck,
  HiXMark,
  HiClock
} from 'react-icons/hi2';

interface ExpeditionOffer {
  id: string;
  price: number;
  pickupDate: string;
  deliveryDate: string;
  message?: string;
  status: string;
  isSelected: boolean;
  createdAt: string;
  transporter: {
    id: string;
    firstName: string;
    lastName: string;
    rating: number;
    reviewCount: number;
    companyName?: string;
  };
}

interface ExpeditionDetail {
  id: string;
  departureAddress: string;
  departureCity: string;
  departurePostalCode?: string;
  arrivalAddress: string;
  arrivalCity: string;
  arrivalPostalCode?: string;
  departureDate: string;
  weight: number;
  volume: number;
  description: string;
  value?: number;
  isFragile: boolean;
  requiresPL: boolean;
  urgency: string;
  maxBudget?: number;
  status: string;
  notes?: string;
  createdAt: string;
  currentOffers: number;
  selectedOffer?: number;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  offers: ExpeditionOffer[];
}

interface CourseRecommendation {
  id: string;
  departure: string;
  arrival: string;
  departureDate: string;
  estimatedArrival?: string;
  maxWeight: number;
  pricePerKg: number;
  vehicleType?: string;
  description: string;
  availableSpace: number;
  transporter: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    rating: number;
    reviewCount: number;
  };
  matchScore: number;
  estimatedPrice: number;
  reasons: string[];
}

export default function ExpeditionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const [expedition, setExpedition] = useState<ExpeditionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const resolvedParams = use(params);

  // Déterminer l'URL de retour selon le type d'utilisateur
  const getBackUrl = () => {
    if (user?.userType === 'TRANSPORTER') {
      return '/search'; // Les transporteurs retournent à la recherche
    }
    return '/expeditions'; // Les expéditeurs retournent à leurs expéditions
  };

  useEffect(() => {
    fetchExpedition();
    fetchRecommendations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchExpedition = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/expeditions/${resolvedParams.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExpedition(data.expedition);
      } else {
        // En cas d'erreur, rediriger vers la recherche plutôt que vers la liste des expéditions
        router.push('/search');
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/search');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/expeditions/${resolvedParams.id}/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700';
      case 'PUBLISHED':
        return 'bg-blue-100 text-blue-700';
      case 'OFFERS_RECEIVED':
        return 'bg-yellow-100 text-yellow-700';
      case 'ASSIGNED':
        return 'bg-green-100 text-green-700';
      case 'IN_TRANSIT':
        return 'bg-purple-100 text-purple-700';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Brouillon';
      case 'PUBLISHED':
        return 'Publiée';
      case 'OFFERS_RECEIVED':
        return 'Offres reçues';
      case 'ASSIGNED':
        return 'Assignée';
      case 'IN_TRANSIT':
        return 'En transit';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'normal':
        return 'text-blue-600 bg-blue-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'Peu urgent';
      case 'normal':
        return 'Normal';
      case 'high':
        return 'Urgent';
      default:
        return urgency;
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    // TODO: Implémenter l'acceptation d'offre
    console.log('Accepter offre:', offerId);
  };

  const handleDeclineOffer = async (offerId: string) => {
    // TODO: Implémenter le refus d'offre
    console.log('Refuser offre:', offerId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-beige flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de l&apos;expédition...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!expedition) {
    return (
      <div className="min-h-screen bg-light-beige flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">Expédition non trouvée</h2>
          <p className="text-gray-500 mb-4">Cette expédition n&apos;existe pas ou vous n&apos;avez pas accès à celle-ci.</p>
          <Link href={getBackUrl()}>
            <Button>
              {user?.userType === 'TRANSPORTER' ? 'Retour à la recherche' : 'Retour aux expéditions'}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-beige py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={getBackUrl()} className="inline-flex items-center text-primary hover:text-dark-bordeaux mb-4">
            <HiArrowLeft className="w-5 h-5 mr-2" />
            {user?.userType === 'TRANSPORTER' ? 'Retour à la recherche' : 'Retour aux expéditions'}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                             <h1 className="text-3xl font-bold text-dark-bordeaux mb-2">
                 {expedition.departureCity} → {expedition.arrivalCity}
               </h1>
               <p className="text-gray-600 text-sm mb-2">
                 {expedition.departureAddress} → {expedition.arrivalAddress}
               </p>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(expedition.status)}`}>
                  {getStatusText(expedition.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(expedition.urgency)}`}>
                  {getUrgencyText(expedition.urgency)}
                </span>
              </div>
            </div>
                         {expedition.status === 'DRAFT' && (
               <Link href={`/expeditions/${resolvedParams.id}/edit`}>
                 <Button className="mt-4 sm:mt-0 px-6 py-3 bg-primary hover:bg-dark-bordeaux text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                   Modifier
                 </Button>
               </Link>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Détails de l'expédition */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informations principales */}
            <Card className="shadow-lg rounded-2xl border border-gray-100 rounded-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
                <CardTitle className="flex items-center text-xl text-dark-bordeaux p-6">
                  <HiMapPin className="w-6 h-6 mr-3 text-primary" />
                  Détails de l&apos;expédition
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div>
                     <h4 className="font-medium text-gray-700 mb-3">Adresse de départ</h4>
                     <div className="bg-primary p-4 rounded-lg space-y-1">
                       <p className="text-primary-beige font-medium">{expedition.departureAddress}</p>
                       <p className="text-primary-beige">
                         {expedition.departureCity}
                         {expedition.departurePostalCode && ` ${expedition.departurePostalCode}`}
                       </p>
                     </div>
                   </div>
                   
                   <div>
                     <h4 className="font-medium text-gray-700 mb-3">Adresse d&apos;arrivée</h4>
                     <div className="bg-primary p-4 rounded-lg space-y-1">
                       <p className="text-primary-beige font-medium">{expedition.arrivalAddress}</p>
                       <p className="text-primary-beige">
                         {expedition.arrivalCity}
                         {expedition.arrivalPostalCode && ` ${expedition.arrivalPostalCode}`}
                       </p>
                     </div>
                   </div>
                 </div>

                 <div>
                   <h4 className="font-medium text-gray-700 mb-2">Informations du trajet</h4>
                   <div className="bg-gray-50 p-4 rounded-lg">
                     <p className="text-gray-600">
                       <HiCalendar className="w-4 h-4 inline mr-1" />
                       <strong>Date de départ souhaitée:</strong> {new Date(expedition.departureDate).toLocaleDateString('fr-FR')}
                     </p>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Colis</h4>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <HiScale className="w-4 h-4 inline mr-1" />
                        <strong>Poids:</strong> {expedition.weight} kg
                      </p>
                      <p className="text-gray-600">
                        <HiCube className="w-4 h-4 inline mr-1" />
                        <strong>Volume:</strong> {expedition.volume} m³
                      </p>
                      {expedition.value && (
                        <p className="text-gray-600">
                          <HiCurrencyEuro className="w-4 h-4 inline mr-1" />
                          <strong>Valeur:</strong> {expedition.value}€
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-primary-beige bg-primary p-4 rounded-lg">{expedition.description}</p>
                </div>

                {expedition.notes && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Notes supplémentaires</h4>
                    <p className="text-primary-beige bg-primary p-4 rounded-lg">{expedition.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {expedition.isFragile && (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                      <HiExclamationTriangle className="w-4 h-4 inline mr-1" />
                      Fragile
                    </span>
                  )}
                  {expedition.requiresPL && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      <HiTruck className="w-4 h-4 inline mr-1" />
                      Poids lourd requis
                    </span>
                  )}
                  {expedition.maxBudget && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      <HiCurrencyEuro className="w-4 h-4 inline mr-1" />
                      Budget max: {expedition.maxBudget}€
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Offres reçues */}
            <Card className="shadow-lg rounded-2xl border border-gray-100 rounded-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
                <CardTitle className="flex items-center justify-between text-xl text-dark-bordeaux p-6">
                  <span className="flex items-center">
                    <HiCurrencyEuro className="w-6 h-6 mr-3 text-primary" />
                    Offres reçues ({expedition.offers.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {expedition.offers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HiClock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune offre pour le moment</h3>
                    <p className="text-gray-500">Les transporteurs vont bientôt vous proposer leurs services.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expedition.offers.map((offer) => (
                      <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {offer.transporter.firstName} {offer.transporter.lastName}
                              </h4>
                              {offer.transporter.companyName && (
                                <span className="text-sm text-gray-500">({offer.transporter.companyName})</span>
                              )}
                              <div className="flex items-center">
                                <HiStar className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-gray-600 ml-1">
                                  {offer.transporter.rating.toFixed(1)} ({offer.transporter.reviewCount})
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Prix proposé</span>
                                <p className="text-lg font-bold text-primary">{offer.price}€</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">Enlèvement</span>
                                <p className="text-sm text-gray-600">{new Date(offer.pickupDate).toLocaleDateString('fr-FR')}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">Livraison</span>
                                <p className="text-sm text-gray-600">{new Date(offer.deliveryDate).toLocaleDateString('fr-FR')}</p>
                              </div>
                            </div>

                            {offer.message && (
                              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                <p className="text-sm text-gray-700">{offer.message}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-2 ml-4">
                            {expedition.status === 'PUBLISHED' || expedition.status === 'OFFERS_RECEIVED' ? (
                              <>
                                <Button
                                  onClick={() => handleAcceptOffer(offer.id)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                                >
                                  <HiCheck className="w-4 h-4 mr-1" />
                                  Accepter
                                </Button>
                                <Button
                                  onClick={() => handleDeclineOffer(offer.id)}
                                  variant="outline"
                                  className="px-4 py-2 border-red-300 text-red-600 hover:bg-red-50 text-sm rounded-lg"
                                >
                                                                     <HiXMark className="w-4 h-4 mr-1" />
                                  Refuser
                                </Button>
                              </>
                            ) : offer.isSelected ? (
                              <span className="px-4 py-2 bg-green-100 text-green-700 text-sm rounded-lg font-medium">
                                ✓ Sélectionnée
                              </span>
                            ) : (
                              <span className="px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg">
                                Non retenue
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommandations de trajets */}
            {recommendations.length > 0 && (
              <Card className="shadow-lg rounded-xl border border-gray-100 rounded-xl p-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg text-dark-bordeaux font-bold p-4">
                    <HiTruck className="w-6 h-6 mr-2 text-primary" />
                    Trajets recommandés pour vous
                  </CardTitle>
                  <p className="text-sm text-gray-600 px-4 pb-2">
                    Voici les 3 meilleurs trajets qui correspondent à votre expédition
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingRecommendations ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">Recherche des meilleurs trajets...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recommendations.map((recommendation, index) => (
                        <div key={recommendation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {recommendation.transporter.companyName || 
                                   `${recommendation.transporter.firstName} ${recommendation.transporter.lastName}`}
                                </h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <HiStar className="w-4 h-4 text-yellow-500" />
                                  <span>{recommendation.transporter.rating.toFixed(1)}</span>
                                  <span>({recommendation.transporter.reviewCount} avis)</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">{recommendation.estimatedPrice.toFixed(2)}€</div>
                              <div className="text-sm text-gray-600">{recommendation.pricePerKg}€/kg</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div className="flex items-center text-gray-600">
                              <HiMapPin className="w-4 h-4 mr-2 text-green-600" />
                              <span>{recommendation.departure}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <HiMapPin className="w-4 h-4 mr-2 text-red-600" />
                              <span>{recommendation.arrival}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <HiCalendar className="w-4 h-4 mr-2" />
                              <span>{new Date(recommendation.departureDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <HiScale className="w-4 h-4 mr-2" />
                              <span>{recommendation.maxWeight} kg max</span>
                            </div>
                          </div>

                          {recommendation.vehicleType && (
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                              <HiTruck className="w-4 h-4 mr-2" />
                              <span>{recommendation.vehicleType === 'PL' ? 'Poids Lourd' : 'Véhicule Léger'}</span>
                            </div>
                          )}

                          <div className="mb-3">
                            <div className="text-sm text-gray-600 mb-2">Pourquoi ce trajet vous convient :</div>
                            <div className="flex flex-wrap gap-2">
                              {recommendation.reasons.map((reason, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Score de compatibilité : <span className="font-medium">{recommendation.matchScore}/300</span>
                            </div>
                            <div className="space-x-2">
                              <Button
                                variant="outline"
                                size="small"
                                onClick={() => router.push(`/courses/${recommendation.id}`)}
                              >
                                Voir le trajet
                              </Button>
                              <Button
                                size="small"
                                onClick={() => router.push(`/transporters/${recommendation.transporter.id}`)}
                              >
                                Voir le transporteur
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Informations complémentaires */}
          <div className="space-y-6">
            {/* Statut et timeline */}
            <Card className="shadow-lg rounded-2xl border border-gray-100 rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg text-dark-bordeaux p-6">Suivi de l&apos;expédition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Créée le</div>
                  <div className="font-medium">{new Date(expedition.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
                
                {expedition.currentOffers > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <div className="text-green-700 font-medium">{expedition.currentOffers}</div>
                    <div className="text-green-600 text-sm">offre(s) reçue(s)</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="shadow-lg rounded-2xl border border-gray-100 rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg text-dark-bordeaux p-6">Votre contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <div>
                  <div className="font-medium text-gray-900">
                    {expedition.client.firstName} {expedition.client.lastName}
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <HiEnvelope className="w-4 h-4 mr-2" />
                  <span className="text-sm">{expedition.client.email}</span>
                </div>
                {expedition.client.phone && (
                  <div className="flex items-center text-gray-600">
                    <HiPhone className="w-4 h-4 mr-2" />
                    <span className="text-sm">{expedition.client.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 