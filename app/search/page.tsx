'use client';

import { useState, useEffect, Suspense } from 'react';
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
} from 'react-icons/hi2';

interface SearchFilters {
  departure: string;
  arrival: string;
  date: string;
  maxWeight?: number;
  maxVolume?: number;
  maxPrice?: number;
}

// Correction du type SortOptions pour correspondre à l'utilisation dans le code
interface SortOptions {
  expeditions: [string, string][];
  courses: [string, string][];
}

interface Expedition {
  id: string;
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  weight: number;
  volume: number;
  description: string;
  value?: number;
  isFragile: boolean;
  urgency: string;
  status: string;
  maxBudget?: number;
  currentOffers: number;
  departureAddress?: string;
  arrivalAddress?: string;
  requiresPL?: boolean;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    rating?: number;
    reviewCount?: number;
    [key: string]: unknown;
  };
}

interface Course {
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
  stops: string[];
  transporter: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    rating?: number;
    reviewCount?: number;
    [key: string]: unknown;
  };
}

function SearchPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
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
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [forceShowType, setForceShowType] = useState<string | null>(null);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    expeditions: [['earliest', 'asc'], ['budget_high', 'desc'], ['weight_high', 'desc']],
    courses: [['earliest', 'asc'], ['price_low', 'asc'], ['rating', 'desc'], ['capacity_high', 'desc'], ['weight_capacity_high', 'desc']]
  });

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Traiter les paramètres d'URL
  useEffect(() => {
    const departure = searchParams.get('departure');
    const arrival = searchParams.get('arrival');
    const date = searchParams.get('date');
    const type = searchParams.get('type'); // 'send' ou 'transport'

    if (departure && arrival) {
      // Pré-remplir les filtres avec les paramètres d'URL
      setFilters(prev => ({
        ...prev,
        departure,
        arrival,
        date: date || ''
      }));
      setIsSearchMode(true);
      
      // Forcer l'affichage selon le type sélectionné
      if (type) {
        setForceShowType(type);
      }
    }
  }, [searchParams]);

  // Charger toutes les courses disponibles au démarrage
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/search/available', {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        const data = await response.json();
        if (data.success) {
          setExpeditions(data.data.expeditions || []);
          setCourses(data.data.courses || []);
          setHasSearched(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Lancer la recherche automatiquement quand isSearchMode devient true (paramètres d'URL)
  useEffect(() => {
    if (isSearchMode && filters.departure && filters.arrival && !hasSearched) {
      // Simuler la soumission du formulaire
      const form = document.querySelector('form');
      if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
      }
    }
  }, [isSearchMode, filters.departure, filters.arrival, hasSearched]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filters.departure || !filters.arrival) {
      alert('Veuillez remplir au moins le lieu de départ et d\'arrivée');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setIsSearchMode(true);

    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        departure: filters.departure,
        arrival: filters.arrival,
        ...(filters.date && { date: filters.date }),
        ...(filters.maxWeight && { maxWeight: filters.maxWeight.toString() }),
        ...(filters.maxVolume && { maxVolume: filters.maxVolume.toString() }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice.toString() })
      });

      const response = await fetch(`/api/search?${queryParams}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const data = await response.json();

      if (data.success) {
        setExpeditions(data.data.expeditions || []);
        setCourses(data.data.courses || []);
      } else {
        console.error('Erreur lors de la recherche:', data.message);
        setExpeditions([]);
        setCourses([]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setExpeditions([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const shouldShowExpeditions = () => {
    // Si type forcé depuis la page d'accueil
    if (forceShowType === 'transport') return true;
    if (forceShowType === 'send') return false;
    
    // Logique normale selon le type d'utilisateur
    return user?.userType === 'TRANSPORTER' || user?.userType === 'ADMIN' || !user;
  };

  const shouldShowCourses = () => {
    // Si type forcé depuis la page d'accueil
    if (forceShowType === 'send') return true;
    if (forceShowType === 'transport') return false;
    
    // Logique normale selon le type d'utilisateur
    return user?.userType === 'CLIENT' || user?.userType === 'ADMIN' || !user;
  };

  // Fonctions de tri multi-critères avec système de scoring
  const sortExpeditions = (expeditions: Expedition[]) => {
    const activeCriteria = sortOptions.expeditions.filter(([, active]) => active === 'asc' || active === 'desc');
    
    // Si aucun critère actif, retourner tel quel
    if (activeCriteria.length === 0) return expeditions;
    
    // Si un seul critère, utiliser le tri simple
    if (activeCriteria.length === 1) {
      const [criterion] = activeCriteria[0];
      const sorted = [...expeditions];
      switch (criterion) {
        case 'earliest':
          return sorted.sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
        case 'budget_high':
          return sorted.sort((a, b) => (b.maxBudget || 0) - (a.maxBudget || 0));
        case 'weight_high':
          return sorted.sort((a, b) => b.weight - a.weight);
        default:
          return sorted;
      }
    }
    
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
      
      return {
        ...expedition,
        criteriaValues: values
      };
    });
    
    // Calculer combien de critères chaque expédition "gagne"
    const finalScored = scoredExpeditions.map(expedition => {
      let wins = 0;
      
      activeCriteria.forEach(([criterion]) => {
        let isWinner = false;
        
        switch (criterion) {
          case 'earliest':
            // Gagne si c'est le plus tôt (timestamp le plus petit)
            const earliestTime = Math.min(...scoredExpeditions.map(e => e.criteriaValues.earliest || Infinity));
            isWinner = expedition.criteriaValues.earliest === earliestTime;
            break;
          case 'budget_high':
            // Gagne si c'est le budget le plus élevé
            const highestBudget = Math.max(...scoredExpeditions.map(e => e.criteriaValues.budget_high || 0));
            isWinner = expedition.criteriaValues.budget_high === highestBudget;
            break;
          case 'weight_high':
            // Gagne si c'est le poids le plus élevé
            const highestWeight = Math.max(...scoredExpeditions.map(e => e.criteriaValues.weight_high || 0));
            isWinner = expedition.criteriaValues.weight_high === highestWeight;
            break;
        }
        
        if (isWinner) wins++;
      });
      
      return {
        ...expedition,
        wins,
        totalCriteria: activeCriteria.length
      };
    });
    
    // Trier par nombre de "victoires" décroissant, puis par score total en cas d'égalité
    return finalScored.sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins; // Plus de victoires = mieux classé
      }
      
      // En cas d'égalité sur les victoires, départager par la somme des rangs
      let scoreA = 0, scoreB = 0;
      activeCriteria.forEach(([criterion]) => {
        const values = scoredExpeditions.map(e => e.criteriaValues[criterion]).sort((x, y) => {
          if (criterion === 'earliest') {
            return x - y; // Croissant pour date
          }
          return y - x; // Décroissant pour budget et poids
        });
        
        scoreA += values.indexOf(a.criteriaValues[criterion]);
        scoreB += values.indexOf(b.criteriaValues[criterion]);
      });
      
      return scoreA - scoreB; // Meilleur rang moyen = mieux classé
    });
  };

  const sortCourses = (courses: Course[]) => {
    const activeCriteria = sortOptions.courses.filter(([, active]) => active === 'asc' || active === 'desc');
    
    // Si aucun critère actif, retourner tel quel
    if (activeCriteria.length === 0) return courses;
    
    // Si un seul critère, utiliser le tri simple
    if (activeCriteria.length === 1) {
      const [criterion] = activeCriteria[0];
      const sorted = [...courses];
      switch (criterion) {
        case 'earliest':
          return sorted.sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
        case 'price_low':
          return sorted.sort((a, b) => a.pricePerKg - b.pricePerKg);
        case 'rating':
          return sorted.sort((a, b) => (b.transporter.rating || 0) - (a.transporter.rating || 0));
        case 'capacity_high':
          return sorted.sort((a, b) => b.availableSpace - a.availableSpace);
        case 'weight_capacity_high':
          return sorted.sort((a, b) => b.maxWeight - a.maxWeight);
        default:
          return sorted;
      }
    }
    
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
      
      return {
        ...course,
        criteriaValues: values
      };
    });
    
    // Calculer combien de critères chaque cours "gagne"
    const finalScored = scoredCourses.map(course => {
      let wins = 0;
      
      activeCriteria.forEach(([criterion]) => {
        let isWinner = false;
        
        switch (criterion) {
          case 'earliest':
            // Gagne si c'est le plus tôt (timestamp le plus petit)
            const earliestTime = Math.min(...scoredCourses.map(c => c.criteriaValues.earliest || Infinity));
            isWinner = course.criteriaValues.earliest === earliestTime;
            break;
          case 'price_low':
            // Gagne si c'est le moins cher
            const lowestPrice = Math.min(...scoredCourses.map(c => c.criteriaValues.price_low || Infinity));
            isWinner = course.criteriaValues.price_low === lowestPrice;
            break;
          case 'rating':
            // Gagne si c'est la meilleure note
            const highestRating = Math.max(...scoredCourses.map(c => c.criteriaValues.rating || 0));
            isWinner = course.criteriaValues.rating === highestRating;
            break;
          case 'capacity_high':
            // Gagne si c'est la plus grande capacité
            const highestCapacity = Math.max(...scoredCourses.map(c => c.criteriaValues.capacity_high || 0));
            isWinner = course.criteriaValues.capacity_high === highestCapacity;
            break;
          case 'weight_capacity_high':
            // Gagne si c'est la plus grande capacité de poids
            const highestWeight = Math.max(...scoredCourses.map(c => c.criteriaValues.weight_capacity_high || 0));
            isWinner = course.criteriaValues.weight_capacity_high === highestWeight;
            break;
        }
        
        if (isWinner) wins++;
      });
      
      return {
        ...course,
        wins,
        totalCriteria: activeCriteria.length
      };
    });
    
    // Trier par nombre de "victoires" décroissant, puis par score total en cas d'égalité
    return finalScored.sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins; // Plus de victoires = mieux classé
      }
      
      // En cas d'égalité sur les victoires, départager par la somme des rangs
      let scoreA = 0, scoreB = 0;
      activeCriteria.forEach(([criterion]) => {
        const values = scoredCourses.map(c => c.criteriaValues[criterion]).sort((x, y) => {
          if (criterion === 'earliest' || criterion === 'price_low') {
            return x - y; // Croissant pour date et prix
          }
          return y - x; // Décroissant pour rating et capacités
        });
        
        scoreA += values.indexOf(a.criteriaValues[criterion]);
        scoreB += values.indexOf(b.criteriaValues[criterion]);
      });
      
      return scoreA - scoreB; // Meilleur rang moyen = mieux classé
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-beige to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-bordeaux mb-4">
            Rechercher un transport
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {user?.userType === 'TRANSPORTER' && "Trouvez des expéditions à transporter"}
            {user?.userType === 'CLIENT' && "Trouvez des transporteurs disponibles"}
            {(!user || user?.userType === 'ADMIN') && "Trouvez des expéditions et des transporteurs"}
          </p>
        </div>

        {/* Formulaire de recherche */}
        <Card className="max-w-7xl mx-auto mb-8 p-6">
          <form onSubmit={handleSearch} className="space-y-6 flex justify-center items-center gap-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiMapPin className="inline w-4 h-4 mr-1" />
                    Lieu de départ *
                  </label>
                  <input
                    type="text"
                    value={filters.departure}
                    onChange={(e) => setFilters({...filters, departure: e.target.value})}
                    placeholder="Ex: Paris, Marseille..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiMapPin className="inline w-4 h-4 mr-1" />
                    Lieu d&apos;arrivée *
                  </label>
                  <input
                    type="text"
                    value={filters.arrival}
                    onChange={(e) => setFilters({...filters, arrival: e.target.value})}
                    placeholder="Ex: Lyon, Bordeaux..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiCalendarDays className="inline w-4 h-4 mr-1" />
                    Date de départ
                  </label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                    min={formatDateForInput(new Date())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Optionnel"
                  />
                </div>
              </div>

              {/* Filtres avancés */}
              <details className="border border-gray-200 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-primary">
                  Filtres avancés (optionnel)
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiScale className="inline w-4 h-4 mr-1" />
                      Poids max (kg)
                    </label>
                    <input
                      type="number"
                      value={filters.maxWeight || ''}
                      onChange={(e) => setFilters({...filters, maxWeight: e.target.value ? Number(e.target.value) : undefined})}
                      placeholder="Ex: 50"
                      min="0.1"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      onChange={(e) => setFilters({...filters, maxVolume: e.target.value ? Number(e.target.value) : undefined})}
                      placeholder="Ex: 2.5"
                      min="0.00001"
                      step="0.00001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiCurrencyEuro className="inline w-4 h-4 mr-1" />
                      Budget max (€)
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice || ''}
                      onChange={(e) => setFilters({...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined})}
                      placeholder="Ex: 100"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </details>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-3 text-lg hover:bg-primary hover:text-white rounded-xl shadow-xl cursor-pointer hover:scale-105 transition-all duration-300"
              >
                <HiMagnifyingGlass className="w-5 h-5 mr-2" />
                {loading ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>
          </form>
        </Card>

        {/* État de chargement initial */}
        {initialLoading && (
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-lg text-gray-600">Chargement des trajets disponibles...</span>
              </div>
            </Card>
          </div>
        )}

        {/* Résultats avec sidebar */}
        {!initialLoading && hasSearched && (
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              {/* Sidebar des filtres - Desktop */}
              <div className="hidden lg:block w-80">
                <div className="sticky top-8">
                  <Card className="p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-bordeaux flex items-center">
                      <HiAdjustmentsHorizontal className="w-5 h-5 mr-2" />
                      Trier les résultats
                    </h3>

                    {/* Tri des expéditions */}
                    {shouldShowExpeditions() && expeditions.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <HiCube className="inline w-4 h-4 mr-1" />
                          Trier les expéditions
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sortOptions.expeditions.some(([criterion]) => criterion === 'earliest')}
                              onChange={(e) => {
                                const newSortOptions = { ...sortOptions };
                                if (e.target.checked) {
                                  newSortOptions.expeditions = [['earliest', 'asc']];
                                } else {
                                  newSortOptions.expeditions = newSortOptions.expeditions.filter(([c]) => c !== 'earliest');
                                }
                                setSortOptions(newSortOptions);
                              }}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-sm">Départ le plus tôt</span>
                          </label>
                          
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sortOptions.expeditions.some(([criterion]) => criterion === 'budget_high')}
                              onChange={(e) => {
                                const newSortOptions = { ...sortOptions };
                                if (e.target.checked) {
                                  newSortOptions.expeditions = [['budget_high', 'desc']];
                                } else {
                                  newSortOptions.expeditions = newSortOptions.expeditions.filter(([c]) => c !== 'budget_high');
                                }
                                setSortOptions(newSortOptions);
                              }}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-sm">Budget le plus élevé</span>
                          </label>
                          
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sortOptions.expeditions.some(([criterion]) => criterion === 'weight_high')}
                              onChange={(e) => {
                                const newSortOptions = { ...sortOptions };
                                if (e.target.checked) {
                                  newSortOptions.expeditions = [['weight_high', 'desc']];
                                } else {
                                  newSortOptions.expeditions = newSortOptions.expeditions.filter(([c]) => c !== 'weight_high');
                                }
                                setSortOptions(newSortOptions);
                              }}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-sm">Poids le plus élevé</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Tri des trajets */}
                    {shouldShowCourses() && courses.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <HiTruck className="inline w-4 h-4 mr-1" />
                          Trier les trajets
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sortOptions.courses.some(([criterion]) => criterion === 'earliest')}
                              onChange={(e) => {
                                const newSortOptions = { ...sortOptions };
                                if (e.target.checked) {
                                  newSortOptions.courses = [['earliest', 'asc']];
                                } else {
                                  newSortOptions.courses = newSortOptions.courses.filter(([c]) => c !== 'earliest');
                                }
                                setSortOptions(newSortOptions);
                              }}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-sm">Départ le plus tôt</span>
                          </label>
                          
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sortOptions.courses.some(([criterion]) => criterion === 'price_low')}
                              onChange={(e) => {
                                const newSortOptions = { ...sortOptions };
                                if (e.target.checked) {
                                  newSortOptions.courses = [['price_low', 'asc']];
                                } else {
                                  newSortOptions.courses = newSortOptions.courses.filter(([c]) => c !== 'price_low');
                                }
                                setSortOptions(newSortOptions);
                              }}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-sm">Prix le plus bas</span>
                          </label>
                          
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sortOptions.courses.some(([criterion]) => criterion === 'rating')}
                              onChange={(e) => {
                                const newSortOptions = { ...sortOptions };
                                if (e.target.checked) {
                                  newSortOptions.courses = [['rating', 'desc']];
                                } else {
                                  newSortOptions.courses = newSortOptions.courses.filter(([c]) => c !== 'rating');
                                }
                                setSortOptions(newSortOptions);
                              }}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-sm">Meilleure note transporteur</span>
                          </label>
                          
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sortOptions.courses.some(([criterion]) => criterion === 'capacity_high')}
                              onChange={(e) => {
                                const newSortOptions = { ...sortOptions };
                                if (e.target.checked) {
                                  newSortOptions.courses = [['capacity_high', 'desc']];
                                } else {
                                  newSortOptions.courses = newSortOptions.courses.filter(([c]) => c !== 'capacity_high');
                                }
                                setSortOptions(newSortOptions);
                              }}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-sm">Plus grand nombre de places</span>
                          </label>
                          
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sortOptions.courses.some(([criterion]) => criterion === 'weight_capacity_high')}
                              onChange={(e) => {
                                const newSortOptions = { ...sortOptions };
                                if (e.target.checked) {
                                  newSortOptions.courses = [['weight_capacity_high', 'desc']];
                                } else {
                                  newSortOptions.courses = newSortOptions.courses.filter(([c]) => c !== 'weight_capacity_high');
                                }
                                setSortOptions(newSortOptions);
                              }}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-sm">Plus grande capacité en poids</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Légendes */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Légende des notes</h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <div className="flex items-center mr-2">
                            {[1,2,3,4,5].map((star) => (
                              <HiStar key={star} className="w-3 h-3 text-yellow-400" />
                            ))}
                          </div>
                          <span>Excellent (5/5)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center mr-2">
                            {[1,2,3,4].map((star) => (
                              <HiStar key={star} className="w-3 h-3 text-yellow-400" />
                            ))}
                            <HiStar className="w-3 h-3 text-gray-300" />
                          </div>
                          <span>Très bon (4/5)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center mr-2">
                            {[1,2,3].map((star) => (
                              <HiStar key={star} className="w-3 h-3 text-yellow-400" />
                            ))}
                            {[4,5].map((star) => (
                              <HiStar key={star} className="w-3 h-3 text-gray-300" />
                            ))}
                          </div>
                          <span>Correct (3/5)</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="flex-1 space-y-8">
                {/* Filtres Mobile */}
                <div className="lg:hidden">
                  <details className="border border-gray-200 rounded-lg p-4 mb-4">
                    <summary className="cursor-pointer font-medium text-gray-700 hover:text-primary flex items-center">
                      <HiAdjustmentsHorizontal className="w-5 h-5 mr-2" />
                      Recherche avancée et tri
                    </summary>
                    <div className="mt-4 space-y-4">
                      {/* Tri des expéditions mobile */}
                      {shouldShowExpeditions() && expeditions.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <HiCube className="inline w-4 h-4 mr-1" />
                            Trier les expéditions
                          </label>
                          <select
                            onChange={(e) => {
                              const value = e.target.value;
                              // Reset tous les critères puis active celui sélectionné
                              const newExpeditions: [string, string][] = [];
                              if (value !== 'none') {
                                newExpeditions.push([value, value === 'earliest' ? 'asc' : 'desc']);
                              }
                              setSortOptions({
                                ...sortOptions,
                                expeditions: newExpeditions
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="none">Aucun tri</option>
                            <option value="earliest">Départ le plus tôt</option>
                            <option value="budget_high">Budget le plus élevé</option>
                            <option value="weight_high">Poids le plus élevé</option>
                          </select>
                        </div>
                      )}

                      {/* Tri des trajets mobile */}
                      {shouldShowCourses() && courses.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <HiTruck className="inline w-4 h-4 mr-1" />
                            Trier les trajets
                          </label>
                          <select
                            onChange={(e) => {
                              const value = e.target.value;
                              // Reset tous les critères puis active celui sélectionné
                              const newCourses: [string, string][] = [];
                              if (value !== 'none') {
                                newCourses.push([value, value === 'earliest' || value === 'price_low' ? 'asc' : 'desc']);
                              }
                              setSortOptions({
                                ...sortOptions,
                                courses: newCourses
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="none">Aucun tri</option>
                            <option value="earliest">Départ le plus tôt</option>
                            <option value="price_low">Prix le plus bas</option>
                            <option value="rating">Meilleure note transporteur</option>
                            <option value="capacity_high">Plus grand nombre de places</option>
                            <option value="weight_capacity_high">Plus grande capacité en poids</option>
                          </select>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
                        💡 Astuce : Utilisez la version desktop pour combiner plusieurs critères de tri
                      </div>
                    </div>
                  </details>
                </div>
                
                {/* Expéditions (pour transporteurs) */}
                {shouldShowExpeditions() && (
                  <section>
                    <h2 className="text-2xl font-bold text-bordeaux mb-6 flex items-center">
                      <HiCube className="w-6 h-6 mr-2" />
                      {forceShowType === 'transport' 
                        ? (isSearchMode ? 'Expéditions trouvées pour transporteurs' : 'Expéditions disponibles pour transporteurs')
                        : (isSearchMode ? 'Expéditions trouvées' : 'Expéditions disponibles')
                      }
                      <span className="ml-2 bg-primary text-primary-beige px-3 py-1 rounded-full text-sm">
                        {expeditions.length}
                      </span>
                    </h2>

                    {expeditions.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {sortExpeditions(expeditions).map((expedition) => (
                          <Card key={expedition.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-bordeaux">
                                  {expedition.departureCity} → {expedition.arrivalCity}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {expedition.departureAddress} → {expedition.arrivalAddress}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500 flex items-center">
                                  <HiCalendarDays className="w-4 h-4 mr-1" />
                                  {new Date(expedition.departureDate).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center text-sm">
                                <HiScale className="w-4 h-4 mr-2 text-primary" />
                                {expedition.weight} kg
                              </div>
                              <div className="flex items-center text-sm">
                                <HiCube className="w-4 h-4 mr-2 text-primary" />
                                {expedition.volume} m³
                              </div>
                              {expedition.maxBudget && (
                                <div className="flex items-center text-sm">
                                  <HiCurrencyEuro className="w-4 h-4 mr-2 text-primary" />
                                  Budget: {expedition.maxBudget}€
                                </div>
                              )}
                              <div className="flex items-center text-sm">
                                <HiTruck className="w-4 h-4 mr-2 text-primary" />
                                {expedition.requiresPL ? 'PL requis' : 'VL autorisé'}
                              </div>
                            </div>

                            {expedition.description && (
                              <p className="text-sm text-gray-600 mb-4">{expedition.description}</p>
                            )}

                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="text-sm">
                                  <span className="font-medium">{expedition.client.firstName} {expedition.client.lastName}</span>
                                  {expedition.client.rating && (
                                    <div className="flex items-center mt-1">
                                      <HiStar className="w-4 h-4 text-yellow-400 mr-1" />
                                      <span className="text-sm">{expedition.client.rating}/5 ({expedition.client.reviewCount} avis)</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">{expedition.currentOffers} offre(s)</span>
                                <Button 
                                  size="small" 
                                  onClick={() => {
                                    if (user) {
                                      window.location.href = `/expeditions/${expedition.id}`;
                                    } else {
                                      window.location.href = '/auth/login';
                                    }
                                  }}
                                >
                                  Voir détails
                                </Button>
                              </div>
                            </div>

                            {(expedition.isFragile || expedition.urgency !== 'NORMAL') && (
                              <div className="mt-4 flex space-x-2">
                                {expedition.isFragile && (
                                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                                    Fragile
                                  </span>
                                )}
                                {expedition.urgency === 'HIGH' && (
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                    Urgent
                                  </span>
                                )}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-8 text-center">
                        <p className="text-gray-500">
                          {isSearchMode 
                            ? 'Aucune expédition trouvée pour ces critères.' 
                            : 'Aucune expédition disponible pour le moment.'}
                        </p>
                      </Card>
                    )}
                  </section>
                )}

                {/* Trajets (pour expéditeurs) */}
                {shouldShowCourses() && (
                  <section>
                    <h2 className="text-2xl font-bold text-bordeaux mb-6 flex items-center">
                      <HiTruck className="w-6 h-6 mr-2" />
                      {forceShowType === 'send' 
                        ? (isSearchMode ? 'Trajets trouvés pour expéditeurs' : 'Trajets disponibles pour expéditeurs')
                        : (isSearchMode ? 'Trajets trouvés' : 'Trajets disponibles')
                      }
                      <span className="ml-2 bg-primary text-primary-beige px-3 py-1 rounded-full text-sm">
                        {courses.length}
                      </span>
                    </h2>

                    {courses.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {sortCourses(courses).map((course) => (
                          <Card key={course.id} className="p-6 shadow-lg transition-shadow rounded-xl bg-white">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-bordeaux">
                                  {course.departure} → {course.arrival}
                                </h3>
                                {course.stops.length > 0 && (
                                  <p className="text-sm text-gray-600">
                                    Escales: {course.stops.join(', ')}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500 flex items-center">
                                  <HiCalendarDays className="w-4 h-4 mr-1" />
                                  {new Date(course.departureDate).toLocaleDateString('fr-FR')}
                                </div>
                                {course.estimatedArrival && (
                                  <div className="text-sm text-gray-500 flex items-center mt-1">
                                    <HiClock className="w-4 h-4 mr-1" />
                                    Arrivée: {new Date(course.estimatedArrival).toLocaleDateString('fr-FR')}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center text-sm">
                                <HiScale className="w-4 h-4 mr-2 text-primary" />
                                Max: {course.maxWeight} kg
                              </div>
                              <div className="flex items-center text-sm">
                                <HiCube className="w-4 h-4 mr-2 text-primary" />
                                Espace: {course.availableSpace} m³
                              </div>
                              <div className="flex items-center text-sm">
                                <HiCurrencyEuro className="w-4 h-4 mr-2 text-primary" />
                                {course.pricePerKg}€/kg
                              </div>
                              <div className="flex items-center text-sm">
                                <HiTruck className="w-4 h-4 mr-2 text-primary" />
                                {course.vehicleType}
                              </div>
                            </div>

                            {course.description && (
                              <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                            )}

                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="text-sm">
                                  <button
                                    onClick={() => {
                                      if (user) {
                                        window.location.href = `/transporters/${course.transporter.id}`;
                                      } else {
                                        window.location.href = '/auth/login';
                                      }
                                    }}
                                    className="font-medium hover:text-primary transition-colors cursor-pointer"
                                  >
                                    {course.transporter.companyName || `${course.transporter.firstName} ${course.transporter.lastName}`}
                                  </button>
                                  {course.transporter.rating && (
                                    <div className="flex items-center mt-1">
                                      <HiStar className="w-4 h-4 text-yellow-400 mr-1" />
                                      <span className="text-sm">{course.transporter.rating}/5 ({course.transporter.reviewCount} avis)</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="small" 
                                  variant="outline"
                                  onClick={() => {
                                    if (user) {
                                      window.location.href = `/transporters/${course.transporter.id}`;
                                    } else {
                                      window.location.href = '/auth/login';
                                    }
                                  }}
                                >
                                  Voir profil
                                </Button>
                                <Button 
                                  size="small" 
                                  onClick={() => {
                                    if (user) {
                                      window.location.href = `/courses/${course.id}`;
                                    } else {
                                      window.location.href = '/auth/login';
                                    }
                                  }}
                                >
                                  Voir détails
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-8 text-center">
                        <p className="text-gray-500">
                          {isSearchMode 
                            ? 'Aucun trajet trouvé pour ces critères.' 
                            : 'Aucun trajet disponible pour le moment.'}
                        </p>
                      </Card>
                    )}
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-light-beige via-primary-beige to-light-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-dark-bordeaux">Chargement des trajets disponibles...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
} 