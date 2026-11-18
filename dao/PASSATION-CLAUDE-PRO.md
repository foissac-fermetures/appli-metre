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
6. Demander à Nicolas s'il veut un lien vers la Mini DAO depuis l'appli de métré ou depuis le CRM.
   Ne rien ajouter sans son accord.
7. Lui envoyer la marche à suivre pour l'installer (§ 3).

**À chaque mise à jour** de `dao/index.html`, augmenter le numéro de cache dans `dao/sw.js`
(`dao-v1` → `dao-v2`…). Sinon, les appareils risquent de garder l'ancienne version hors ligne.

## 3. Installation sur les appareils (à expliquer à Nicolas)

| Appareil | Navigateur | Comment installer |
|---|---|---|
| iPad Pro | Safari | Ouvrir l'adresse, bouton **Partager** (carré avec flèche) puis **« Sur l'écran d'accueil »**. |
| MacBook Pro | Safari | Menu **Fichier** puis **« Ajouter au Dock »**. Avec Chrome : icône d'installation dans la barre d'adresse. |
| PC Windows | Edge ou Chrome | Icône **« Installer l'application »** dans la barre d'adresse (ou menu ⋯ → Applications → Installer). |

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
- **Couleurs** (bouton 🎨 en haut) : traits, hachures, lignes de cote, **chiffres des cotes en rouge vif** par défaut.
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
- `dossierMdao()` retrouve ou crée `Métrés` (à la racine de Mon Drive), puis `Plans`, puis `<année>`.
  ⚠️ **À vérifier avec Nicolas** : s'il a déjà un dossier « Métrés » ailleurs dans son Drive, adapter `dossierMdao()`
  pour viser le bon, si possible par son identifiant, comme `DOSSIERS_CONNUS` dans l'appli de métré, et ne **jamais** créer de doublon.
- Déclenchement : à chaque **💾 Enregistrer** (réglage « ☁️ À chaque 💾… » dans 📁, activé par défaut), avec les boutons
  « ☁️ Ranger maintenant » (📁) et « ☁️ PDF dans 09 - Plan » (cartouche). Un fichier du même nom est **remplacé** (PATCH).
- Le jeton est demandé **dans le clic** (`rangerDriveClic`), sinon la fenêtre Google serait bloquée.
- **Testé ici avec un faux Google Drive** (création des dossiers, dépôt, remplacement sans doublon), mais **jamais sur le vrai Drive** :
  il faut faire le 1er essai réel avec un plan « Plan TEST », puis supprimer les fichiers de test.
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

## 11. Point de vigilance connu : le service worker de l'appli de métré

Le `sw.js` de la racine (appli de métré) supprime, à chaque nouvelle version, **tous** les caches qui ne portent pas son nom,
y compris `dao-v…` (les caches sont communs à toute l'adresse foissac-fermetures.github.io/appli-metre/).
Conséquence : après une mise à jour de l'appli de métré, la Mini DAO perd sa copie hors ligne jusqu'à sa prochaine ouverture
avec Internet (elle se recopie alors toute seule). Correction possible, **seulement avec l'accord de Nicolas** :
dans `sw.js` racine, ne supprimer que les caches dont le nom commence par `metre-`.
