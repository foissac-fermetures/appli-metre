/* Version en ligne : importer le fichier exporté depuis le CRM de claude.ai (« ⇩ Exporter mes données »). */
(function () {
  const after = document.getElementById("tabOrd"); if (!after || !window.CRM_ONLINE) return;
  const b = document.createElement("button"); b.className = "lnk tabord"; b.type = "button"; b.textContent = "⇧ Importer mes données";
  const f = document.createElement("input"); f.type = "file"; f.accept = ".json,application/json"; f.hidden = true;
  after.after(b, f);
  b.onclick = () => f.click();
  f.onchange = async () => {
    const file = f.files && f.files[0]; f.value = ""; if (!file) return;
    try { const n = CRM_ONLINE.store.importAll(JSON.parse(await file.text()));
      (window.toast || alert)(n + " fiches importées" + (CRM_ONLINE.tokenOk() ? ", enregistrées dans ton Google Drive" : " — connecte-toi à Google pour les garder sur tous tes appareils"));
    } catch (e) { (window.toast || alert)("Import impossible : " + e.message); }
  };
  // première utilisation : rien dans le CRM → on propose l'import bien en vue
  CRM_ONLINE.store.load().then(() => { if (!Object.keys(CRM_ONLINE.store.docs).length) { b.textContent = "⇧ Importer mes données (première fois)"; b.style.fontWeight = "700"; } });
})();
/* Version en ligne : bouton « 📐 Mini DAO » (ouvre la Mini DAO, avec un bouton de retour au CRM). Ajouté le 18/11/2026.
   Il est ici (et pas dans index.html) car index.html est régénéré depuis la version claude.ai du CRM. */
(function () {
  const after = document.getElementById("tabOrd"); if (!after || !/github\.io$/.test(location.hostname)) return;
  const a = document.createElement("a"); a.className = "lnk tabord"; a.href = "../dao/?retour=crm"; a.textContent = "📐 Mini DAO";
  a.title = "Ouvrir la Mini DAO (dessin 2D)"; a.style.textDecoration = "none";
  after.after(a);
})();
/* ---------------------------------------------------------------------------------------------
   Version en ligne : raccourcis (19/11/2026, projet « Réorganisation des logiciels »).
   Ici (et pas dans index.html) car index.html est régénéré depuis la version claude.ai du CRM.
   - boutons 📅 RDV · 📞 · 💬 SMS · 🔁 Relance · ✉️ Mail sur chaque ligne de la liste des dossiers ;
   - barre d'actions fixe en haut de la fiche client, avec les liens directs 📏 Métré et 📐 Plan ;
   - recherche rapide Ctrl+K (ou bouton 🔍) depuis tous les onglets, Entrée = ouvrir la fiche ;
   - « Récents » : les 5 derniers clients ouverts ;
   - ?client=<nom> à l'ouverture : ouvre directement la fiche de ce client (retour du métré / de la Mini DAO).
   --------------------------------------------------------------------------------------------- */
