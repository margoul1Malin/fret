'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { HiUser, HiTruck, HiUserGroup, HiCog, HiArrowRightOnRectangle, HiPlus, HiEye, HiChartBar, HiCalendar } from 'react-icons/hi2';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  phone?: string;
  companyName?: string;
  isVerified: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          if (data.success) {
            setUser(data.user);
          } else {
            router.push('/auth/login');
          }
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-beige flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre tableau de bord...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getUserTypeIcon = () => {
    switch (user.userType) {
      case 'TRANSPORTER':
        return <HiTruck className="w-12 h-12 text-primary" />;
      case 'CLIENT':
        return <HiUserGroup className="w-12 h-12 text-primary" />;
      default:
        return <HiUser className="w-12 h-12 text-primary" />;
    }
  };

  const getUserTypeLabel = () => {
    switch (user.userType) {
      case 'TRANSPORTER':
        return 'Transporteur';
      case 'CLIENT':
        return 'Expéditeur';
      case 'ADMIN':
        return 'Administrateur';
      default:
        return 'Utilisateur';
    }
  };

  return (
    <div className="min-h-screen bg-light-beige">
      {/* Header avec dégradé */}
      <div className="bg-gradient-to-r from-primary to-dark-bordeaux text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Bienvenue, {user.firstName} !
              </h1>
              <p className="text-primary-beige text-lg">
                Gérez vos {user.userType === 'TRANSPORTER' ? 'trajets et transports' : 'expéditions'} depuis votre tableau de bord
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary p-2 flex items-center justify-center rounded-xl"
            >
              <HiArrowRightOnRectangle className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Profil utilisateur - Colonne gauche */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
              <CardHeader className="text-center pb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {getUserTypeIcon()}
                </div>
                <CardTitle className="text-xl text-dark-bordeaux">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <p className="text-primary font-medium">{getUserTypeLabel()}</p>
                {user.companyName && (
                  <p className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full mt-2">
                    {user.companyName}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Informations</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Email :</span>
                      <p className="text-gray-800 break-all">{user.email}</p>
                    </div>
                    {user.phone && (
                      <div>
                        <span className="font-medium text-gray-600">Téléphone :</span>
                        <p className="text-gray-800">{user.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100">
                  <span className="text-sm font-medium text-gray-700">Statut du compte</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.isVerified 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {user.isVerified ? '✓ Vérifié' : '⏳ En attente'}
                  </span>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-6 hover:bg-primary hover:text-white transition-colors p-2 flex items-center justify-center"
                >
                  <HiCog className="w-4 h-4 mr-2" />
                  Modifier le profil
                </Button>
              </CardContent>
            </Card>

            {/* Card statistiques rapides */}
            <Card className="shadow-lg p-6 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <HiChartBar className="w-5 h-5 mr-2 text-primary" />
                  Aperçu rapide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Ce mois</span>
                    <span className="text-xl font-bold text-primary">0</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Complétés</span>
                    <span className="text-xl font-bold text-success">0</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      {user.userType === 'TRANSPORTER' ? 'Revenus' : 'Économies'}
                    </span>
                    <span className="text-xl font-bold text-warning">0€</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal - 3 colonnes droite */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Actions rapides */}
            <Card className="shadow-lg p-6 rounded-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-dark-bordeaux">Actions rapides</CardTitle>
                <p className="text-gray-600">
                  {user.userType === 'CLIENT' 
                    ? 'Publiez une nouvelle expédition ou consultez vos envois'
                    : 'Créez un nouveau trajet ou recherchez des expéditions'
                  }
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.userType === 'CLIENT' ? (
                    <>
                      <Link href="/expeditions/create" className="block">
                        <div className="bg-gradient-to-br from-primary to-dark-bordeaux rounded-xl p-6 text-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
                          <div className="flex items-center justify-between mb-4">
                            <HiPlus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Nouveau</span>
                          </div>
                          <h3 className="text-xl font-bold mb-2">Publier une expédition</h3>
                          <p className="text-primary-beige text-sm">
                            Créez une nouvelle demande d&apos;expédition et trouvez le transporteur idéal
                          </p>
                        </div>
                      </Link>
                      
                      <Link href="/expeditions" className="block">
                        <div className="bg-white border-2 border-primary/20 rounded-xl p-6 hover:shadow-xl hover:border-primary/40 transition-all duration-300 cursor-pointer group">
                          <div className="flex items-center justify-between mb-4">
                            <HiEye className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Gérer</span>
                          </div>
                          <h3 className="text-xl font-bold text-dark-bordeaux mb-2">Mes expéditions</h3>
                          <p className="text-gray-600 text-sm">
                            Consultez et gérez vos demandes d&apos;expédition
                          </p>
                        </div>
                      </Link>
                    </>
                  ) : user.userType === 'TRANSPORTER' ? (
                    <>
                      <Link href="/courses/create" className="block">
                        <div className="bg-gradient-to-br from-primary to-dark-bordeaux rounded-xl p-6 text-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
                          <div className="flex items-center justify-between mb-4">
                            <HiPlus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Nouveau</span>
                          </div>
                          <h3 className="text-xl font-bold mb-2">Publier un trajet</h3>
                          <p className="text-primary-beige text-sm">
                            Ajoutez votre itinéraire et proposez vos services de transport
                          </p>
                        </div>
                      </Link>
                      
                      <Link href="/courses/my-courses" className="block">
                        <div className="bg-white border-2 border-primary/20 rounded-xl p-6 hover:shadow-xl hover:border-primary/40 transition-all duration-300 cursor-pointer group">
                          <div className="flex items-center justify-between mb-4">
                            <HiEye className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Gérer</span>
                          </div>
                          <h3 className="text-xl font-bold text-dark-bordeaux mb-2">Mes trajets</h3>
                          <p className="text-gray-600 text-sm">
                            Consultez et gérez vos trajets publiés et réservations
                          </p>
                        </div>
                      </Link>
                    </>
                  ) : (
                    <div className="col-span-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-8 text-center">
                      <HiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-600 mb-2">Panneau Administrateur</h3>
                      <p className="text-gray-500">Fonctionnalités administrateur en cours de développement...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activité récente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg p-6 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HiCalendar className="w-5 h-5 mr-2 text-primary" />
                    Activité récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HiCalendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">Aucune activité récente</p>
                    <p className="text-sm text-gray-400">
                      Vos dernières {user.userType === 'TRANSPORTER' ? 'trajets' : 'expéditions'} apparaîtront ici
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg p-6 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HiChartBar className="w-5 h-5 mr-2 text-primary" />
                    Statistiques détaillées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          {user.userType === 'TRANSPORTER' ? 'Trajets complétés' : 'Expéditions réussies'}
                        </span>
                        <span className="text-sm font-bold text-primary">0/0</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Note moyenne</span>
                        <span className="text-sm font-bold text-warning">
                          ⭐ 0.0/5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-warning h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Taux de réussite</span>
                        <span className="text-sm font-bold text-success">0%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-success h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 