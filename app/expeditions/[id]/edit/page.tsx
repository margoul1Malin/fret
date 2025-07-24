'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  HiMapPin, 
  HiCalendarDays, 
  HiScale, 
  HiCube, 
  HiDocumentText, 
  HiCurrencyEuro,
  HiExclamationTriangle,
  HiTruck,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';

interface ExpeditionFormData {
  departureAddress: string;
  departureCity: string;
  departurePostalCode: string;
  arrivalAddress: string;
  arrivalCity: string;
  arrivalPostalCode: string;
  departureDate: string;
  weight: string;
  volume: string;
  description: string;
  value: string;
  isFragile: boolean;
  requiresPL: boolean;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  maxBudget: string;
  notes: string;
}

interface Errors {
  [key: string]: string;
}

export default function EditExpeditionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<ExpeditionFormData>({
    departureAddress: '',
    departureCity: '',
    departurePostalCode: '',
    arrivalAddress: '',
    arrivalCity: '',
    arrivalPostalCode: '',
    departureDate: '',
    weight: '',
    volume: '',
    description: '',
    value: '',
    isFragile: false,
    requiresPL: false,
    urgency: 'MEDIUM',
    maxBudget: '',
    notes: ''
  });

  useEffect(() => {
    fetchExpedition();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        const expedition = data.expedition;
        
        // Convertir les données pour le formulaire
        setFormData({
          departureAddress: expedition.departureAddress || '',
          departureCity: expedition.departureCity || '',
          departurePostalCode: expedition.departurePostalCode || '',
          arrivalAddress: expedition.arrivalAddress || '',
          arrivalCity: expedition.arrivalCity || '',
          arrivalPostalCode: expedition.arrivalPostalCode || '',
          departureDate: formatDateForInput(new Date(expedition.departureDate)),
          weight: expedition.weight.toString(),
          volume: expedition.volume.toString(),
          description: expedition.description || '',
          value: expedition.value ? expedition.value.toString() : '',
          isFragile: expedition.isFragile || false,
          requiresPL: expedition.requiresPL || false,
          urgency: expedition.urgency || 'MEDIUM',
          maxBudget: expedition.maxBudget ? expedition.maxBudget.toString() : '',
          notes: expedition.notes || ''
        });
      } else {
        router.push('/expeditions');
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/expeditions');
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

  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date >= today) {
      setFormData(prev => ({
        ...prev,
        departureDate: formatDateForInput(date)
      }));
      setShowCalendar(false);
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

  const isSelectedDate = (date: Date): boolean => {
    if (!formData.departureDate) return false;
    const selectedDate = new Date(formData.departureDate + 'T00:00:00');
    return date.getFullYear() === selectedDate.getFullYear() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getDate() === selectedDate.getDate();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.departureAddress.trim()) {
      newErrors.departureAddress = 'L\'adresse de départ est obligatoire';
    }
    if (!formData.departureCity.trim()) {
      newErrors.departureCity = 'La ville de départ est obligatoire';
    }
    if (!formData.arrivalAddress.trim()) {
      newErrors.arrivalAddress = 'L\'adresse d\'arrivée est obligatoire';
    }
    if (!formData.arrivalCity.trim()) {
      newErrors.arrivalCity = 'La ville d\'arrivée est obligatoire';
    }
    if (!formData.departureDate) {
      newErrors.departureDate = 'La date de départ est obligatoire';
    } else {
      const selectedDate = new Date(formData.departureDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.departureDate = 'La date de départ ne peut pas être dans le passé';
      }
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Le poids doit être supérieur à 0';
    }
    if (!formData.volume || parseFloat(formData.volume) <= 0 || parseFloat(formData.volume) < 0.00001) {
      newErrors.volume = 'Le volume doit être supérieur à 0.00001 m³';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
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
      const response = await fetch(`/api/expeditions/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          weight: parseFloat(formData.weight),
          volume: parseFloat(formData.volume),
          value: formData.value ? parseFloat(formData.value) : null,
          maxBudget: formData.maxBudget ? parseFloat(formData.maxBudget) : null,
          departureDate: new Date(formData.departureDate)
        }),
      });

      if (response.ok) {
        router.push(`/expeditions/${resolvedParams.id}`);
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Erreur lors de la modification de l\'expédition' });
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
          <h1 className="text-3xl font-bold text-dark-bordeaux">Modifier l&apos;expédition</h1>
          <p className="text-gray-600 mt-2">Modifiez les détails de votre expédition</p>
        </div>

        <Card className="shadow-xl rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
            <CardTitle className="text-2xl text-dark-bordeaux flex items-center">
              <HiMapPin className="w-6 h-6 mr-3 text-primary" />
              Détails de l&apos;expédition
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Adresses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Adresse de départ */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-dark-bordeaux border-b border-primary/20 pb-2">
                    📍 Adresse de départ
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse complète *
                    </label>
                    <input
                      type="text"
                      name="departureAddress"
                      value={formData.departureAddress}
                      onChange={handleInputChange}
                      placeholder="Ex: 123 Rue de la République"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.departureAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.departureAddress && <p className="text-red-500 text-sm mt-1">{errors.departureAddress}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville *
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
                        Code postal
                      </label>
                      <input
                        type="text"
                        name="departurePostalCode"
                        value={formData.departurePostalCode}
                        onChange={handleInputChange}
                        placeholder="Ex: 69000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Adresse d'arrivée */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-dark-bordeaux border-b border-primary/20 pb-2">
                    🎯 Adresse d&apos;arrivée
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse complète *
                    </label>
                    <input
                      type="text"
                      name="arrivalAddress"
                      value={formData.arrivalAddress}
                      onChange={handleInputChange}
                      placeholder="Ex: 456 Avenue des Champs"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.arrivalAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.arrivalAddress && <p className="text-red-500 text-sm mt-1">{errors.arrivalAddress}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville *
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal
                      </label>
                      <input
                        type="text"
                        name="arrivalPostalCode"
                        value={formData.arrivalPostalCode}
                        onChange={handleInputChange}
                        placeholder="Ex: 75001"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Date et caractéristiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiCalendarDays className="w-4 h-4 inline mr-1" />
                    Date de départ *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`w-full px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.departureDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {formData.departureDate ? formatDateForDisplay(formData.departureDate) : 'Sélectionner une date'}
                  </button>
                  {errors.departureDate && <p className="text-red-500 text-sm mt-1">{errors.departureDate}</p>}

                  {showCalendar && (
                    <div ref={calendarRef} className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={() => navigateMonth('prev')}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <HiChevronLeft className="w-4 h-4" />
                        </button>
                        <h3 className="font-semibold">
                          {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button
                          type="button"
                          onClick={() => navigateMonth('next')}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <HiChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'].map((day) => (
                          <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((date, index) => {
                          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                          const isPastDate = date < today;
                          const isSelected = isSelectedDate(date);

                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleDateSelect(date)}
                              disabled={isPastDate}
                              className={`p-2 text-sm rounded hover:bg-primary hover:text-white transition-colors ${
                                isSelected
                                  ? 'bg-primary text-white'
                                  : isCurrentMonth
                                  ? isPastDate
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-900 hover:bg-primary hover:text-white'
                                  : 'text-gray-300'
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
                    <HiScale className="w-4 h-4 inline mr-1" />
                    Poids (kg) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="Ex: 2.5"
                    step="0.1"
                    min="0.1"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.weight ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiCube className="w-4 h-4 inline mr-1" />
                    Volume (m³) *
                  </label>
                  <input
                    type="number"
                    name="volume"
                    value={formData.volume}
                    onChange={handleInputChange}
                    placeholder="Ex: 0.5 (min: 0.00001)"
                    step="0.00001"
                    min="0.00001"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.volume ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.volume && <p className="text-red-500 text-sm mt-1">{errors.volume}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiDocumentText className="w-4 h-4 inline mr-1" />
                  Description du colis *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Décrivez votre colis (contenu, particularités...)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Informations supplémentaires */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HiCurrencyEuro className="w-4 h-4 inline mr-1" />
                    Valeur déclarée (€)
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder="Ex: 150"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget maximum (€)
                  </label>
                  <input
                    type="number"
                    name="maxBudget"
                    value={formData.maxBudget}
                    onChange={handleInputChange}
                    placeholder="Ex: 50"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Options et urgence */}
              <div className="space-y-6">
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFragile"
                      checked={formData.isFragile}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-gray-700 flex items-center">
                      <HiExclamationTriangle className="w-4 h-4 mr-1 text-orange-500" />
                      Colis fragile
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requiresPL"
                      checked={formData.requiresPL}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-gray-700 flex items-center">
                      <HiTruck className="w-4 h-4 mr-1 text-blue-500" />
                      Poids lourd requis
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau d&apos;urgence
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="LOW">Faible - Pas pressé</option>
                    <option value="MEDIUM">Moyen - Dans les temps</option>
                    <option value="HIGH">Élevé - Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes supplémentaires
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Informations complémentaires, instructions spéciales..."
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
                  {isLoading ? 'Modification...' : 'Modifier l\'expédition'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 