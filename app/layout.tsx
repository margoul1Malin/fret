import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { AuthProvider } from '@/hooks/useAuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SendUp - Le BlaBlacar des marchandises',
  description: 'Plateforme collaborative de transport de marchandises. Réduisez vos coûts de transport et votre empreinte carbone.',
  keywords: 'transport, marchandises, collaborative, livraison, économique, écologique',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </AuthProvider>
        <footer className="bg-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center md:text-left">
                <h3 className="font-bold text-xl mb-4">SendUp</h3>
                <p className="text-white/80 leading-relaxed">
                  Le BlaBlacar des marchandises. Transport collaboratif et économique.
                </p>
              </div>
              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-white/80">
                  <li><a href="/search" className="hover:text-white transition-colors">Rechercher un trajet</a></li>
                  <li><a href="/publish" className="hover:text-white transition-colors">Publier une expédition</a></li>
                  <li><a href="/become-transporter" className="hover:text-white transition-colors">Devenir transporteur</a></li>
                </ul>
              </div>
              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-white/80">
                  <li><a href="/help" className="hover:text-white transition-colors">Centre d&apos;aide</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="/safety" className="hover:text-white transition-colors">Sécurité</a></li>
                </ul>
              </div>
              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4">Légal</h4>
                <ul className="space-y-2 text-white/80">
                  <li><a href="/terms" className="hover:text-white transition-colors">Conditions générales</a></li>
                  <li><a href="/privacy" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                  <li><a href="/cookies" className="hover:text-white transition-colors">Cookies</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
              © 2024 SendUp. Tous droits réservés.
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
