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

## Liens directs CRM ↔ métré ↔ Mini DAO (19/11/2026, projet « Réorganisation des logiciels »)

- CRM (`crm/import.js`, bloc « raccourcis ») : boutons d'action sur les lignes, barre d'actions en haut de la fiche avec **📏 Métré** → `../?client=<nom>&retour=crm` et **📐 Plan** → `../dao/?client=<nom>&retour=crm`, recherche Ctrl+K, « Récents », et `?client=<nom>` qui ouvre la fiche du client. Ne pas mettre ces ajouts dans `crm/index.html` (régénéré).
- Métré (`index.html` racine) : `ouvrirDepuisLienCRM()` lit `?client=` : métré définitif existant → ouvert directement ; seulement un métré de devis → question « Commencer le métré définitif » (creerRendezVous + Partir du devis signé) / « Ouvrir le métré existant » ; aucun métré → fenêtre « Nouveau rendez-vous » puis remplissage depuis le fichier du CRM ; bouton `#tabCRM` « 📇 Fiche CRM » → `crm/?client=<nom>`.
- Mini DAO (`dao/index.html`) : `RETOUR_CLIENT` ; avec `retour=crm`, le bouton ↩ Retour revient sur `../crm/?client=<nom>`.

- Journal d'utilisation (19/11/2026) : carnet commun `localStorage["journal-usage"]` rempli par le CRM (`crm/import.js`), la Mini DAO (`dao/index.html`) et le métré (`index.html`, `window.journalUsage`) — boutons / onglets / commandes, jamais de donnée client. Le métré l'envoie (`envoyerJournalUsage()`, seulement si Google est déjà connecté) dans Mon Drive › Appli métré – Dossiers › « Journal d'utilisation (applis).json », lu par la revue des logiciels du 1er et du 16. À conserver.

- Connexion Google par redirection (19/11/2026) : `gParRedirection()` (iPad + `navigator.bluetooth` = Bluefy) → `gPartirChezGoogle()` part sur accounts.google.com et revient sur `https://foissac-fermetures.github.io/appli-metre/#access_token=…` (adresse déclarée dans le client OAuth Google Cloud). La petite fenêtre Google reste blanche dans Bluefy : ne pas supprimer.

## Nicolas

Répondre en français, simplement. Avant une nouvelle fonction, lui proposer une liste d'options à cocher. Tester avant de dire que c'est fait.
