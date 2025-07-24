'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuthContext';
import { 
  HiMagnifyingGlass, 
  HiMapPin, 
  HiCalendarDays,
  HiTruck,
  HiCube,
  HiScale,
  HiCurrencyEuro,
  HiStar,
  HiClock,
  HiAdjustmentsHorizontal,
  HiExclamationTriangle,
} from 'react-icons/hi2';

interface SearchFilters {
  departure: string;
  arrival: string;
  date: string;
  maxWeight?: number;
  maxVolume?: number;
  maxPrice?: number;
}

interface SortOptions {
  expeditions: {
    earliest: boolean;
    budget_high: boolean;
    weight_high: boolean;
  };
  courses: {
    earliest: boolean;
    price_low: boolean;
    rating: boolean;
    capacity_high: boolean;
    weight_capacity_high: boolean;
  };
}

interface Expedition {
  id: string;
  departureCity: string;
  departureAddress: string;
  arrivalCity: string;
  arrivalAddress: string;
  departureDate: string;
  weight: number;
  volume: number;
  maxBudget?: number;
  description: string;
  urgency: string;
  isFragile: boolean;
  requiresPL: boolean;
  client: {
    firstName: string;
    lastName: string;
    rating?: number;
    reviewCount?: number;
  };
  currentOffers: number;
}

interface Course {
  id: string;
  departure: string;
  arrival: string;
  stops: string[];
  departureDate: string;
  estimatedArrival: string;
  maxWeight: number;
  availableSpace: number;
  pricePerKg: number;
  vehicleType: string;
  description: string;
  transporter: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    rating?: number;
    reviewCount?: number;
  };
}

