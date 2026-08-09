/* =========================================================
   FIRST FIVE YEARS
   main.js

   1. Progressive reveal
   2. Forms
   ========================================================= */

(function () {
  'use strict';


  /* =======================================================
     1. REVEAL
     ======================================================= */

  var reduceMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

  var supportsObserver =
    'IntersectionObserver' in window;

  var targets =
    document.querySelectorAll('.reveal');


  /*
   * Sisältö näkyy oletuksena.
   * Reveal aktivoidaan vasta kun JavaScript
   * ja IntersectionObserver ovat käytettävissä.
   */

  if (
    !reduceMotion &&
    supportsObserver &&
    targets.length
  ) {

    document.documentElement.classList.add(
      'reveal-ready'
    );


    var observer =
      new IntersectionObserver(
        function (entries) {

          entries.forEach(
            function (entry) {

              if (entry.isIntersecting) {

                entry.target.classList.add(
                  'in'
                );

                observer.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          rootMargin:
            '0px 0px -8% 0px',

          threshold: 0.05
        }
      );


    targets.forEach(
      function (element) {
        observer.observe(element);
      }
    );

  } else {

    targets.forEach(
      function (element) {
        element.classList.add('in');
      }
    );

  }


  /* =======================================================
     2. FORMS
     ======================================================= */

  var endpoint =
    window.FFY_FORM_ENDPOINT || '';

  var configured =
    endpoint &&
    endpoint.indexOf('LISAA_') !== 0 &&
    endpoint !== '#';


  document
    .querySelectorAll(
      'form[data-form]'
    )
    .forEach(
      function (form) {

        var message =
          form.querySelector(
            '.form-msg'
          );

        var button =
          form.querySelector(
            'button[type="submit"]'
          );


        form.addEventListener(
          'submit',
          function (event) {

            event.preventDefault();


            /* selaimen validointi */

            if (
              !form.checkValidity()
            ) {

              form.reportValidity();

              return;

            }


            /* honeypot */

            var honeypot =
              form.querySelector(
                'input[name="_gotcha"]'
              );

            if (
              honeypot &&
              honeypot.value
            ) {
              return;
            }


            /* endpoint ei vielä käytössä */

            if (!configured) {

              if (message) {

                message.textContent =
                  'Lomake ei ole vielä käytössä. Kirjoita osoitteeseen hello@firstfive.fi';

              }

              return;

            }


            /* lomakedata */

            var data =
              new FormData(form);

            data.append(
              '_lomake',
              form.getAttribute(
                'data-form'
              ) || 'yhteys'
            );


            /* loading */

            if (button) {

              button.disabled = true;

              button.setAttribute(
                'aria-disabled',
                'true'
              );

            }

            if (message) {

              message.textContent =
                'Lähetetään...';

            }


            /* lähetys */

            fetch(
              endpoint,
              {
                method: 'POST',

                body: data,

                headers: {
                  Accept:
                    'application/json'
                }
              }
            )

              .then(
                function (response) {

                  if (!response.ok) {

                    throw new Error(
                      'HTTP ' +
                      response.status
                    );

                  }


                  form.reset();


                  if (message) {

                    message.textContent =
                      form.getAttribute(
                        'data-success'
                      ) ||
                      'Kiitos. Viesti on lähetetty.';

                  }

                }
              )

              .catch(
                function (error) {

                  console.error(
                    'Form submission failed:',
                    error
                  );


                  if (message) {

                    message.textContent =
                      'Lähetys ei onnistunut. Kirjoita osoitteeseen hello@firstfive.fi';

                  }

                }
              )

              .finally(
                function () {

                  if (button) {

                    button.disabled =
                      false;

                    button.removeAttribute(
                      'aria-disabled'
                    );

                  }

                }
              );

          }
        );

      }
    );

})();
