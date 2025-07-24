'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuthContext'
import { 
  HiMenu, 
  HiX, 
  HiTruck, 
  HiArchive, 
  HiSearch, 
  HiUser, 
  HiBell,
} from 'react-icons/hi'
import { HiArrowRightOnRectangle } from 'react-icons/hi2'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  
  const getUserTypeLabel = () => {
    if (!user) return '';
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
  }

  return (
    <nav className="nav sticky top-0 z-50 bg-white">
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <HiTruck className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-primary">SendUp</span>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-10">
            <Link href="/search" className="nav-link flex items-center space-x-2 py-2 px-3 rounded-lg transition-all hover:bg-primary hover:text-primary-beige">
              <HiSearch className="w-5 h-5" />
              <span>Rechercher</span>
            </Link>
            <Link href="/publish" className="nav-link flex items-center space-x-2 py-2 px-3 rounded-lg transition-all hover:bg-primary hover:text-primary-beige">
              <HiArchive className="w-5 h-5" />
              <span>Expédier</span>
            </Link>
            <Link href="/become-transporter" className="nav-link flex items-center space-x-2 py-2 px-3 rounded-lg transition-all hover:bg-primary hover:text-primary-beige">
              <HiTruck className="w-5 h-5" />
              <span>Transporter</span>
            </Link>
            <Link href="/help" className="nav-link py-2 px-3 rounded-lg transition-all hover:bg-primary hover:text-primary-beige">
              Aide
            </Link>
          </div>

          {/* Actions utilisateur */}
          <div className="hidden md:flex items-center space-x-5">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : isAuthenticated && user ? (
              <>
                <button className="relative p-3 bg-primary text-primary-beige transition-colors rounded-lg cursor-pointer">
                  <HiBell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full text-xs text-white flex items-center justify-center">0</span>
                </button>

                <div className="flex items-center space-x-4">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-primary hover:text-primary-beige p-2 rounded-xl cursor-pointer group">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <HiUser className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-neutral-500 group-hover:text-primary-beige">{getUserTypeLabel()}</div>
                      </div>
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={logout} className="flex items-center space-x-2 hover:bg-primary hover:text-primary-beige cursor-pointer rounded-xl p-2">
                    <HiArrowRightOnRectangle className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost" className="px-6">Connexion</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="px-6">S&apos;inscrire</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Menu mobile */}
          <button
            className="md:hidden p-3 rounded-lg hover:bg-neutral-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <HiX className="w-6 h-6" />
            ) : (
              <HiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Menu mobile ouvert */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-6 space-y-2">
            <Link 
              href="/search" 
              className="flex items-center space-x-3 p-4 rounded-xl hover:bg-neutral-100 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <HiSearch className="w-6 h-6 text-primary" />
              <span className="font-medium">Rechercher un trajet</span>
            </Link>
            <Link 
              href="/publish" 
              className="flex items-center space-x-3 p-4 rounded-xl hover:bg-neutral-100 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <HiArchive className="w-6 h-6 text-primary" />
              <span className="font-medium">Expédier un colis</span>
            </Link>
            <Link 
              href="/become-transporter" 
              className="flex items-center space-x-3 p-4 rounded-xl hover:bg-neutral-100 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <HiTruck className="w-6 h-6 text-primary" />
              <span className="font-medium">Devenir transporteur</span>
            </Link>
            <Link 
              href="/help" 
              className="flex items-center space-x-3 p-4 rounded-xl hover:bg-neutral-100 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="font-medium">Centre d&apos;aide</span>
            </Link>
            
            <div className="border-t border-neutral-200 pt-6 mt-6">
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-xl">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <HiUser className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-sm text-neutral-600">john@example.com</div>
                    </div>
                  </div>
                  <Link href="/profile" className="block p-4 hover:bg-neutral-100 rounded-xl transition-all">Mon profil</Link>
                  <Link href="/my-shipments" className="block p-4 hover:bg-neutral-100 rounded-xl transition-all">Mes expéditions</Link>
                  <Link href="/my-trips" className="block p-4 hover:bg-neutral-100 rounded-xl transition-all">Mes trajets</Link>
                  <button className="block p-4 text-left text-error hover:bg-primary hover:text-primary-beige rounded-xl transition-all w-full cursor-pointer" onClick={logout}>Déconnexion</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">Connexion</Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">S&apos;inscrire</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 