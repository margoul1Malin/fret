# Choix
Technologies : 
- Code : React / NodeJS 
- DB : MongoDB / Prisma
- UI/UX : Choix de beige/blanc cassé avec rouge bordeaux 
- Authentification : JWT
- Répartition Equilibrée des routes

# Fait
- Authentification Expéditeurs / Transporteurs avec Dashboard
    - Authentification Sécurisée via JWT et durée de session définies
    - Transporteurs : 
        - Gestion des courses (création, suppression, modification)
            - Courses :
                - Capacité de Stockage en Poids
                - Capacité de Stockage en nombre de colis
                - Départ / Arrivée : Heure, Date, Lieux
                - Type de Véhicule
                - Prix par kg
                - Informations de contact
                - Système de Rating par les utilisateurs
    - Expéditeurs : 
        - Gestion des Expéditions (création, suppression, modification)
            - Expéditions :
                - Poids / Volume /
                - Départ / Arrivée : Heure, Date, Lieux
                - Spécification Poids Lourd / Colis Fragile
                - Spécification du prix du colis pour l'assurance
                - Possibilité de noter les transporteurs via leur page de profil public et accès aux infos de contact
                - Spécification du budget
                - Chaque expédition à sa page unique avec un tri sélectif et intelligent des 3 trajets disponibles les plus pertinent pour leur expédition
    - Recherche Avancée
        - Spécification minimum : Ville de Départ & Ville D'arrivée
        - Possibilités de spécifications supplémentaire : Date, Poids minimal requis, Volum minmal requis, Budget Max
        - Tri des résultats avancés :
            - Pour la recherche de trajets : 
                - Meilleur notes transportuers
                - Départ le plus tôt
                - Prix le plus bas
                - Plus grand nombre de places (m3)
                - Plus grande capacité de stockage (kg)
            - Pour la rechrche d'expeditions : 
                - Départ le plus tôt
                - Budget le plus élevé
                - Poids le plus élevé
    - Formulaire de Contact
        - FAQ Présente sur le côté pour s'éviter les demandes inutiles
        - Réception par mail
- Sécurité 
    - Mot de passes minimal requis : Majuscule Chiffre minuscules 8 caractères
    - JWT pour l'authentification
    - Middleware : Redirection propre des routes selon les comptes utilisateurs et leurs droits
    - Aucun types any : Un type any signifie que l'utilisateur peut rentrer n'importe quoi, ici on en a aucuns
    - Formulaires en phase de sécurisation 0 trust
    

# A Faire...

- Authentification Expéditeurs / Transporteurs avec Dashboard
    - Transporteurs : 
        - Vérification des documents pour PL / Entreprise (et la modif des courses) ( ajout de documents légaux (Kbis, assurance, carte grise, capacité transport) obligatoire.)
        - Formulaire plus orienté UX sympa
    - Expéditeurs : 
    - Administrateur
        - On doit faire tout le panel
- Payements & Prix : 
    - Stripe / PayPal : Inclure les vraies fonctionnalités
    - Stripe Connect : Répartition entre les parties (infaisable si on ne s'est pas eu au téléphone)
    - Prix calculé actuellement selon poids, manque volume et distance. Sur spécification transporteur. 
- Systeme de Notifications
    - Notifications pour Colis : Départ, Transit, Arrivé
    - Notifications création : Etre notifié sur création d'expeditions ou création de transport selon l'utilisateur
    - Notifications pour les propositions de trajet envers une expedition
- Fonctionnalités Avancées (Recquiert Supplément car Complexe et le site vaut 3x plus que le prix annoncé de base)
    - Géolocalisation
    - Notifs (SMS/Email) : A voir pour quoi ? 
    - Système de gestion Assurance
    - Vérification des Documents Légaux.
    - Etude de marché
        - Tarification moins chère que la concurrence pour se positionner rapidement sur le marché. <- Ne fais pas partie de mon travail à la base faudra qu'on en discute
- Gestion SEO Avancée : 
    - Le projet est ambitieux la gestion SEO va demander un certain travail nous verrons ça ensemble
- Pags Légales
    - Ca je peux pas faire sans plus d'infos.

# Comptes 2 Test :
Expediteur : 
- Username : joe@expedition.com
- Password : Password123
Transporteur : 
- Username : joe@transporteur.com
- Password : Password123