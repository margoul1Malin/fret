'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  HiArrowLeft, 
  HiMapPin, 
  HiCalendar, 
  HiScale, 
  HiCube, 
  HiDocumentText,
  HiCurrencyEuro,
  HiExclamationTriangle,
  HiTruck,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';
import Link from 'next/link';

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
  urgency: string;
  maxBudget: string;
  notes: string;
}

export default function CreateExpeditionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
    urgency: 'normal',
    maxBudget: '',
    notes: ''
  });

  // Vérification d'accès - seuls les clients peuvent créer des expéditions
  useEffect(() => {
    if (user && user.userType !== 'CLIENT') {
      router.push('/search');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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
    
    if (errors.departureDate) {
      setErrors(prev => ({ ...prev, departureDate: '' }));
    }
    
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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.departureAddress.trim()) {
      newErrors.departureAddress = 'L\'adresse de départ est requise';
    }
    if (!formData.departureCity.trim()) {
      newErrors.departureCity = 'La ville de départ est requise';
    }
    if (!formData.arrivalAddress.trim()) {
      newErrors.arrivalAddress = 'L\'adresse d\'arrivée est requise';
    }
    if (!formData.arrivalCity.trim()) {
      newErrors.arrivalCity = 'La ville d\'arrivée est requise';
    }
    if (!formData.departureDate) {
      newErrors.departureDate = 'La date de départ est requise';
    } else {
      const selectedDate = new Date(formData.departureDate + 'T00:00:00');
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
      newErrors.description = 'La description est requise';
    }
    if (formData.value && parseFloat(formData.value) < 0) {
      newErrors.value = 'La valeur doit être positive';
    }
    if (formData.maxBudget && parseFloat(formData.maxBudget) <= 0) {
      newErrors.maxBudget = 'Le budget doit être supérieur à 0';
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

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/expeditions', {
        method: 'POST',
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
        const data = await response.json();
        router.push(`/expeditions/${data.expedition.id}`);
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Erreur lors de la création de l\'expédition' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setErrors({ general: 'Erreur de connexion. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-beige py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-primary hover:text-dark-bordeaux mb-4">
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-dark-bordeaux mb-2">Créer une expédition</h1>
          <p className="text-gray-600">Publiez votre demande d&apos;expédition et recevez des offres de transporteurs</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de transport */}
          <Card className="shadow-lg rounded-2xl border border-gray-100">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
              <CardTitle className="flex items-center text-xl text-dark-bordeaux font-bold p-4">
                <HiMapPin className="w-6 h-6 mr-3 text-primary" />
                Informations de transport
              </CardTitle>
            </CardHeader>
                         <CardContent className="p-6 space-y-6">
               {/* Adresse de départ */}
               <div>
                 <h4 className="font-medium text-gray-700 mb-4">Adresse de départ *</h4>
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Adresse complète
                     </label>
                     <input
                       type="text"
                       name="departureAddress"
                       value={formData.departureAddress}
                       onChange={handleInputChange}
                       placeholder="123 Rue de la République, Appartement 4"
                       className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                         errors.departureAddress ? 'border-red-500' : 'border-gray-300'
                       }`}
                     />
                     {errors.departureAddress && <p className="text-red-500 text-sm mt-1">{errors.departureAddress}</p>}
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Ville *
                       </label>
                       <input
                         type="text"
                         name="departureCity"
                         value={formData.departureCity}
                         onChange={handleInputChange}
                         placeholder="Paris"
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
                         placeholder="75001"
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                       />
                     </div>
                   </div>
                 </div>
               </div>

               {/* Adresse d'arrivée */}
               <div>
                 <h4 className="font-medium text-gray-700 mb-4">Adresse d&apos;arrivée *</h4>
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Adresse complète
                     </label>
                     <input
                       type="text"
                       name="arrivalAddress"
                       value={formData.arrivalAddress}
                       onChange={handleInputChange}
                       placeholder="456 Avenue de la Liberté, Maison 12"
                       className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                         errors.arrivalAddress ? 'border-red-500' : 'border-gray-300'
                       }`}
                     />
                     {errors.arrivalAddress && <p className="text-red-500 text-sm mt-1">{errors.arrivalAddress}</p>}
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Ville *
                       </label>
                       <input
                         type="text"
                         name="arrivalCity"
                         value={formData.arrivalCity}
                         onChange={handleInputChange}
                         placeholder="Lyon"
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
                         placeholder="69001"
                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                       />
                     </div>
                   </div>
                 </div>
               </div>

                             <div className="relative">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   <HiCalendar className="w-4 h-4 inline mr-1" />
                   Date de départ souhaitée *
                 </label>
                                    <div className="relative" ref={calendarRef}>
                     <button
                     type="button"
                     onClick={() => setShowCalendar(!showCalendar)}
                     className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-left flex items-center justify-between ${
                       errors.departureDate ? 'border-red-500' : 'border-gray-300'
                     } ${formData.departureDate ? 'text-gray-900' : 'text-gray-500'}`}
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
                 {errors.departureDate && <p className="text-red-500 text-sm mt-1">{errors.departureDate}</p>}
               </div>
            </CardContent>
          </Card>

          {/* Détails du colis */}
          <Card className="shadow-lg rounded-2xl border border-gray-100">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
              <CardTitle className="flex items-center text-xl text-dark-bordeaux font-bold p-4">
                <HiCube className="w-6 h-6 mr-3 text-primary" />
                Détails du colis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="Ex: 25"
                    step="0.1"
                    min="0"
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
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre marchandise (mobilier, électroménager, etc.)"
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiCurrencyEuro className="w-4 h-4 inline mr-1" />
                  Valeur déclarée (€) (optionnel)
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder="Ex: 500"
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.value ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
                <p className="text-sm text-gray-500 mt-1">Indiquez la valeur pour l&apos;assurance</p>
              </div>
            </CardContent>
          </Card>

          {/* Options et contraintes */}
          <Card className="shadow-lg rounded-2xl border border-gray-100">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
              <CardTitle className="flex items-center text-xl text-dark-bordeaux font-bold p-4">
                <HiExclamationTriangle className="w-6 h-6 mr-3 text-primary" />
                Options et contraintes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFragile"
                    checked={formData.isFragile}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-gray-700">Marchandise fragile</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requiresPL"
                    checked={formData.requiresPL}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-gray-700 flex items-center">
                    <HiTruck className="w-4 h-4 mr-1" />
                    Nécessite un poids lourd
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgence
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="low">Peu urgent</option>
                    <option value="normal">Normal</option>
                    <option value="high">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget maximum (€) (optionnel)
                  </label>
                  <input
                    type="number"
                    name="maxBudget"
                    value={formData.maxBudget}
                    onChange={handleInputChange}
                    placeholder="Ex: 150"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.maxBudget ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.maxBudget && <p className="text-red-500 text-sm mt-1">{errors.maxBudget}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes supplémentaires (optionnel)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Informations complémentaires, instructions spéciales..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>

          {/* Erreur générale */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="w-full sm:w-auto px-6 py-3">
                Annuler
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-dark-bordeaux text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? 'Création...' : 'Publier l\'expédition'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 