(function () {
  if (typeof renderList !== "function" || typeof renderDrawer !== "function" || typeof openDossier !== "function") return;
  const css = document.createElement("style");
  css.textContent = `.qa{display:flex;gap:4px;margin-top:6px;flex-wrap:wrap}
.qab{font:inherit;font-size:.76rem;padding:3px 9px;border:1px solid var(--line);border-radius:999px;background:var(--panel);color:var(--ink);cursor:pointer;text-decoration:none;line-height:1.5;white-space:nowrap}
.qab:hover,.qab:focus-visible{border-color:var(--c-rdv);color:var(--c-rdv)}
.qab.rdv{border-color:color-mix(in srgb,var(--c-rdv) 55%,var(--line))}
.qab.lien{border-style:dashed}
.fqa{position:sticky;top:0;z-index:3;display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:8px 10px;margin:-4px 0 4px;border:1px solid var(--line);border-radius:10px;background:var(--panel);box-shadow:0 4px 12px rgba(0,0,0,.08)}
.fqa .qab{font-size:.84rem;padding:5px 11px}
.fqa.mob{display:none}
@media (max-width:760px){.fqa.mob{display:flex}.fcr>.fqa:not(.mob){display:none}}
.fqa .sep{width:1px;align-self:stretch;background:var(--line);margin:0 2px}
.qaflash{outline:3px solid var(--c-rdv);outline-offset:3px;border-radius:8px}
.search .qkbtn{margin-left:6px;font-size:.8rem;padding:4px 10px;align-self:center}
.recbar{flex-basis:100%;display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-top:-4px}
.qk{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.45);display:flex;align-items:flex-start;justify-content:center;padding:10vh 12px 12px}
.qk[hidden]{display:none}
.qkbox{width:min(640px,100%);background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,.35);padding:12px;display:grid;gap:8px;max-height:80vh;overflow:auto}
#qkin{font:inherit;font-size:1.05rem;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink);width:100%;box-sizing:border-box}
.qkh{font-size:.8rem;color:var(--muted);padding:2px 4px}
.qki{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;align-items:center;padding:8px 10px;border:1px solid transparent;border-radius:8px;cursor:pointer}
.qki:hover{border-color:var(--line)}
.qki.on{border-color:var(--c-rdv);background:color-mix(in srgb,var(--c-rdv) 8%,transparent)}
.qki .qa{grid-column:1/-1;margin-top:0}
.qkn{display:flex;flex-direction:column;min-width:0}.qkn b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.qkhelp{font-size:.75rem;color:var(--muted);text-align:right}
@media (max-width:700px){.recbar{display:none}.search .qkbtn{display:none}}`;
  document.head.appendChild(css);
  const q$ = s => document.querySelector(s);
  const findRow = id => rows.find(r => r.id === id);
  const tel = r => { const t = (r.tel || "").replace(/\s/g, ""); return /\d{6}/.test(t) ? t : ""; };
  const nomLien = r => encodeURIComponent((r.client || "").trim());
  // 27/11/2026 : l'e-mail du client part aussi vers le métré (le classeur CRM n'a pas de colonne mail) → case « E-mail » de la fiche Client
  const mailLien = r => { try { const m = (typeof mailOf === "function" ? mailOf(r) : r.mail) || ""; return /@/.test(m) ? "&mail=" + encodeURIComponent(m.trim()) : ""; } catch (e) { return ""; } };
  const lienMetre = r => "../?client=" + nomLien(r) + mailLien(r) + "&retour=crm";
  const lienPlan = r => "../dao/?client=" + nomLien(r) + "&retour=crm";

  /* -- boutons d'action -- */
  function qaRow(r){ const t = tel(r);
    return `<div class="qa"><button type="button" class="qab rdv" data-qa="rdv" title="Noter un rendez-vous">📅 RDV</button>${t ? `<a class="qab" href="tel:${esc(t)}" title="Appeler">📞 Appeler</a><button type="button" class="qab" data-qa="sms" title="Préparer un SMS">💬 SMS</button>` : ""}<button type="button" class="qab" data-qa="rel" title="Noter une relance">🔁 Relance</button><button type="button" class="qab" data-qa="mail" title="Écrire un mail">✉️ Mail</button>${(typeof status === "function" && status(r) === "relancer" && !((suivi[r.id] || {}).norel)) ? `<button type="button" class="qab" data-qa="norel" title="Ne plus relancer ce devis (tu pourras reprendre depuis sa fiche)">🔕 Plus de relance</button>` : ""}</div>`; }
  function fqaBar(r){ const t = tel(r);
    return `<div class="fqa" aria-label="Actions rapides"><button type="button" class="qab rdv" data-fqa="rdv">📅 RDV</button>${t ? `<a class="qab" href="tel:${esc(t)}">📞 Appeler</a><button type="button" class="qab" data-fqa="sms">💬 SMS</button>` : ""}<button type="button" class="qab" data-fqa="rel">🔁 Relance</button><button type="button" class="qab" data-fqa="mail">✉️ Mail</button>${(typeof status === "function" && status(r) === "relancer" && !((suivi[r.id] || {}).norel)) ? `<button type="button" class="qab" data-fqa="norel" title="Ne plus relancer ce devis (tu pourras reprendre depuis sa fiche)">🔕 Plus de relance</button>` : ""}${(r.pdf_devis || []).length ? `<button type="button" class="qab" data-resa="${esc(r.id)}">📐 Plan de réservation</button>` : ""}<span class="sep"></span><a class="qab lien" href="${lienMetre(r)}" title="Ouvrir le métré de ce client dans l'appli de métré (ou le créer)">📏 Métré</a><a class="qab lien" href="${lienPlan(r)}" title="Ouvrir le plan de ce client dans la Mini DAO (ou le créer)">📐 Plan</a></div>`; }
  function qaShow(el){ if (!el) return false; for (let p = el.parentElement; p; p = p.parentElement) if (p.tagName === "DETAILS") p.open = true;
    const box = el.closest("fieldset, .relblk, .fcard") || el; box.scrollIntoView({ block: "center", behavior: "smooth" });
    box.classList.add("qaflash"); setTimeout(() => box.classList.remove("qaflash"), 1400);
    setTimeout(() => { try { el.focus({ preventScroll: true }); } catch(_){} }, 350); return true; }
  function qaGo(kind){ const r = findRow(openId); if (!r) return;
    if (kind === "norel") { setNoRel(r, true); return; }
    if (kind === "rdv") { if (!qaShow(q$("#rdvd"))) toast("Pas de rendez-vous à noter sur ce dossier"); }
    else if (kind === "rel") { if (!qaShow(q$("#mrc"))) toast("Pas de relance à noter sur ce dossier"); }
    else if (kind === "sms") { if (smsFor === r.id) { const b = q$("#smsbox"); if (b) b.scrollIntoView({ block: "center", behavior: "smooth" }); } else { const b = q$("#smsb"); if (b) b.click(); else toast("Pas de numéro pour un SMS"); } }
    else if (kind === "mail") { if (cmFor === r.id) { const b = q$("#cmbox"); if (b) b.scrollIntoView({ block: "center", behavior: "smooth" }); } else { const b = q$("#cmb"); if (b) b.click(); else toast("Pas d'adresse mail"); } } }
  function quickAct(id, kind){ openDossier(id); setTimeout(() => qaGo(kind), 80); }
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-fqa]"); if (!b) return; e.preventDefault(); e.stopPropagation(); qaGo(b.dataset.fqa); }, true);

  /* -- récents -- */
  function recentsGet(){ try { return JSON.parse(localStorage.getItem("crm-recents") || "[]").filter(id => rows.some(r => r.id === id)); } catch(_){ return []; } }
  function recentPush(id){ try { const a = [id].concat(JSON.parse(localStorage.getItem("crm-recents") || "[]").filter(x => x !== id)).slice(0, 8); localStorage.setItem("crm-recents", JSON.stringify(a)); } catch(_){} }
  function renderRecbar(){ const el = q$("#recbar"); if (!el) return; const L = recentsGet().slice(0, 5).map(findRow).filter(Boolean);
    el.hidden = !L.length; el.innerHTML = L.length ? `<span class="sub">Récents :</span>` + L.map(r => `<button type="button" class="qab" data-recid="${esc(r.id)}">${esc(r.client)}</button>`).join("") : "";
    el.querySelectorAll("[data-recid]").forEach(b => b.onclick = () => openDossier(b.dataset.recid)); }

  /* -- on habille la liste et la fiche après chaque affichage -- */
  const _renderList = renderList;
  renderList = function () { const out = _renderList.apply(this, arguments);
    try { document.querySelectorAll("#rows tr[data-id]").forEach(tr => { const td = tr.querySelector("td"); const r = findRow(tr.dataset.id); if (!td || !r || td.querySelector(".qa")) return; td.insertAdjacentHTML("beforeend", qaRow(r));
      td.querySelectorAll("button[data-qa]").forEach(b => b.onclick = e => { e.stopPropagation(); e.preventDefault(); if (b.dataset.qa === "norel") { const r2 = findRow(tr.dataset.id); if (r2) setNoRel(r2, true); return; } quickAct(tr.dataset.id, b.dataset.qa); }); }); renderRecbar(); } catch(_){}
    return out; };
  const _renderDrawer = renderDrawer;
  renderDrawer = function () { const out = _renderDrawer.apply(this, arguments);
    try { const r = findRow(openId), f = q$("#drawer .fcr"); if (r && f && !f.querySelector(".fqa")) f.insertAdjacentHTML("afterbegin", fqaBar(r));
      /* téléphone (écran étroit, fiche sur une seule colonne) : la même barre juste sous le nom du client, sinon elle est tout en bas des coordonnées */
      const l = q$("#drawer .fcl"); if (r && l && !l.querySelector(".fqa")) { const top = l.querySelector(".fcl-top"); const html = fqaBar(r).replace('class="fqa"', 'class="fqa mob"'); if (top) top.insertAdjacentHTML("afterend", html); else l.insertAdjacentHTML("afterbegin", html); } } catch(_){}
    return out; };
  const _openDossier = openDossier;
  openDossier = function (id) { recentPush(id); return _openDossier.apply(this, arguments); };

  /* -- recherche rapide Ctrl+K -- */
  let qkSel = 0, qkList = [];
  function qkFind(s){ s = s.trim().toLowerCase(); if (!s) return recentsGet().slice(0, 5).map(findRow).filter(Boolean);
    const sd = s.replace(/\s/g, ""), out = [];
    for (const r of rows) { const name = (r.client || "").toLowerCase(), hay = [r.client, aliasOf(r), r.lieu, r.adr, r.proj].join(" ").toLowerCase(), t = (r.tel || "").replace(/\s/g, "");
      const sc = name.startsWith(s) ? 3 : name.includes(s) ? 2 : hay.includes(s) ? 1 : (/\d{3}/.test(sd) && t.includes(sd)) ? 1 : 0;
      if (sc) out.push([sc, r]); }
    return out.sort((a, b) => b[0] - a[0] || (a[1].client || "").localeCompare(b[1].client || "")).slice(0, 8).map(x => x[1]); }
  function qkClose(){ const o = q$("#qk"); if (o) o.hidden = true; }
  function qkRender(){ const s = q$("#qkin").value; qkList = qkFind(s);
    q$("#qkres").innerHTML = (s.trim() ? "" : `<div class="qkh">${qkList.length ? "Derniers clients ouverts" : "Tape un nom, une commune ou un téléphone"}</div>`) + (qkList.length ? qkList.map((r, i) => { const st = status(r), t = tel(r), S = ST[st] || { c: "", l: "" };
      return `<div class="qki ${i === qkSel ? "on" : ""}" data-qkid="${esc(r.id)}"><div class="qkn"><b>${esc(r.client)}</b><span class="sub">${esc(r.lieu || "—")}${r.proj ? " · " + esc(r.proj) : ""}</span></div><span class="pill ${S.c}">${S.l}</span><div class="qa"><button type="button" class="qab rdv" data-qkqa="rdv">📅 RDV</button>${t ? `<a class="qab" href="tel:${esc(t)}" title="Appeler">📞</a><button type="button" class="qab" data-qkqa="sms" title="SMS">💬</button>` : ""}<button type="button" class="qab" data-qkqa="rel" title="Relance">🔁</button><button type="button" class="qab" data-qkqa="mail" title="Mail">✉️</button><a class="qab lien" href="${lienMetre(r)}">📏 Métré</a><a class="qab lien" href="${lienPlan(r)}">📐 Plan</a></div></div>`; }).join("") : (s.trim() ? `<div class="qkh">Aucun client trouvé</div>` : ""));
    const on = q$("#qkres .qki.on"); if (on) on.scrollIntoView({ block: "nearest" }); }
  function qkOpen(){ let o = q$("#qk");
    if (!o) { document.body.insertAdjacentHTML("beforeend", `<div id="qk" class="qk" hidden><div class="qkbox" role="dialog" aria-label="Recherche rapide"><input id="qkin" type="search" placeholder="Nom, commune, téléphone…" autocomplete="off"><div id="qkres"></div><div class="qkhelp">↑ ↓ pour choisir · Entrée = ouvrir la fiche · Échap = fermer</div></div></div>`); o = q$("#qk");
      o.addEventListener("click", e => { if (e.target === o) qkClose(); });
      q$("#qkin").addEventListener("input", () => { qkSel = 0; qkRender(); });
      q$("#qkin").addEventListener("keydown", e => {
        if (e.key === "ArrowDown") { e.preventDefault(); qkSel = Math.min(qkSel + 1, qkList.length - 1); qkRender(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); qkSel = Math.max(qkSel - 1, 0); qkRender(); }
        else if (e.key === "Enter") { e.preventDefault(); const r = qkList[qkSel]; if (r) { qkClose(); openDossier(r.id); } }
        else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); qkClose(); } });
      q$("#qkres").addEventListener("click", e => { const it = e.target.closest("[data-qkid]"); if (!it || e.target.closest("a")) return; const b = e.target.closest("[data-qkqa]"); e.preventDefault(); qkClose(); if (b) quickAct(it.dataset.qkid, b.dataset.qkqa); else openDossier(it.dataset.qkid); }); }
    o.hidden = false; const i = q$("#qkin"); i.value = ""; qkSel = 0; qkRender(); setTimeout(() => i.focus(), 20); }
  document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === "k" || e.key === "K")) { e.preventDefault(); const o = q$("#qk"); if (o && !o.hidden) qkClose(); else qkOpen(); } }, true);
  { const sq = q$(".search"), qi = q$("#q");
    if (sq && qi && !q$("#qkbtn")) { qi.placeholder = qi.placeholder.replace(/…$/, "… (Entrée = ouvrir)");
      sq.insertAdjacentHTML("beforeend", `<button type="button" class="qab qkbtn" id="qkbtn" title="Recherche rapide, depuis n'importe quel onglet">🔍 Ctrl+K</button>`);
      sq.insertAdjacentHTML("afterend", `<div id="recbar" class="recbar" hidden></div>`); q$("#qkbtn").onclick = qkOpen; }
    if (qi) qi.addEventListener("keydown", e => { if (e.key !== "Enter" || !qi.value.trim()) return; const l = filtered(); if (l.length) { e.preventDefault(); openDossier(l[0].id); } }); }

  /* -- ?client=<nom> : ouvrir la fiche de ce client (retour du métré ou de la Mini DAO) -- */
  { let cible = ""; try { const P = new URLSearchParams(location.search); cible = (P.get("client") || "").trim(); if (cible) { P.delete("client"); history.replaceState(null, "", location.pathname + (P.toString() ? "?" + P : "") + location.hash); } } catch(_){}
    if (cible) { const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
      const n = norm(cible), n1 = n.split(" ")[0] || ""; let essais = 0;
      const t = setInterval(() => { essais++; if (!rows.length) { if (essais > 60) clearInterval(t); return; } clearInterval(t);
        let r = rows.find(x => norm(x.client) === n || norm(aliasOf(x)) === n);
        if (!r && n1.length >= 3) { const M = rows.filter(x => norm(x.client).split(" ").includes(n1)); if (M.length === 1) r = M[0]; }
        if (r) openDossier(r.id); else { const qi = q$("#q"); if (qi) { qi.value = cible; qi.dispatchEvent(new Event("input")); } toast("Client « " + cible + " » : pas trouvé tel quel, voici la recherche"); } }, 500); } }
})();

