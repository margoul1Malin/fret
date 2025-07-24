'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  HiMapPin, 
  HiCalendar, 
  HiScale, 
  HiTruck, 
  HiPlus,
  HiTrash,
  HiArrowLeft,
  HiDocumentText,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';

interface Stop {
  id: string;
  city: string;
  time: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setUserType] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    departure: '',
    arrival: '',
    departureDate: '',
    departureTime: '',
    estimatedArrival: '',
    maxWeight: '',
    pricePerKg: '',
    minPackageWeight: '0',
    maxPackageWeight: '',
    description: '',
    vehicleType: 'VL',
    availableSpace: '1'
  });

  const [stops, setStops] = useState<Stop[]>([]);

  // Fonctions pour le calendrier
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent (grisés)
    const prevMonth = new Date(year, month - 1, 0); // Dernier jour du mois précédent
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthDays - i);
      days.push({ date: prevDate, isCurrentMonth: false, isPast: true });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const isPast = currentDate < today;
      days.push({ date: currentDate, isCurrentMonth: true, isPast });
    }

    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines × 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false, isPast: false });
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    if (date < today) return; // Empêcher la sélection de dates passées
    
    setFormData(prev => ({
      ...prev,
      departureDate: formatDateForInput(date)
    }));
    
    setShowCalendar(false);
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const isSelectedDate = (date: Date) => {
    if (!formData.departureDate) return false;
    const selectedDate = new Date(formData.departureDate + 'T00:00:00');
    return date.getFullYear() === selectedDate.getFullYear() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getDate() === selectedDate.getDate();
  };

  // Fermer le calendrier quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
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
          if (data.success && data.user.userType === 'TRANSPORTER') {
            setIsAuthenticated(true);
            setUserType(data.user.userType);
          } else {
            router.push('/search');
          }
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addStop = () => {
    const newStop: Stop = {
      id: Date.now().toString(),
      city: '',
      time: ''
    };
    setStops(prev => [...prev, newStop]);
  };

  const removeStop = (stopId: string) => {
    setStops(prev => prev.filter(stop => stop.id !== stopId));
  };

  const updateStop = (stopId: string, field: 'city' | 'time', value: string) => {
    setStops(prev => prev.map(stop => 
      stop.id === stopId ? { ...stop, [field]: value } : stop
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Combiner date et heure de départ
      const departureDateTime = new Date(`${formData.departureDate}T${formData.departureTime}`);
      
      // Préparer les données d'escales
      const stopsData = stops
        .filter(stop => stop.city.trim() !== '')
        .map(stop => ({
          city: stop.city.trim(),
          estimatedTime: stop.time || null
        }));

      const courseData = {
        departure: formData.departure.trim(),
        arrival: formData.arrival.trim(),
        departureDate: departureDateTime.toISOString(),
        estimatedArrival: formData.estimatedArrival ? new Date(formData.estimatedArrival).toISOString() : null,
        stops: stopsData,
        maxWeight: parseFloat(formData.maxWeight),
        pricePerKg: parseFloat(formData.pricePerKg),
        minPackageWeight: parseFloat(formData.minPackageWeight),
        maxPackageWeight: formData.maxPackageWeight ? parseFloat(formData.maxPackageWeight) : null,
        description: formData.description.trim(),
        vehicleType: formData.vehicleType,
        availableSpace: parseInt(formData.availableSpace)
      };

      const token = localStorage.getItem('token');
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/courses/my-courses');
      } else {
        setError(data.message || 'Erreur lors de la création du trajet');
      }
    } catch (error) {
      console.error('Erreur lors de la création du trajet:', error);
      setError('Erreur lors de la création du trajet. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-light-beige flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Vérification des autorisations...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-beige">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-dark-bordeaux text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold">Publier un trajet</h1>
              <p className="text-primary-beige">Ajoutez votre itinéraire et proposez vos services</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Card className="border-l-4 border-l-red-500 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Itinéraire */}
          <Card className="shadow-lg p-6">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <HiMapPin className="w-6 h-6 mr-2 text-primary" />
                Itinéraire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville de départ *
                  </label>
                  <input
                    type="text"
                    name="departure"
                    value={formData.departure}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Paris"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville d&apos;arrivée *
                  </label>
                  <input
                    type="text"
                    name="arrival"
                    value={formData.arrival}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Lyon"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Escales */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Escales (optionnelles)
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={addStop}
                    className="text-primary border-primary hover:bg-primary hover:text-white p-2 flex items-center justify-center rounded-xl"
                  >
                    <HiPlus className="w-4 h-4 mr-1" />
                    Ajouter une escale
                  </Button>
                </div>
                
                {stops.map((stop, index) => (
                  <div key={stop.id} className="flex items-center space-x-3 mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={stop.city}
                        onChange={(e) => updateStop(stop.id, 'city', e.target.value)}
                        placeholder={`Escale ${index + 1}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="time"
                        value={stop.time}
                        onChange={(e) => updateStop(stop.id, 'time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="small"
                      onClick={() => removeStop(stop.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <HiTrash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Horaires */}
          <Card className="shadow-lg p-6">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <HiCalendar className="w-6 h-6 mr-2 text-primary" />
                Horaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de départ *
                  </label>
                  <div className="relative" ref={calendarRef}>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-left flex items-center justify-between text-gray-900"
                    >
                      <span>
                        {formData.departureDate 
                          ? formatDateForDisplay(formData.departureDate)
                          : 'Sélectionnez une date'
                        }
                      </span>
                      <HiCalendar className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    {showCalendar && (
                      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-80">
                        {/* Header du calendrier */}
                        <div className="flex items-center justify-between mb-4">
                          <button
                            type="button"
                            onClick={() => navigateMonth(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <HiChevronLeft className="w-5 h-5 text-gray-600" />
                          </button>
                          <h3 className="font-semibold text-gray-900">
                            {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                          </h3>
                          <button
                            type="button"
                            onClick={() => navigateMonth(1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <HiChevronRight className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>

                        {/* Jours de la semaine */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Grille des jours */}
                        <div className="grid grid-cols-7 gap-1">
                          {getDaysInMonth(currentMonth).map((dayInfo, index) => {
                            const { date, isCurrentMonth, isPast } = dayInfo;
                            const isSelected = isSelectedDate(date);
                            const isToday = date.toDateString() === today.toDateString();
                            const isClickable = isCurrentMonth && !isPast;

                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => isClickable && handleDateSelect(date)}
                                disabled={!isClickable}
                                className={`
                                  h-10 w-10 text-sm rounded-lg transition-all duration-200
                                  ${isSelected 
                                    ? 'bg-primary text-white font-semibold' 
                                    : isToday && isCurrentMonth
                                      ? 'bg-primary/10 text-primary font-semibold'
                                      : isClickable
                                        ? 'hover:bg-primary/10 text-gray-900'
                                        : 'text-gray-300 cursor-not-allowed'
                                  }
                                  ${isCurrentMonth ? '' : 'text-gray-300'}
                                  ${isPast && isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                                `}
                              >
                                {date.getDate()}
                              </button>
                            );
                          })}
                        </div>

                        {/* Footer avec bouton fermer */}
                        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            Sélectionnez une date à partir d&apos;aujourd&apos;hui
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowCalendar(false)}
                            className="text-sm text-primary hover:text-dark-bordeaux font-medium"
                          >
                            Fermer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de départ *
                  </label>
                  <input
                    type="time"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrivée estimée (optionnelle)
                </label>
                <input
                  type="datetime-local"
                  name="estimatedArrival"
                  value={formData.estimatedArrival}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Capacité et tarifs */}
          <Card className="shadow-lg p-6">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <HiScale className="w-6 h-6 mr-2 text-primary" />
                Capacité et tarifs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poids maximum (kg) *
                  </label>
                  <input
                    type="number"
                    name="maxWeight"
                    value={formData.maxWeight}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.1"
                    placeholder="Ex: 500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix par kg (€) *
                  </label>
                  <input
                    type="number"
                    name="pricePerKg"
                    value={formData.pricePerKg}
                    onChange={handleInputChange}
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="Ex: 2.50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poids minimum par colis (kg)
                  </label>
                  <input
                    type="number"
                    name="minPackageWeight"
                    value={formData.minPackageWeight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poids maximum par colis (kg)
                  </label>
                  <input
                    type="number"
                    name="maxPackageWeight"
                    value={formData.maxPackageWeight}
                    onChange={handleInputChange}
                    min="0.1"
                    step="0.1"
                    placeholder="Pas de limite"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Places disponibles
                  </label>
                  <input
                    type="number"
                    name="availableSpace"
                    value={formData.availableSpace}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Véhicule et description */}
          <Card className="shadow-lg p-6">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <HiTruck className="w-6 h-6 mr-2 text-primary" />
                Véhicule et description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de véhicule
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="VL">Véhicule Léger (VL)</option>
                  <option value="PL">Poids Lourd (PL)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du trajet *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Décrivez votre trajet, les conditions de transport, les restrictions particulières..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto p-2 flex items-center justify-center rounded-xl cursor-pointer hover:bg-primary hover:text-white"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full sm:w-auto p-2 flex items-center justify-center rounded-xl cursor-pointer hover:bg-primary hover:text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publication en cours...
                </>
              ) : (
                <>
                  <HiDocumentText className="w-4 h-4 mr-2" />
                  Publier le trajet
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 