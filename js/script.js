
/*
 * CONFIGURAÇÃO
 * URL do aplicativo da web publicado no Google Apps Script.
 */
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbxv0asHko6eKK31ZxglRX5Hf776jsXZE1AV5AVCbOKK2VbULD8NA3oNbVUuEPaqKP9I/exec";

const openButtons = document.querySelectorAll("[data-open]");
const formPanels = document.querySelectorAll(".form-panel");
const closeButtons = document.querySelectorAll("[data-close]");
const guestForms = document.querySelectorAll(".guest-form");

function closeAllForms() {
  formPanels.forEach((panel) => {
    panel.hidden = true;
  });
}

openButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeAllForms();

    const panel = document.getElementById(button.dataset.open);

    if (panel) {
      panel.hidden = false;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });

      const firstInput = panel.querySelector(
        'input:not([type="hidden"]), textarea'
      );

      if (firstInput) {
        firstInput.focus({ preventScroll: true });
      }
    }
  });
});

closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeAllForms();

    const confirmation = document.getElementById("confirmacao");
    if (confirmation) {
      confirmation.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

guestForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const status = form.querySelector(".form-status");
    const submitButton = form.querySelector('button[type="submit"]');

    if (!FORM_ENDPOINT || FORM_ENDPOINT === "COLE_SUA_URL_AQUI") {
      status.textContent = "O formulário ainda não está configurado.";
      return;
    }

    if (form.dataset.formType === "presenca") {
      const checkedMusic = form.querySelectorAll(
        'input[name="musicas"]:checked'
      );

      if (checkedMusic.length === 0) {
        status.textContent = "Escolha pelo menos um estilo musical.";
        form.querySelector('input[name="musicas"]').focus();
        return;
      }
    }

    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    status.textContent = "Enviando sua resposta...";

    try {
      const formData = new FormData(form);

      // Identifica o tipo de formulário.
      formData.set("tipo", form.dataset.formType);

      // Junta as opções musicais para que todas sejam salvas.
      const musicas = formData.getAll("musicas");
      formData.delete("musicas");

      if (musicas.length > 0) {
        formData.set("musicas", musicas.join(", "));
      }

      // Envia os dados ao Apps Script.
      // O modo no-cors impede a leitura da resposta do Google,
      // mas permite realizar a requisição sem depender do CORS.
      await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new URLSearchParams(formData),
        mode: "no-cors"
      });

      status.textContent =
        "Resposta enviada! Se houver algum problema, avisaremos.";
      form.reset();
    } catch (error) {
      status.textContent =
        "Não foi possível enviar. Confira sua conexão e tente novamente.";
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
    }
  });
});
