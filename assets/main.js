document.addEventListener("DOMContentLoaded", () => {

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  /* =====================================================
     REVEAL
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


    const observer =
      new IntersectionObserver(
        (entries, observerInstance) => {

          entries.forEach((entry) => {

            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("in");

            observerInstance.unobserve(
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
      observer.observe(element);
    });

  }


  /* =====================================================
     INTERNAL LINKS
     ===================================================== */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {

      link.addEventListener(
        "click",
        (event) => {

          const href =
            link.getAttribute("href");

          if (!href || href === "#") {
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
     FORMWARD
     ===================================================== */

  const forms =
    document.querySelectorAll(
      "[data-form]"
    );


  forms.forEach((form) => {

    const endpoint =
      window.FFY_FORM_ENDPOINT || "";


    const validEndpoint =
      endpoint.startsWith(
        "https://forms.formward.eu/"
      );


    if (!validEndpoint) {
      form.hidden = true;
      return;
    }


    const submitButton =
      form.querySelector(
        'button[type="submit"]'
      );


    const statusMessage =
      form.querySelector(
        ".form-msg"
      );


    const fields =
      form.querySelectorAll(
        "input:not(.hp):not([type='hidden']), textarea, select"
      );


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
          describedBy.split(/\s+/);


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


    const clearError =
      (field) => {

        field.removeAttribute(
          "aria-invalid"
        );

        const error =
          getErrorElement(field);

        if (error) {
          error.textContent = "";
        }

      };


    const setError =
      (field, message) => {

        field.setAttribute(
          "aria-invalid",
          "true"
        );

        const error =
          getErrorElement(field);

        if (error) {
          error.textContent = message;
        }

      };


    const validateField =
      (field) => {

        clearError(field);


        if (field.disabled) {
          return true;
        }


        if (
          field.type === "checkbox" &&
          field.required &&
          !field.checked
        ) {

          setError(
            field,
            "Hyväksy tämä kohta ennen viestin lähettämistä."
          );

          return false;

        }


        if (
          field.validity.valueMissing
        ) {

          if (
            field.id === "c-name"
          ) {

            setError(
              field,
              "Kirjoita nimesi."
            );

          } else if (
            field.id === "c-email"
          ) {

            setError(
              field,
              "Kirjoita sähköpostiosoitteesi."
            );

          } else if (
            field.id === "c-msg"
          ) {

            setError(
              field,
              "Kirjoita viesti."
            );

          } else {

            setError(
              field,
              "Täytä tämä kenttä."
            );

          }


          return false;

        }


        if (
          field.validity.typeMismatch
        ) {

          setError(
            field,
            "Tarkista sähköpostiosoitteen muoto."
          );

          return false;

        }


        return true;

      };


    fields.forEach((field) => {

      const eventName =
        field.type === "checkbox"
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

    });


    form.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();


        if (statusMessage) {
          statusMessage.textContent = "";
        }


        const honeypot =
          form.querySelector(".hp");


        if (
          honeypot &&
          honeypot.value.trim() !== ""
        ) {
          return;
        }


        let valid = true;
        let firstInvalid = null;


        fields.forEach((field) => {

          if (!validateField(field)) {

            valid = false;

            if (!firstInvalid) {
              firstInvalid = field;
            }

          }

        });


        if (!valid) {

          if (statusMessage) {
            statusMessage.textContent =
              "Tarkista lomakkeen virheelliset kentät.";
          }

          if (firstInvalid) {
            firstInvalid.focus();
          }

          return;

        }


        const originalText =
          submitButton
            ? submitButton.textContent
            : "";


        if (submitButton) {

          submitButton.disabled = true;

          submitButton.textContent =
            "Lähetetään…";

        }


        if (statusMessage) {
          statusMessage.textContent =
            "Lähetetään viestiä…";
        }


        const formData =
          new FormData(form);


        if (
          !formData.has("_subject")
        ) {

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
                  Accept:
                    "application/json"
                }
              }
            );


          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}`
            );
          }


          form.reset();


          fields.forEach((field) => {
            clearError(field);
          });


          if (statusMessage) {

            statusMessage.textContent =
              form.dataset.success ||
              "Kiitos. Viestisi on lähetetty.";

            statusMessage.focus();

          }


        } catch (error) {

          console.error(
            "Form submission failed:",
            error
          );


          if (statusMessage) {

            statusMessage.textContent =
              "Viestin lähettäminen ei onnistunut. Yritä uudelleen tai kirjoita osoitteeseen hello@firstfive.fi.";

          }


        } finally {

          if (submitButton) {

            submitButton.disabled =
              false;

            submitButton.textContent =
              originalText;

          }

        }

      }
    );

  });


  /* =====================================================
     EXTERNAL LINKS
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
