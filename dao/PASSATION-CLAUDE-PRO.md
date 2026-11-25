# Mini DAO 2D – Dossier de passation pour Claude (compte Pro)

> **À lire en premier par Claude.** Ce dossier contient tout ce qu'il faut pour mettre en ligne et faire évoluer
> la Mini DAO 2D, créée le 18/11/2026 avec Nicolas (Foissac Fermetures) sur son compte Claude personnel.
> Nicolas parle uniquement français : **toujours lui répondre en français**, simplement, sans jargon.

---

## 1. Ce que Nicolas veut

Un petit logiciel de dessin 2D inspiré d'AutoCAD, uniquement avec les outils de base, pour dessiner
des menuiseries et fermetures, les coter et les imprimer avec un cartouche.
Il doit fonctionner **comme un vrai logiciel** sur **son iPad Pro, son MacBook Pro et son PC Windows**,
de la même façon que ses deux autres applis déjà en ligne :

- Appli de métré : https://foissac-fermetures.github.io/appli-metre/
- CRM Gourdon : https://foissac-fermetures.github.io/appli-metre/crm/

## 2. Mise en ligne (à faire par Claude Pro)

Dépôt GitHub : **`foissac-fermetures/appli-metre`** (GitHub Pages, branche principale).
Adresse finale de la Mini DAO : **https://foissac-fermetures.github.io/appli-metre/dao/**

