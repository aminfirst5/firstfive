/* =========================================================
   FIRST FIVE YEARS
   main.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     1. REVEAL ANIMATIONS
     ======================================================= */

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const revealElements = document.querySelectorAll(".reveal");

  if (
    !reduceMotion &&
    "IntersectionObserver" in window &&
    revealElements.length
  ) {
    document.documentElement.classList.add("reveal-ready");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -8% 0px"
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
     2. SMOOTH INTERNAL LINKS
     ======================================================= */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {

    link.addEventListener("click", (event) => {

      const href = link.getAttribute("href");

      if (!href || href === "#") {
        return;
      }

      const target = document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });

      /*
       * Vie myös näppäimistöfokuksen kohteeseen.
       * Tämä auttaa erityisesti näppäimistö- ja
       * ruudunlukijakäyttäjiä.
       */

      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }

      target.focus({
        preventScroll: true
      });

      /*
       * Päivitetään URL-hash ilman uutta latausta.
       */

      if (history.pushState) {
        history.pushState(null, "", href);
      }

    });

  });


  /* =======================================================
     3. FORMWARD FORM
     ======================================================= */

  const forms = document.querySelectorAll("[data-form]");

  forms.forEach((form) => {

    const endpoint = window.FFY_FORM_ENDPOINT || "";

    const submitButton = form.querySelector(
      'button[type="submit"], input[type="submit"]'
    );

    const statusMessage = form.querySelector(".form-msg");


    /* -----------------------------------------------------
       Endpoint validation
       ----------------------------------------------------- */

    const configured =
      endpoint &&
      endpoint !== "LISAA_ENDPOINT_TAHAN" &&
      endpoint !== "#";

    const allowedEndpoint =
      endpoint.startsWith(
        "https://forms.formward.eu/"
      );


    if (!configured || !allowedEndpoint) {
      form.hidden = true;
      return;
    }

    form.hidden = false;


    /* =====================================================
       4. VALIDATION HELPERS
       ===================================================== */

    const getErrorElement = (field) => {

      const describedBy =
        field.getAttribute("aria-describedby");

      if (!describedBy) {
        return null;
      }

      const ids =
        describedBy
          .split(/\s+/)
          .filter(Boolean);

      for (const id of ids) {

        const element =
          document.getElementById(id);

        if (
          element &&
          element.classList.contains("field-error")
        ) {
          return element;
        }

      }

      return null;
    };


    const clearFieldError = (field) => {

      field.removeAttribute("aria-invalid");

      const errorElement =
        getErrorElement(field);

      if (errorElement) {
        errorElement.textContent = "";
      }

    };


    const setFieldError = (field, message) => {

      field.setAttribute(
        "aria-invalid",
        "true"
      );

      const errorElement =
        getErrorElement(field);

      if (errorElement) {
        errorElement.textContent = message;
      }

    };


    const validateField = (field) => {

      clearFieldError(field);

      if (field.disabled) {
        return true;
      }


      /* Checkbox */

      if (
        field.type === "checkbox" &&
        field.required
      ) {

        if (!field.checked) {

          setFieldError(
            field,
            "Hyväksy tämä kohta ennen viestin lähettämistä."
          );

          return false;
        }

        return true;
      }


      /* Empty required field */

      if (field.validity.valueMissing) {

        if (field.id === "c-name") {

          setFieldError(
            field,
            "Kirjoita nimesi."
          );

        } else if (field.id === "c-email") {

          setFieldError(
            field,
            "Kirjoita sähköpostiosoitteesi."
          );

        } else if (field.id === "c-msg") {

          setFieldError(
            field,
            "Kirjoita viesti."
          );

        } else {

          setFieldError(
            field,
            "Täytä tämä kenttä."
          );

        }

        return false;
      }


      /* Invalid email etc. */

      if (field.validity.typeMismatch) {

        if (field.type === "email") {

          setFieldError(
            field,
            "Tarkista sähköpostiosoitteen muoto."
          );

        } else {

          setFieldError(
            field,
            "Tarkista kentän sisältö."
          );

        }

        return false;
      }


      /* Too short */

      if (field.validity.tooShort) {

        setFieldError(
          field,
          `Kirjoita vähintään ${field.minLength} merkkiä.`
        );

        return false;
      }


      /* Too long */

      if (field.validity.tooLong) {

        setFieldError(
          field,
          `Kirjoita enintään ${field.maxLength} merkkiä.`
        );

        return false;
      }


      /* Pattern mismatch */

      if (field.validity.patternMismatch) {

        setFieldError(
          field,
          "Tarkista kentän sisältö."
        );

        return false;
      }


      return true;
    };


    /* =====================================================
       5. FORM FIELDS
       ===================================================== */

    const fields = form.querySelectorAll(
      "input:not(.hp):not([type='hidden']), textarea, select"
    );


    fields.forEach((field) => {

      const eventName =
        field.type === "checkbox" ||
        field.tagName === "SELECT"
          ? "change"
          : "input";


      field.addEventListener(
        eventName,
        () => {

          if (
            field.getAttribute("aria-invalid") === "true"
          ) {
            validateField(field);
          }

        }
      );


      field.addEventListener(
        "blur",
        () => {

          if (
            field.required &&
            (
              field.value ||
              field.type === "checkbox"
            )
          ) {
            validateField(field);
          }

        }
      );

    });


    /* =====================================================
       6. FORM SUBMISSION
       ===================================================== */

    form.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();


        if (statusMessage) {
          statusMessage.textContent = "";
        }


        /* Honeypot */

        const honeypot =
          form.querySelector(".hp");

        if (
          honeypot &&
          honeypot.value.trim() !== ""
        ) {
          return;
        }


        /* Validate all fields */

        let formIsValid = true;
        let firstInvalidField = null;


        fields.forEach((field) => {

          const valid =
            validateField(field);

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
              "Tarkista lomakkeen virheelliset kentät.";
          }

          if (firstInvalidField) {
            firstInvalidField.focus();
          }

          return;
        }


        /* Loading state */

        const originalButtonText =
          submitButton
            ? submitButton.textContent
            : "";


        if (submitButton) {

          submitButton.disabled = true;

          submitButton.setAttribute(
            "aria-disabled",
            "true"
          );

          submitButton.textContent =
            "Lähetetään…";

        }


        if (statusMessage) {
          statusMessage.textContent =
            "Lähetetään viestiä…";
        }


        /* FormData */

        const formData =
          new FormData(form);


        if (!formData.has("_lomake")) {

          formData.append(
            "_lomake",
            form.dataset.form || "yhteys"
          );

        }


        if (!formData.has("_subject")) {

          formData.append(
            "_subject",
            "Uusi yhteydenotto — First Five Years"
          );

        }


        try {

          const response =
            await fetch(
              endpoint,
              {
                method: "POST",
                body: formData,
                headers: {
                  Accept: "application/json"
                }
              }
            );


          /* Success */

          if (response.ok) {

            form.reset();


            fields.forEach((field) => {
              clearFieldError(field);
            });


            const successMessage =
              form.dataset.success ||
              "Kiitos. Viestisi on lähetetty.";


            if (statusMessage) {

              statusMessage.textContent =
                successMessage;

              /*
               * Viedään statusviestiin fokus,
               * jos sillä on tabindex.
               */

              if (
                statusMessage.hasAttribute("tabindex")
              ) {
                statusMessage.focus();
              }

            }


            return;
          }


          /* Server error */

          let responseData = null;


          try {
            responseData =
              await response.json();
          } catch (error) {
            responseData = null;
          }


          let serverMessage = "";


          if (
            responseData &&
            typeof responseData.message === "string"
          ) {
            serverMessage =
              responseData.message;
          }


          if (statusMessage) {

            statusMessage.textContent =
              serverMessage ||
              "Viestin lähettäminen ei onnistunut. Tarkista tiedot ja yritä uudelleen.";

          }


        } catch (error) {

          console.error(
            "Formward submission failed:",
            error
          );


          if (statusMessage) {

            statusMessage.textContent =
              "Viestin lähettäminen ei onnistunut verkkoyhteyden vuoksi. Tarkista yhteys ja yritä uudelleen.";

          }


        } finally {

          if (submitButton) {

            submitButton.disabled = false;

            submitButton.removeAttribute(
              "aria-disabled"
            );

            submitButton.textContent =
              originalButtonText;

          }

        }

      }
    );

  });


  /* =======================================================
     7. EXTERNAL LINKS
     ======================================================= */

  document
    .querySelectorAll(
      'a[target="_blank"]'
    )
    .forEach((link) => {

      const rel =
        new Set(
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
