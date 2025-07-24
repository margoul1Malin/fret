'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { 
  HiArchiveBox,
  HiArrowRight,
  HiShieldCheck,
  HiCurrencyEuro,
  HiGlobeAlt,
  HiTruck,
  HiStar,
  HiClock,
  HiMapPin,
  HiCheckCircle,
  HiSparkles
} from 'react-icons/hi2';

export default function PublishPage() {
  return (
    <div className="min-h-screen bg-light-beige">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-light-beige via-primary-beige to-light-beige py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-8">
              <HiSparkles className="w-5 h-5 mr-2" />
              Solution d&apos;expédition innovante
            </div>
            
            {/* Titre principal */}
            <h1 className="text-4xl md:text-6xl font-bold text-dark-bordeaux mb-6 leading-tight">
              Expédiez vos
              <span className="text-primary block">marchandises</span>
              en toute simplicité
            </h1>
            
            {/* Sous-titre */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connectez-vous avec des transporteurs fiables et économisez jusqu&apos;à 40% sur vos frais de transport. 
              Simple, sécurisé et écologique.
            </p>
            
            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth/register">
                <Button variant="primary" size="large" className="w-full sm:w-auto px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200 flex rounded-lg hover:bg-primary hover:text-primary-beige p-2 items-center justify-center cursor-pointer">
                  <HiArchiveBox className="w-5 h-5 mr-2" />
                  Devenir Expéditeur
                  <HiArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/courses/search">
                <Button variant="outline" size="large" className="w-full sm:w-auto px-8 py-4 flex rounded-lg bg-primary text-primary-beige hover:bg-primary-beige hover:shadow-xl hover:text-primary p-2 items-center justify-center cursor-pointer">
                  Voir les trajets disponibles
                </Button>
              </Link>
            </div>
            
            {/* Stats expéditeurs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center p-4 bg-white/50 rounded-2xl">
                <div className="text-2xl md:text-3xl font-bold text-primary">-40%</div>
                <div className="text-sm text-gray-600">d&apos;économies</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-2xl">
                <div className="text-2xl md:text-3xl font-bold text-primary">24h</div>
                <div className="text-sm text-gray-600">délai moyen</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-2xl">
                <div className="text-2xl md:text-3xl font-bold text-primary">98%</div>
                <div className="text-sm text-gray-600">livraisons réussies</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-2xl">
                <div className="text-2xl md:text-3xl font-bold text-primary">5000+</div>
                <div className="text-sm text-gray-600">expéditions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche pour les expéditeurs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-bordeaux mb-4">
              Comment expédier avec SendUp ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un processus simple et sécurisé en 4 étapes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: HiArchiveBox,
                title: "Décrivez votre envoi",
                description: "Renseignez les détails de votre marchandise : dimensions, poids, destination et date souhaitée."
              },
              {
                step: "2", 
                icon: HiStar,
                title: "Recevez des offres",
                description: "Les transporteurs vous proposent leurs services avec des tarifs compétitifs et transparents."
              },
              {
                step: "3",
                icon: HiShieldCheck,
                title: "Choisissez et payez",
                description: "Sélectionnez le transporteur qui vous convient et payez en toute sécurité via notre plateforme."
              },
              {
                step: "4",
                icon: HiTruck,
                title: "Suivez votre envoi",
                description: "Recevez des notifications en temps réel et suivez l'avancement de votre expédition."
              }
            ].map((step, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-200 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-dark-bordeaux mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages pour les expéditeurs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-bordeaux mb-4">
              Pourquoi expédier avec SendUp ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tous les avantages d&apos;une solution moderne et collaborative
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: HiCurrencyEuro,
                title: "Économique",
                description: "Réduisez vos coûts de transport jusqu'à 40% grâce à notre réseau de transporteurs optimisé.",
                color: "text-primary"
              },
              {
                icon: HiGlobeAlt,
                title: "Écologique", 
                description: "Participez à l'économie collaborative et réduisez l'empreinte carbone de vos expéditions.",
                color: "text-success"
              },
              {
                icon: HiShieldCheck,
                title: "Sécurisé",
                description: "Transporteurs vérifiés, assurance incluse et paiement sécurisé via notre plateforme.",
                color: "text-info"
              },
              {
                icon: HiClock,
                title: "Rapide",
                description: "Trouvez un transporteur en quelques minutes et expédiez le jour même si besoin.",
                color: "text-warning"
              },
              {
                icon: HiMapPin,
                title: "Suivi en temps réel",
                description: "Suivez votre marchandise en direct et recevez des notifications à chaque étape.",
                color: "text-primary"
              },
              {
                icon: HiStar,
                title: "Qualité garantie",
                description: "Transporteurs notés et évalués par la communauté pour un service de qualité.",
                color: "text-success"
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 bg-white rounded-2xl border border-gray-100">
                <div className={`w-16 h-16 bg-${feature.color.split('-')[1]}/10 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-dark-bordeaux mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Types d'envois */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-bordeaux mb-4">
              Tous types d&apos;envois acceptés
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              De la petite pièce détachée au mobilier, nous avons le transporteur qu&apos;il vous faut
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Colis et paquets",
                description: "Documents, vêtements, accessoires",
                size: "Jusqu'à 30kg",
                price: "À partir de 5€"
              },
              {
                title: "Électroménager",
                description: "Lave-linge, réfrigérateur, TV",
                size: "30kg à 150kg",
                price: "À partir de 25€"
              },
              {
                title: "Mobilier",
                description: "Canapé, armoire, table",
                size: "Plus de 150kg",
                price: "À partir de 50€"
              },
              {
                title: "Véhicules 2 roues",
                description: "Moto, scooter, vélo",
                size: "Transport spécialisé",
                price: "À partir de 80€"
              },
              {
                title: "Matériaux",
                description: "Carrelage, parquet, gravats",
                size: "Transport en benne",
                price: "À partir de 60€"
              },
              {
                title: "Marchandises pro",
                description: "Équipements, machines",
                size: "Transport professionnel",
                price: "Sur devis"
              }
            ].map((type, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 bg-white rounded-2xl border border-gray-100">
                <h3 className="text-lg font-semibold text-dark-bordeaux mb-2">{type.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Poids :</span>
                    <span className="text-sm font-medium">{type.size}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Prix :</span>
                    <span className="text-sm font-medium text-primary">{type.price}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages expéditeurs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-bordeaux mb-4">
              Ils expédient avec SendUp
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez les témoignages de nos expéditeurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sophie Laurent",
                role: "Propriétaire boutique en ligne",
                text: "SendUp m'a permis de réduire mes coûts de livraison de 35% tout en offrant un meilleur service à mes clients. Le suivi en temps réel est fantastique !",
                rating: 5,
                savings: "35%"
              },
              {
                name: "Marc Dubois", 
                role: "Particulier",
                text: "J'ai déménagé mon salon complet pour seulement 80€ au lieu des 200€ demandés par les déménageurs traditionnels. Service impeccable !",
                rating: 5,
                savings: "60%"
              },
              {
                name: "Claire Martin",
                role: "Artisane créatrice",
                text: "Mes créations arrivent toujours en parfait état. Les transporteurs sont soigneux et l'assurance me donne une tranquillité d'esprit totale.",
                rating: 5,
                savings: "40%"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <HiStar key={i} className="w-5 h-5 text-warning" />
                  ))}
                  <span className="ml-2 text-sm font-medium text-primary">Économie: {testimonial.savings}</span>
                </div>
                <blockquote className="text-gray-600 mb-4 italic leading-relaxed">
                  &quot;{testimonial.text}&quot;
                </blockquote>
                <div className="border-t pt-4">
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à expédier avec SendUp ?
          </h2>
          <p className="text-lg text-primary-beige mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d&apos;expéditeurs qui font déjà confiance à notre plateforme
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Link href="/auth/register">
              <Button 
                variant="secondary" 
                size="large"
                className="w-full sm:w-auto px-8 py-4 bg-white text-primary hover:bg-primary-beige font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex rounded-lg hover:bg-primary hover:text-primary p-2 items-center justify-center cursor-pointer"
              >
                <HiArchiveBox className="w-5 h-5 mr-2" />
                Devenir Expéditeur
              </Button>
            </Link>
            <Link href="/courses/search">
              <Button 
                variant="outline" 
                size="large" 
                className="w-full sm:w-auto px-8 py-4 text-white border-2 border-white hover:bg-white hover:text-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex rounded-lg hover:bg-primary-peige hover:text-primary p-2 items-center justify-center cursor-pointer"
              >
                Voir les transporteurs
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 text-white/80 text-sm">
            <div className="flex items-center">
              <HiCheckCircle className="w-4 h-4 mr-2" />
              Inscription gratuite
            </div>
            <div className="flex items-center">
              <HiCheckCircle className="w-4 h-4 mr-2" />
              Paiement sécurisé
            </div>
            <div className="flex items-center">
              <HiCheckCircle className="w-4 h-4 mr-2" />
              Support 7j/7
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 