1. ✅ (18/11/2026, commit 02fc465) Copier le dossier **`dao/`** de ce paquet à la racine du dépôt, à côté de `crm/`.
   Il contient : `index.html` (toute l'appli), `manifest.webmanifest`, `sw.js`, les icônes et `lib/` (jsPDF + svg2pdf.js).
2. Ajouter au `README.md` du dépôt la section qui se trouve dans `README-ajout.md`.
3. **Ne pas toucher** au `sw.js` racine ni à `crm/`. La Mini DAO a son propre service worker (`dao/sw.js`,
   portée `dao/`), indépendant de celui de l'appli de métré.
4. Faire un commit (par exemple « Ajout de la Mini DAO 2D (dossier dao/) ») et un push sur la branche publiée.
5. Attendre la publication de GitHub Pages (1 à 2 min), puis ouvrir l'adresse et vérifier :
   la page s'ouvre, l'icône apparaît, `L` puis un clic trace un trait, et le bouton 🖨 Imprimer ouvre bien l'impression.
6. ✅ Lien vers la Mini DAO depuis l'appli de métré et depuis le CRM : demandé et fait le 18/11/2026 (§ 12).
7. Lui envoyer la marche à suivre pour l'installer (§ 3).

**À chaque mise à jour** de `dao/index.html`, augmenter le numéro de cache dans `dao/sw.js`
(`dao-v1` → `dao-v2`…). Sinon, les appareils risquent de garder l'ancienne version hors ligne.

## 3. Installation sur les appareils (à expliquer à Nicolas)

| Appareil | Navigateur | Comment installer |
|---|---|---|
| iPad Pro | Safari | Ouvrir l'adresse, bouton **Partager** (carré avec flèche) puis **« Sur l'écran d'accueil »**. |
| MacBook Pro | Safari | Menu **Fichier** puis **« Ajouter au Dock »**. Avec Chrome : icône d'installation dans la barre d'adresse. |
| PC Windows | Edge ou Chrome | Icône **« Installer l'application »** dans la barre d'adresse (ou menu ⋯ → Applications → Installer). |

⚠️ **PC de Nicolas (Chrome), constaté le 18/11/2026** : l'appli de métré étant déjà installée dans Chrome, et `dao/` étant dans sa portée,
Chrome ne propose pas « Installer » pour la Mini DAO (seulement « Ouvrir dans Métré ») et « Créer un raccourci » n'a plus la case « Ouvrir dans une fenêtre ».
Solution mise en place : raccourci **Bureau › « Mini DAO »** = `chrome_proxy.exe --profile-directory="Default" --app=https://foissac-fermetures.github.io/appli-metre/dao/`,
icône `Documents\Mini DAO\mini-dao.ico`. Ouvre une vraie fenêtre sans barre d'adresse, avec le même profil Chrome que le métré (mêmes plans, même connexion Google).
Même raccourci corrigé pour le CRM « Mes dossiers Gourdon » (Bureau, menu Démarrer, barre des tâches), icône `Documents\CRM Gourdon\crm.ico`.
**MacBook Pro (18/11/2026)** : Métré déjà installé (appli Chrome). Pour la Mini DAO et le CRM, Safari et Chrome sont en lecture seule pour Claude ;
solution : deux petites applis dans `~/Applications` (« Mini DAO.app », « Mes dossiers Gourdon.app ») dont le script lance
`open -na "Google Chrome" --args --profile-directory=Default --app=<adresse>` (même profil Chrome que le métré). Les trois sont dans le Dock (Finder › Fichier › Ajouter au Dock).

Une fois installée, la Mini DAO s'ouvre dans sa propre fenêtre, avec son icône, et **fonctionne sans Internet**.

⚠️ Les plans sont enregistrés **dans l'appareil** (stockage du navigateur). Pour passer un plan d'un appareil
à l'autre : **📁 Fichier → Exporter le fichier (.mdao)**, le ranger dans Google Drive, puis **Ouvrir un fichier**
sur l'autre appareil. Une synchronisation automatique par Google Drive, comme pour le CRM, est une évolution
possible (§ 8).

⚠️ L'impression **ne marche pas** dans l'aperçu d'artefact de claude.ai (le cadre bloque `window.print`).
Elle marche dans l'appli installée et dans un navigateur normal.

## 4. Fonctionnement technique

- **Un seul fichier** `dao/index.html` : HTML, CSS et JavaScript, **sans bibliothèque externe, sans compilation**.
  Le dessin est en SVG, avec des coordonnées en **millimètres**, l'axe Y vers le haut et l'origine en (0,0).
- Le script est découpé en sections, repérées par des commentaires `// ---------- … ----------` :
  État, Hachures (géométrie + motifs), Cotations, Polylignes, Ajuster/Prolonger, Rendu, Accrochage, Sélection,
  Décalage, Analyse des saisies, Commandes (`startCmd`, `feedPoint`, `submit`, `finishCmd`), Annuler/Rétablir,
  Vue, Souris/tactile, Clavier, Couleurs, Menu cotations, Hachures (barre d'options), Cartouche & impression,
  Fichier, Organiser la barre d'outils, Installation (service worker), Démarrage.
- Le service worker n'est enregistré que sur `*.github.io` en https. Le même `index.html` reste donc utilisable
  comme artefact claude.ai.

### Modèle de données (tableau `ents`)

```
{type:"line",   a:{x,y}, b:{x,y}, color}
{type:"rect",   a:{x,y}, b:{x,y}, color}                 // a = coin min, b = coin max
{type:"circle", c:{x,y}, r, color}
{type:"poly",   pts:[{x,y}…], closed:true|false, color}
{type:"hatch",  bounds:[contour extérieur, trous…], pattern, spacing, angle, color}
                // contour : {kind:"rect",a,b} | {kind:"circle",c,r} | {kind:"poly",pts}
{type:"text", p:{x,y}, txt, h, angle, bold, color}   // h = hauteur en mm SUR LE PAPIER (écran : h×4 px)
{type:"dim", kind:"lin"|"ali"|"rad"|"dia"|"ang", …}
                // lin/ali : p1,p2,q (+orient "h"|"v" pour lin) ; rad/dia : c,r,q ; ang : c,a1,sw,q
```
Chaque objet a un `id` et un `layer` (nom de calque, « Dessin » par défaut ; les cotes vont **toujours** dans « Cotes »).
Les calques du plan : `layers = [{name, visible}]` et `curLayer`. Seuls les objets des calques visibles (`VE()`)
sont affichés, sélectionnables, accrochables, servent de limites (Ajuster/Prolonger, hachures) et sont imprimés.
 Le déplacement passe par `translate()`, qui décale tout sous-objet `{x,y}`.
Pour cette raison, un angle ou une direction ne doit **jamais** être stocké sous la forme `{x,y}`.

### Stockage (localStorage, avec try/catch)

| Clé | Contenu |
|---|---|
| `miniDAO2D` | Plan en cours (sauvegarde automatique) et réglages : cartouche, couleurs, hachures, répétition, nom du plan |
| `miniDAO2D_lib` | Liste des plans enregistrés `[ {id, name, date, data} ]` |
| `miniDAO2D_nav` | Ordre des boutons de la barre d'outils |

Fichier d'échange **`.mdao`** : du JSON `{app:"Mini DAO 2D", format:1, name, date, ents, nextId, cart, layers, curLayer}`.

### Impression

`buildSheet()` construit un SVG au format A4 ou A3, en paysage ou en portrait, avec cadre et cartouche.
On peut imprimer à l'échelle (automatique ou imposée : 1:1 à 1:500) ou ajusté à la page (« Sans échelle »),
en couleur ou en noir et blanc. Les couleurs très claires s'impriment en noir.
`@page` est réglé dynamiquement, puis `window.print()` est appelé. **Dans Claude**, `window.print` est bloqué : « Imprimer » crée alors un **PDF** (jsPDF 2.5.2 + svg2pdf.js 2.2.4 chargés depuis cdn.jsdelivr.net, plan + visuel en page 2), proposé via la capacité `downloads` (sur iPad : feuille de partage → Imprimer). Le bouton « 📄 Enregistrer en PDF » existe partout (lien de téléchargement hors Claude).
Il faut toujours dire à Nicolas d'imprimer en **taille réelle / 100 %**.

## 5. Commandes (comme AutoCAD)

| Commande | Alias | Notes |
|---|---|---|
| Ligne | `L` | Une longueur tapée part vers la souris ; `500<45`, `@dx,dy`, `x,y`. `F` = fermer. Entrée = nouveau trait. |
| Polyligne | `PL` | `F` = fermer (ou clic sur le 1er point), `A` = annuler le dernier point, Entrée = ouverte. Affiche la surface. |
| Rectangle | `REC` | 1er coin, puis `largeur,hauteur` (le sens suit la souris). |
| Cercle | `C` | Centre, puis rayon ou `D600` pour le diamètre. |
| Décaler | `DEC` | Distance, objet, côté. Marche sur les traits, rectangles, cercles et polylignes. |
| Ajuster / Prolonger | `AJ` / `PR` | Mode rapide : tous les objets servent de limites. Maj+clic inverse les deux. |
| Texte | `T` | Clic → une case (textarea) s'ouvre à l'endroit voulu. **Entrée = ligne suivante** (demande de Nicolas) ; valider = clic ailleurs, ✓ Valider le texte, Ctrl/⌘+Entrée, Échap ou clic droit (le texte n'est jamais perdu). Le texte peut faire plusieurs lignes (`txt` contient des `\n`). Clic maintenu sur un texte + glisser = le déplacer directement (cadre pointillé quand il est sélectionné). Double-clic (ou double-tap) pour le modifier ; texte vidé = supprimé. Taille (mm à l'impression), angle, gras. |
| Hachures | `H` | Clic dans une zone fermée (polyligne fermée, rectangle, cercle, boucle de traits). `P` = contour par points. |
| Déplacer / Copier | `DEP` / `CP` | Clic sur l'objet (ou fenêtre), point de base, destination. |
| Effacer | `E` | Ou touche Suppr sur la sélection. |
| Cotations | `COTLIN`, `COTALI`, `COTCONT`, `COTRAYON`, `COTDIA`, `COTANG` | Menu « Cotation ▾ ». Entrée au 1er point = choisir un trait. `COTCONT` repart de l'extrémité de la cote précédente la plus proche du nouveau point (quel que soit le sens de saisie) ; `S` = choisir une autre cote. |
| Mesure rapide | `DI` | Les flèches et la valeur suivent la souris ; rien n'est ajouté au dessin. |
| Autres | `ZE` zoom étendu, `U` annuler, `AIDE` | F3 = accrochage, F8 = Ortho, Ctrl+Z / Ctrl+Y. |

**Accrochages** (`findSnap`, menu ▾ à côté de « Accroch. ») : extrémité, milieu, centre, **intersection** (demandée par Nicolas), perpendiculaire (activés par défaut) et proche (désactivé par défaut). Ils sont réglés par `snapModes` ; le nom de l'accrochage s'affiche en vert près du curseur.

Taper une autre commande pendant une commande permet de changer de commande.

## 6. Choix faits avec Nicolas (à respecter)

- **🔁 Répéter (activé par défaut)** : après chaque tracé, cote ou mesure, la commande se relance.
  On en sort avec le **clic droit** ou **Échap**. Le clic droit ne sert **pas** à déplacer la vue :
  c'est la molette (clic molette glissé) ou le bouton ✋ Main qui s'en chargent.
- **Calques** (📑 Calques) : calque courant, 👁 afficher ou masquer, ⇥ ranger la sélection, ajouter et supprimer.
  Les **cotes vont automatiquement dans « Cotes »**. Le bouton **📏 Cotes** en haut les masque et les réaffiche d'un clic
  (demande explicite de Nicolas). Ajouter une cote réaffiche le calque « Cotes » s'il était masqué.
- **💾 Enregistrer** (bouton en haut, Ctrl/⌘+S) : la 1re fois, on demande le nom du client et le plan s'appelle
  **toujours « Plan <client> »** (demande de Nicolas, fonction `withPlan`). Ensuite, l'enregistrement se fait directement.
  Le nom du client va aussi dans le cartouche s'il est vide. « Nouveau plan » vide les champs client du cartouche.
  📁 (Fichier) sert pour la liste des plans, les copies et l'export/import `.mdao`.
- **Couleurs** (bouton 🎨 en haut) : traits, hachures, lignes de cote, **chiffres des cotes en rouge vif** par défaut,
  **textes** (`colors.texte`), **flèche + texte : flèche et trait** (`colors.repLigne`) et **flèche + texte : texte** (`colors.repTexte`) — dao-v11.
  Avec des objets sélectionnés, la couleur leur est aussi appliquée (texte → `e.color` ; repère → `e.color` pour la flèche, `e.tcolor` pour le texte ;
  un repère sans couleur propre suit la couleur générale). Pastille « Couleur » dans la barre de l'outil Texte. Menu 🎨 défilant (iPad).
- **Barre d'outils de gauche sur UNE seule colonne** (demande explicite), réorganisable (⇅ Organiser), avec l'ordre mémorisé.
- **Sélection comme AutoCAD** : chaque clic **ajoute** l'objet, la fenêtre ajoute, Maj+clic retire, Ctrl/⌘+A sélectionne tout.
  Cliquer dans le vide ne désélectionne pas : on utilise Échap, le clic droit ou ✕.
  Une barre en haut du dessin propose 🗑 Supprimer, Déplacer, Copier, Tout sélectionner et ✕.
- Les **hachures** sont groupées en Général, **Effet bois** (veinage en S, fil droit, avec nœuds, flammé, bois en bout)
  et **Effet vitré** (reflets, dépoli, cannelé).
- **iPad** : toucher = poser un point ; pincer = zoomer ; glisser à deux doigts = déplacer la vue.
  Les boutons **↵ Entrée** et **✕ Échap** remplacent le clavier et le clic droit.
- Nicolas aime qu'on lui **propose des listes d'options à cocher** avant d'ajouter des fonctions.
- Il teste lui-même et signale les bugs (exemple corrigé : Déplacer ne marchait qu'une fois).
  **Toujours reproduire et tester** avant de dire que c'est corrigé.


## 6 bis. ✨ Claude et visuel couleur (option 1 choisie par Nicolas)

- **🖼 Visuel** affiche la page 2 : une façade en couleur dessinée par `visuMarkup()`, qui s'appuie sur la spécification `visuel`.
  On y trouve bardage bois (lames et veinage), vitrage (dégradé et reflets), brique, enduit, panneau,
  ainsi que les menuiseries (cadre de profil 70 mm, fixe, coulissant 2/3/4, ouvrant 1/2, oscillo-battant), avec la couleur RAL.
  La page 2 est **ajustée à la page (sans échelle)** et s'imprime après le plan si la case du cartouche est cochée.
- `visuel = {elements:[{shape:id, remplissage, couleur?, sens?}], menuiseries:[{shape:id, type, couleur?, profil?}], couleurMenuiseries, couleurNom, titre}`
  Il est enregistré avec le plan (`.mdao`, mes plans), comme l'historique `iaHist`.
- **Dans Claude** (artefact claude.ai avec la capacité `sample` déclarée), le bouton **✨ Claude** ouvre un panneau.
  On y écrit (ou on dicte avec le micro du clavier) une demande en français. `askIA()` envoie à Claude `IA_RULES`,
  la description des formes fermées (`planForAI()` : id, triangle/trapèze/rectangle…, dimensions, position, taille relative)
  et le visuel actuel. Claude répond en **JSON** et le visuel s'affiche. Les retouches à la suite sont possibles.
- **Dans le logiciel installé (GitHub Pages)**, il n'y a pas d'IA (option 1 : pas de clé API). **✨ Claude** copie le plan
  dans le presse-papiers (préfixe `MINIDAO1:` + JSON) et ouvre `claudeUrl`, c'est-à-dire l'artefact claude.ai.
  On y colle le plan, on fait le visuel, puis « ↩ Copier pour mon logiciel ». De retour dans le logiciel,
  on touche « 📋 Récupérer le plan et le visuel ».
- ✅ **Fait le 18/11/2026 (compte Pro)** : `dao/index.html` est publié comme artefact sur le compte Claude Pro de Nicolas :
  **https://claude.ai/artifact/7PvXDGDYbMSxNXBWj7XyUt** (slug `33ca2da6-42c8-4e22-bf6f-dfead7f753c1`), avec les capacités
  `{"sample":{},"downloads":{}}`. C'est la valeur par défaut de `claudeUrl`. L'ancienne adresse du compte perso
  (`S998mSD3A3dCjL1aqwmDJy`) est ignorée si un appareil l'avait gardée en mémoire (`load()`).
  **À chaque modification de `dao/index.html`, republier aussi cet artefact** (mêmes fichiers : index.html, manifest, icônes),
  pour que la version dans Claude reste identique à celle de GitHub.
  Nicolas peut aussi changer cette adresse lui-même : ✨ Claude → « Adresse de la Mini DAO dans Claude ».
- Option 2, possible plus tard : IA dans le logiciel installé avec une clé API Anthropic (compte développeur payant à l'usage).
  Elle n'est pas faite.


## 6 ter. ☁️ Rangement automatique dans Google Drive (logiciel installé uniquement)

Demande de Nicolas : le PDF doit aller directement dans le dossier Drive **« 09 - Plan »**, et le plan modifiable
dans **Mon Drive › Métrés › Plans › <année>**.
- Le code est **repris de l'appli de métré** (`/index.html` du dépôt) : `GOOGLE_CLIENT_ID`, `DRIVE_SCOPE` identique
  (le jeton `g_jeton` est donc partagé, puisque c'est la même adresse), `demanderJeton()`, `gdrive()`, `dossierDrive()` et `deposerDrive()`.
- `dossierPlans()` fait **la même recherche** que l'appli de métré (`'09 - Plan'`, sinon Plan, Plans…) et partage
  la même mémoire `plans_dossier`. Si aucun dossier n'est trouvé, il crée « 09 - Plan » dans Mon Drive.
- Intérêt : l'appli de métré joint à la fin du PDF d'un métré tout PDF de « 09 - Plan » dont le nom contient le nom du client.
  Comme le 💾 de la Mini DAO nomme les plans **« Plan <client> »**, « Plan Dupont.pdf » est joint au métré DUPONT.
- `DOSSIERS_DAO` (choix de Nicolas, 18/11/2026) : identifiants fixes de « 09 - Plan » (`1VmeCGm30gWiPxYmOkP4gJbtpkFl31aio`, racine de Mon Drive)
  et de « Métrés ». `dossierPlans()` et `dossierMdao()` les utilisent d'abord ; la recherche par nom ne sert que si le dossier a été supprimé.
- `dossierMdao()` retrouve ou crée `Métrés` (à la racine de Mon Drive), puis `Plans`, puis `<année>`.
  ⚠️ **À vérifier avec Nicolas** : s'il a déjà un dossier « Métrés » ailleurs dans son Drive, adapter `dossierMdao()`
  pour viser le bon, si possible par son identifiant, comme `DOSSIERS_CONNUS` dans l'appli de métré, et ne **jamais** créer de doublon.
- Déclenchement : à chaque **💾 Enregistrer** (réglage « ☁️ À chaque 💾… » dans 📁, activé par défaut), avec les boutons
  « ☁️ Ranger maintenant » (📁) et « ☁️ PDF dans 09 - Plan » (cartouche). Un fichier du même nom est **remplacé** (PATCH).
- Le jeton est demandé **dans le clic** (`rangerDriveClic`), sinon la fenêtre Google serait bloquée.
- ✅ **Essai réel fait le 18/11/2026** sur le vrai Drive avec « Plan TEST » : dossiers créés une seule fois, fichiers remplacés au 2e enregistrement.
  Le navigateur intégré de Claude bloque la fenêtre Google si le clic ne vient pas de Nicolas : c'est lui qui clique sur 💾 la 1re fois.
- Le PDF est fabriqué par jsPDF et svg2pdf.js, **copiés dans `dao/lib/`** : cela marche hors ligne, et ils sont dans le cache de `dao/sw.js`.
  Dans Claude, les mêmes versions sont chargées depuis cdn.jsdelivr.net.

## 7. Tester

Il n'y a pas de compilation : ouvrir `dao/index.html` dans un navigateur suffit.
Pendant la création, l'appli a été testée avec Playwright (Chromium) : on tape des commandes dans `#cmd`,
on clique sur le SVG `#cv`, on lit `localStorage.miniDAO2D`, et on génère le PDF d'impression
(`emulate_media("print")` puis `page.pdf(prefer_css_page_size=True)`).
Pour l'iPad, on utilise un contexte `has_touch=True` et des `PointerEvent` de type `touch` pour simuler le pincement.

## 8. Idées d'évolution déjà évoquées (non faites)

Ces idées n'ont pas encore été validées par Nicolas : les lui proposer sous forme de liste à cocher.
- Hachures maçonnerie (brique, parpaing, béton, pierre), revêtements (parquet, lames, carrelage, tuiles),
  terre, sable, métal.
- Cotes liées aux objets (elles suivent quand on déplace un objet),  couleur et verrouillage par calque.
- Arcs (et ajuster les cercles), congé et chanfrein, rotation, miroir.
- Symboles réutilisables de menuiserie (fenêtre, porte, volet…).
- Synchronisation des plans dans Google Drive (comme le CRM, `appDataFolder`), export DXF vers AutoCAD,
  export PDF direct.
- Lien depuis l'appli de métré ou le CRM (par exemple « Dessiner » depuis un dossier client).

## 9. Contenu du paquet

```
PASSATION-CLAUDE-PRO.md   ← ce document
README-ajout.md           ← section à ajouter au README du dépôt
dao/index.html            ← l'appli complète (≈ 190 Ko)
dao/manifest.webmanifest  ← nom, icônes, mode « appli »
dao/sw.js                 ← fonctionnement hors ligne (augmenter CACHE à chaque mise à jour)
dao/icon-32.png, icon-180.png, icon-192.png, icon-512.png
dao/lib/jspdf.umd.min.js, svg2pdf.umd.min.js (+ licences MIT)  ← fabrication du PDF hors ligne
PROMPT-POUR-CLAUDE-PRO.md ← le message que Nicolas te donne
```

## 10. Journal des évolutions

| Date | Version cache | Changement |
|---|---|---|
| 18/11/2026 | dao-v1 | Mise en ligne dans `foissac-fermetures/appli-metre/dao/` (commit 02fc465). |
| 18/11/2026 | dao-v2 | Artefact sur le compte Pro (sample + downloads) ; nouvelle adresse `claudeUrl`, l'ancienne est ignorée. |
| 18/11/2026 | dao-v3 | Drive : « 09 - Plan » fixé par son identifiant (`DOSSIERS_DAO.plan`, à la racine de Mon Drive). « Métrés » n'existait pas : Nicolas a choisi de le créer dans Mon Drive ; son identifiant sera mis dans `DOSSIERS_DAO.metres` après le 1er essai. |
| 18/11/2026 | dao-v4 + metre-v95 | Liens entre les applis (Nicolas a coché les 4 options) : voir § 12. |
| 18/11/2026 | metre-v95 | `sw.js` racine : ne supprime plus que les caches `metre-…` (§ 11). |
| 18/11/2026 | metre-v102 | Liens Mini DAO + correctif hors-ligne **remis** dans le métré (effacés par les versions v96-v101 d'une autre conversation). Ajout de `CLAUDE.md` à la racine (consignes : repartir de la dernière version, garder ces ajouts). |
| 18/11/2026 | dao-v6 | **Bibliothèque de symboles** (Nicolas a coché toutes les options) : voir § 13. |
| 24/11/2026 | dao-v9 | Flèche + texte (repère), texte libre des cotes, nom automatique « Plan CLIENT – Titre », cartouche par défaut (Foissac Fermetures / Nicolas), arc 2 points + flèche, cercle 3 points, arrondi entre 2 traits : voir § 14. |
| 25/11/2026 | dao-v10 | Commandes toujours actives : une fonction reste accrochée à la souris jusqu'au clic droit (ou Échap) ; bouton 🔁 retiré : voir § 15. |
| 25/11/2026 | dao-v11 | Couleurs des **textes** et de la **flèche + texte** (flèche/trait et texte séparément) dans 🎨, appliquées aussi aux objets sélectionnés ; pastille couleur dans la barre Texte ; menu 🎨 défilant. Préparé dans une autre conversation sur la base de dao-v10, testé (écran + impression). |
| 18/11/2026 | dao-v5 | **Essai réel Google Drive réussi** (« Plan TEST », 2 enregistrements : PDF dans 09 - Plan, .mdao dans Métrés › Plans › 2026, remplacés sans doublon). « Métrés » fixé : `DOSSIERS_DAO.metres = 1HoXaRkku5deGnEtg6t3SK6jtvs4zr1lz`. |

## 11. Service worker de l'appli de métré : corrigé le 18/11/2026 (accord de Nicolas)

Avant, le `sw.js` de la racine supprimait à chaque nouvelle version **tous** les caches de l'adresse, y compris `dao-v…`,
et la Mini DAO perdait sa copie hors ligne. Corrigé : il ne supprime plus que les caches dont le nom commence par `metre-`.
Testé (Chromium) : `metre-v94` supprimé, `dao-v4` et un cache tiers gardés, appli de métré affichée sans erreur.
Les deux applis gardent chacune leur propre service worker : `metre-…` (racine) et `dao-…` (`dao/`).

## 12. Liens avec l'appli de métré et le CRM (18/11/2026, demandé par Nicolas)

Nicolas veut la Mini DAO **toute seule** (installée depuis `dao/`, sa propre icône) **et** dans l'appli de métré. C'est la même Mini DAO :
dans l'appli de métré installée, `dao/` est dans la portée du manifeste du métré (`scope: ./`), donc elle s'ouvre dans la même fenêtre.

| Où | Quoi | Code |
|---|---|---|
| Métré, accueil | Bouton **📐 Mini DAO** → `dao/?retour=accueil` | `index.html` racine, `#hDAO` (à côté de « 📲 Tablette de dessin ») |
| Métré, dans un métré | Onglet-bouton **📐 Dessiner le plan** (après « + Ajouter… ») → enregistre le métré puis `dao/?client=<client.nom>&retour=<id>` | `#tabDAO` dans `renderDossier()` |
| Métré, démarrage | `?ouvrir=<id>` rouvre ce métré (puis l'adresse est nettoyée) | fin de `index.html` racine, `DB.open().then(…)` |
| CRM | Lien **📐 Mini DAO** → `../dao/?retour=crm`, à côté de « ⇅ Ranger les onglets » | **`crm/import.js`** (pas `crm/index.html`, qui est régénéré depuis claude.ai) |
| Mini DAO | `?client=` : rouvre « Plan <client> » s'il existe dans Mes plans, sinon nouveau plan déjà nommé et client dans le cartouche. Le dessin en cours est d'abord rangé dans Mes plans (« Brouillon … » s'il n'avait pas de nom) : rien n'est perdu. | `ouvrirPlanClient()`, `garderDessinEnCours()` |
| Mini DAO | Bouton **↩ Retour** (seulement si `?retour=`) : enregistre le plan (demande le nom la 1re fois), attend le rangement Google Drive (PDF dans 09 - Plan), puis revient. Si Drive échoue, on reste ; un 2e appui revient quand même. | `revenir()`, `rangerDrive()` renvoie `true/false` |

| Mini DAO | (19/11/2026) Avec `?retour=crm&client=<nom>` (bouton 📐 Plan de la fiche CRM), ↩ Retour revient sur la fiche de ce client dans le CRM (`RETOUR_CLIENT`). | `retourUrl()` |

Intérêt : le PDF « Plan <client>.pdf » est dans « 09 - Plan » avant le retour, donc l'appli de métré le joint au PDF du métré.
Tests (Playwright, adresse github.io simulée + faux Drive) : accueil → DAO → retour ; métré → Dessiner → 💾 → retour au même métré ;
2e passage = même plan rouvert, fichiers Drive remplacés (pas de doublon) ; CRM → DAO → retour CRM ; DAO seule = pas de bouton Retour.

## 13. Bibliothèque de symboles (dao-v6, 18/11/2026)

Bouton **🚪 Symboles** (barre de gauche, après Cotation) ou commandes `SYM`, `SYMBOLE`, `BIBLIO`, `BLOC`, `INSERER`.
41 symboles en 9 onglets (`SYM_CATS` / `SYMS` dans `index.html`, bloc « Bibliothèque de symboles ») :
portes (1 et 2 vantaux, coulissante, garage), fenêtres (1, 2 vantaux, OB, fixe), portes-fenêtres et baies coulissantes 2/3 rails,
extérieur (portail battant, coulissant avec refoulement, portillon, pergola), WC / lave-mains / lavabo / double vasque / douches / baignoire,
cuisine et buanderie (évier, plaque, frigo, plan de travail, lave-linge, sèche-linge, chauffe-eau), escaliers (droit, quart tournant),
mobilier (lits, table + 6 chaises, canapé, armoire), voiture, Nord, repère de coupe, « Entrée ».

- **Construction** : chaque symbole = objets ordinaires (line, rect, poly, circle, text) avec le même `grp` (+ `sym` = id du symbole), sur le calque **« Symboles »**.
  Rien à faire pour l'impression, le PDF, Drive ou le .mdao. Repère local en mm : x le long du mur, y vers le côté d'ouverture ; origine = milieu de l'ouverture
  sur l'axe du mur (menuiseries `open:true`, paramètres `w` passage et `ep` épaisseur du mur) ou milieu du dos (appareils, meubles).
- **Pose** (`beginSym`, `symFrame`, `placeSym`) : le symbole suit la souris. « Accrocher au mur » (case de la barre du haut, retenue) : aligné sur le trait le plus proche
  (40 px) ; pour une menuiserie, si une face parallèle existe à 30–700 mm, l'épaisseur est prise et le symbole est centré dans le mur. Ouverture du côté de la souris.
  Touches **R** (90°), **M** (miroir = côté des paumelles), **I** (changer de côté), largeur tapée ; boutons équivalents dans la barre `#symopts` (iPad).
  Largeurs / épaisseurs retenues par symbole dans `symOpts` (sauvegardé).
- **Blocs** : `selected` est un `GroupSel` (un clic sélectionne tout le symbole) ; Effacer au clic efface le bloc ; Copier crée de nouveaux blocs.
  Barre de sélection : **⟳ 90°**, **⇋ Miroir** (autour du centre de la sélection, `transformSel` / `xformEnt`, aussi pour des objets ordinaires) et **Décomposer**.
- Les traits du mur ne sont pas coupés automatiquement dans l'ouverture : utiliser **Ajuster** entre les deux montants.
- Tests : `window.__daoTest = true` avant le chargement expose `window.__dao` (tests automatiques seulement).

## 14. Repères, cotes libres, nom automatique, arcs (dao-v9, 24/11/2026)

Options cochées par Nicolas : flèche + texte modifiable ; cotes à texte libre ; nom « Plan CLIENT – Titre » ; arc 2 points + flèche, cercle 3 points, arrondi.

- **Flèche + texte** (`REP`, `REPERE`, `FLECHE`, `LEADER`, bouton « Flèche + texte ») : clic sur l'endroit montré, clic où va le texte, fenêtre de texte
  (plusieurs lignes ; Ctrl+Entrée = OK). Objet = cote `{type:"dim", kind:"lead", p1 (pointe), q (texte), txt}` → même style, couleurs, calque « Cotes »
  et impression que les cotes (`leadMarkup` appelé par `dimMarkup`). Modifiable : **attraper la pointe ou le texte** (`leadGripAt`, `gripDrag`, accrochage actif),
  **double-clic** pour changer le texte, bouton **✎ Texte** de la barre de sélection.
- **Cotes à texte libre** : double-clic sur une cote (ou ✎ Texte) → fenêtre `mDimTxt` ; le texte va dans `d.txt` et remplace la mesure (`dimLabel`).
  Vide ou « Vraie mesure » = mesure réelle. Le texte des cotes est maintenant échappé (`esc`).
- **Nom automatique** : `nomDuCartouche()` = `withPlan(client)` + « – titre ». 💾 sans fenêtre dès que le client est rempli dans le cartouche ;
  sinon la fenêtre demande **client + titre** (et les écrit dans le cartouche). Le nom suit le cartouche à chaque 💾.
  Si le nom change, les fichiers Drive du plan sont **renommés** (`renommerDrive`, `driveNom` mémorisé par plan) au lieu d'être dupliqués ;
  `driveNom` est remis à zéro pour un nouveau plan, une copie ou un plan ouvert depuis le métré (pour ne jamais renommer les fichiers d'un autre plan).
  Le lien depuis le métré (`?client=`) retrouve aussi « Plan CLIENT – Titre ».
- **Cartouche par défaut** : `CART_DEFAUTS = {societe:"Foissac Fermetures", dessine:"Nicolas"}` remplit ces champs s'ils sont vides (`cartDefauts`).
- **Arcs** : nouvel objet `{type:"arc", c, r, a0, a1}` (degrés, sens trigonométrique). Pris en charge : écran, impression/PDF, accrochage (bouts, milieu, centre),
  sélection, déplacer/copier, ⟳ 90° / miroir (`xformEnt` reconstruit l'arc par 3 points), décaler. Pas encore : ajuster/prolonger un arc, hachurer une zone fermée par un arc.
  - `A` / `ARC` « Arc + flèche » : 2 points (naissances) puis hauteur de flèche tapée (côté de la souris ; négatif = autre côté) ou clic au sommet.
  - `C3P` « Cercle 3 points » (crée un cercle ordinaire).
  - `RA` / `RACCORD` / `ARRONDI` : rayon tapé (0 = angle vif, retenu), puis 2 traits cliqués du côté à garder (lignes ou côtés de rectangle, décomposé au besoin).
- Tests automatiques : `window.__dao` expose aussi `cart`, `planNameTxt`, `driveNom`, `planId`.

## 15. Commandes toujours actives (dao-v10, 25/11/2026, demandé par Nicolas)

Demande : « quand j'ai choisi une fonction (cotation, ligne…), elle reste accrochée à la souris tant que je n'ai pas fait de clic droit ».

- `finishCmd()` relance **toujours** la commande (on ne regarde plus `repeatOn`, qui reste dans la sauvegarde mais ne sert plus).
- Le bouton 🔁 (`#bRep`, `updRep`) est retiré : il permettait de couper la répétition, ce qui donnait l'impression que la fonction « se décrochait ».
- Entrée vide pendant une commande : termine le tracé en cours et **relance** la même commande (avant : sortie) — rectangle, cercle, mesurer, décaler, déplacer/copier, cotes, texte, ajuster/prolonger, hachures, effacer.
- Seules sorties : **clic droit** ou **Échap** (ou choisir un autre outil).
- Test : `tests/test_rep.py` (chaque outil reste actif après 2 utilisations, même avec `repeatOn:false` en mémoire ; clic droit → plus de commande).

