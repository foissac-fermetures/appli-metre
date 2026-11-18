# Consignes pour Claude – dépôt foissac-fermetures/appli-metre

Ce dépôt contient **trois applis** de Nicolas, publiées sur https://foissac-fermetures.github.io/appli-metre/ :

| Dossier | Appli | Notice |
|---|---|---|
| racine (`index.html`, `sw.js`) | Appli de métré | — |
| `crm/` | CRM « Mes dossiers Gourdon » | `crm/import.js` est l'ajout de la version en ligne (`crm/index.html` est régénéré depuis claude.ai) |
| `dao/` | Mini DAO 2D | `dao/PASSATION-CLAUDE-PRO.md` (à tenir à jour) |

## Avant toute modification

1. **Repartir de la dernière version en ligne** : `git pull` (ou un clone neuf) juste avant de modifier, et encore juste avant de pousser.
   Ne jamais pousser un `index.html` ou un `sw.js` préparé à partir d'une copie ancienne : cela efface le travail des autres conversations.
   (Le 18/11/2026, les versions v96 à v101 du métré ont ainsi effacé les liens vers la Mini DAO ; ils ont été remis en v102.)
2. Ne toucher qu'à l'appli demandée. Augmenter le numéro de cache de l'appli modifiée (`metre-vNN` dans `sw.js`, `dao-vN` dans `dao/sw.js`).

## Ajouts à conserver dans l'appli de métré (racine) – liens avec la Mini DAO

Cherchez `Mini DAO` / `CLAUDE.md` dans `index.html` :
- bouton `#hDAO` « 📐 Mini DAO » sur l'accueil → `dao/?retour=accueil` ;
- bouton `#tabDAO` « 📐 Dessiner le plan » dans un métré (après « + Ajouter… ») → `dao/?client=<client.nom>&retour=<id>` ;
- au démarrage (`DB.open().then(…)`), `?ouvrir=<id>` rouvre ce métré (retour de la Mini DAO).

Et dans `sw.js` (racine) : l'événement `activate` ne supprime **que** les caches dont le nom commence par `metre-`
(sinon la Mini DAO perd sa copie hors ligne à chaque mise à jour du métré). Garder `x.startsWith("metre-")`.

## Nicolas

Répondre en français, simplement. Avant une nouvelle fonction, lui proposer une liste d'options à cocher. Tester avant de dire que c'est fait.
