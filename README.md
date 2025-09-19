# 🏢 Calculateur Temps de Travail ADP - Extension Chrome

Extension Chrome professionnelle pour calculer automatiquement les temps de travail avec pause déjeuner et heures supplémentaires sur les pages ADP RedBox.

## ✨ Fonctionnalités

### 🎯 Calcul intelligent des temps
- **Calcul automatique** des périodes de travail
- **Détection en temps réel** de la période en cours si vous êtes pointé
- **Calcul précis** de l'heure de fin pour atteindre votre objectif (7h24 par défaut)
- **Gestion des heures supplémentaires** et du temps manquant

### 🍽️ Gestion de la pause déjeuner
- **Détection automatique** de la pause repas (pause la plus longue entre 11h30 et 14h15)
- **Insertion visuelle** de l'indicateur "🍽️ Pause repas" dans l'interface ADP
- **Ajout automatique** de 45 minutes si aucune pause repas n'est détectée
- **Minimum de 3 entrées** requises pour la détection

### 🎨 Interface utilisateur
- **Popup élégant** avec logo ADP stylisé (lettres rouges + couronne dorée)
- **Configuration personnalisable** de l'objectif journalier
- **Sauvegarde automatique** des paramètres
- **Interface 100% en français**
- **Design responsive** et moderne

## 🚀 Installation

### Installation manuelle (développeur)
1. Téléchargez ou clonez ce repository
2. Ouvrez Chrome et allez dans `chrome://extensions/`
3. Activez le **Mode développeur** en haut à droite
4. Cliquez sur **"Charger l'extension non empaquetée"**
5. Sélectionnez le dossier contenant les fichiers de l'extension

## 📖 Utilisation

### ⚡ Utilisation automatique
1. **Naviguez** vers votre page de pointage ADP (`https://mon.adp.com/redbox/*`)
2. **Attendez** le chargement automatique (2-5 secondes)
3. **Consultez** le résumé qui s'affiche sous vos entrées de pointage

### 🎛️ Configuration via le popup
1. **Cliquez** sur l'icône de l'extension dans la barre d'outils Chrome
2. **Modifiez** l'objectif journalier si nécessaire (défaut : 7h24)
3. **Recalculez** manuellement avec le bouton "🔄 Recalculer les temps"
4. **Sauvegardez** vos paramètres personnalisés

### 🔍 Informations affichées
- **Périodes individuelles** : Détail de chaque période travaillée
- **Période en cours** : Temps écoulé depuis le dernier pointage d'entrée (temps réel)
- **Pause déjeuner** : Statut de détection et prise en compte
- **Temps total** : Temps de travail total effectué
- **Heures supplémentaires** : Temps dépassant l'objectif ou temps manquant
- **Heure de fin conseillée** : Quand pointer pour atteindre votre objectif

## ⚙️ Configuration avancée

### 🎯 Paramètres modifiables
- **Objectif journalier** : Personnalisable (1h-12h59m)
- **Pause déjeuner minimum** : 45 minutes (fixe, conforme à la législation)
- **Plage de détection pause** : 11h30 - 14h15 (optimale)

### 🔧 Options techniques
- **Recalcul automatique** : Lors des changements de page
- **Sauvegarde cloud** : Paramètres synchronisés entre vos appareils Chrome
- **Observateur DOM** : Surveillance automatique des modifications

## 🏗️ Architecture technique

### 📁 Structure des fichiers
```
/
├── manifest.json           # Configuration extension Chrome (Manifest V3)
├── content.js             # Script principal de calcul et insertion DOM  
├── popup.html            # Interface utilisateur du popup
├── popup.js              # Logique de l'interface utilisateur
├── icons/
│   ├── icon16.png       # Icône 16x16 pour la barre d'outils
│   ├── icon48.png       # Icône 48x48 pour la page d'extensions
│   └── icon128.png      # Icône 128x128 pour le Chrome Web Store
└── README.md            # Documentation complète
```

### 🔧 Spécifications techniques
- **Manifest V3** : Dernière version du système d'extensions Chrome
- **Permissions minimales** : `activeTab` et `storage` uniquement
- **Content Scripts** : Injection automatique sur les pages ADP
- **Storage API** : Sauvegarde cloud des paramètres utilisateur
- **Message Passing** : Communication popup ↔ content script

### 🧮 Algorithmes de calcul

#### Détection de pause repas
```javascript
// Recherche de la pause la plus longue entre 11h30 et 14h15
// Minimum 3 entrées requises : Entrée → Sortie → Entrée
// Si trouvée : insertion de l'indicateur visuel "🍽️ Pause repas"
// Si non trouvée : ajout automatique de 45 minutes au calcul
```

#### Calcul de l'heure de fin
```javascript
// Temps restant = Objectif - Temps travaillé - (45min si pas de pause détectée)
// Heure de fin = Heure actuelle + Temps restant
// Gestion du passage minuit : ajustement automatique
```

## 🐛 Résolution de problèmes

### ❌ L'extension ne fonctionne pas
1. **Vérifiez l'URL** : Assurez-vous d'être sur `https://mon.adp.com/redbox/*`
2. **Rechargez la page** : Appuyez sur F5 pour recharger
3. **Recalculez manuellement** : Utilisez le bouton dans le popup
4. **Console développeur** : Ouvrez F12 et vérifiez les erreurs

### 🍽️ La pause repas n'est pas détectée
- **Vérifiez les horaires** : La pause doit être entre 11h30 et 14h15
- **Nombre d'entrées** : Au moins 3 pointages requis
- **Durée minimale** : La pause doit être significative
- **Fallback automatique** : 45 minutes sont ajoutées automatiquement si non détectée

### ⏰ Le calcul semble incorrect
1. **Vérifiez l'objectif** : Confirmez votre objectif journalier dans le popup
2. **Période en cours** : Le temps affiché inclut la période actuelle si vous êtes pointé
3. **Pause minimum** : 45 minutes sont toujours comptabilisées
4. **Recalcul** : Utilisez le bouton de recalcul manuel

## 🔒 Confidentialité et sécurité

### 🛡️ Données traitées
- **Aucune transmission** : Toutes les données restent locales
- **Pas de tracking** : Aucune donnée personnelle n'est collectée
- **Stockage local** : Seuls vos paramètres sont sauvegardés
- **Open source** : Code source entièrement auditable

### 🔐 Permissions
- **activeTab** : Lecture des données de pointage sur la page ADP active uniquement
- **storage** : Sauvegarde de vos paramètres personnalisés

## 📄 Licence

Cette extension est distribuée sous licence libre pour usage personnel et professionnel.

### ⚖️ Conditions d'utilisation
- **Usage libre** : Personnel et professionnel autorisé
- **Modification** : Autorisée avec mention du projet original
- **Redistribution** : Autorisée sous même licence
- **Garantie** : Fournie "en l'état" sans garantie

---

**🎯 Extension Chrome Calculateur Temps de Travail ADP - Version 2.4**
*Développée avec ❤️ pour optimiser votre gestion du temps de travail*
