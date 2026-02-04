// --- app.js (TEST 1) ---
// Objectif : tracer le token Turnstile reçu côté client,
// et tracer le payload JSON envoyé au backend APIM.
// Aucun changement de logique serveur ici.

(function () {
  // Remplace l'URL ci-dessous par ton endpoint APIM si besoin
  const APIM_URL = "https://apim-reset-pwd-fnaim.azure-api.net/reset-password/api/ResetPassword";

  // Stocke le token globalement pour qu'on le voie dans la console
  window.captchaToken = null;

  // Callback nommé par data-callback="onCaptchaSuccess" dans index.html
  window.onCaptchaSuccess = function onCaptchaSuccess(token) {
    window.captchaToken = token || null;

    // LOG 1 : le token Turnstile tel que reçu côté client
    if (token && typeof token === "string") {
      console.log("[TEST1] Turnstile token (client) =", token.substring(0, 16) + "...", "(len=" + token.length + ")");
    } else {
      console.log("[TEST1] Turnstile token (client) = null/undefined");
    }

    // Active le bouton seulement si on a un token
    const btn = document.getElementById('submitBtn');
    if (btn) btn.disabled = !Boolean(window.captchaToken);
  };

  // Bouton/submit
  window.resetPassword = async function resetPassword() {
    const upn = (document.getElementById('userPrincipalName')?.value || "").trim();
    const email = (document.getElementById('emailToVerify')?.value || "").trim();
    const messageDiv = document.getElementById('message');
    const btn = document.getElementById('submitBtn');

    // Sanity checks client légers
    if (!window.captchaToken) {
      showMessage("Veuillez valider le CAPTCHA.", "warn");
      return;
    }
    if (!upn || !email || !upn.includes("@") || !email.includes("@")) {
      showMessage("Veuillez saisir un login et un email valides.", "warn");
      return;
    }

    // LOG 2 : payload tel qu'on va l'envoyer au backend
    console.log("[TEST1] Payload envoyé au backend =", {
      userPrincipalName: upn,
      emailToVerify: email,
      captchaToken: window.captchaToken ? (window.captchaToken.substring(0, 16) + "...") : null
    });

    try {
      btn.disabled = true;
      showMessage("Demande en cours...", "info");

      const res = await fetch(APIM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrincipalName: upn,
          emailToVerify: email,
          captchaToken: window.captchaToken
        })
      });

      // On ne teste pas le backend ici; on trace simplement le status
      console.log("[TEST1] Réponse APIM/Function => HTTP", res.status);
      if (res.ok) {
        showMessage("Demande envoyée. (TEST 1 : front OK)", "success");
      } else {
        showMessage("Réponse serveur: HTTP " + res.status + " (TEST 1)", "error");
      }
    } catch (e) {
      console.error("[TEST1] Erreur fetch:", e);
      showMessage("Erreur réseau. (TEST 1)", "error");
    } finally {
      btn.disabled = false;
    }
  };

  function showMessage(text, type) {
    const el = document.getElementById('message');
    if (!el) return;
    el.style.display = "block";
    el.textContent = text;
    el.style.border = "2px solid";
    if (type === "success") {
      el.style.backgroundColor = "#F0FFF0";
      el.style.borderColor = "#7FC39A";
      el.style.color = "#2d5f3d";
    } else if (type === "warn") {
      el.style.backgroundColor = "#fff4ce";
      el.style.borderColor = "#FFD700";
      el.style.color = "#8a6d3b";
    } else if (type === "error") {
      el.style.backgroundColor = "#ffe6e6";
      el.style.borderColor = "#cc0000";
      el.style.color = "#cc0000";
    } else {
      el.style.backgroundColor = "#FFFACD";
      el.style.borderColor = "#FFD700";
      el.style.color = "#333";
    }
  }
})();

