import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  HiHome,
  HiMagnifyingGlass,
  HiExclamationTriangle,
  HiTruck,
  HiCube
} from 'react-icons/hi2';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-beige via-primary-beige to-light-beige flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        
        {/* Illustration */}
        <div className="mb-8">
          <div className="relative mx-auto w-64 h-64 mb-6">
            {/* Camion perdu */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <HiTruck className="w-32 h-32 text-primary/30 transform rotate-12" />
                <div className="absolute -top-2 -right-2">
                  <HiExclamationTriangle className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
            
            {/* Colis éparpillés */}
            <HiCube className="absolute top-4 left-8 w-8 h-8 text-primary/40 transform -rotate-12" />
            <HiCube className="absolute bottom-8 right-4 w-6 h-6 text-primary/40 transform rotate-45" />
            <HiCube className="absolute top-12 right-12 w-5 h-5 text-primary/40 transform -rotate-45" />
            
            {/* Points de suspension pour montrer le mouvement */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>

        {/* Titre principal */}
        <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-dark-bordeaux mb-4">
          Oups ! Route introuvable
        </h2>
        
        {/* Sous-titre avec humour */}
        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
          Il semblerait que notre transporteur se soit perdu en chemin... 
          Cette page n&apos;existe pas ou a été déplacée vers une nouvelle destination !
        </p>

        {/* Statistiques amusantes */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
            <div className="text-2xl font-bold text-primary">∞</div>
            <div className="text-xs text-gray-600">Routes possibles</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
            <div className="text-2xl font-bold text-primary">1</div>
            <div className="text-xs text-gray-600">Page perdue</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/20 md:block hidden">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-xs text-gray-600">Soucis</div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link href="/">
            <Button 
              variant="primary" 
              size="large" 
              className="w-full sm:w-auto hover:bg-primary hover:text-primary-beige p-3 flex items-center justify-center rounded-xl"
            >
              <HiHome className="w-5 h-5 mr-2" />
              Retour à l&apos;accueil
            </Button>
          </Link>
          
          <Link href="/search">
            <Button 
              variant="outline" 
              size="large" 
              className="w-full sm:w-auto hover:bg-primary hover:text-primary-beige p-3 flex items-center justify-center rounded-xl"
            >
              <HiMagnifyingGlass className="w-5 h-5 mr-2" />
              Rechercher un trajet
            </Button>
          </Link>
        </div>

        {/* Suggestion de navigation */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-primary/20 max-w-lg mx-auto">
          <h3 className="text-lg font-semibold text-dark-bordeaux mb-3">
            Vous cherchiez peut-être :
          </h3>
          <div className="space-y-2 text-sm">
            <Link 
              href="/search" 
              className="block text-primary hover:text-dark-bordeaux transition-colors font-medium"
            >
              → Rechercher des trajets ou expéditions
            </Link>
            <Link 
              href="/publish" 
              className="block text-primary hover:text-dark-bordeaux transition-colors font-medium"
            >
              → Publier une expédition
            </Link>
            <Link 
              href="/become-transporter" 
              className="block text-primary hover:text-dark-bordeaux transition-colors font-medium"
            >
              → Devenir transporteur
            </Link>
            <Link 
              href="/help" 
              className="block text-primary hover:text-dark-bordeaux transition-colors font-medium"
            >
              → Centre d&apos;aide
            </Link>
          </div>
        </div>

        {/* Footer message */}
        <p className="text-sm text-gray-500 mt-8">
          Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, 
          <Link href="/help" className="text-primary hover:underline ml-1">
            contactez-nous
          </Link>
        </p>
      </div>
    </div>
  );
} 