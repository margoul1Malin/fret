'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  HiSparkles, 
  HiArrowRight,
  HiMapPin,
  HiCalendar,
  HiTruck,
  HiShieldCheck,
  HiCurrencyEuro,
  HiUserGroup,
  HiStar,
  HiGlobeAlt
} from 'react-icons/hi2';

export default function HomePage() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<'send' | 'transport'>('send');
  const [searchForm, setSearchForm] = useState({
    departure: '',
    arrival: '',
    date: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchForm.departure || !searchForm.arrival) {
      alert('Veuillez remplir au moins le lieu de départ et d\'arrivée');
      return;
    }

    // Construire les paramètres de recherche
    const queryParams = new URLSearchParams({
      departure: searchForm.departure,
      arrival: searchForm.arrival,
      type: searchType, // Ajouter le type de recherche
      ...(searchForm.date && { date: searchForm.date })
    });

    // Naviguer vers la page de recherche avec les paramètres
    router.push(`/search?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-light-beige">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-light-beige via-primary-beige to-light-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-8">
              <HiSparkles className="w-5 h-5 mr-2" />
              Révolutionnez votre transport
            </div>
            
            {/* Titre principal */}
            <h1 className="text-4xl md:text-6xl font-bold text-dark-bordeaux mb-6 leading-tight">
              Le BlaBlacar des
              <span className="text-primary block">marchandises</span>
            </h1>
            
            {/* Sous-titre */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Connectez-vous avec des transporteurs fiables pour expédier vos marchandises ou optimisez vos trajets en transportant pour d&apos;autres.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button variant="primary" size="large" className="w-full sm:w-auto hover:bg-primary hover:text-primary-beige p-2 flex items-center justify-center rounded-xl">
                <HiTruck className="w-5 h-5 mr-2" />
                Commencer maintenant
                <HiArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="large" className="w-full sm:w-auto hover:bg-primary hover:text-primary-beige p-2 flex items-center justify-center rounded-xl">
                Découvrir comment ça marche
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-gray-600">Transporteurs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">5000+</div>
                <div className="text-sm text-gray-600">Expéditions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">98%</div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">40%</div>
                <div className="text-sm text-gray-600">d&apos;économies</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-8 max-w-md mx-auto">
              <button
                onClick={() => setSearchType('send')}
                className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-all ${
                  searchType === 'send'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                J&apos;expédie
              </button>
              <button
                onClick={() => setSearchType('transport')}
                className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-all ${
                  searchType === 'transport'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Je transporte
              </button>
            </div>

            {/* Search Form */}
            <Card className="p-6">
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      <HiMapPin className="w-4 h-4 inline mr-1" />
                      Départ
                    </label>
                    <input
                      type="text"
                      name="departure"
                      value={searchForm.departure}
                      onChange={handleInputChange}
                      placeholder="Ville de départ"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      <HiMapPin className="w-4 h-4 inline mr-1" />
                      Arrivée
                    </label>
                    <input
                      type="text"
                      name="arrival"
                      value={searchForm.arrival}
                      onChange={handleInputChange}
                      placeholder="Ville d&apos;arrivée"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      <HiCalendar className="w-4 h-4 inline mr-1" />
                      Date (optionnel)
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={searchForm.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" variant="primary" className="w-full py-3">
                      Rechercher
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-bordeaux mb-4">
              Pourquoi choisir SendUp ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une plateforme innovante qui révolutionne le transport de marchandises
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiCurrencyEuro className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-dark-bordeaux mb-3">Économique</h3>
              <p className="text-gray-600">
                Réduisez vos coûts de transport jusqu&apos;à 40% grâce à notre réseau de transporteurs optimisé.
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiGlobeAlt className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-dark-bordeaux mb-3">Écologique</h3>
              <p className="text-gray-600">
                Optimisez l&apos;utilisation des véhicules et réduisez l&apos;empreinte carbone du transport.
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiShieldCheck className="w-8 h-8 text-info" />
              </div>
              <h3 className="text-xl font-semibold text-dark-bordeaux mb-3">Sécurisé</h3>
              <p className="text-gray-600">
                Transporteurs vérifiés, assurance incluse et suivi en temps réel de vos marchandises.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-bordeaux mb-4">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Pour les clients */}
            <div>
              <h3 className="text-2xl font-bold text-primary mb-6 text-center">
                <HiUserGroup className="w-6 h-6 inline mr-2" />
                Pour les expéditeurs
              </h3>
              <div className="space-y-6">
                {[
                  { step: "1", title: "Publier votre demande", desc: "Décrivez votre marchandise et le trajet souhaité" },
                  { step: "2", title: "Recevoir des offres", desc: "Les transporteurs vous proposent leurs services" },
                  { step: "3", title: "Choisir et payer", desc: "Sélectionnez votre transporteur et payez en sécurité" },
                  { step: "4", title: "Suivre l&apos;expédition", desc: "Suivez votre marchandise en temps réel" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-bordeaux mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pour les transporteurs */}
            <div>
              <h3 className="text-2xl font-bold text-primary mb-6 text-center">
                <HiTruck className="w-6 h-6 inline mr-2" />
                Pour les transporteurs
              </h3>
              <div className="space-y-6">
                {[
                  { step: "1", title: "Créer votre profil", desc: "Renseignez vos véhicules et zones de transport" },
                  { step: "2", title: "Chercher des missions", desc: "Trouvez des expéditions sur vos trajets" },
                  { step: "3", title: "Proposer vos services", desc: "Soumettez vos offres aux expéditeurs" },
                  { step: "4", title: "Transporter et gagner", desc: "Effectuez le transport et recevez votre paiement" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-bordeaux mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-bordeaux mb-4">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Marie Dubois",
                role: "E-commerçante",
                text: "SendUp m'a permis de réduire mes coûts de livraison de 35% tout en gardant un service de qualité.",
                rating: 5
              },
              {
                name: "Pierre Martin",
                role: "Transporteur",
                text: "Grâce à SendUp, j'optimise mes trajets et augmente mes revenus de 25% chaque mois.",
                rating: 5
              },
              {
                name: "Sophie Laurent",
                role: "Artisane",
                text: "Un service fiable et professionnel. Mes créations arrivent toujours en parfait état.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <HiStar key={i} className="w-5 h-5 text-warning" />
                  ))}
                </div>
                <blockquote className="text-gray-600 mb-4 italic">
                  &quot;{testimonial.text}&quot;
                </blockquote>
                <div>
                  <div className="font-semibold text-dark-bordeaux">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

            {/* CTA Final */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à révolutionner vos transports ?
          </h2>
          <p className="text-lg text-primary-beige mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d&apos;utilisateurs qui font déjà confiance à SendUp
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              variant="secondary" 
              size="large"
              className="w-full sm:w-auto px-8 py-4 bg-white text-primary hover:bg-primary-beige font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <HiUserGroup className="w-5 h-5 mr-2" />
              Je veux expédier
            </Button>
            <Button 
              variant="outline" 
              size="large" 
              className="w-full sm:w-auto px-8 py-4 text-white border-2 border-white hover:bg-white hover:text-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <HiTruck className="w-5 h-5 mr-2" />
              Je veux transporter
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
