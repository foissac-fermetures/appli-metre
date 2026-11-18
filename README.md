# Appli de métré – Foissac Fermetures
Adresse : https://foissac-fermetures.github.io/appli-metre/
Application web (iPad, Mac, PC). Les dossiers clients restent sur l'appareil et dans Google Drive, jamais ici.

## CRM Gourdon
Adresse : https://foissac-fermetures.github.io/appli-metre/crm/
Le CRM de Nicolas (dossiers clients de l'agence de Gourdon). Les données des clients ne sont pas dans ce dépôt :
elles restent sur l'appareil et dans l'espace caché de l'appli sur le Google Drive de Nicolas (« appDataFolder »).
Le Drive de travail est lu en lecture seule. `crm/index.html` est généré à partir de la version claude.ai du CRM.

## Mini DAO 2D
Adresse : https://foissac-fermetures.github.io/appli-metre/dao/
Petit logiciel de dessin 2D inspiré d'AutoCAD (traits, polylignes, rectangles, cercles, parallèles, ajuster/prolonger,
cotes, hachures bois et vitrage, cartouche, impression A4/A3 à l'échelle). Il fonctionne sur iPad, Mac et PC,
s'installe comme une appli et marche sans réseau.
Les plans restent sur l'appareil (stockage du navigateur). À chaque 💾, ils sont aussi rangés dans le Google Drive de Nicolas : PDF dans « 09 - Plan » (joint au métré du client) et `.mdao` dans Métrés › Plans › année. Jamais dans ce dépôt.
Tout est dans `dao/index.html` (un seul fichier, sans compilation). À chaque mise à jour, augmenter `CACHE` dans `dao/sw.js`.