export default function SearchContent() {
  console.log('🚀 SearchContent component is rendering');
  
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  console.log('👤 User from useAuth:', user);
  console.log('🔗 SearchParams:', Object.fromEntries(searchParams.entries()));
  const [filters, setFilters] = useState<SearchFilters>({
    departure: '',
    arrival: '',
    date: '',
    maxWeight: undefined,
    maxVolume: undefined,
    maxPrice: undefined
  });

  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'expeditions' | 'courses'>('expeditions');
  const [forceShowType, setForceShowType] = useState<string | null>(null);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    expeditions: {
      earliest: true,
      budget_high: false,
      weight_high: false
    },
    courses: {
      earliest: true,
      price_low: false,
      rating: false,
      capacity_high: false,
      weight_capacity_high: false
    }
  });

  // Initialiser les filtres depuis les paramètres URL
  useEffect(() => {
    const departure = searchParams.get('departure') || '';
    const arrival = searchParams.get('arrival') || '';
    const date = searchParams.get('date') || '';
    const maxWeight = searchParams.get('maxWeight');
    const maxVolume = searchParams.get('maxVolume');
    const maxPrice = searchParams.get('maxPrice');
    const type = searchParams.get('type');

    setFilters({
      departure,
      arrival,
      date,
      maxWeight: maxWeight ? parseFloat(maxWeight) : undefined,
      maxVolume: maxVolume ? parseFloat(maxVolume) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
    });

    if (type) {
      setForceShowType(type);
      if (type === 'expedition') {
        setActiveTab('expeditions');
      } else if (type === 'course') {
        setActiveTab('courses');
      }
    }

  }, [searchParams]);

  // Effet séparé pour lancer la recherche automatique
  useEffect(() => {
    if (filters.departure && filters.arrival && filters.departure.trim() && filters.arrival.trim()) {
      // Si on a été forcé à afficher un type depuis l'URL, lancer la recherche
      const urlType = searchParams.get('type');
      if (urlType) {
        handleSearch();
      }
    }
  }, [filters.departure, filters.arrival]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async () => {
    console.log('🔍 Début de la recherche avec filtres:', filters);
    
    // Validation côté client
    if (!filters.departure || !filters.arrival) {
      setError('Veuillez renseigner la ville de départ et d\'arrivée');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (filters.departure?.trim()) searchParams.set('departure', filters.departure.trim());
      if (filters.arrival?.trim()) searchParams.set('arrival', filters.arrival.trim());
      if (filters.date) searchParams.set('date', filters.date);
      if (filters.maxWeight) searchParams.set('maxWeight', filters.maxWeight.toString());
      if (filters.maxVolume) searchParams.set('maxVolume', filters.maxVolume.toString());
      if (filters.maxPrice) searchParams.set('maxPrice', filters.maxPrice.toString());

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/search?${searchParams.toString()}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données reçues:', data);
        setExpeditions(data.expeditions || []);
        setCourses(data.courses || []);
        
        // Déterminer quel onglet afficher en premier
        if (forceShowType) {
          // Si on force un type, on respecte ce choix
          if (forceShowType === 'expedition') {
            setActiveTab('expeditions');
          } else if (forceShowType === 'course') {
            setActiveTab('courses');
          }
        } else {
          // Sinon, afficher l'onglet avec des résultats
          if (data.expeditions?.length > 0 && (!data.courses?.length || data.expeditions.length >= data.courses.length)) {
            setActiveTab('expeditions');
          } else if (data.courses?.length > 0) {
            setActiveTab('courses');
          }
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur API:', response.status, errorData);
        setError(errorData.message || 'Erreur lors de la recherche');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('💥 Erreur de recherche:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      departure: '',
      arrival: '',
      date: '',
      maxWeight: undefined,
      maxVolume: undefined,
      maxPrice: undefined
    });
    setExpeditions([]);
    setCourses([]);
    setError(null);
    setForceShowType(null);
  };

  // Fonctions de tri multi-critères avec système de scoring
  const sortExpeditions = (expeditions: Expedition[]) => {
    const activeCriteria = Object.entries(sortOptions.expeditions).filter(([, active]) => active);
    
    // Si aucun critère actif, retourner tel quel
    if (activeCriteria.length === 0) return expeditions;

    // Tri multi-critères avec comptage des "victoires"
    const scoredExpeditions = expeditions.map(expedition => {
      // Calculer les valeurs pour chaque critère
      const values: Record<string, number> = {};
      activeCriteria.forEach(([criterion]) => {
        switch (criterion) {
          case 'earliest':
            values.earliest = new Date(expedition.departureDate).getTime();
            break;
          case 'budget_high':
            values.budget_high = expedition.maxBudget || 0;
            break;
          case 'weight_high':
            values.weight_high = expedition.weight;
            break;
        }
      });

      return { expedition, values };
    });

    // Comparer chaque paire et compter les "victoires"
    const scored = scoredExpeditions.map(item => {
      let score = 0;
      
      scoredExpeditions.forEach(other => {
        if (item === other) return;
        
        let wins = 0;
        let total = 0;
        
        activeCriteria.forEach(([criterion]) => {
          total++;
          const myValue = item.values[criterion];
          const otherValue = other.values[criterion];
          
          if (criterion === 'earliest') {
            // Plus tôt = mieux (valeur plus petite)
            if (myValue < otherValue) wins++;
          } else {
            // Plus élevé = mieux (budget et poids)
            if (myValue > otherValue) wins++;
          }
        });
        
        score += wins / total;
      });
      
      return { ...item, score };
    });

    // Trier par score décroissant
    return scored
      .sort((a, b) => b.score - a.score)
      .map(item => item.expedition);
  };

  const sortCourses = (courses: Course[]) => {
    const activeCriteria = Object.entries(sortOptions.courses).filter(([, active]) => active);
    
    // Si aucun critère actif, retourner tel quel
    if (activeCriteria.length === 0) return courses;

    // Tri multi-critères avec comptage des "victoires"
    const scoredCourses = courses.map(course => {
      // Calculer les valeurs pour chaque critère
      const values: Record<string, number> = {};
      activeCriteria.forEach(([criterion]) => {
        switch (criterion) {
          case 'earliest':
            values.earliest = new Date(course.departureDate).getTime();
            break;
          case 'price_low':
            values.price_low = course.pricePerKg;
            break;
          case 'rating':
            values.rating = course.transporter.rating || 0;
            break;
          case 'capacity_high':
            values.capacity_high = course.availableSpace;
            break;
          case 'weight_capacity_high':
            values.weight_capacity_high = course.maxWeight;
            break;
        }
      });

      return { course, values };
    });

    // Comparer chaque paire et compter les "victoires"
    const scored = scoredCourses.map(item => {
      let score = 0;
      
      scoredCourses.forEach(other => {
        if (item === other) return;
        
        let wins = 0;
        let total = 0;
        
        activeCriteria.forEach(([criterion]) => {
          total++;
          const myValue = item.values[criterion];
          const otherValue = other.values[criterion];
          
          if (criterion === 'earliest' || criterion === 'price_low') {
            // Plus tôt/moins cher = mieux (valeur plus petite)
            if (myValue < otherValue) wins++;
          } else {
            // Plus élevé = mieux (rating, capacité, poids)
            if (myValue > otherValue) wins++;
          }
        });
        
        score += wins / total;
      });
      
      return { ...item, score };
    });

    // Trier par score décroissant
    return scored
      .sort((a, b) => b.score - a.score)
      .map(item => item.course);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-red-100 text-red-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'LOW':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return 'Urgent';
      case 'MEDIUM':
        return 'Normal';
      case 'LOW':
        return 'Flexible';
      default:
        return 'Normal';
    }
  };

  const sortedExpeditions = sortExpeditions(expeditions);
  const sortedCourses = sortCourses(courses);

  console.log('📊 État des résultats:', {
    expeditions: expeditions.length,
    courses: courses.length,
    sortedExpeditions: sortedExpeditions.length,
    sortedCourses: sortedCourses.length,
    activeTab,
    isLoading,
    error
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-beige via-primary-beige to-light-beige">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dark-bordeaux mb-4">
            Rechercher des trajets
          </h1>
          <p className="text-gray-600 text-lg">
            Trouvez le trajet parfait pour vos besoins
          </p>
        </div>

        {/* Formulaire de recherche */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <HiMapPin className="inline w-4 h-4 mr-1" />
                Départ
              </label>
              <input
                type="text"
                value={filters.departure}
                onChange={(e) => setFilters({ ...filters, departure: e.target.value })}
                placeholder="Ville de départ"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <HiMapPin className="inline w-4 h-4 mr-1" />
                Arrivée
              </label>
              <input
                type="text"
                value={filters.arrival}
                onChange={(e) => setFilters({ ...filters, arrival: e.target.value })}
                placeholder="Ville d'arrivée"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <HiCalendarDays className="inline w-4 h-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-primary hover:text-dark-bordeaux transition-colors"
            >
              <HiAdjustmentsHorizontal className="w-4 h-4 mr-2" />
              Filtres avancés
            </button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recherche...
                  </div>
                ) : (
                  <>
                    <HiMagnifyingGlass className="w-4 h-4 mr-2" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiScale className="inline w-4 h-4 mr-1" />
                  Poids max (kg)
                </label>
                <input
                  type="number"
                  value={filters.maxWeight || ''}
                  onChange={(e) => setFilters({ ...filters, maxWeight: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Poids maximum"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiCube className="inline w-4 h-4 mr-1" />
                  Volume max (m³)
                </label>
                <input
                  type="number"
                  value={filters.maxVolume || ''}
                  onChange={(e) => setFilters({ ...filters, maxVolume: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Volume maximum"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiCurrencyEuro className="inline w-4 h-4 mr-1" />
                  Prix max
                </label>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Prix maximum"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Résultats */}
        {(expeditions.length > 0 || courses.length > 0) && (
          <div>
            {/* Onglets */}
            <div className="flex mb-6">
              <button
                onClick={() => setActiveTab('expeditions')}
                className={`flex items-center px-6 py-3 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'expeditions'
                    ? 'bg-white text-primary border-b-2 border-primary'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
              >
                <HiCube className="w-5 h-5 mr-2" />
                Expéditions ({expeditions.length})
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`flex items-center px-6 py-3 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'courses'
                    ? 'bg-white text-primary border-b-2 border-primary'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
              >
                <HiTruck className="w-5 h-5 mr-2" />
                Trajets ({courses.length})
              </button>
            </div>

            {/* Options de tri */}
            <Card className="p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Options de tri</h3>
              
              {activeTab === 'expeditions' && (
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sortOptions.expeditions.earliest}
                      onChange={(e) => setSortOptions({
                        ...sortOptions,
                        expeditions: {
                          ...sortOptions.expeditions,
                          earliest: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Départ le plus proche</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sortOptions.expeditions.budget_high}
                      onChange={(e) => setSortOptions({
                        ...sortOptions,
                        expeditions: {
                          ...sortOptions.expeditions,
                          budget_high: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Budget le plus élevé</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sortOptions.expeditions.weight_high}
                      onChange={(e) => setSortOptions({
                        ...sortOptions,
                        expeditions: {
                          ...sortOptions.expeditions,
                          weight_high: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Poids le plus élevé</span>
                  </label>
                </div>
              )}

              {activeTab === 'courses' && (
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sortOptions.courses.earliest}
                      onChange={(e) => setSortOptions({
                        ...sortOptions,
                        courses: {
                          ...sortOptions.courses,
                          earliest: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Départ le plus proche</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sortOptions.courses.price_low}
                      onChange={(e) => setSortOptions({
                        ...sortOptions,
                        courses: {
                          ...sortOptions.courses,
                          price_low: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Prix le plus bas</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sortOptions.courses.rating}
                      onChange={(e) => setSortOptions({
                        ...sortOptions,
                        courses: {
                          ...sortOptions.courses,
                          rating: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Meilleure note</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sortOptions.courses.capacity_high}
                      onChange={(e) => setSortOptions({
                        ...sortOptions,
                        courses: {
                          ...sortOptions.courses,
                          capacity_high: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Plus grande capacité</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sortOptions.courses.weight_capacity_high}
                      onChange={(e) => setSortOptions({
                        ...sortOptions,
                        courses: {
                          ...sortOptions.courses,
                          weight_capacity_high: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Capacité de poids élevée</span>
                  </label>
                </div>
              )}
            </Card>

            {/* Liste des résultats */}
            <div className="space-y-4">
              {activeTab === 'expeditions' && sortedExpeditions.map((expedition) => (
                <Card key={expedition.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-dark-bordeaux">
                          {expedition.departureAddress || expedition.departureCity} → {expedition.arrivalAddress || expedition.arrivalCity}
                        </h3>
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(expedition.urgency)}`}>
                          {getUrgencyLabel(expedition.urgency)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{expedition.description}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <HiCalendarDays className="w-4 h-4 mr-1" />
                          {formatDate(expedition.departureDate)}
                        </span>
                        <span className="flex items-center">
                          <HiScale className="w-4 h-4 mr-1" />
                          {expedition.weight}kg
                        </span>
                        <span className="flex items-center">
                          <HiCube className="w-4 h-4 mr-1" />
                          {expedition.volume}m³
                        </span>
                        {expedition.isFragile && (
                          <span className="flex items-center text-orange-600">
                            <HiExclamationTriangle className="w-4 h-4 mr-1" />
                            Fragile
                          </span>
                        )}
                        {expedition.requiresPL && (
                          <span className="flex items-center text-blue-600">
                            <HiTruck className="w-4 h-4 mr-1" />
                            Permis PL requis
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {expedition.maxBudget && (
                        <div className="text-lg font-bold text-primary mb-1">
                          {formatPrice(expedition.maxBudget)}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 mb-2">
                        {expedition.currentOffers} offre(s)
                      </div>
                      <div className="text-sm text-gray-600">
                        {expedition.client.firstName} {expedition.client.lastName}
                        {expedition.client.rating && (
                          <span className="flex items-center mt-1">
                            <HiStar className="w-4 h-4 text-yellow-400 mr-1" />
                            {expedition.client.rating.toFixed(1)} ({expedition.client.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="primary">
                      Faire une offre
                    </Button>
                  </div>
                </Card>
              ))}

              {activeTab === 'courses' && sortedCourses.map((course) => (
                <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-dark-bordeaux mb-2">
                        {course.departure} → {course.arrival}
                      </h3>
                      {course.stops && course.stops.length > 0 && (
                        <p className="text-sm text-gray-500 mb-2">
                          Escales: {course.stops.join(', ')}
                        </p>
                      )}
                      <p className="text-gray-600 mb-2">{course.description}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <HiCalendarDays className="w-4 h-4 mr-1" />
                          {formatDate(course.departureDate)}
                        </span>
                        <span className="flex items-center">
                          <HiClock className="w-4 h-4 mr-1" />
                          Arrivée: {formatDate(course.estimatedArrival)}
                        </span>
                        <span className="flex items-center">
                          <HiScale className="w-4 h-4 mr-1" />
                          {course.maxWeight}kg max
                        </span>
                        <span className="flex items-center">
                          <HiCube className="w-4 h-4 mr-1" />
                          {course.availableSpace}m³ dispo
                        </span>
                        <span className="flex items-center">
                          <HiTruck className="w-4 h-4 mr-1" />
                          {course.vehicleType}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary mb-1">
                        {formatPrice(course.pricePerKg)}/kg
                      </div>
                      <div className="text-sm text-gray-600">
                        {course.transporter.companyName || `${course.transporter.firstName} ${course.transporter.lastName}`}
                        {course.transporter.rating && (
                          <span className="flex items-center mt-1">
                            <HiStar className="w-4 h-4 text-yellow-400 mr-1" />
                            {course.transporter.rating.toFixed(1)} ({course.transporter.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="primary">
                      Réserver
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Message si aucun résultat */}
            {activeTab === 'expeditions' && expeditions.length === 0 && (
              <Card className="p-8 text-center">
                <HiCube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune expédition trouvée</h3>
                <p className="text-gray-600">Essayez de modifier vos critères de recherche.</p>
              </Card>
            )}

            {activeTab === 'courses' && courses.length === 0 && (
              <Card className="p-8 text-center">
                <HiTruck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun trajet trouvé</h3>
                <p className="text-gray-600">Essayez de modifier vos critères de recherche.</p>
              </Card>
            )}
          </div>
        )}

        {/* Message d'accueil si pas de recherche */}
        {!isLoading && expeditions.length === 0 && courses.length === 0 && !error && (
          <Card className="p-12 text-center">
            <HiMagnifyingGlass className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              Commencez votre recherche
            </h3>
            <p className="text-gray-600 mb-6">
              Entrez votre ville de départ et d&apos;arrivée pour trouver des trajets disponibles.
            </p>
            {!user && (
              <p className="text-sm text-gray-500">
                <span className="font-medium">Astuce :</span> Connectez-vous pour accéder à plus de fonctionnalités !
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
} 