// reset.js  v3 – 09-02-2026
(() => {
  /* ---------- constantes ---------- */
  const API_FINAL = "https://apim-reset-pwd-fnaim.azure-api.net/reset-password/api/FinalizeReset";
  const qs = new URLSearchParams(window.location.search);

  // Valeurs depuis la query (si fournies dans le lien)
  const tokenQS = (qs.get("token")  || "").trim();
  const upnQS   = (qs.get("upn")    || "").trim();
  const emailQS = (qs.get("email")  || qs.get("mail") || "").trim();

  /* ---------- helpers UI ---------- */
  const $ = (id) => document.getElementById(id);
  const show = (txt, type) => {
    const m = $("message");
    if (!m) return;
    m.style.display = "block";
    m.textContent   = txt;
    const ok  = type === "success";
    const err = type === "error";
    m.style.background = ok ? "#e6ffed" : err ? "#ffe6e6" : "#FFFACD";
    m.style.border     = ok ? "2px solid #2ecc71" : err ? "2px solid #cc0000" : "2px solid #FFD700";
    m.style.color      = ok ? "#2d5f3d" : err ? "#cc0000" : "#333";
  };

  const validatePwd = (p1, p2) => {
    if (!p1 || !p2) return "Veuillez saisir et confirmer votre mot de passe.";
    if (p1 !== p2)  return "Les deux mots de passe ne correspondent pas.";
    if (p1.length < 10) return "Le mot de passe doit contenir au moins 10 caractères.";
    return null;
  };

  /* ---------- formulaire ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    // Contrôle du token (obligatoire)
    if (!tokenQS) {
      show("Lien invalide ou expiré (token manquant).", "error");
      const btn = $("submitBtn"); if (btn) btn.disabled = true;
      return;
    }

    // Pré-remplissage si les champs existent dans la page
    const upnInput   = $("upn");
    const emailInput = $("email");

    if (upnInput && !upnInput.value && upnQS)     upnInput.value = upnQS;
    if (emailInput && !emailInput.value && emailQS) emailInput.value = emailQS;

    $("resetForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const p1 = $("newPassword")?.value.trim() || "";
      const p2 = $("confirmPassword")?.value.trim() || "";

      // UPN & email obligatoires (depuis champ si présent, sinon depuis la query)
      const upn   = (upnInput?.value || upnQS || "").trim();
      const email = (emailInput?.value || emailQS || "").trim();

      if (!upn)   { show("UPN manquant.",   "error"); return; }
      if (!email) { show("Adresse e‑mail manquante.", "error"); return; }

      const err = validatePwd(p1, p2);
      if (err) { show(err, "error"); return; }

      const submitBtn = $("submitBtn");
      if (submitBtn) submitBtn.disabled = true;
      show("Envoi en cours…", "info");

      try {
        const payload = { token: tokenQS, upn, email, newPassword: p1 };
        const res = await fetch(API_FINAL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-from-frontend": "resetpw.fnaim.fr"
          },
          body: JSON.stringify(payload)
        });

        const text = await res.text().catch(() => "");
        if (res.status === 202 || res.ok) {
          show("Mot de passe mis à jour (demande acceptée).", "success");
        } else {
          // Remonte le message exact de l’API s’il existe
          show(text || `Échec (${res.status}).`, "error");
        }
      } catch (e) {
        show("Erreur réseau : " + (e?.message || e), "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
})();