/* ---------- Journal d'utilisation (19/11/2026, projet « Réorganisation des logiciels », voir CLAUDE.md du dépôt) ----------
   Carnet commun aux 3 applis (même adresse) : localStorage « journal-usage ». Note seulement les boutons, onglets
   et commandes utilisés et leur enchaînement — jamais de nom de client, de numéro ni de texte saisi.
   L'appli de métré l'envoie dans Mon Drive › Appli métré – Dossiers › « Journal d'utilisation (applis).json ». */
(function(){
  const APP="crm", LS="journal-usage";
  const pad=n=>String(n).padStart(2,"0"), now=()=>{ const d=new Date(); return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+" "+d.toTimeString().slice(0,8); };
  const ua=navigator.userAgent||"", APPAREIL=(/iPad/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1))?"ipad":/iPhone|Android.*Mobile/.test(ua)?"tel":/Mac/.test(ua)?"mac":"pc";
  const SESS=Math.random().toString(36).slice(2,6);
  const clean=k=>String(k).replace(/[\r\n"\\]/g," ").replace(/\s+/g," ").trim().slice(0,60);
  let buf=[];
  function flush(){ if(!buf.length) return; try{ const L=JSON.parse(localStorage.getItem(LS)||"[]"); localStorage.setItem(LS, JSON.stringify(L.concat(buf).slice(-20000))); buf=[]; }catch(_){ buf=buf.slice(-500); } }
  function log(k){ k=clean(k); if(!k) return; buf.push(now()+" "+APP+" "+APPAREIL+" "+k+" ~"+SESS); if(buf.length>=40) flush(); }
  function where(el){ const s=el.closest("#drawer,#qk,[id^='v-'],aside[id],section[id],.snav,header,#resa"); return s?(s.id||s.tagName.toLowerCase()):"page"; }
  function key(el){
    if(el.dataset&&el.dataset.qa) return "recherche→"+el.dataset.qa;
    if(el.dataset&&el.dataset.fqa) return "fiche→"+el.dataset.fqa;
    if(el.dataset&&el.dataset.qkqa) return "ctrlk→"+el.dataset.qkqa;
    if(el.dataset&&el.dataset.recid) return "récents:client";
    if(el.classList&&el.classList.contains("lien")) return "fiche→"+(/dao\//.test(el.getAttribute("href")||"")?"plan":"metre");
    if(el.classList&&el.classList.contains("tab")&&el.id) return "onglet:"+el.id.replace(/^t-/,"");
    const w=where(el);
    if(el.id) return w+":"+el.id;
    if(el.tagName==="TR") return w+":ligne";
    const ds=Object.keys(el.dataset||{}).filter(k=>k!=="id"&&k!=="g");
    if(ds.length) return w+":"+ds[0];
    let t=(el.getAttribute("aria-label")||el.textContent||"").replace(/\s+/g," ").trim();
    if(!t||t.length>30||/\d{2}/.test(t)||el.closest("[data-id]")) t=el.tagName.toLowerCase()+(el.closest("[data-id]")?"-carte":"");
    return w+":"+t;
  }
  document.addEventListener("click",e=>{ const el=e.target.closest&&e.target.closest("button,a,summary,select,tr[data-id],[data-id],[role=button],[data-cmd],[data-tab],.tab,.tool,.item,input[type=checkbox],input[type=radio]"); if(el) try{ log(key(el)); }catch(_){} },true);
  { let had=false; const q=document.getElementById("q"); if(q) q.addEventListener("input",()=>{ const has=!!q.value.trim(); if(has&&!had) log("recherche:frappe"); had=has; }); }
  document.addEventListener("keydown",e=>{ if((e.ctrlKey||e.metaKey)&&/^k$/i.test(e.key)) log("raccourci:Ctrl+K"); else if(e.key==="Enter"&&e.target&&e.target.id==="q") log("recherche:Entrée"); else if(e.key==="Enter"&&e.target&&e.target.id==="qkin") log("ctrlk:Entrée"); },true);
  { const u=new URLSearchParams(location.search); if(u.get("client")) log("arrivée:lien-client"); }
  log("ouverture");
  setInterval(flush,30000);
  document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden") flush(); });
  window.addEventListener("pagehide",flush);
  window.journalUsage={ log, flush };
})();
