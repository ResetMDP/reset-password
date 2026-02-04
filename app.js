(function () {
  const APIM_URL = "https://apim-reset-pwd-fnaim.azure-api.net/reset-password/api/ResetPassword";

  window.captchaToken = null;

  // Cloudflare Turnstile callback
  window.onCaptchaSuccess = function (token) {
    window.captchaToken = token;
    const btn = document.getElementById("submitBtn");
    if (btn) btn.disabled = !Boolean(token);
  };

  // Submit
  window.resetPassword = async function () {
    const upn = document.getElementById("userPrincipalName")?.value.trim();
    const email = document.getElementById("emailToVerify")?.value.trim();
    const messageDiv = document.getElementById("message");
    const btn = document.getElementById("submitBtn");

    if (!window.captchaToken) {
      showMessage("Veuillez valider le CAPTCHA.", "error");
      return;
    }

    if (!upn || !email || !upn.includes("@") || !email.includes("@")) {
      showMessage("Veuillez saisir des adresses valides.", "error");
      return;
    }

    try {
      btn.disabled = true;
      showMessage("Envoi en cours...", "info");

      const res = await fetch(APIM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrincipalName: upn,
          emailToVerify: email,
          captchaToken: window.captchaToken
        })
      });

      if (res.ok) {
        showMessage("Votre demande est prise en compte. Vérifiez votre email.", "success");
      } else if (res.status === 403) {
        showMessage("CAPTCHA invalide. Veuillez réessayer.", "error");
      } else {
        showMessage("Erreur serveur : " + res.status, "error");
      }
    } catch (e) {
      showMessage("Erreur réseau.", "error");
    } finally {
      btn.disabled = false;
    }
  };

  function showMessage(text, type) {
    const el = document.getElementById("message");
    el.style.display = "block";
    el.textContent = text;

    if (type === "success") {
      el.style.background = "#F0FFF0";
      el.style.color = "#2d5f3d";
      el.style.border = "2px solid #7FC39A";
    } else if (type === "info") {
      el.style.background = "#FFFACD";
      el.style.color = "#333";
      el.style.border = "2px solid #FFD700";
    } else {
      el.style.background = "#ffe6e6";
      el.style.color = "#cc0000";
      el.style.border = "2px solid #cc0000";
    }
  }
})();
