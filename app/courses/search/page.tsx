'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiMapPin,
  HiCalendar,
  HiScale,
  HiCurrencyEuro,
  HiTruck,
  HiStar,
  HiShieldCheck,
  HiArrowLeft,
  HiClock,
  HiUser
} from 'react-icons/hi2';

interface Course {
  id: string;
  departure: string;
  arrival: string;
  departureDate: string;
  estimatedArrival?: string;
  maxWeight: number;
  pricePerKg: number;
  description: string;
  vehicleType: string;
  status: string;
  availableWeight: number;
  bookedWeight: number;
  occupancyRate: number;
  transporter: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
  };
}

interface SearchFilters {
  departure: string;
  arrival: string;
  departureDate: string;
  maxWeight: string;
  maxPricePerKg: string;
  vehicleType: string;
}

export default function SearchCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');

  const [filters, setFilters] = useState<SearchFilters>({
    departure: '',
    arrival: '',
    departureDate: '',
    maxWeight: '',
    maxPricePerKg: '',
    vehicleType: ''
  });

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsAuthenticated(true);
            setUserType(data.user.userType);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      }
    };

    checkAuth();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const searchCourses = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres non-vides
      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim() !== '') {
          params.append(key, value.trim());
        }
      });

      const response = await fetch(`/api/courses?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCourses(data.data.courses);
      } else {
        setError(data.message || 'Erreur lors de la recherche');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      departure: '',
      arrival: '',
      departureDate: '',
      maxWeight: '',
      maxPricePerKg: '',
      vehicleType: ''
    });
    setCourses([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVehicleTypeLabel = (type: string) => {
    return type === 'VL' ? 'Véhicule Léger' : 'Poids Lourd';
  };

  const calculateEstimatedPrice = (weight: number, pricePerKg: number) => {
    return (weight * pricePerKg).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-light-beige">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-dark-bordeaux text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary"
            >
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Rechercher des trajets</h1>
              <p className="text-primary-beige">Trouvez le transporteur idéal pour vos marchandises</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulaire de recherche */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <HiMagnifyingGlass className="w-6 h-6 mr-2 text-primary" />
                Recherche de trajets
              </div>
              <Button
                variant="outline"
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <HiAdjustmentsHorizontal className="w-4 h-4 mr-2" />
                Filtres avancés
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recherche de base */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville de départ
                </label>
                <input
                  type="text"
                  name="departure"
                  value={filters.departure}
                  onChange={handleFilterChange}
                  placeholder="Ex: Paris"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville d&apos;arrivée
                </label>
                <input
                  type="text"
                  name="arrival"
                  value={filters.arrival}
                  onChange={handleFilterChange}
                  placeholder="Ex: Lyon"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de départ (à partir de)
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={filters.departureDate}
                  onChange={handleFilterChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Filtres avancés */}
            {showFilters && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Filtres avancés</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poids minimum disponible (kg)
                    </label>
                    <input
                      type="number"
                      name="maxWeight"
                      value={filters.maxWeight}
                      onChange={handleFilterChange}
                      min="1"
                      step="0.1"
                      placeholder="Ex: 100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix maximum par kg (€)
                    </label>
                    <input
                      type="number"
                      name="maxPricePerKg"
                      value={filters.maxPricePerKg}
                      onChange={handleFilterChange}
                      min="0.01"
                      step="0.01"
                      placeholder="Ex: 5.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de véhicule
                    </label>
                    <select
                      name="vehicleType"
                      value={filters.vehicleType}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="">Tous les types</option>
                      <option value="VL">Véhicule Léger (VL)</option>
                      <option value="PL">Poids Lourd (PL)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                Effacer les filtres
              </Button>
              <Button
                variant="primary"
                onClick={searchCourses}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recherche...
                  </>
                ) : (
                  <>
                    <HiMagnifyingGlass className="w-4 h-4 mr-2" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Messages d'erreur */}
        {error && (
          <Card className="border-l-4 border-l-red-500 bg-red-50 mb-6">
            <CardContent className="p-4">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Résultats de recherche */}
        {courses.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark-bordeaux">
                {courses.length} trajet{courses.length > 1 ? 's' : ''} trouvé{courses.length > 1 ? 's' : ''}
              </h3>
            </div>

            {courses.map((course) => (
              <Card key={course.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Itinéraire */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center space-x-3">
                        <HiMapPin className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-semibold text-dark-bordeaux text-lg">
                            {course.departure} → {course.arrival}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <HiTruck className="w-4 h-4 mr-1" />
                            {getVehicleTypeLabel(course.vehicleType)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <HiCalendar className="w-4 h-4 mr-2" />
                          {formatDate(course.departureDate)}
                        </div>
                        {course.estimatedArrival && (
                          <div className="flex items-center text-gray-600">
                            <HiClock className="w-4 h-4 mr-2" />
                            Arrivée: {formatDate(course.estimatedArrival)}
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <HiScale className="w-4 h-4 mr-2" />
                          {course.availableWeight} kg disponible
                        </div>
                        <div className="flex items-center text-gray-600">
                          <HiCurrencyEuro className="w-4 h-4 mr-2" />
                          {course.pricePerKg}€/kg
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm">
                        {course.description}
                      </p>
                    </div>

                    {/* Transporteur */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Transporteur</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <HiUser className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            {course.transporter.firstName} {course.transporter.lastName}
                            {course.transporter.isVerified && (
                              <HiShieldCheck className="w-4 h-4 ml-2 text-green-600" />
                            )}
                          </div>
                          {course.transporter.companyName && (
                            <div className="text-sm text-gray-600">
                              {course.transporter.companyName}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <HiStar className="w-4 h-4 mr-1 text-yellow-500" />
                            {course.transporter.rating.toFixed(1)} ({course.transporter.reviewCount} avis)
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Occupation du trajet</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${course.occupancyRate}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {course.bookedWeight} kg / {course.maxWeight} kg ({course.occupancyRate}%)
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Réserver</h4>
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-sm text-blue-700 mb-2">Simulation rapide</div>
                          <div className="space-y-2">
                            <input
                              type="number"
                              placeholder="Poids (kg)"
                              min="0.1"
                              step="0.1"
                              className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              onChange={(e) => {
                                const weight = parseFloat(e.target.value) || 0;
                                const price = calculateEstimatedPrice(weight, course.pricePerKg);
                                const priceDisplay = e.target.parentElement?.querySelector('.price-display');
                                if (priceDisplay) {
                                  priceDisplay.textContent = weight > 0 ? `≈ ${price}€` : '0€';
                                }
                              }}
                            />
                            <div className="text-lg font-bold text-blue-700 price-display">0€</div>
                          </div>
                        </div>
                        
                        {isAuthenticated ? (
                          userType === 'CLIENT' ? (
                            <Link href={`/courses/${course.id}/book`} className="block">
                              <Button variant="primary" className="w-full">
                                Réserver ce trajet
                              </Button>
                            </Link>
                          ) : (
                            <div className="text-sm text-gray-500 text-center p-3 bg-gray-50 rounded">
                              Réservé aux clients
                            </div>
                          )
                        ) : (
                          <Link href="/auth/login" className="block">
                            <Button variant="outline" className="w-full">
                              Se connecter pour réserver
                            </Button>
                          </Link>
                        )}
                        
                        <Link href={`/courses/${course.id}`} className="block">
                          <Button variant="outline" className="w-full">
                            Voir les détails
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Aucun résultat */}
        {courses.length === 0 && !isLoading && (filters.departure || filters.arrival || filters.departureDate) && (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <HiMagnifyingGlass className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Aucun trajet trouvé
              </h3>
              <p className="text-gray-500 mb-6">
                Essayez de modifier vos critères de recherche ou élargissez votre zone géographique
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            </CardContent>
          </Card>
        )}

        {/* État initial */}
        {courses.length === 0 && !isLoading && !filters.departure && !filters.arrival && !filters.departureDate && (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <HiTruck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Trouvez votre transporteur idéal
              </h3>
              <p className="text-gray-500 mb-6">
                Utilisez les filtres ci-dessus pour rechercher des trajets correspondant à vos besoins
              </p>
              <Button variant="primary" onClick={() => setShowFilters(true)}>
                <HiAdjustmentsHorizontal className="w-4 h-4 mr-2" />
                Afficher les filtres
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 