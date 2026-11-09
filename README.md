# Web_Projet-fil-rouge : Steams

**Steams** est une application web de messagerie instantanée développée dans le cadre du projet fil rouge. Elle combine un système de discussion en temps réel avec l'API Web de Steam pour permettre aux joueurs de partager facilement leurs statistiques.

## Lien du site du projet (temporaire)

```
https://web-projet-fil-rouge.onrender.com/
```

## Fonctionnalités principales

- **Authentification et Profils** : Inscription, connexion et personnalisation du profil utilisateur (nom, biographie).
- **Messagerie en temps réel** : Création de salons de discussion entre contacts et envoi de messages en direct grâce à Supabase Realtime.

## Fonctionnalités supplémentaires

- **Connexion via Steam (OpenID 2.0)** : Liaison du compte Steam en un clic sans avoir à chercher manuellement son `SteamID64`.
- **Top 10 des jeux Steam** :
  - Affichage automatique des 10 jeux les plus joués (avec le nombre d'heures) sur la fiche de profil d'un contact.
  - Bouton de partage rapide pour envoyer son Top 10 directement dans un salon de discussion.
  - Récupération dynamique de l'avatar Steam officiel.

## Technologies utilisées

- **Frontend** : HTML5, CSS3 (thème sombre inspiré de Discord), JavaScript (Vanilla)
- **Base de données & Temps réel** : [Supabase](https://supabase.com/) (Auth, PostgreSQL, Realtime)
- **Backend** : Node.js & Express (gestion de l'OpenID Steam et appels à l'API Steam Web)
- **Hébergement** : [Render](https://render.com/)
> **Note** : On doit passer par Render pour gérer le backend (notamment la connexion via Steam) car GitHub Page ne le permet pas


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
   BACKEND_URL=http://localhost:3000/
   FRONTEND_URL=http://localhost:3000/
   ```

3. **Démarrer le serveur** :
   ```bash
   npm start
   ```
   L'application est ensuite accessible sur `http://localhost:3000/`.

> **Note** : L'API Steam ne marche qu'avec des profils publics pour récupérer les jeux.