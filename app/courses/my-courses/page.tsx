'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, } from '@/components/ui/Card';
import { 
  HiPlus,
  HiArrowLeft,
  HiMapPin,
  HiCalendar,
  HiScale,
  HiCurrencyEuro,
  HiTruck,
  HiEye,
  HiPencil,
  HiTrash,
  HiUsers,
  HiClock,
  HiCheckCircle
} from 'react-icons/hi2';

interface Course {
  id: string;
  departure: string;
  arrival: string;
  departureDate: string;
  maxWeight: number;
  pricePerKg: number;
  description: string;
  vehicleType: string;
  status: string;
  stats: {
    totalBookings: number;
    bookedWeight: number;
    availableWeight: number;
    occupancyRate: number;
    totalRevenue: number;
    pendingBookings: number;
  };
}

export default function MyCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const checkAuthAndLoadCourses = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        // Vérifier l'authentification
        const authResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!authResponse.ok) {
          router.push('/auth/login');
          return;
        }

        const authData = await authResponse.json();
        if (!authData.success || authData.user.userType !== 'TRANSPORTER') {
          router.push('/dashboard');
          return;
        }

        // Charger les trajets
        const coursesResponse = await fetch('/api/courses/my-courses', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          if (coursesData.success) {
            setCourses(coursesData.data.courses);
          } else {
            setError(coursesData.message);
          }
        } else {
          setError('Erreur lors du chargement des trajets');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur de connexion');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadCourses();
  }, [router]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return { label: 'Disponible', color: 'bg-green-100 text-green-800' };
      case 'FULL':
        return { label: 'Complet', color: 'bg-yellow-100 text-yellow-800' };
      case 'IN_PROGRESS':
        return { label: 'En cours', color: 'bg-blue-100 text-blue-800' };
      case 'COMPLETED':
        return { label: 'Terminé', color: 'bg-gray-100 text-gray-800' };
      case 'CANCELLED':
        return { label: 'Annulé', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    return type === 'VL' ? 'Véhicule Léger' : 'Poids Lourd';
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

  const handleDelete = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette course ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Recharger la liste des courses
        setCourses(prev => prev.filter(course => course.id !== courseId));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    }
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    return course.status === filter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-beige flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos trajets...</p>
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary p-2 flex items-center justify-center rounded-xl"
              >
                <HiArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Mes trajets</h1>
                <p className="text-primary-beige">Gérez vos trajets et réservations</p>
              </div>
            </div>
            <Link href="/courses/create">
              <Button
                variant="secondary"
                className="bg-white text-primary hover:bg-primary-beige p-2 flex items-center justify-center rounded-xl"
              >
                <HiPlus className="w-4 h-4 mr-2" />
                Nouveau trajet
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="border-l-4 border-l-red-500 bg-red-50 mb-6">
            <CardContent className="p-4">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{courses.length}</div>
              <div className="text-sm text-gray-600">Trajets total</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {courses.filter(c => c.status === 'AVAILABLE').length}
              </div>
              <div className="text-sm text-gray-600">Disponibles</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {courses.reduce((sum, c) => sum + c.stats.totalBookings, 0)}
              </div>
              <div className="text-sm text-gray-600">Réservations</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {courses.reduce((sum, c) => sum + c.stats.totalRevenue, 0).toFixed(0)}€
              </div>
              <div className="text-sm text-gray-600">Revenus</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="shadow-lg mb-6 rounded-xl p-4 flex justify-center items-center space-x-12 w-full">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'AVAILABLE', label: 'Disponibles' },
                { key: 'FULL', label: 'Complets' },
                { key: 'IN_PROGRESS', label: 'En cours' },
                { key: 'COMPLETED', label: 'Terminés' }
              ].map((filterOption) => (
                <Button
                  key={filterOption.key}
                  variant={filter === filterOption.key ? 'primary' : 'outline'}
                  size="small"
                  onClick={() => setFilter(filterOption.key)}
                  className="hover:bg-primary hover:text-primary-beige p-2 flex items-center justify-center rounded-xl cursor-pointer"
                >
                  {filterOption.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Liste des trajets */}
        {filteredCourses.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center w-full flex flex-col items-center justify-center">
              <HiTruck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {filter === 'all' ? 'Aucun trajet publié' : 'Aucun trajet dans cette catégorie'}
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === 'all' 
                  ? 'Commencez par publier votre premier trajet pour proposer vos services'
                  : 'Modifiez les filtres ou créez de nouveaux trajets'
                }
              </p>
              <Link href="/courses/create">
                <Button variant="primary" className="px-6 py-3 bg-primary hover:bg-dark-bordeaux text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer">
                  <HiPlus className="w-4 h-4 mr-2" />
                  Publier un trajet
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredCourses.map((course) => {
              const statusInfo = getStatusLabel(course.status);
              return (
                <Card key={course.id} className="shadow-lg hover:shadow-xl transition-shadow rounded-xl p-4">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Itinéraire et infos principales */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <HiMapPin className="w-5 h-5 text-primary" />
                            <div>
                              <div className="font-semibold text-dark-bordeaux">
                                {course.departure} → {course.arrival}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center">
                                <HiTruck className="w-4 h-4 mr-1" />
                                {getVehicleTypeLabel(course.vehicleType)}
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <HiCalendar className="w-4 h-4 mr-2" />
                            {formatDate(course.departureDate)}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <HiScale className="w-4 h-4 mr-2" />
                            {course.maxWeight} kg max
                          </div>
                          <div className="flex items-center text-gray-600">
                            <HiCurrencyEuro className="w-4 h-4 mr-2" />
                            {course.pricePerKg}€/kg
                          </div>
                          <div className="flex items-center text-gray-600">
                            <HiUsers className="w-4 h-4 mr-2" />
                            {course.stats.totalBookings} réservation(s)
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm line-clamp-2">
                          {course.description}
                        </p>
                      </div>

                      {/* Statistiques */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700 mb-3">Occupation</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Réservé:</span>
                            <span className="font-medium">{course.stats.bookedWeight} kg</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Disponible:</span>
                            <span className="font-medium">{course.stats.availableWeight} kg</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${course.stats.occupancyRate}%` }}
                            ></div>
                          </div>
                          <div className="text-center text-sm text-gray-600">
                            {course.stats.occupancyRate}% occupé
                          </div>
                        </div>
                        
                        {course.stats.pendingBookings > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center text-yellow-700">
                              <HiClock className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                {course.stats.pendingBookings} demande(s) en attente
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700 mb-3">Actions</h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="small"
                            className="w-full justify-start hover:bg-primary hover:text-primary-beige p-2 flex items-center justify-center rounded-xl cursor-pointer"
                            onClick={() => router.push(`/courses/${course.id}`)}
                          >
                            <HiEye className="w-4 h-4 mr-2" />
                            Voir détails
                          </Button>
                          
                          {course.status === 'AVAILABLE' && (
                            <Button
                              variant="outline"
                              size="small"
                              className="w-full justify-start text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-600 p-2 flex items-center justify-center rounded-xl cursor-pointer"
                              onClick={() => router.push(`/courses/${course.id}/edit`)}
                            >
                              <HiPencil className="w-4 h-4 mr-2" />
                              Modifier
                            </Button>
                          )}
                          
                          {course.stats.totalBookings === 0 && course.status === 'AVAILABLE' && (
                            <Button
                              variant="outline"
                              size="small"
                              className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50 hover:text-red-600 p-2 flex items-center justify-center rounded-xl cursor-pointer"
                              onClick={() => handleDelete(course.id)}
                            >
                              <HiTrash className="w-4 h-4 mr-2" />
                              Supprimer
                            </Button>
                          )}

                          {course.status === 'IN_PROGRESS' && (
                            <Button
                              variant="outline"
                              size="small"
                              className="w-full justify-start text-green-600 border-green-300 hover:bg-green-50 hover:text-green-600 p-2 flex items-center justify-center rounded-xl cursor-pointer"
                            >
                              <HiCheckCircle className="w-4 h-4 mr-2" />
                              Marquer terminé
                            </Button>
                          )}
                        </div>
                        
                        {course.stats.totalRevenue > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-700">
                                {course.stats.totalRevenue}€
                              </div>
                              <div className="text-xs text-green-600">Revenus générés</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 