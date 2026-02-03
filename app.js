/* app.js */
(function () {
  const API_ENDPOINT =
    "https://apim-reset-pwd-fnaim.azure-api.net/reset-password/api/ResetPassword";

  let captchaToken = "";  // jeton Turnstile

  const btn = document.getElementById("submitBtn");
  const msg = document.getElementById("message");

  // callback Turnstile
  window.onCaptchaSuccess = function (token) {
    captchaToken = token;
    btn.disabled = false;
    btn.classList.add("enabled");
  };

  btn.addEventListener("click", async () => {
    if (btn.disabled) return;

    const login = document.getElementById("userPrincipalName").value.trim();
    const email = document.getElementById("emailToVerify").value.trim();

    if (!login || !email) { show("Veuillez remplir tous les champs.", "error"); return; }
    if (!captchaToken)     { show("CAPTCHA non validé.", "error"); return; }

    btn.disabled = true;
    show("Envoi en cours…", "");

    try {
      const resp = await fetch(API_ENDPOINT, {
        method : "POST",
        headers: {
          "Content-Type"          : "application/json",
          "cf-turnstile-response" : captchaToken     // ← attendu par la Function
        },
        body: JSON.stringify({ userPrincipalName: login, emailToVerify: email })
      });

      if (resp.status === 202)
        show("Demande enregistrée ! Vérifiez votre boîte mail.", "success");
      else if (resp.status === 429)
        show("Trop de tentatives ; réessayez dans une minute.", "error");
      else if (resp.status === 403)
        show("Validation CAPTCHA échouée. Rechargez la page.", "error");
      else
        show(`Erreur ${resp.status}`, "error");
    } catch (e) {
      show("Erreur réseau : " + e.message, "error");
    } finally {
      btn.disabled = true;
      btn.classList.remove("enabled");
      captchaToken = "";
      if (window.turnstile) turnstile.reset();
    }
  });

  function show(text, type) {
    msg.textContent = text;
    msg.className = type;
  }
})();
