/* =========================================================
   FIRST FIVE YEARS
   main.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     1. REVEAL ANIMATIONS
     ======================================================= */

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("in");
    });
  }


  /* =======================================================
     2. DIAGRAM ANIMATION
     ======================================================= */

  const gapFigures = document.querySelectorAll(".gapfig");

  if ("IntersectionObserver" in window) {
    const gapObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.25
      }
    );

    gapFigures.forEach((figure) => {
      gapObserver.observe(figure);
    });
  } else {
    gapFigures.forEach((figure) => {
      figure.classList.add("in");
    });
  }


  /* =======================================================
     3. JOURNEY ANIMATION
     ======================================================= */

  const journeys = document.querySelectorAll(".journey");

  if ("IntersectionObserver" in window) {
    const journeyObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("journey-active");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.25
      }
    );

    journeys.forEach((journey) => {
      journeyObserver.observe(journey);
    });
  } else {
    journeys.forEach((journey) => {
      journey.classList.add("journey-active");
    });
  }


  /* =======================================================
     4. SMOOTH INTERNAL LINKS
     ======================================================= */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });

      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }

      target.focus({
        preventScroll: true
      });
    });
  });


  /* =======================================================
     5. FORMSPREE FORM
     ======================================================= */

  const forms = document.querySelectorAll("[data-form]");

  forms.forEach((form) => {

    const endpoint = window.FFY_FORM_ENDPOINT;

    const submitButton = form.querySelector(
      'button[type="submit"], input[type="submit"]'
    );

    const statusMessage = form.querySelector(".form-msg");

    /*
     * If Formspree has not yet been configured,
     * don't leave a broken form visible.
     */

    if (
      !endpoint ||
      endpoint === "LISAA_ENDPOINT_TAHAN" ||
      !endpoint.startsWith("https://formspree.io/")
    ) {
      form.hidden = true;
      return;
    }


    /* -----------------------------------------------------
       Validation helpers
       ----------------------------------------------------- */

    const getErrorElement = (field) => {
      const describedBy = field.getAttribute("aria-describedby");

      if (!describedBy) return null;

      const ids = describedBy.split(/\s+/);

      for (const id of ids) {
        const element = document.getElementById(id);

        if (element && element.classList.contains("field-error")) {
          return element;
        }
      }

      return null;
    };


    const clearFieldError = (field) => {
      field.removeAttribute("aria-invalid");

      const errorElement = getErrorElement(field);

      if (errorElement) {
        errorElement.textContent = "";
      }
    };


    const setFieldError = (field, message) => {
      field.setAttribute("aria-invalid", "true");

      const errorElement = getErrorElement(field);

      if (errorElement) {
        errorElement.textContent = message;
      }
    };


    const validateField = (field) => {
      clearFieldError(field);

      if (field.disabled) return true;

      if (field.type === "checkbox" && field.required) {
        if (!field.checked) {
          setFieldError(
            field,
            "Hyväksy tämä kohta ennen viestin lähettämistä."
          );

          return false;
        }

        return true;
      }


      if (field.validity.valueMissing) {
        setFieldError(
          field,
          "Täytä tämä kenttä."
        );

        return false;
      }


      if (field.validity.typeMismatch) {
        if (field.type === "email") {
          setFieldError(
            field,
            "Tarkista sähköpostiosoite."
          );
        } else {
          setFieldError(
            field,
            "Tarkista kentän sisältö."
          );
        }

        return false;
      }


      if (field.validity.tooShort) {
        setFieldError(
          field,
          `Kirjoita vähintään ${field.minLength} merkkiä.`
        );

        return false;
      }


      if (field.validity.tooLong) {
        setFieldError(
          field,
          `Kirjoita enintään ${field.maxLength} merkkiä.`
        );

        return false;
      }


      if (field.validity.patternMismatch) {
        setFieldError(
          field,
          "Tarkista kentän sisältö."
        );

        return false;
      }


      return true;
    };


    /* -----------------------------------------------------
       Clear errors when user fixes a field
       ----------------------------------------------------- */

    const fields = form.querySelectorAll(
      "input:not(.hp), textarea, select"
    );

    fields.forEach((field) => {
      const eventName =
        field.type === "checkbox" ||
        field.tagName === "SELECT"
          ? "change"
          : "input";

      field.addEventListener(eventName, () => {
        if (field.getAttribute("aria-invalid") === "true") {
          validateField(field);
        }
      });
    });


    /* -----------------------------------------------------
       Submission
       ----------------------------------------------------- */

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (statusMessage) {
        statusMessage.textContent = "";
      }


      /*
       * Honeypot.
       * Bots often fill hidden fields.
       */

      const honeypot = form.querySelector(".hp");

      if (honeypot && honeypot.value.trim() !== "") {
        return;
      }


      /*
       * Validate every field.
       */

      let formIsValid = true;
      let firstInvalidField = null;

      fields.forEach((field) => {
        const valid = validateField(field);

        if (!valid) {
          formIsValid = false;

          if (!firstInvalidField) {
            firstInvalidField = field;
          }
        }
      });


      if (!formIsValid) {
        if (statusMessage) {
          statusMessage.textContent =
            "Tarkista lomakkeessa olevat tiedot.";
        }

        if (firstInvalidField) {
          firstInvalidField.focus();
        }

        return;
      }


      /*
       * Loading state.
       */

      const originalButtonText = submitButton
        ? submitButton.textContent
        : "";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-disabled", "true");
        submitButton.textContent = "Lähetetään…";
      }

      if (statusMessage) {
        statusMessage.textContent = "Lähetetään viestiä…";
      }


      try {

        const formData = new FormData(form);

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });


        /* -------------------------------------------------
           SUCCESS
           ------------------------------------------------- */

        if (response.ok) {

          form.reset();

          fields.forEach((field) => {
            clearFieldError(field);
          });

          const successMessage =
            form.dataset.success ||
            "Kiitos. Viestisi on lähetetty.";

          if (statusMessage) {
            statusMessage.textContent = successMessage;
            statusMessage.focus?.();
          }

          return;
        }


        /* -------------------------------------------------
           FORMSPREE VALIDATION ERROR
           ------------------------------------------------- */

        let data = null;

        try {
          data = await response.json();
        } catch (error) {
          data = null;
        }


        if (data && Array.isArray(data.errors)) {

          const messages = data.errors
            .map((error) => error.message)
            .filter(Boolean);

          if (statusMessage) {
            statusMessage.textContent =
              messages.length > 0
                ? messages.join(" ")
                : "Viestin lähettäminen ei onnistunut. Tarkista tiedot ja yritä uudelleen.";
          }

        } else {

          if (statusMessage) {
            statusMessage.textContent =
              "Viestin lähettäminen ei onnistunut. Yritä hetken kuluttua uudelleen.";
          }

        }

      } catch (error) {

        /*
         * Network failure, offline user, DNS failure etc.
         */

        if (statusMessage) {
          statusMessage.textContent =
            "Yhteys katkesi eikä viestiä voitu lähettää. Tarkista verkkoyhteys ja yritä uudelleen.";
        }

      } finally {

        /*
         * Restore button.
         */

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-disabled");
          submitButton.textContent = originalButtonText;
        }

      }

    });

  });


  /* =======================================================
     6. EXTERNAL LINKS
     ======================================================= */

  document.querySelectorAll('a[target="_blank"]').forEach((link) => {

    const rel = new Set(
      (link.getAttribute("rel") || "")
        .split(/\s+/)
        .filter(Boolean)
    );

    rel.add("noopener");
    rel.add("noreferrer");

    link.setAttribute(
      "rel",
      Array.from(rel).join(" ")
    );

  });

});
