'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuthContext';
import { 
  HiStar, 
  HiUser,
  HiTruck,
  HiCalendarDays,
  HiChatBubbleBottomCenterText,
  HiCheckBadge,
  HiScale,
  HiCube,
  HiPhone,
  HiEnvelope,
  HiXMark as HiX
} from 'react-icons/hi2';

interface TransporterProfile {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  userType: string;
  isActive: boolean;
  email?: string;
  phone?: string;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
  };
}

interface Course {
  id: string;
  departure: string;
  arrival: string;
  departureDate: string;
  pricePerKg: number;
  maxWeight: number;
  availableSpace: number;
  vehicleType: string;
  status: string;
}

export default function TransporterProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [transporter, setTransporter] = useState<TransporterProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchTransporterProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/transporters/${resolvedParams.id}`, {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        const data = await response.json();
        if (data.success) {
          setTransporter(data.data.transporter);
          setReviews(data.data.reviews);
          setCourses(data.data.courses);
        } else {
          console.error('Erreur:', data.message);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransporterProfile();
  }, [resolvedParams.id]);

  const handleSubmitReview = async () => {
    if (!user || user.userType !== 'CLIENT') {
      alert('Seuls les expéditeurs peuvent laisser des avis');
      return;
    }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/transporters/${resolvedParams.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: newReview.rating,
          comment: newReview.comment.trim() || null
        })
      });

      const data = await response.json();
      if (data.success) {
        // Recharger les reviews
        const updatedResponse = await fetch(`/api/transporters/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setTransporter(updatedData.data.transporter);
          setReviews(updatedData.data.reviews);
        }
        
        setShowReviewForm(false);
        setNewReview({ rating: 5, comment: '' });
        alert('Votre avis a été publié avec succès !');
      } else {
        alert(data.message || 'Erreur lors de la publication de l\'avis');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'avis:', error);
      alert('Erreur lors de la publication de l\'avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onStarClick && onStarClick(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <HiStar
              className={`w-5 h-5 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-beige to-white">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-lg text-gray-600">Chargement du profil...</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!transporter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-beige to-white">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-bordeaux mb-4">Transporteur introuvable</h1>
            <p className="text-gray-600">Ce profil n&apos;existe pas ou n&apos;est plus disponible.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-beige to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header du profil */}
          <Card className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                  <HiUser className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-bordeaux">
                    {transporter.companyName || `${transporter.firstName} ${transporter.lastName}`}
                  </h1>
                  {transporter.companyName && (
                    <p className="text-lg text-gray-600 mt-1">
                      {transporter.firstName} {transporter.lastName}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-2">
                      {renderStars(transporter.rating || 0)}
                      <span className="text-sm text-gray-600">
                        ({transporter.reviewCount || 0} avis)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HiCheckBadge className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600">Transporteur vérifié</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Membre depuis {new Date(transporter.createdAt).toLocaleDateString('fr-FR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              {user && user.userType === 'CLIENT' && (
                <div className="flex items-center space-x-3">
                  {(transporter.phone || transporter.email) && (
                    <Button
                      variant="outline"
                      onClick={() => setShowContactModal(true)}
                      className="flex items-center space-x-2"
                    >
                      <HiPhone className="w-4 h-4" />
                      <span>Contacter</span>
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="flex items-center space-x-2"
                  >
                    <HiStar className="w-4 h-4" />
                    <span>Laisser un avis</span>
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Trajets récents */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-bordeaux mb-4 flex items-center">
              <HiTruck className="w-5 h-5 mr-2" />
              Trajets récents
            </h2>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.slice(0, 4).map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-bordeaux">
                        {course.departure} → {course.arrival}
                      </h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {course.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <HiCalendarDays className="w-4 h-4 mr-1" />
                        {new Date(course.departureDate).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center">
                        <HiScale className="w-4 h-4 mr-1" />
                        {course.pricePerKg}€/kg
                      </div>
                      <div className="flex items-center">
                        <HiScale className="w-4 h-4 mr-1" />
                        Max: {course.maxWeight}kg
                      </div>
                      <div className="flex items-center">
                        <HiCube className="w-4 h-4 mr-1" />
                        {course.availableSpace}m³
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucun trajet récent</p>
            )}
          </Card>

          {/* Avis clients */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-bordeaux mb-4 flex items-center">
              <HiChatBubbleBottomCenterText className="w-5 h-5 mr-2" />
              Avis clients ({reviews.length})
            </h2>
            
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          {renderStars(review.rating)}
                          <span className="font-medium text-gray-900">
                            {review.reviewer.firstName} {review.reviewer.lastName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucun avis pour le moment</p>
            )}
          </Card>

          {/* Formulaire d'avis */}
          {showReviewForm && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-bordeaux mb-4">Laisser un avis</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview({ ...newReview, rating })
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Partagez votre expérience avec ce transporteur..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="flex items-center space-x-2"
                  >
                    <HiStar className="w-4 h-4" />
                    <span>{submittingReview ? 'Publication...' : 'Publier l\'avis'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setNewReview({ rating: 5, comment: '' });
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Modal de contact */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Informations de contact</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <HiUser className="w-8 h-8 text-white" />
                  </div>
                  <div className="font-semibold text-lg">
                    {transporter.companyName || `${transporter.firstName} ${transporter.lastName}`}
                  </div>
                  {transporter.companyName && (
                    <div className="text-sm text-gray-600">
                      {transporter.firstName} {transporter.lastName}
                    </div>
                  )}
                </div>

                {transporter.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <HiPhone className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-gray-600">Téléphone</div>
                      <a 
                        href={`tel:${transporter.phone}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {transporter.phone}
                      </a>
                    </div>
                  </div>
                )}

                {transporter.email && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <HiEnvelope className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <a 
                        href={`mailto:${transporter.email}`}
                        className="font-medium text-primary hover:underline break-all"
                      >
                        {transporter.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 