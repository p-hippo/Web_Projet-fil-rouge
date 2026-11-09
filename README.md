# Web_Projet-fil-rouge : Steams

## Fonctionnalités principales

- **Authentification et Profils** : Inscription, connexion et personnalisation du profil utilisateur (nom, biographie).
- **Messagerie en temps réel** : Création de salons de discussion entre contacts et envoi de messages en direct grâce à Supabase Realtime.
- **Connexion via Steam (OpenID 2.0)** : Liaison du compte Steam en un clic sans avoir à chercher manuellement son `SteamID64`.
- **Top 10 des jeux Steam** :
  - Affichage automatique des 10 jeux les plus joués (avec le nombre d'heures) sur la fiche de profil d'un contact.
  - Bouton de partage rapide pour envoyer son Top 10 directement dans un salon de discussion.
  - Récupération dynamique de l'avatar Steam officiel.

## Installation et lancement en local

1. **Cloner le dépôt et installer les dépendances** :
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement** :
   Créez un fichier `.env` à la racine du projet :
   ```env
   PORT=3000
   STEAM_API_KEY=VOTRE_CLE_API_STEAM
   BACKEND_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:3000
   ```

3. **Démarrer le serveur** :
   ```bash
   npm start
   ```
   L'application est ensuite accessible sur `http://localhost:3000/connexion.html`.

> **Note** : L'API Steam ne marche qu'avec des profils publics pour récupérer les jeux.