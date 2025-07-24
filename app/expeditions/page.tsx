'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  HiArrowLeft, 
  HiPlus, 
  HiEye, 
  HiPencil,
  HiTrash,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiCalendar,
  HiScale,
  HiCube,
  HiMapPin,
  HiCurrencyEuro,
  HiExclamationTriangle
} from 'react-icons/hi2';

interface Expedition {
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
  currentOffers: number;
  selectedOffer?: number;
  createdAt: string;
}

export default function ExpeditionsPage() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  useEffect(() => {
    fetchExpeditions();
  }, []);

  const fetchExpeditions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/expeditions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExpeditions(data.expeditions || []);
      } else {
        console.error('Erreur lors du chargement des expéditions');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
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
        return 'text-green-600';
      case 'normal':
        return 'text-blue-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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

  const filteredExpeditions = expeditions.filter(expedition => {
    const matchesSearch = 
      expedition.departureCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expedition.arrivalCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expedition.departureAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expedition.arrivalAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expedition.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || expedition.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || expedition.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const handleDelete = async (expeditionId: string) => {
    const expedition = expeditions.find(exp => exp.id === expeditionId);
    const statusText = expedition ? getStatusText(expedition.status) : '';
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cette expédition ?\n\nStatut actuel: ${statusText}\n\nCette action est irréversible.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/expeditions/${expeditionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setExpeditions(prev => prev.filter(exp => exp.id !== expeditionId));
        // Optionnel: message de succès
        // alert('Expédition supprimée avec succès');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erreur lors de la suppression de l\'expédition');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-beige flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos expéditions...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-beige py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-primary hover:text-dark-bordeaux mb-4">
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Retour au dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dark-bordeaux mb-2">Mes expéditions</h1>
              <p className="text-gray-600">Gérez toutes vos demandes d&apos;expédition</p>
            </div>
            <Link href="/expeditions/create">
              <Button className="mt-4 sm:mt-0 px-6 py-3 bg-primary hover:bg-dark-bordeaux text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center">
                <HiPlus className="w-5 h-5 mr-2" />
                Nouvelle expédition
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <Card className="mb-8 shadow-lg rounded-2xl border border-gray-100">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiMagnifyingGlass className="w-4 h-4 inline mr-1" />
                  Rechercher
                </label>
                <input
                  type="text"
                                     placeholder="Ville, adresse, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                                     <HiAdjustmentsHorizontal className="w-4 h-4 inline mr-1" />
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="DRAFT">Brouillon</option>
                  <option value="PUBLISHED">Publiée</option>
                  <option value="OFFERS_RECEIVED">Offres reçues</option>
                  <option value="ASSIGNED">Assignée</option>
                  <option value="IN_TRANSIT">En transit</option>
                  <option value="DELIVERED">Livrée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiExclamationTriangle className="w-4 h-4 inline mr-1" />
                  Urgence
                </label>
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">Toutes les urgences</option>
                  <option value="low">Peu urgent</option>
                  <option value="normal">Normal</option>
                  <option value="high">Urgent</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{filteredExpeditions.length}</span> expédition(s) trouvée(s)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des expéditions */}
        {filteredExpeditions.length === 0 ? (
          <Card className="shadow-lg rounded-2xl border border-gray-100 p-4">
            <CardContent className="p-12 text-center w-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiMapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune expédition trouvée</h3>
              <p className="text-gray-500 mb-6">
                {expeditions.length === 0 
                  ? "Commencez par créer votre première expédition"
                  : "Aucune expédition ne correspond à vos critères de recherche"
                }
              </p>
              <Link href="/expeditions/create">
                <Button className="px-6 py-3 bg-primary hover:bg-dark-bordeaux text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer">
                  <HiPlus className="w-5 h-5 mr-2" />
                  Créer une expédition
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredExpeditions.map((expedition) => (
              <Card key={expedition.id} className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl border border-gray-100 p-4">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(expedition.status)}`}>
                          {getStatusText(expedition.status)}
                        </span>
                        <span className={`text-xs font-medium ${getUrgencyColor(expedition.urgency)}`}>
                          {getUrgencyText(expedition.urgency)}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <HiMapPin className="w-4 h-4 mr-1" />
                        <span className="font-medium">{expedition.departureCity}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{expedition.arrivalCity}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/expeditions/${expedition.id}`}>
                        <Button variant="ghost" className="p-2 hover:bg-primary/10" title="Voir les détails">
                          <HiEye className="w-4 h-4 text-primary" />
                        </Button>
                      </Link>
                      
                      {/* Bouton Éditer - Possible tant que le transport n'a pas commencé */}
                      {['DRAFT', 'PUBLISHED', 'OFFERS_RECEIVED'].includes(expedition.status) && (
                        <Link href={`/expeditions/${expedition.id}/edit`}>
                          <Button variant="ghost" className="p-2 hover:bg-blue-50" title="Modifier l'expédition">
                            <HiPencil className="w-4 h-4 text-blue-600" />
                          </Button>
                        </Link>
                      )}
                      
                      {/* Bouton Supprimer - Possible avant assignation */}
                      {['DRAFT', 'PUBLISHED'].includes(expedition.status) && (
                        <Button 
                          variant="ghost" 
                          onClick={() => handleDelete(expedition.id)}
                          className="p-2 hover:bg-red-50"
                          title="Supprimer l'expédition"
                        >
                          <HiTrash className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                      
                      {/* Indicateur quand les actions ne sont plus possibles */}
                      {['ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(expedition.status) && (
                        <div className="flex items-center text-xs text-gray-500 px-2">
                          <span>Actions limitées</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 text-sm line-clamp-2">{expedition.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <HiScale className="w-4 h-4 mr-2" />
                      <span>{expedition.weight} kg</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <HiCube className="w-4 h-4 mr-2" />
                      <span>{expedition.volume} m³</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <HiCalendar className="w-4 h-4 mr-2" />
                      <span>{new Date(expedition.departureDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <HiCurrencyEuro className="w-4 h-4 mr-2" />
                      <span>
                        {expedition.selectedOffer 
                          ? `${expedition.selectedOffer}€` 
                          : expedition.maxBudget 
                            ? `Max ${expedition.maxBudget}€`
                            : 'Prix libre'
                        }
                      </span>
                    </div>
                  </div>

                  {expedition.currentOffers > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-700 text-sm font-medium">
                        {expedition.currentOffers} offre(s) reçue(s)
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Créée le {new Date(expedition.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    {(expedition.isFragile || expedition.requiresPL) && (
                      <div className="flex space-x-2">
                        {expedition.isFragile && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                            Fragile
                          </span>
                        )}
                        {expedition.requiresPL && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            PL requis
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 