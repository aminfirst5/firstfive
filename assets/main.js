document.addEventListener("DOMContentLoaded", () => {

  const isEnglish =
    document.documentElement.lang
      .toLowerCase()
      .startsWith("en");


  const messages = isEnglish
    ? {
        consent: "Accept this item before sending your message.",
        name: "Enter your name.",
        email: "Enter your email address.",
        message: "Enter your message.",
        required: "Complete this field.",
        emailFormat: "Check the email address format.",
        invalid: "Check the contents of this field.",
        minLength: (length) => `Enter at least ${length} characters.`,
        maxLength: (length) => `Enter no more than ${length} characters.`,
        formInvalid: "Check the highlighted fields.",
        sendingButton: "Sending…",
        sendingStatus: "Sending your message…",
        subject: "New contact — First Five Years",
        success: "Thank you. Your message has been sent.",
        serverError: "Your message could not be sent. Try again or email hello@firstfive.fi.",
        networkError: "Your message could not be sent because of a network error. Check your connection and try again, or email hello@firstfive.fi."
      }
    : {
        consent: "Hyväksy tämä kohta ennen viestin lähettämistä.",
        name: "Kirjoita nimesi.",
        email: "Kirjoita sähköpostiosoitteesi.",
        message: "Kirjoita viesti.",
        required: "Täytä tämä kenttä.",
        emailFormat: "Tarkista sähköpostiosoitteen muoto.",
        invalid: "Tarkista kentän sisältö.",
        minLength: (length) => `Kirjoita vähintään ${length} merkkiä.`,
        maxLength: (length) => `Kirjoita enintään ${length} merkkiä.`,
        formInvalid: "Tarkista lomakkeen virheelliset kentät.",
        sendingButton: "Lähetetään…",
        sendingStatus: "Lähetetään viestiä…",
        subject: "Uusi yhteydenotto — First Five Years",
        success: "Kiitos. Viestisi on lähetetty.",
        serverError: "Viestin lähettäminen ei onnistunut. Yritä uudelleen tai kirjoita osoitteeseen hello@firstfive.fi.",
        networkError: "Viestin lähettäminen ei onnistunut verkkoyhteyden vuoksi. Tarkista yhteys ja yritä uudelleen tai kirjoita osoitteeseen hello@firstfive.fi."
      };

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  /* =====================================================
     1. REVEAL ANIMATIONS
     ===================================================== */

  const revealElements =
    document.querySelectorAll(".reveal");


  if (
    !reduceMotion &&
    "IntersectionObserver" in window &&
    revealElements.length
  ) {

    document.documentElement.classList.add(
      "reveal-ready"
    );


    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {

          entries.forEach((entry) => {

            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("in");

            observer.unobserve(
              entry.target
            );

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


  /* =====================================================
     2. INTERNAL ANCHOR LINKS
     ===================================================== */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {

      link.addEventListener(
        "click",
        (event) => {

          const href =
            link.getAttribute("href");


          if (
            !href ||
            href === "#"
          ) {
            return;
          }


          const target =
            document.querySelector(href);


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior:
              reduceMotion
                ? "auto"
                : "smooth",

            block: "start"
          });


          /*
           * Vie näppäimistöfokuksen myös kohdeosioon.
           */

          if (
            !target.hasAttribute("tabindex")
          ) {

            target.setAttribute(
              "tabindex",
              "-1"
            );

          }


          target.focus({
            preventScroll: true
          });

        }
      );

    });


  /* =====================================================
     3. FORMWARD FORMS
     ===================================================== */

  const forms =
    document.querySelectorAll(
      "[data-form]"
    );


  forms.forEach((form) => {

    const endpoint =
      window.FFY_FORM_ENDPOINT || "";


    const allowedEndpoint =
      endpoint.startsWith(
        "https://forms.formward.eu/"
      );


    /*
     * Jos Formward-endpoint ei ole käytössä,
     * lomaketta ei jätetä rikkinäisenä näkyviin.
     */

    if (!allowedEndpoint) {

      form.hidden = true;

      return;

    }


    form.hidden = false;


    const submitButton =
      form.querySelector(
        'button[type="submit"], input[type="submit"]'
      );


    const statusMessage =
      form.querySelector(
        ".form-msg"
      );


    const fields =
      form.querySelectorAll(
        "input:not(.hp):not([type='hidden']), textarea, select"
      );


    /* ===================================================
       ERROR ELEMENT
       =================================================== */

    const getErrorElement =
      (field) => {

        const describedBy =
          field.getAttribute(
            "aria-describedby"
          );


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
            element.classList.contains(
              "field-error"
            )
          ) {

            return element;

          }

        }


        return null;

      };


    /* ===================================================
       CLEAR ERROR
       =================================================== */

    const clearError =
      (field) => {

        field.removeAttribute(
          "aria-invalid"
        );


        const errorElement =
          getErrorElement(field);


        if (errorElement) {

          errorElement.textContent = "";

        }

      };


    /* ===================================================
       SET ERROR
       =================================================== */

    const setError =
      (field, message) => {

        field.setAttribute(
          "aria-invalid",
          "true"
        );


        const errorElement =
          getErrorElement(field);


        if (errorElement) {

          errorElement.textContent =
            message;

        }

      };


    /* ===================================================
       FIELD VALIDATION
       =================================================== */

    const validateField =
      (field) => {

        clearError(field);


        if (field.disabled) {
          return true;
        }


        /* Checkbox */

        if (
          field.type === "checkbox" &&
          field.required
        ) {

          if (!field.checked) {

            setError(
              field,
              messages.consent
            );

            return false;

          }


          return true;

        }


        /* Required field missing */

        if (
          field.validity.valueMissing
        ) {

          if (
            field.id === "c-name"
          ) {

            setError(
              field,
              messages.name
            );

          } else if (
            field.id === "c-email"
          ) {

            setError(
              field,
              messages.email
            );

          } else if (
            field.id === "c-msg"
          ) {

            setError(
              field,
              messages.message
            );

          } else {

            setError(
              field,
              messages.required
            );

          }


          return false;

        }


        /* Email type mismatch */

        if (
          field.validity.typeMismatch
        ) {

          if (
            field.type === "email"
          ) {

            setError(
              field,
              messages.emailFormat
            );

          } else {

            setError(
              field,
              messages.invalid
            );

          }


          return false;

        }


        /* Too short */

        if (
          field.validity.tooShort
        ) {

          setError(
            field,
            messages.minLength(field.minLength)
          );

          return false;

        }


        /* Too long */

        if (
          field.validity.tooLong
        ) {

          setError(
            field,
            messages.maxLength(field.maxLength)
          );

          return false;

        }


        /* Pattern mismatch */

        if (
          field.validity.patternMismatch
        ) {

          setError(
            field,
            messages.invalid
          );

          return false;

        }


        return true;

      };


    /* ===================================================
       LIVE VALIDATION
       =================================================== */

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
            field.getAttribute(
              "aria-invalid"
            ) === "true"
          ) {

            validateField(field);

          }

        }
      );


      field.addEventListener(
        "blur",
        () => {

          /*
           * Ei näytetä tyhjälle kentälle virhettä
           * pelkästä tabbaamisesta, mutta jos käyttäjä
           * on syöttänyt jotain, tarkistetaan sisältö.
           */

          if (
            field.type === "checkbox"
          ) {

            if (
              field.getAttribute(
                "aria-invalid"
              ) === "true"
            ) {

              validateField(field);

            }

            return;

          }


          if (
            field.value.trim() !== ""
          ) {

            validateField(field);

          }

        }
      );

    });


    /* ===================================================
       SUBMIT
       =================================================== */

    form.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();


        if (statusMessage) {

          statusMessage.textContent = "";

        }


        /* -----------------------------------------------
           Honeypot
           ----------------------------------------------- */

        const honeypot =
          form.querySelector(".hp");


        if (
          honeypot &&
          honeypot.value.trim() !== ""
        ) {

          /*
           * Botille ei anneta palautetta.
           */

          return;

        }


        /* -----------------------------------------------
           Validate all fields
           ----------------------------------------------- */

        let formIsValid = true;

        let firstInvalidField = null;


        fields.forEach((field) => {

          const valid =
            validateField(field);


          if (!valid) {

            formIsValid = false;


            if (!firstInvalidField) {

              firstInvalidField =
                field;

            }

          }

        });


        if (!formIsValid) {

          if (statusMessage) {

            statusMessage.textContent =
              messages.formInvalid;

          }


          if (firstInvalidField) {

            firstInvalidField.focus();

          }


          return;

        }


        /* -----------------------------------------------
           Loading state
           ----------------------------------------------- */

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
            messages.sendingButton;

        }


        if (statusMessage) {

          statusMessage.textContent =
            messages.sendingStatus;

        }


        /* -----------------------------------------------
           Form data
           ----------------------------------------------- */

        const formData =
          new FormData(form);


        /*
         * Sisäinen tunniste Formwardiin.
         */

        if (
          !formData.has("_lomake")
        ) {

          formData.append(
            "_lomake",
            form.dataset.form ||
              "yhteys"
          );

        }


        /*
         * Sähköpostiin tuleva otsikko.
         */

        if (
          !formData.has("_subject")
        ) {

          formData.append(
            "_subject",
            messages.subject
          );

        }


        try {

          /* ---------------------------------------------
             Send
             --------------------------------------------- */

          const response =
            await fetch(
              endpoint,
              {
                method: "POST",

                body: formData,

                headers: {
                  Accept:
                    "application/json"
                }
              }
            );


          /* ---------------------------------------------
             Success
             --------------------------------------------- */

          if (response.ok) {

            form.reset();


            fields.forEach(
              (field) => {

                clearError(field);

              }
            );


            const successMessage =
              form.dataset.success ||
              messages.success;


            if (statusMessage) {

              statusMessage.textContent =
                successMessage;


              if (
                statusMessage.hasAttribute(
                  "tabindex"
                )
              ) {

                statusMessage.focus();

              }

            }


            return;

          }


          /* ---------------------------------------------
             Formward/server error
             --------------------------------------------- */

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
            typeof responseData.message ===
              "string"
          ) {

            serverMessage =
              responseData.message;

          }


          if (statusMessage) {

            statusMessage.textContent =
              serverMessage ||
              messages.serverError;

          }


        } catch (error) {

          /* ---------------------------------------------
             Network error
             --------------------------------------------- */

          console.error(
            "Formward submission failed:",
            error
          );


          if (statusMessage) {

            statusMessage.textContent =
              messages.networkError;

          }


        } finally {

          /* ---------------------------------------------
             Restore button
             --------------------------------------------- */

          if (submitButton) {

            submitButton.disabled =
              false;

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


  /* =====================================================
     4. EXTERNAL LINKS
     ===================================================== */

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
