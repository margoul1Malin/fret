'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { 
  HiTruck,
  HiArrowRight,
  HiShieldCheck,
  HiCurrencyEuro,
  HiUserGroup,
  HiStar,
  HiClock,
  HiMapPin,
  HiCalculator,
  HiCheckCircle,
  HiSparkles,
  HiBanknotes,
  HiChartBarSquare
} from 'react-icons/hi2';

export default function BecomeTransporterPage() {
  return (
    <div className="min-h-screen bg-light-beige">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-dark-bordeaux to-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-primary-beige/20 text-primary-beige rounded-full text-sm font-semibold mb-8">
              <HiSparkles className="w-5 h-5 mr-2" />
              Opportunité de revenus complémentaires
            </div>
            
            {/* Titre principal */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Devenez
              <span className="text-primary-beige block">transporteur</span>
              et optimisez vos trajets
            </h1>
            
            {/* Sous-titre */}
            <p className="text-lg md:text-xl text-primary-beige/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Rentabilisez vos déplacements en transportant pour d&apos;autres. Gagnez jusqu&apos;à 500€ par mois 
              en optimisant vos trajets existants.
            </p>
            
            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth/register">
                <Button variant="primary" size="large" className="w-full sm:w-auto px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200 flex rounded-lg bg-primary-beige text-primary hover:bg-white hover:text-primary p-2 items-center justify-center cursor-pointer">
                  <HiTruck className="w-5 h-5 mr-2" />
                  Devenir Transporteur
                  <HiArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="large" className="w-full sm:w-auto px-8 py-4 flex rounded-lg border-2 border-primary-beige text-primary-beige hover:bg-primary-beige hover:text-primary p-2 items-center justify-center cursor-pointer">
                  Voir les missions disponibles
                </Button>
              </Link>
            </div>
            
            {/* Stats transporteurs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center p-4 bg-primary-beige/20 rounded-2xl">
                <div className="text-2xl md:text-3xl font-bold text-primary-beige">+25%</div>
                <div className="text-sm text-primary-beige/80">revenus mensuels</div>
              </div>
              <div className="text-center p-4 bg-primary-beige/20 rounded-2xl">
                <div className="text-2xl md:text-3xl font-bold text-primary-beige">500€</div>
                <div className="text-sm text-primary-beige/80">gains moyens/mois</div>
              </div>
              <div className="text-center p-4 bg-primary-beige/20 rounded-2xl">
                <div className="text-2xl md:text-3xl font-bold text-primary-beige">1000+</div>
                <div className="text-sm text-primary-beige/80">transporteurs actifs</div>
              </div>
              <div className="text-center p-4 bg-primary-beige/20 rounded-2xl">
                <div className="text-2xl md:text-3xl font-bold text-primary-beige">4.8/5</div>
                <div className="text-sm text-primary-beige/80">satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche pour les transporteurs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-bordeaux mb-4">
              Comment transporter avec SendUp ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un processus simple pour maximiser vos revenus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: HiUserGroup,
                title: "Créez votre profil",
                description: "Renseignez vos véhicules, zones de transport et disponibilités. Validation en 24h."
              },
              {
                step: "2", 
                icon: HiMapPin,
                title: "Trouvez des missions",
                description: "Découvrez les expéditions disponibles sur vos trajets habituels ou planifiés."
              },
              {
                step: "3",
                icon: HiBanknotes,
                title: "Proposez vos tarifs",
                description: "Définissez vos prix en toute liberté et négociez directement avec les expéditeurs."
              },
              {
                step: "4",
                icon: HiTruck,
                title: "Transportez et gagnez",
                description: "Effectuez le transport et recevez votre paiement automatiquement sous 48h."
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

      {/* Avantages pour les transporteurs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-bordeaux mb-4">
              Pourquoi devenir transporteur SendUp ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tous les avantages d&apos;une plateforme moderne et rentable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: HiCurrencyEuro,
                title: "Revenus complémentaires",
                description: "Gagnez jusqu'à 500€ par mois en optimisant vos trajets existants sans contrainte.",
                color: "text-primary"
              },
              {
                icon: HiCalculator,
                title: "Tarifs libres", 
                description: "Fixez vos prix en toute liberté et négociez directement avec les expéditeurs.",
                color: "text-success"
              },
              {
                icon: HiShieldCheck,
                title: "Protection intégrale",
                description: "Assurance tous risques incluse et paiement garanti via notre plateforme sécurisée.",
                color: "text-info"
              },
              {
                icon: HiClock,
                title: "Flexibilité totale",
                description: "Choisissez vos missions selon vos disponibilités et contraintes personnelles.",
                color: "text-warning"
              },
              {
                icon: HiChartBarSquare,
                title: "Suivi des performances",
                description: "Tableau de bord complet pour suivre vos gains, évaluations et statistiques.",
                color: "text-primary"
              },
              {
                icon: HiStar,
                title: "Réputation valorisée",
                description: "Système de notation qui récompense la qualité et augmente vos opportunités.",
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

      {/* Types de véhicules */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-bordeaux mb-4">
              Tous types de véhicules acceptés
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              De la voiture au camion, chaque véhicule a sa mission
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Voiture",
                description: "Colis, paquets, bagages",
                capacity: "Jusqu'à 500kg",
                earning: "5-25€ par mission"
              },
              {
                title: "Break / Monospace",
                description: "Électroménager, meubles",
                capacity: "500kg à 1 tonne",
                earning: "25-75€ par mission"
              },
              {
                title: "Utilitaire",
                description: "Mobilier, déménagement",
                capacity: "1 à 3.5 tonnes",
                earning: "50-150€ par mission"
              },
              {
                title: "Camion",
                description: "Transport professionnel",
                capacity: "Plus de 3.5 tonnes",
                earning: "100-400€ par mission"
              },
              {
                title: "Remorque",
                description: "Véhicules, machines",
                capacity: "Transport spécialisé",
                earning: "80-300€ par mission"
              },
              {
                title: "Benne",
                description: "Matériaux, gravats",
                capacity: "Transport en vrac",
                earning: "60-200€ par mission"
              }
            ].map((vehicle, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 bg-white rounded-2xl border border-gray-100">
                <h3 className="text-lg font-semibold text-dark-bordeaux mb-2">{vehicle.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{vehicle.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Capacité :</span>
                    <span className="text-sm font-medium">{vehicle.capacity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Gains :</span>
                    <span className="text-sm font-medium text-primary">{vehicle.earning}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages transporteurs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-bordeaux mb-4">
              Ils transportent avec SendUp
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez les témoignages de nos transporteurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Pierre Martin",
                role: "Transporteur particulier",
                text: "Grâce à SendUp, j'optimise mes trajets et augmente mes revenus de 25% chaque mois. Les missions sont variées et les paiements toujours à l'heure !",
                rating: 5,
                earning: "+300€/mois"
              },
              {
                name: "Julie Rousseau", 
                role: "Artisan avec utilitaire",
                text: "Entre mes chantiers, je transporte pour SendUp. C'est un complément de revenus parfait qui me permet de rentabiliser mes déplacements.",
                rating: 5,
                earning: "+450€/mois"
              },
              {
                name: "Thomas Leroy",
                role: "Chauffeur professionnel",
                text: "Interface simple, missions claires, paiements rapides. SendUp m'a permis de développer mon activité indépendante en toute sérénité.",
                rating: 5,
                earning: "+650€/mois"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <HiStar key={i} className="w-5 h-5 text-warning" />
                  ))}
                  <span className="ml-2 text-sm font-medium text-primary">Gains: {testimonial.earning}</span>
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

      {/* Conditions et prérequis */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-bordeaux mb-4">
              Conditions pour devenir transporteur
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des prérequis simples pour garantir un service de qualité
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 bg-white rounded-2xl border border-gray-100">
                <h3 className="text-xl font-semibold text-dark-bordeaux mb-4">Documents requis</h3>
                <ul className="space-y-3">
                  {[
                    "Permis de conduire valide",
                    "Carte grise du véhicule",
                    "Assurance responsabilité civile",
                    "Kbis si activité professionnelle",
                    "Attestation de capacité transport (si +3.5T)"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <HiCheckCircle className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 bg-white rounded-2xl border border-gray-100">
                <h3 className="text-xl font-semibold text-dark-bordeaux mb-4">Critères de qualité</h3>
                <ul className="space-y-3">
                  {[
                    "Véhicule en bon état",
                    "Respect des délais",
                    "Communication client",
                    "Soin des marchandises",
                    "Évaluation minimum 3.5/5"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <HiCheckCircle className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à optimiser vos trajets ?
          </h2>
          <p className="text-lg text-primary-beige mb-8 max-w-2xl mx-auto">
            Rejoignez notre réseau de transporteurs et commencez à générer des revenus dès aujourd&apos;hui
          </p>
          
                     <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
             <Link href="/auth/register">
               <Button 
                 variant="secondary" 
                 size="large"
                 className="w-full sm:w-auto px-8 py-4 bg-white text-primary hover:bg-primary-beige font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex rounded-lg hover:bg-primary-beige hover:text-primary p-2 items-center justify-center cursor-pointer"
               >
                 <HiTruck className="w-5 h-5 mr-2" />
                 Devenir Transporteur
               </Button>
             </Link>
             <Link href="/courses">
               <Button 
                 variant="outline" 
                 size="large" 
                 className="w-full sm:w-auto px-8 py-4 text-white border-2 border-white hover:bg-white hover:text-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex rounded-lg hover:bg-primary-beige hover:text-primary p-2 items-center justify-center cursor-pointer"
               >
                 Voir les missions
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
              Validation 24h
            </div>
            <div className="flex items-center">
              <HiCheckCircle className="w-4 h-4 mr-2" />
              Paiement garanti
            </div>
            <div className="flex items-center">
              <HiCheckCircle className="w-4 h-4 mr-2" />
              Support dédié
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 