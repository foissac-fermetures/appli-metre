/* CRM Gourdon – version en ligne (GitHub Pages).
   Remplace ce que claude.ai fournissait au CRM :
   - « db »  : les données du CRM (suivi, tâches, SAV, clients, dossiers, réglages), gardées sur l'appareil
               et synchronisées dans l'espace caché de l'appli sur le Google Drive de Nicolas (appDataFolder :
               invisible dans « Mon Drive », aucun fichier de travail n'est créé ni modifié) ;
   - « mcp » : Google Drive (lecture seule), Google Agenda, Gmail (brouillons), appelés directement chez Google ;
   - « user ». */
(function () {
  "use strict";
  const CLIENT_ID = "1087131197985-65k5sf880bieuc2krp9u69j5q3e0r26g.apps.googleusercontent.com";
  const SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly",        // lire tes fichiers Drive (jamais les modifier)
    "https://www.googleapis.com/auth/drive.appdata",         // l'espace caché du CRM (ses propres données)
    "https://www.googleapis.com/auth/calendar.events"        // tes rendez-vous dans Google Agenda
  ].join(" ");
  const GMAIL = "https://www.googleapis.com/auth/gmail.compose";   // brouillons Gmail (jamais d'envoi) : demandé seulement si tu t'en sers
  const DATA_FILE = "crm-gourdon-donnees.json";
  const LS_TOKEN = "crm_g_jeton", LS_OK = "crm_g_ok";

  /* ---------- connexion Google ---------- */
  let token = null, tokenEnd = 0, granted = "", gClient = null, gReady = null, wantGmail = false;
  try { const j = JSON.parse(localStorage.getItem(LS_TOKEN) || "null"); if (j && j.s === SCOPES && j.f > Date.now() + 60000) { token = j.t; tokenEnd = j.f; granted = j.g || ""; } } catch (e) {}
  const hasGmail = () => granted.indexOf(GMAIL) >= 0;
  const tokenOk = () => token && Date.now() < tokenEnd - 60000;
  function loadGis() {
    if (gReady) return gReady;
    gReady = new Promise((ok, ko) => {
      const s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.async = true;
      s.onload = () => { gClient = google.accounts.oauth2.initTokenClient({ client_id: CLIENT_ID, scope: SCOPES, hint: "nb@foissacfermetures.fr", callback: () => {} }); ok(); };
      s.onerror = () => { gReady = null; ko(new Error("Google injoignable (pas de réseau ?)")); };
      document.head.appendChild(s);
    });
    return gReady;
  }
  const authWaiters = [];
  function signIn(withGmail) {   // à appeler dans un clic
    return new Promise((ok, ko) => {
      if (!gClient) { loadGis().then(() => signIn(withGmail).then(ok, ko), ko); return; }
      gClient.callback = r => {
        if (r.error) return ko(new Error(r.error));
        token = r.access_token; tokenEnd = Date.now() + r.expires_in * 1000; granted = r.scope || SCOPES;
        if (hasGmail()) wantGmail = false;
        try { localStorage.setItem(LS_TOKEN, JSON.stringify({ t: token, f: tokenEnd, s: SCOPES, g: granted })); localStorage.setItem(LS_OK, "1"); if (hasGmail()) localStorage.setItem("crm_g_gmail", "1"); } catch (e) {}
        banner(); authWaiters.splice(0).forEach(f => f()); ok(token);
        try { if (typeof window.loadAgenda === "function") window.loadAgenda(); } catch (e) {}
      };
      gClient.error_callback = e => ko(new Error(e && e.type === "popup_closed" ? "fenêtre Google fermée" : "connexion Google impossible"));
      const sc = SCOPES + ((withGmail || localStorage.getItem("crm_g_gmail")) ? " " + GMAIL : "");
      gClient.requestAccessToken({ scope: sc, include_granted_scopes: true, prompt: localStorage.getItem(LS_OK) && !withGmail ? "" : "consent" });
    });
  }
  function needAuth() { const e = new Error("Connecte-toi à Google avec le bouton en haut de la page, puis recommence."); e.code = "needs_reauth"; return e; }
  async function gfetch(url, opt = {}, raw) {
    if (!tokenOk()) { banner(); throw needAuth(); }
    const r = await fetch(url, Object.assign({}, opt, { headers: Object.assign({}, opt.headers || {}, { Authorization: "Bearer " + token }) }));
    if (r.status === 401) { token = null; banner(); throw needAuth(); }
    if (!r.ok) { const t = await r.text().catch(() => ""); const e = new Error("Google " + r.status + " : " + t.slice(0, 200)); e.code = r.status === 403 ? "consent_required" : r.status === 404 ? "not_found" : "tool_error"; throw e; }
    if (raw) return r;
    if (r.status === 204) return null;
    return r.json();
  }

  /* ---------- bandeau de connexion ---------- */
  let bar = null;
  function banner() {
    if (!document.body) { document.addEventListener("DOMContentLoaded", banner, { once: true }); return; }
    if (!bar) {
      bar = document.createElement("div"); bar.id = "gbar";
      bar.style.cssText = "position:sticky;top:0;z-index:9999;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;padding:10px 16px;background:#1b2f5e;color:#fff;font:600 14px -apple-system,Segoe UI,Arial,sans-serif";
      document.body.prepend(bar);
    }
    if (tokenOk() && wantGmail) {
      bar.hidden = false; bar.innerHTML = `<span>Pour préparer des brouillons Gmail, autorise Gmail une fois (le CRM n'envoie jamais rien tout seul).</span><button type="button" style="font:inherit;padding:7px 14px;border-radius:8px;border:0;background:#fff;color:#1b2f5e;cursor:pointer">Autoriser Gmail</button><button type="button" data-x style="font:inherit;background:none;border:0;color:#fff;cursor:pointer;text-decoration:underline">plus tard</button><span id="gbarmsg" style="font-weight:400"></span>`;
      bar.querySelector("button").onclick = () => signIn(true).catch(e => { bar.querySelector("#gbarmsg").textContent = e.message; });
      bar.querySelector("[data-x]").onclick = () => { wantGmail = false; banner(); };
      return; }
    if (tokenOk()) { bar.hidden = true; return; }
    bar.hidden = false;
    bar.innerHTML = `<span>${localStorage.getItem(LS_OK) ? "La connexion Google a expiré." : "Pour lire ton Drive, ton agenda et garder tes données, connecte-toi à Google."}</span><button type="button" style="font:inherit;padding:7px 14px;border-radius:8px;border:0;background:#fff;color:#1b2f5e;cursor:pointer">Se connecter à Google</button><span id="gbarmsg" style="font-weight:400"></span>`;
    bar.querySelector("button").onclick = () => signIn().then(() => { store.pull(true); }, e => { bar.querySelector("#gbarmsg").textContent = e.message; });
  }
  setInterval(() => { if (token && !tokenOk()) banner(); }, 60000);

  /* ---------- données : stockage local + espace caché du Drive ---------- */
  // DOCS : { "collection/id": { d: données | null (supprimé), t: horodatage ms } }
  const IDB = "crm-gourdon", IDB_STORE = "kv";
  function idb() { return new Promise((ok, ko) => { const q = indexedDB.open(IDB, 1); q.onupgradeneeded = () => q.result.createObjectStore(IDB_STORE); q.onsuccess = () => ok(q.result); q.onerror = () => ko(q.error); }); }
  async function idbGet(k) { const d = await idb(); return new Promise((ok, ko) => { const r = d.transaction(IDB_STORE).objectStore(IDB_STORE).get(k); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); }); }
  async function idbSet(k, v) { const d = await idb(); return new Promise((ok, ko) => { const tx = d.transaction(IDB_STORE, "readwrite"); tx.objectStore(IDB_STORE).put(v, k); tx.oncomplete = () => ok(); tx.onerror = () => ko(tx.error); }); }

  const store = {
    docs: {}, loaded: null, fileId: null, dirty: false, pushTimer: null, lastPull: 0, listeners: new Set(), status: "",
    async load() {
      if (this.loaded) return this.loaded;
      this.loaded = (async () => { try { this.docs = (await idbGet("docs")) || {}; } catch (e) { this.docs = {}; } })();
      return this.loaded;
    },
    saveLocal() { idbSet("docs", this.docs).catch(() => {}); },
    merge(remote) { let changed = false;
      for (const [k, v] of Object.entries(remote || {})) { const l = this.docs[k]; if (!l || (v.t || 0) > (l.t || 0)) { this.docs[k] = v; changed = true; } }
      return changed; },
    notify() { for (const f of this.listeners) { try { f(); } catch (e) { console.warn(e); } } },
    async findFile() {
      if (this.fileId) return this.fileId;
      const r = await gfetch("https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime)&q=" + encodeURIComponent(`name='${DATA_FILE}'`));
      this.fileId = (r.files && r.files[0] && r.files[0].id) || null; return this.fileId;
    },
    async pull(force) {
      if (!tokenOk()) return;
      if (!force && Date.now() - this.lastPull < 30000) return;
      this.lastPull = Date.now();
      try { await this.load(); const id = await this.findFile(); if (!id) { if (Object.keys(this.docs).length) this.schedulePush(10); return; }
        const r = await gfetch("https://www.googleapis.com/drive/v3/files/" + id + "?alt=media", {}, true); const j = await r.json();
        if (this.merge(j.docs)) { this.saveLocal(); this.notify(); }
        if (this.hasLocalNewer(j.docs)) this.schedulePush(10);
      } catch (e) { console.warn("pull", e); }
    },
    hasLocalNewer(remote) { remote = remote || {}; return Object.entries(this.docs).some(([k, v]) => !remote[k] || (v.t || 0) > (remote[k].t || 0)); },
    schedulePush(ms) { this.dirty = true; clearTimeout(this.pushTimer); this.pushTimer = setTimeout(() => this.push(), ms == null ? 2500 : ms); },
    async push() {
      if (!this.dirty) return; if (!tokenOk()) { banner(); return; }
      try {
        const id = await this.findFile();
        if (id) { try { const r = await gfetch("https://www.googleapis.com/drive/v3/files/" + id + "?alt=media", {}, true); const j = await r.json(); if (this.merge(j.docs)) { this.saveLocal(); this.notify(); } } catch (e) {} }
        const body = JSON.stringify({ format: "crm-gourdon-1", saved: new Date().toISOString(), docs: this.docs });
        const meta = id ? {} : { name: DATA_FILE, parents: ["appDataFolder"], mimeType: "application/json" };
        const bnd = "crm" + Math.random().toString(36).slice(2);
        const multi = `--${bnd}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${bnd}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${bnd}--`;
        const url = id ? "https://www.googleapis.com/upload/drive/v3/files/" + id + "?uploadType=multipart&fields=id" : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id";
        const r = await gfetch(url, { method: id ? "PATCH" : "POST", headers: { "Content-Type": "multipart/related; boundary=" + bnd }, body: multi });
        this.fileId = r.id; this.dirty = false;
      } catch (e) { console.warn("push", e); clearTimeout(this.pushTimer); this.pushTimer = setTimeout(() => this.push(), 30000); }
    },
    get(path) { const x = this.docs[path]; return x && x.d != null ? x.d : null; },
    put(path, data) { this.docs[path] = { d: data == null ? null : JSON.parse(JSON.stringify(data)), t: Date.now() }; this.saveLocal(); this.schedulePush(); queueMicrotask(() => this.notify()); },
    list(coll) { const pre = coll + "/", out = []; for (const [k, v] of Object.entries(this.docs)) if (k.startsWith(pre) && k.indexOf("/", pre.length) < 0 && v.d != null) out.push([k.slice(pre.length), v.d]); return out.sort((a, b) => a[0] < b[0] ? -1 : 1); },
    importAll(obj) { // fichier exporté depuis le CRM de claude.ai
      const docs = obj && obj.docs; if (!docs || typeof docs !== "object") throw new Error("fichier non reconnu");
      const now = Date.now(); let n = 0;
      for (const [k, v] of Object.entries(docs)) { if (!/^[A-Za-z0-9_-]+\/[^/]+$/.test(k)) continue; this.docs[k] = { d: v, t: now }; n++; }
      this.saveLocal(); this.schedulePush(100); this.notify(); return n;
    }
  };
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") store.pull(); else if (store.dirty) store.push(); });
  setInterval(() => { if (document.visibilityState === "visible") store.pull(); }, 120000);
  window.addEventListener("pagehide", () => { if (store.dirty) store.push(); });

  const META = Object.freeze({ fromCache: false, hasPendingWrites: false });
  const snapDoc = (id, data) => ({ id, exists: data != null, metadata: META, data: () => data == null ? undefined : JSON.parse(JSON.stringify(data)) });
  function docRef(path) {
    const id = path.split("/").pop();
    return {
      id, path,
      async get() { await store.load(); return snapDoc(id, store.get(path)); },
      async set(data) { await store.load(); store.put(path, data); },
      async update(data) { await store.load(); store.put(path, Object.assign({}, store.get(path) || {}, data)); },
      async delete() { await store.load(); store.put(path, null); },
      onSnapshot(next, err) { let last; const fire = () => { const d = store.get(path), s = JSON.stringify(d); if (s === last) return; last = s; next(snapDoc(id, d)); };
        store.load().then(() => { store.listeners.add(fire); fire(); }, err); return () => store.listeners.delete(fire); },
      collection(c) { return collRef(path + "/" + c); }
    };
  }
  function collRef(path, lim) {
    const snapColl = () => { let L = store.list(path); if (lim) L = L.slice(0, lim); const docs = L.map(([id, d]) => snapDoc(id, d)); return { docs, size: docs.length, empty: !docs.length, metadata: META, docChanges: () => docs.map((doc, i) => ({ type: "added", doc, oldIndex: -1, newIndex: i })) }; };
    return {
      path,
      doc(id) { return docRef(path + "/" + (id || Math.random().toString(36).slice(2, 12))); },
      limit(n) { return collRef(path, n); },
      async get() { await store.load(); return snapColl(); },
      onSnapshot(next, err) { let last; const fire = () => { const s = JSON.stringify(store.list(path)); if (s === last) return; last = s; next(snapColl()); };
        store.load().then(() => { store.listeners.add(fire); fire(); }, err); return () => store.listeners.delete(fire); }
    };
  }
  const dbApi = Object.freeze({ collection: c => collRef(c), doc: p => docRef(p) });

  /* ---------- Google Drive (lecture seule), Agenda, Gmail ---------- */
  function driveQuery(q) { // syntaxe des connecteurs claude.ai → syntaxe Drive
    return String(q || "")
      .replace(/parentId\s*=\s*'([^']+)'/g, "'$1' in parents")
      .replace(/parentId\s*!=\s*'([^']+)'/g, "not '$1' in parents")
      .replace(/\btitle\s+(contains|=|!=)/g, "name $1");
  }
  const mapFile = f => ({ id: f.id, title: f.name, mimeType: f.mimeType, createdTime: f.createdTime, modifiedTime: f.modifiedTime, viewUrl: f.webViewLink, parentId: (f.parents || [])[0], fileSize: f.size });
  const FIELDS = "nextPageToken,incompleteSearch,files(id,name,mimeType,createdTime,modifiedTime,webViewLink,parents,size)";
  async function fileMeta(id) { return gfetch("https://www.googleapis.com/drive/v3/files/" + id + "?supportsAllDrives=true&fields=id,name,mimeType,size"); }
  async function fileBytes(id, exportMime) {
    const url = exportMime ? "https://www.googleapis.com/drive/v3/files/" + id + "/export?mimeType=" + encodeURIComponent(exportMime)
                           : "https://www.googleapis.com/drive/v3/files/" + id + "?alt=media&supportsAllDrives=true";
    const r = await gfetch(url, {}, true); return new Uint8Array(await r.arrayBuffer());
  }
  const b64 = u8 => { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  let pdfReady = null;
  function loadPdfJs() { if (pdfReady) return pdfReady; pdfReady = new Promise((ok, ko) => { const s = document.createElement("script"); s.src = "../lib/pdf.min.js"; s.onload = () => { pdfjsLib.GlobalWorkerOptions.workerSrc = "../lib/pdf.worker.min.js"; ok(); }; s.onerror = () => { pdfReady = null; ko(new Error("lecteur PDF indisponible")); }; document.head.appendChild(s); }); return pdfReady; }
  async function pdfText(u8) { await loadPdfJs(); const doc = await pdfjsLib.getDocument({ data: u8 }).promise, out = [];
    for (let p = 1; p <= Math.min(doc.numPages, 6); p++) { const pg = await doc.getPage(p), c = await pg.getTextContent(); let line = [], lastY = null;
      for (const it of c.items) { const y = it.transform ? Math.round(it.transform[5]) : null; if (lastY != null && y != null && Math.abs(y - lastY) > 3) { out.push(line.join(" ")); line = []; } line.push(it.str); lastY = y; }
      out.push(line.join(" ")); }
    return out.join("\n"); }

  const cal = id => "https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(id || "primary");
  const rfc = s => { if (!s) return s; if (/[zZ]|[+-]\d\d:\d\d$/.test(s)) return s; const d = new Date(s); return isNaN(d) ? s : d.toISOString(); };
  function evResource(i) {
    const e = {}; ["summary", "description", "location"].forEach(k => { if (i[k] != null) e[k] = i[k]; });
    if (i.startTime) e.start = i.allDay ? { date: String(i.startTime).slice(0, 10) } : { dateTime: i.startTime.length === 19 ? i.startTime : i.startTime, timeZone: "Europe/Paris" };
    if (i.endTime) e.end = i.allDay ? { date: String(i.endTime).slice(0, 10) } : { dateTime: i.endTime, timeZone: "Europe/Paris" };
    return e;
  }
  function utf8b64(s) { return b64(new TextEncoder().encode(s)); }
  function mime(i) {
    const enc = s => /^[\x20-\x7e]*$/.test(s) ? s : "=?UTF-8?B?" + utf8b64(s) + "?=";
    const B1 = "a" + Math.random().toString(36).slice(2), B2 = "b" + Math.random().toString(36).slice(2), B3 = "c" + Math.random().toString(36).slice(2);
    const atts = i.attachments || [], inl = atts.filter(a => a.inline), files = atts.filter(a => !a.inline);
    const H = ["MIME-Version: 1.0"]; if (i.to && i.to.length) H.push("To: " + [].concat(i.to).join(", ")); if (i.cc && i.cc.length) H.push("Cc: " + [].concat(i.cc).join(", ")); H.push("Subject: " + enc(i.subject || ""));
    const wrap = s => s.replace(/.{1,76}/g, "$&\r\n");
    const alt = `Content-Type: multipart/alternative; boundary="${B3}"\r\n\r\n--${B3}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrap(utf8b64(i.body || ""))}` +
      (i.htmlBody ? `--${B3}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrap(utf8b64(i.htmlBody))}` : "") + `--${B3}--\r\n`;
    let rel = alt;
    if (inl.length) rel = `Content-Type: multipart/related; boundary="${B2}"\r\n\r\n--${B2}\r\n${alt}` + inl.map((a, k) => `--${B2}\r\nContent-Type: ${a.mimeType}\r\nContent-Transfer-Encoding: base64\r\nContent-ID: <att${atts.indexOf(a)}>\r\nContent-Disposition: inline; filename="${a.filename}"\r\n\r\n${wrap(a.content)}`).join("") + `--${B2}--\r\n`;
    let body = rel;
    if (files.length) body = `Content-Type: multipart/mixed; boundary="${B1}"\r\n\r\n--${B1}\r\n${rel}` + files.map(a => `--${B1}\r\nContent-Type: ${a.mimeType}; name="${enc(a.filename)}"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename="${enc(a.filename)}"\r\n\r\n${wrap(a.content)}`).join("") + `--${B1}--\r\n`;
    return H.join("\r\n") + "\r\n" + body;
  }
  const b64url = s => utf8b64(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const TOOLS = {
    "Google Drive": {
      async search_files(i) {
        let url = "https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&includeItemsFromAllDrives=true&corpora=allDrives&fields=" + encodeURIComponent(FIELDS) +
          "&pageSize=" + Math.min(1000, i.pageSize || 100) + "&q=" + encodeURIComponent(driveQuery(i.query));
        if (i.pageToken) url += "&pageToken=" + encodeURIComponent(i.pageToken);
        if (i.orderBy) url += "&orderBy=" + encodeURIComponent(i.orderBy.replace(/\btitle\b/, "name"));
        const r = await gfetch(url); return { files: (r.files || []).map(mapFile), nextPageToken: r.nextPageToken || undefined };
      },
      async read_file_content(i) {
        const m = await fileMeta(i.fileId);
        if (m.mimeType === "application/vnd.google-apps.document") return { fileContent: new TextDecoder().decode(await fileBytes(i.fileId, "text/plain")) };
        if (m.mimeType === "application/vnd.google-apps.spreadsheet") return { fileContent: new TextDecoder().decode(await fileBytes(i.fileId, "text/csv")) };
        const u8 = await fileBytes(i.fileId);
        if (m.mimeType === "application/pdf" || /\.pdf$/i.test(m.name || "")) return { fileContent: await pdfText(u8) };
        return { fileContent: new TextDecoder().decode(u8) };
      },
      async download_file_content(i) { return { content: b64(await fileBytes(i.fileId, i.exportMimeType)) }; }
    },
    "Google Calendar": {
      async list_events(i) {
        let url = cal(i.calendarId) + "/events?singleEvents=true&maxResults=" + Math.min(2500, i.pageSize || 250);
        if (i.startTime) url += "&timeMin=" + encodeURIComponent(rfc(i.startTime)); if (i.endTime) url += "&timeMax=" + encodeURIComponent(rfc(i.endTime));
        if (i.orderBy) url += "&orderBy=" + encodeURIComponent(i.orderBy);
        const r = await gfetch(url); return { events: r.items || [] };
      },
      async create_event(i) { return gfetch(cal(i.calendarId) + "/events?sendUpdates=none", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(evResource(i)) }); },
      async update_event(i) { return gfetch(cal(i.calendarId) + "/events/" + encodeURIComponent(i.eventId) + "?sendUpdates=none", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(evResource(i)) }); },
      async delete_event(i) { try { await gfetch(cal(i.calendarId) + "/events/" + encodeURIComponent(i.eventId) + "?sendUpdates=none", { method: "DELETE" }); } catch (e) { if (e.code !== "not_found") throw e; } return { deleted: true }; }
    },
    "Gmail": {
      async create_draft(i) {
        if (!hasGmail()) { wantGmail = true; banner(); const e = new Error("Autorise Gmail avec le bouton bleu en haut de la page, puis reclique."); e.code = "consent_required"; throw e; }
        const r = await gfetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: { raw: b64url(mime(i)) } }) });
        return { draft: r, viewUrl: "https://mail.google.com/mail/u/0/#drafts?compose=" + (r.message && r.message.id) };
      }
    }
  };
  const mcpApi = Object.freeze({
    async callTool(server, tool, input) {
      const f = TOOLS[server] && TOOLS[server][tool]; if (!f) { const e = new Error("outil inconnu : " + server + " / " + tool); e.code = "not_in_manifest"; throw e; }
      return { payload: await f(input || {}) };
    }
  });
  const userApi = Object.freeze({ isOwner: () => true, canEdit: () => true, can: async () => true, id: async () => "nicolas", me: async () => ({ id: "nicolas", name: "Nicolas" }) });

  window.claude = Object.freeze({
    use: async name => name === "db" ? (await store.load(), dbApi) : name === "mcp" ? mcpApi : name === "user" ? userApi : null
  });
  window.CRM_ONLINE = { store, signIn, tokenOk };

  loadGis().catch(() => {});
  banner();
  if (tokenOk()) store.load().then(() => store.pull(true));
})();
