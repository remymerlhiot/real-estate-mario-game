# Super Mario Bros - Real Estate Edition

Un jeu de plateforme inspiré de Super Mario Bros, entièrement développé en JavaScript vanilla avec HTML5 Canvas.

## Description

Ce jeu reprend les mécaniques classiques de Super Mario Bros avec des graphismes procéduraux dessinés directement sur le canvas. Incarnez Mario, collectez des pièces, évitez les ennemis et explorez un niveau rempli de plateformes, tuyaux et secrets !

## Fonctionnalités

### Gameplay
- ✅ Personnage Mario avec animations fluides (marche, saut, idle)
- ✅ Système de physique réaliste (gravité, vélocité, accélération)
- ✅ Contrôles réactifs au clavier
- ✅ Détection de collisions précise
- ✅ Caméra qui suit Mario automatiquement

### Éléments de jeu
- 🍄 **Power-ups** : Champignon (agrandit Mario) et Fleur de feu
- 🪙 **Pièces** : Collectez-les pour augmenter votre score (100 pièces = 1 vie)
- ❓ **Blocs questions** : Frappez-les pour obtenir des pièces
- 🧱 **Briques** : Plateformes sur lesquelles sauter
- 🟢 **Tuyaux** : Éléments décoratifs du niveau
- 👹 **Ennemis** : Goombas qui patrouillent le niveau

### Système de jeu
- 📊 **HUD complet** : Score, pièces, monde, temps, vies
- 💀 **Système de vies** : 3 vies au départ
- 🏆 **Score** : Points pour les pièces, ennemis vaincus et power-ups
- 🎮 **Menu principal** : Écran de démarrage avec instructions
- ☠️ **Game Over** : Écran de fin avec possibilité de recommencer

## Contrôles

| Touche | Action |
|--------|--------|
| `←` ou `A` | Se déplacer à gauche |
| `→` ou `D` | Se déplacer à droite |
| `↑` ou `W` ou `ESPACE` | Sauter |

### Astuces de jeu
- Sautez sur les ennemis pour les éliminer
- Frappez les blocs `?` par en dessous pour obtenir des pièces
- Le champignon rouge vous fait grandir et vous protège d'un coup
- La fleur de feu vous donne des pouvoirs spéciaux
- Collectez 100 pièces pour gagner une vie supplémentaire

## Installation et utilisation

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Aucune installation ou dépendance externe requise

### Lancement du jeu

1. Clonez ce dépôt :
```bash
git clone https://github.com/votre-username/real-estate-mario-game.git
cd real-estate-mario-game
```

2. Ouvrez le fichier `index.html` dans votre navigateur :
   - Double-cliquez sur `index.html`, ou
   - Utilisez un serveur local (recommandé) :
   ```bash
   # Avec Python 3
   python -m http.server 8000

   # Avec Node.js
   npx http-server
   ```
   Puis ouvrez `http://localhost:8000` dans votre navigateur.

3. Cliquez sur "START GAME" et jouez !

## Structure du projet

```
real-estate-mario-game/
├── index.html          # Structure HTML du jeu
├── style.css           # Styles et mise en page
├── game.js             # Logique du jeu
└── README.md           # Ce fichier
```

## Technologies utilisées

- **HTML5 Canvas** : Rendu graphique
- **JavaScript ES6** : Logique de jeu et programmation orientée objet
- **CSS3** : Interface utilisateur et mise en page

## Caractéristiques techniques

- Game loop à ~60 FPS utilisant `requestAnimationFrame`
- Système de sprites procéduraux (dessinés programmatiquement)
- Optimisation du rendu (culling des objets hors écran)
- Architecture orientée objet (classes Mario, Enemy, Coin, PowerUp)
- Gestion d'état de jeu centralisée
- Système de caméra avec défilement horizontal

## Développement futur

Fonctionnalités potentielles à ajouter :
- 🎵 Effets sonores et musique
- 🔥 Système de tir de boules de feu
- 🌟 Plus d'ennemis (Koopa Troopa, etc.)
- 🏰 Niveaux supplémentaires
- 👑 Boss de fin de niveau
- 💾 Système de sauvegarde des scores
- 🎨 Sprites graphiques plus détaillés
- 📱 Support mobile avec contrôles tactiles

## Crédits

Projet inspiré du jeu original **Super Mario Bros** développé par Nintendo.

Ce jeu est un projet éducatif à but non lucratif, créé pour démontrer l'utilisation de JavaScript et HTML5 Canvas.

## Licence

Ce projet est fourni à des fins éducatives uniquement. Tous les droits sur les concepts de personnages et de gameplay appartiennent à Nintendo.

---

**Bon jeu et amusez-vous bien ! 🎮🍄**
