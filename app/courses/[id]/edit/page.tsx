'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  HiMapPin, 
  HiCurrencyEuro,
  HiTruck,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';

interface Stop {
  id: string;
  city: string;
  time: string;
}

interface CourseFormData {
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  availableWeight: string;
  availableVolume: string;
  pricePerKg: string;
  minPackageWeight: string;
  maxPackageWeight: string;
  vehicleType: 'VL' | 'PL';
  description: string;
  route: string;
}

interface Errors {
  [key: string]: string;
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [showDepartureCalendar, setShowDepartureCalendar] = useState(false);
  const [showArrivalCalendar, setShowArrivalCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const departureCalendarRef = useRef<HTMLDivElement>(null);
  const arrivalCalendarRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CourseFormData>({
    departureCity: '',
    arrivalCity: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    availableWeight: '',
    availableVolume: '',
    pricePerKg: '',
    minPackageWeight: '0',
    maxPackageWeight: '',
    vehicleType: 'VL',
    description: '',
    route: ''
  });

  const [stops, setStops] = useState<Stop[]>([]);

  useEffect(() => {
    fetchCourse();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (departureCalendarRef.current && !departureCalendarRef.current.contains(event.target as Node)) {
        setShowDepartureCalendar(false);
      }
      if (arrivalCalendarRef.current && !arrivalCalendarRef.current.contains(event.target as Node)) {
        setShowArrivalCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${resolvedParams.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        const course = responseData.data;
        
        console.log('Course data:', course);
        
        if (!course) {
          console.error('Course data is undefined');
          router.push('/courses/my-courses');
          return;
        }
        
        // Extraire l'heure de la date de départ
        const departureDateTime = new Date(course.departureDate);
        const departureTime = departureDateTime.toTimeString().slice(0, 5);
        
        // Extraire l'heure de la date d'arrivée
        const arrivalDateTime = new Date(course.estimatedArrival || course.departureDate);
        const arrivalTime = arrivalDateTime.toTimeString().slice(0, 5);
        
        setFormData({
          departureCity: course.departure || '',
          arrivalCity: course.arrival || '',
          departureDate: formatDateForInput(departureDateTime),
          departureTime: departureTime,
          arrivalDate: formatDateForInput(arrivalDateTime),
          arrivalTime: arrivalTime,
          availableWeight: course.maxWeight?.toString() || '',
          availableVolume: course.availableSpace?.toString() || '',
          pricePerKg: course.pricePerKg?.toString() || '',
          minPackageWeight: course.minPackageWeight?.toString() || '0',
          maxPackageWeight: course.maxPackageWeight?.toString() || '',
          vehicleType: course.vehicleType || 'VL',
          description: course.description || '',
          route: course.route || ''
        });

        // Charger les escales
        if (course.stops && Array.isArray(course.stops)) {
          const formattedStops = course.stops.map((stop: string, index: number) => ({
            id: `stop-${index}`,
            city: stop,
            time: ''
          }));
          setStops(formattedStops);
        }
      } else {
        router.push('/courses/my-courses');
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/courses/my-courses');
    } finally {
      setIsLoadingData(false);
    }
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateString: string): string => {
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
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      days.push(currentDate);
    }
    return days;
  };

  const handleDateSelect = (date: Date, type: 'departure' | 'arrival') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date >= today) {
      const dateString = formatDateForInput(date);
      if (type === 'departure') {
        setFormData(prev => ({ ...prev, departureDate: dateString }));
        setShowDepartureCalendar(false);
      } else {
        setFormData(prev => ({ ...prev, arrivalDate: dateString }));
        setShowArrivalCalendar(false);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isSelectedDate = (date: Date, dateString: string): boolean => {
    if (!dateString) return false;
    const selectedDate = new Date(dateString + 'T00:00:00');
    return date.getFullYear() === selectedDate.getFullYear() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getDate() === selectedDate.getDate();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Gestion des escales
  const addStop = () => {
    const newStop: Stop = {
      id: `stop-${Date.now()}`,
      city: '',
      time: ''
    };
    setStops([...stops, newStop]);
  };

  const removeStop = (id: string) => {
    setStops(stops.filter(stop => stop.id !== id));
  };

  const updateStop = (id: string, field: 'city' | 'time', value: string) => {
    setStops(stops.map(stop => 
      stop.id === id ? { ...stop, [field]: value } : stop
    ));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.departureCity.trim()) {
      newErrors.departureCity = 'La ville de départ est obligatoire';
    }
    if (!formData.arrivalCity.trim()) {
      newErrors.arrivalCity = 'La ville d\'arrivée est obligatoire';
    }
    if (!formData.departureDate) {
      newErrors.departureDate = 'La date de départ est obligatoire';
    }
    if (!formData.arrivalDate) {
      newErrors.arrivalDate = 'La date d\'arrivée est obligatoire';
    }
    if (formData.departureDate && formData.arrivalDate) {
      const depDate = new Date(formData.departureDate + 'T00:00:00');
      const arrDate = new Date(formData.arrivalDate + 'T00:00:00');
      if (arrDate < depDate) {
        newErrors.arrivalDate = 'La date d\'arrivée doit être après la date de départ';
      }
    }
    if (!formData.availableWeight || parseFloat(formData.availableWeight) <= 0) {
      newErrors.availableWeight = 'Le poids disponible doit être supérieur à 0';
    }
    if (!formData.availableVolume || parseInt(formData.availableVolume) <= 0) {
      newErrors.availableVolume = 'Le nombre de places doit être supérieur à 0';
    }
    if (!formData.pricePerKg || parseFloat(formData.pricePerKg) <= 0) {
      newErrors.pricePerKg = 'Le prix par kg doit être supérieur à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          departure: formData.departureCity,
          arrival: formData.arrivalCity,
          maxWeight: parseFloat(formData.availableWeight),
          availableSpace: parseInt(formData.availableVolume),
          pricePerKg: parseFloat(formData.pricePerKg),
          minPackageWeight: parseFloat(formData.minPackageWeight),
          maxPackageWeight: formData.maxPackageWeight ? parseFloat(formData.maxPackageWeight) : null,
          departureDate: new Date(`${formData.departureDate}T${formData.departureTime}:00`),
          estimatedArrival: new Date(`${formData.arrivalDate}T${formData.arrivalTime}:00`),
          vehicleType: formData.vehicleType,
          description: formData.description,
          route: formData.route,
          stops: stops.map(stop => stop.city).filter(city => city.trim() !== '')
        }),
      });

      if (response.ok) {
        router.push('/courses/my-courses');
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Erreur lors de la modification de la course' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setErrors({ general: 'Erreur de connexion. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-beige via-primary-beige to-light-beige flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const vehicleTypes = [
    { value: 'VL', label: '🚗 Véhicule léger' },
    { value: 'PL', label: '🚚 Poids lourd' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-beige via-primary-beige to-light-beige py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-primary hover:text-dark-bordeaux mb-4 transition-colors"
          >
            <HiChevronLeft className="w-5 h-5 mr-1" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-dark-bordeaux">Modifier la course</h1>
          <p className="text-gray-600 mt-2">Modifiez les détails de votre trajet</p>
        </div>

        <Card className="shadow-xl rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
            <CardTitle className="text-2xl text-dark-bordeaux flex items-center">
              <HiTruck className="w-6 h-6 mr-3 text-primary" />
              Détails de la course
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Trajet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiMapPin className="w-4 h-4 inline mr-1" />
                    Ville de départ *
                  </label>
                  <input
                    type="text"
                    name="departureCity"
                    value={formData.departureCity}
                    onChange={handleInputChange}
                    placeholder="Ex: Lyon"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.departureCity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.departureCity && <p className="text-red-500 text-sm mt-1">{errors.departureCity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiMapPin className="w-4 h-4 inline mr-1" />
                    Ville d&apos;arrivée *
                  </label>
                  <input
                    type="text"
                    name="arrivalCity"
                    value={formData.arrivalCity}
                    onChange={handleInputChange}
                    placeholder="Ex: Paris"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.arrivalCity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.arrivalCity && <p className="text-red-500 text-sm mt-1">{errors.arrivalCity}</p>}
                </div>
              </div>

              {/* Dates et heures - Section Départ */}
              <div>
                <h3 className="text-lg font-semibold text-dark-bordeaux mb-4">📅 Planning</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Départ */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Départ</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowDepartureCalendar(!showDepartureCalendar)}
                          className={`w-full px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.departureDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          {formData.departureDate ? formatDateForDisplay(formData.departureDate) : 'Date'}
                        </button>
                        {errors.departureDate && <p className="text-red-500 text-sm mt-1">{errors.departureDate}</p>}

                        {showDepartureCalendar && (
                          <div ref={departureCalendarRef} className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
                            {/* Calendrier pour date de départ */}
                            <div className="flex items-center justify-between mb-4">
                              <button type="button" onClick={() => navigateMonth('prev')} className="p-2 hover:bg-gray-100 rounded">
                                <HiChevronLeft className="w-4 h-4" />
                              </button>
                              <h3 className="font-semibold">
                                {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                              </h3>
                              <button type="button" onClick={() => navigateMonth('next')} className="p-2 hover:bg-gray-100 rounded">
                                <HiChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'].map((day) => (
                                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">{day}</div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {getDaysInMonth(currentMonth).map((date, index) => {
                                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                                const isPastDate = date < today;
                                const isSelected = isSelectedDate(date, formData.departureDate);
                                return (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleDateSelect(date, 'departure')}
                                    disabled={isPastDate}
                                    className={`p-2 text-sm rounded hover:bg-primary hover:text-white transition-colors ${
                                      isSelected ? 'bg-primary text-white' : isCurrentMonth ? isPastDate ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:bg-primary hover:text-white' : 'text-gray-300'
                                    }`}
                                  >
                                    {date.getDate()}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Heure *
                        </label>
                        <input
                          type="time"
                          name="departureTime"
                          value={formData.departureTime}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.departureTime ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.departureTime && <p className="text-red-500 text-sm mt-1">{errors.departureTime}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Arrivée */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Arrivée</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowArrivalCalendar(!showArrivalCalendar)}
                          className={`w-full px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.arrivalDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          {formData.arrivalDate ? formatDateForDisplay(formData.arrivalDate) : 'Date'}
                        </button>
                        {errors.arrivalDate && <p className="text-red-500 text-sm mt-1">{errors.arrivalDate}</p>}

                        {showArrivalCalendar && (
                          <div ref={arrivalCalendarRef} className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
                            {/* Calendrier pour date d'arrivée */}
                            <div className="flex items-center justify-between mb-4">
                              <button type="button" onClick={() => navigateMonth('prev')} className="p-2 hover:bg-gray-100 rounded">
                                <HiChevronLeft className="w-4 h-4" />
                              </button>
                              <h3 className="font-semibold">
                                {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                              </h3>
                              <button type="button" onClick={() => navigateMonth('next')} className="p-2 hover:bg-gray-100 rounded">
                                <HiChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'].map((day) => (
                                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">{day}</div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {getDaysInMonth(currentMonth).map((date, index) => {
                                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                                const isPastDate = date < today;
                                const isSelected = isSelectedDate(date, formData.arrivalDate);
                                return (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleDateSelect(date, 'arrival')}
                                    disabled={isPastDate}
                                    className={`p-2 text-sm rounded hover:bg-primary hover:text-white transition-colors ${
                                      isSelected ? 'bg-primary text-white' : isCurrentMonth ? isPastDate ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:bg-primary hover:text-white' : 'text-gray-300'
                                    }`}
                                  >
                                    {date.getDate()}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Heure *
                        </label>
                        <input
                          type="time"
                          name="arrivalTime"
                          value={formData.arrivalTime}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.arrivalTime ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.arrivalTime && <p className="text-red-500 text-sm mt-1">{errors.arrivalTime}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contraintes de poids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poids minimum par colis (kg) *
                  </label>
                  <input
                    type="number"
                    name="minPackageWeight"
                    value={formData.minPackageWeight}
                    onChange={handleInputChange}
                    placeholder="Ex: 0"
                    step="0.1"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.minPackageWeight ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.minPackageWeight && <p className="text-red-500 text-sm mt-1">{errors.minPackageWeight}</p>}
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
                    placeholder="Ex: 100 (optionnel)"
                    step="0.1"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Capacités et prix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poids disponible (kg) *
                  </label>
                  <input
                    type="number"
                    name="availableWeight"
                    value={formData.availableWeight}
                    onChange={handleInputChange}
                    placeholder="Ex: 500"
                    step="0.1"
                    min="0.1"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.availableWeight ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.availableWeight && <p className="text-red-500 text-sm mt-1">{errors.availableWeight}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Places disponibles *
                  </label>
                  <input
                    type="number"
                    name="availableVolume"
                    value={formData.availableVolume}
                    onChange={handleInputChange}
                    placeholder="Ex: 5"
                    step="1"
                    min="1"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.availableVolume ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.availableVolume && <p className="text-red-500 text-sm mt-1">{errors.availableVolume}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiCurrencyEuro className="w-4 h-4 inline mr-1" />
                    Prix par kg (€) *
                  </label>
                  <input
                    type="number"
                    name="pricePerKg"
                    value={formData.pricePerKg}
                    onChange={handleInputChange}
                    placeholder="Ex: 2.50"
                    step="0.01"
                    min="0.01"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.pricePerKg ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.pricePerKg && <p className="text-red-500 text-sm mt-1">{errors.pricePerKg}</p>}
                </div>
              </div>

              {/* Type de véhicule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiTruck className="w-4 h-4 inline mr-1" />
                  Type de véhicule *
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {vehicleTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Escales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escales intermédiaires (optionnel)
                </label>
                <div className="space-y-3">
                  {stops.map((stop) => (
                    <div key={stop.id} className="flex gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Ville"
                        value={stop.city}
                        onChange={(e) => updateStop(stop.id, 'city', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="time"
                        placeholder="Heure"
                        value={stop.time}
                        onChange={(e) => updateStop(stop.id, 'time', e.target.value)}
                        className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeStop(stop.id)}
                        className="px-3 py-3 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addStop}
                    className="w-full py-3 border-dashed border-2 border-gray-300 hover:border-primary hover:bg-primary/5"
                  >
                    + Ajouter une escale
                  </Button>
                </div>
              </div>

              {/* Route détaillée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route détaillée (optionnel)
                </label>
                <textarea
                  name="route"
                  value={formData.route}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Précisions sur l'itinéraire, routes particulières..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Informations complémentaires sur votre trajet..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 sm:flex-none px-8 py-3"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-8 py-3 bg-primary hover:bg-dark-bordeaux text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? 'Modification...' : 'Modifier la course'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 