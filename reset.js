// reset.js — logique de la page reset.html (soumission du nouveau mot de passe)

(() => {
  const APIM_URL_FINAL = "https://apim-reset-pwd-fnaim.azure-api.net/reset-password/api/FinalizeReset";

  // --- utilitaires
  const $ = (id) => document.getElementById(id);

  function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("token") || "").trim();
  }

  function showMessage(text, type = "info") {
    const el = $("message");
    if (!el) return;
    el.style.display = "block";
    el.textContent = text;

    if (type === "success") {
      el.style.background = "#F0FFF0";
      el.style.color = "#2d5f3d";
      el.style.border = "2px solid #7FC39A";
    } else if (type === "error") {
      el.style.background = "#ffe6e6";
      el.style.color = "#cc0000";
      el.style.border = "2px solid #cc0000";
    } else {
      el.style.background = "#FFFACD";
      el.style.color = "#333";
      el.style.border = "2px solid #FFD700";
    }
  }

  function validatePassword(pw, confirm) {
    if (!pw || !confirm) return "Veuillez saisir et confirmer votre mot de passe.";
    if (pw !== confirm) return "Les deux mots de passe ne correspondent pas.";
    // règle simple (tu pourras l’ajuster) : 10+ caractères
    if (pw.length < 10) return "Le mot de passe doit contenir au moins 10 caractères.";
    return null;
  }

  async function submitNewPassword(token, password) {
    const payload = {
      resetToken: token,
      newPassword: password
    };

    const res = await fetch(APIM_URL_FINAL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-From-Frontend": "resetpw.fnaim.fr"
      },
      body: JSON.stringify(payload)
    });

    return res;
  }

  // --- initialisation page
  document.addEventListener("DOMContentLoaded", () => {
    const token = getTokenFromUrl();
    const form = $("resetForm");
    const btn = $("submitBtn");

    if (!token) {
      showMessage("Lien invalide ou token manquant.", "error");
      if (btn) btn.disabled = true;
      return;
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!btn) return;

        const pw = $("newPassword")?.value || "";
        const confirm = $("confirmPassword")?.value || "";

        const err = validatePassword(pw, confirm);
        if (err) {
          showMessage(err, "error");
          return;
        }

        try {
          btn.disabled = true;
          showMessage("Envoi en cours...", "info");

          const res = await submitNewPassword(token, pw);

          if (res.ok) {
            showMessage("Votre demande a été prise en compte. Veuillez vous reconnecter.", "success");
          } else {
            // on reste générique (pas d’indices)
            showMessage("Votre demande a été prise en compte.", "success");
          }
        } catch {
          showMessage("Votre demande a été prise en compte.", "success");
        } finally {
          btn.disabled = false;
        }
      });
    }
  });
})();