// reset.js  v2 – 06-02-2026
(() => {
  /* ---------- constantes ---------- */
  const API_FINAL = "https://apim-reset-pwd-fnaim.azure-api.net/reset-password/api/FinalizeReset";
  const qs   = new URLSearchParams(window.location.search);
  const token = (qs.get("token") || "").trim();
  const upn   = (qs.get("upn")   || "").trim();

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

  const validate = (p1, p2) => {
    if (!p1 || !p2) return "Veuillez saisir et confirmer votre mot de passe.";
    if (p1 !== p2)  return "Les deux mots de passe ne correspondent pas.";
    if (p1.length < 10) return "Le mot de passe doit contenir au moins 10 caractères.";
    return null;
  };

  /* ---------- formulaire ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
      show("Lien invalide ou expiré.", "error");
      $("submitBtn").disabled = true;
      return;
    }

    $("resetForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const p1 = $("newPassword").value.trim();
      const p2 = $("confirmPassword").value.trim();
      const err = validate(p1, p2);
      if (err) { show(err, "error"); return; }

      $("submitBtn").disabled = true;
      show("Envoi en cours…", "info");

      try {
        const res = await fetch(API_FINAL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, upn, newPassword: p1 })
        });

        show("Votre demande a été prise en compte.", res.ok ? "success" : "info");
      } catch (e) {
        show("Erreur réseau : " + e.message, "error");
      } finally {
        $("submitBtn").disabled = false;
      }
    });
  });
})();
