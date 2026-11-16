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
