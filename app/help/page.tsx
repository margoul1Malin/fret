'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuthContext';
import { 
  HiQuestionMarkCircle, 
  HiChatBubbleLeftRight, 
  HiChevronDown,
  HiChevronUp,
  HiEnvelope,
  HiPhone,
  HiUser,
  HiBuildingOffice2,
  HiExclamationTriangle,
  HiCheckCircle
} from 'react-icons/hi2';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'Comment fonctionne SendUp ?',
    answer: 'SendUp met en relation des expéditeurs qui ont des colis à envoyer avec des transporteurs qui effectuent déjà des trajets. C\'est un système collaboratif qui permet de réduire les coûts et l\'empreinte carbone.',
    category: 'Général'
  },
  {
    id: '2',
    question: 'Comment créer une expédition ?',
    answer: 'Connectez-vous à votre compte expéditeur, cliquez sur "Nouvelle expédition" dans votre dashboard, remplissez les détails (adresses, poids, volume, date) et publiez votre annonce. Les transporteurs pourront alors vous faire des offres.',
    category: 'Expéditions'
  },
  {
    id: '3',
    question: 'Comment devenir transporteur ?',
    answer: 'Inscrivez-vous en tant que transporteur, créez vos trajets en indiquant vos itinéraires, dates, capacités disponibles et tarifs. Les expéditeurs pourront réserver de la place sur vos trajets.',
    category: 'Transport'
  },
  {
    id: '4',
    question: 'Comment sont calculés les prix ?',
    answer: 'Les transporteurs fixent leurs prix au kilogramme. Le prix total dépend du poids de votre colis et du tarif proposé par le transporteur. Vous pouvez comparer les offres et choisir celle qui vous convient.',
    category: 'Tarification'
  },
  {
    id: '5',
    question: 'Que faire si mon colis est endommagé ?',
    answer: 'Contactez immédiatement notre support via le formulaire ci-dessous. Nous médierons entre vous et le transporteur. C\'est pourquoi nous recommandons de déclarer la valeur de vos colis et de les assurer si nécessaire.',
    category: 'Problèmes'
  },
  {
    id: '6',
    question: 'Comment modifier ou annuler une expédition ?',
    answer: 'Vous pouvez modifier une expédition tant qu\'elle n\'est pas assignée à un transporteur. Pour annuler, utilisez le bouton "Supprimer" dans la liste de vos expéditions (possible seulement avant assignation).',
    category: 'Expéditions'
  },
  {
    id: '7',
    question: 'Quels types de véhicules sont disponibles ?',
    answer: 'Nous proposons des véhicules légers (VL) pour les petits colis et des poids lourds (PL) pour les gros volumes ou poids importants. Chaque trajet indique le type de véhicule utilisé.',
    category: 'Transport'
  },
  {
    id: '8',
    question: 'Comment contacter un transporteur ?',
    answer: 'Une fois une offre acceptée, vous recevez les coordonnées du transporteur et pouvez échanger directement avec lui pour organiser la prise en charge et la livraison.',
    category: 'Communication'
  }
];

const categories = ['Tous', 'Général', 'Expéditions', 'Transport', 'Tarification', 'Problèmes', 'Communication'];

const subjectOptions = [
  { value: 'GENERAL', label: 'Question générale' },
  { value: 'TECHNICAL', label: 'Problème technique' },
  { value: 'BILLING', label: 'Facturation' },
  { value: 'ACCOUNT', label: 'Compte utilisateur' },
  { value: 'TRANSPORT', label: 'Questions transport' },
  { value: 'BUG_REPORT', label: 'Signalement de bug' },
  { value: 'FEATURE_REQUEST', label: 'Demande de fonctionnalité' },
  { value: 'OTHER', label: 'Autre' }
];

export default function HelpPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [contactForm, setContactForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    company: '',
    subject: 'GENERAL',
    priority: 'NORMAL',
    message: ''
  });

  const filteredFAQs = activeCategory === 'Tous' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  const handleFAQToggle = (faqId: string) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
        setContactForm({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: '',
          company: '',
          subject: 'GENERAL',
          priority: 'NORMAL',
          message: ''
        });
      } else {
        setSubmitError(data.message || 'Erreur lors de l&apos;envoi de votre message');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setSubmitError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-beige via-primary-beige to-light-beige py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-bordeaux mb-4">Centre d&apos;aide</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trouvez rapidement les réponses à vos questions ou contactez notre équipe support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Section FAQ */}
          <div>
            <Card className="shadow-xl rounded-2xl border border-gray-100 bg-white/90 backdrop-blur-sm rounded-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl p-6">
                <CardTitle className="text-2xl text-dark-bordeaux flex items-center">
                  <HiQuestionMarkCircle className="w-6 h-6 mr-3 text-primary" />
                  Questions fréquentes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 rounded-xl">
                {/* Filtres par catégorie */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          activeCategory === category
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Liste des FAQ */}
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleFAQToggle(faq.id)}
                        className="w-full px-4 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-dark-bordeaux">{faq.question}</span>
                        {openFAQ === faq.id ? (
                          <HiChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <HiChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {openFAQ === faq.id && (
                        <div className="px-4 py-4 bg-white border-t border-gray-200">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {faq.category}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune question trouvée dans cette catégorie.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section Contact */}
          <div>
            <Card className="shadow-xl rounded-2xl border border-gray-100 bg-white/90 backdrop-blur-sm rounded-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl p-6">
                <CardTitle className="text-2xl text-dark-bordeaux flex items-center">
                  <HiChatBubbleLeftRight className="w-6 h-6 mr-3 text-primary" />
                  Contactez-nous
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <HiCheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <p className="text-green-700">
                      Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                    </p>
                  </div>
                )}

                {submitError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <HiExclamationTriangle className="w-5 h-5 text-red-600 mr-3" />
                    <p className="text-red-700">{submitError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitContact} className="space-y-6">
                  {/* Informations personnelles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <HiUser className="w-4 h-4 inline mr-1" />
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={contactForm.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Votre prénom"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <HiUser className="w-4 h-4 inline mr-1" />
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={contactForm.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <HiEnvelope className="w-4 h-4 inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <HiPhone className="w-4 h-4 inline mr-1" />
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={contactForm.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="06 12 34 56 78"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <HiBuildingOffice2 className="w-4 h-4 inline mr-1" />
                        Entreprise (facultatif)
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={contactForm.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Nom de votre entreprise (optionnel)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet *
                    </label>
                    <select
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {subjectOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priorité
                    </label>
                    <select
                      name="priority"
                      value={contactForm.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="LOW">Faible</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">Élevée</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Décrivez votre question ou problème en détail..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-primary hover:bg-dark-bordeaux text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Autres moyens de contact</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center">
                      <HiEnvelope className="w-4 h-4 mr-2 text-primary" />
                      support@sendup.fr
                    </p>
                    <p className="flex items-center">
                      <HiPhone className="w-4 h-4 mr-2 text-primary" />
                      01 23 45 67 89 (Du lundi au vendredi, 9h-18h)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 