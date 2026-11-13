"use strict";

// Configure com o número oficial, incluindo o código do país e somente dígitos.
const WHATSAPP_PHONE = "";

const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#navegacao-principal");

if (menuToggle && primaryNavigation) {
  const menuLabel = menuToggle.querySelector(".visually-hidden");

  function setMenuOpen(isOpen) {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    primaryNavigation.classList.toggle("is-open", isOpen);

    if (menuLabel) {
      menuLabel.textContent = isOpen ? "Fechar menu" : "Abrir menu";
    }
  }

  function isMenuToggleVisible() {
    return !menuToggle.hidden
      && menuToggle.getClientRects().length > 0
      && window.getComputedStyle(menuToggle).visibility === "visible";
  }

  document.documentElement.classList.add("menu-ready");
  menuToggle.hidden = false;

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    setMenuOpen(isOpen);
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("a")) {
      return;
    }

    const wasKeyboardActivation = event.detail === 0;
    setMenuOpen(false);

    if (wasKeyboardActivation && isMenuToggleVisible()) {
      window.requestAnimationFrame(() => {
        if (isMenuToggleVisible()) {
          menuToggle.focus({ preventScroll: true });
        }
      });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);

      if (isMenuToggleVisible()) {
        menuToggle.focus({ preventScroll: true });
      }
    }
  });
}

const yearElement = document.querySelector("#current-year");

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

const quoteForm = document.querySelector("#quote-form");

if (quoteForm instanceof HTMLFormElement) {
  const nameInput = quoteForm.elements.namedItem("name");
  const phoneInput = quoteForm.elements.namedItem("phone");
  const serviceInput = quoteForm.elements.namedItem("service");
  const descriptionInput = quoteForm.elements.namedItem("description");
  const formStatus = document.querySelector("#quote-form-status");

  if (
    nameInput instanceof HTMLInputElement
    && phoneInput instanceof HTMLInputElement
    && serviceInput instanceof HTMLSelectElement
    && descriptionInput instanceof HTMLTextAreaElement
    && formStatus instanceof HTMLElement
  ) {
    const formFields = [nameInput, phoneInput, serviceInput, descriptionInput];

    quoteForm.addEventListener("input", (event) => {
      if (event.target instanceof HTMLElement && formFields.includes(event.target)) {
        event.target.setCustomValidity("");
        formStatus.textContent = "";
      }
    });

    quoteForm.addEventListener("change", (event) => {
      if (event.target instanceof HTMLElement && formFields.includes(event.target)) {
        event.target.setCustomValidity("");
        formStatus.textContent = "";
      }
    });

    quoteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      formFields.forEach((field) => field.setCustomValidity(""));

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const phoneDigits = phone.replace(/\D/g, "");
      const hasInvalidPhoneCharacters = /[^\d\s()+.-]/.test(phone);
      const service = serviceInput.value;
      const description = descriptionInput.value.trim();

      if (name.length < 2 || name.length > 100) {
        nameInput.setCustomValidity("Informe um nome com pelo menos 2 caracteres.");
      }

      if (hasInvalidPhoneCharacters || phoneDigits.length < 10 || phoneDigits.length > 15) {
        phoneInput.setCustomValidity("Informe um telefone válido, incluindo o DDD.");
      }

      if (!service) {
        serviceInput.setCustomValidity("Selecione o tipo de serviço.");
      }

      if (description.length < 10 || description.length > 1000) {
        descriptionInput.setCustomValidity("Descreva sua necessidade com 10 a 1.000 caracteres.");
      }

      if (!quoteForm.reportValidity()) {
        formStatus.textContent = "Revise os campos destacados antes de continuar.";
        return;
      }

      const whatsappPhone = WHATSAPP_PHONE.trim();

      if (!/^[1-9]\d{7,14}$/.test(whatsappPhone)) {
        formStatus.textContent = "O atendimento pelo WhatsApp ainda não está configurado com um número válido. Defina WHATSAPP_PHONE em js/script.js no formato internacional, com o código do país e somente dígitos.";
        return;
      }

      const message = [
        "Olá! Gostaria de solicitar um orçamento com a ClimaPro.",
        "",
        `Nome: ${name}`,
        `Telefone: ${phone}`,
        `Tipo de serviço: ${service}`,
        `Descrição: ${description}`,
      ].join("\n");
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
      const whatsappWindow = window.open(whatsappUrl, "_blank");

      if (!whatsappWindow) {
        formStatus.textContent = "Não foi possível abrir o WhatsApp. Verifique se o navegador bloqueou a nova janela e tente novamente.";
        return;
      }

      whatsappWindow.opener = null;
      formStatus.textContent = "O WhatsApp foi aberto com a mensagem preparada. Confira os dados e envie por lá para concluir sua solicitação.";
    });
  }
}
