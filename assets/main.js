/* First Five Years — main.js
   1. Scroll reveal
   2. Mittauspolun animaatio
   3. Lomakkeiden käsittely
*/

(function () {
  'use strict';

  /* =========================================================
     1. SCROLL REVEAL
     ========================================================= */

  var reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  var revealTargets = document.querySelectorAll('.reveal');

  if (
    reduceMotion ||
    !('IntersectionObserver' in window)
  ) {
    revealTargets.forEach(function (el) {
      el.classList.add('in');
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.05
      }
    );

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  }


  /* =========================================================
     2. MITTAUSPOLUN ANIMAATIO
     ========================================================= */

  var journeys = document.querySelectorAll('.journey');

  if (journeys.length) {

    if (
      reduceMotion ||
      !('IntersectionObserver' in window)
    ) {
      journeys.forEach(function (journey) {
        journey.classList.add('journey-active');
      });

    } else {

      var journeyObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {

            if (!entry.isIntersecting) {
              return;
            }

            var journey = entry.target;

            /*
              Pieni viive tekee animaatiosta rauhallisemman:
              ensin osio tulee näkyviin, sitten polku käynnistyy.
            */
            window.setTimeout(function () {
              journey.classList.add('journey-active');
            }, 250);

            journeyObserver.unobserve(journey);
          });
        },
        {
          rootMargin: '0px 0px -15% 0px',
          threshold: 0.2
        }
      );

      journeys.forEach(function (journey) {
        journeyObserver.observe(journey);
      });
    }
  }


  /* =========================================================
     3. FORMS
     ========================================================= */

  var endpoint = window.FFY_FORM_ENDPOINT || '';

  var configured =
    endpoint &&
    endpoint.indexOf('LISAA_') !== 0;

  var forms = document.querySelectorAll(
    'form[data-form]'
  );

  forms.forEach(function (form) {

    var msg = form.querySelector('.form-msg');

    var button = form.querySelector(
      'button[type="submit"]'
    );


    form.addEventListener(
      'submit',
      function (event) {

        event.preventDefault();


        /* ---------- selaimen validointi ---------- */

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }


        /* ---------- honeypot ---------- */

        var hp = form.querySelector(
          'input[name="_gotcha"]'
        );

        if (hp && hp.value) {
          return;
        }


        /* ---------- endpoint puuttuu ---------- */

        if (!configured) {

          if (msg) {
            msg.textContent =
              'Lomake ei ole vielä käytössä. Kirjoita osoitteeseen hello@firstfive.fi';
          }

          return;
        }


        /* ---------- lomakedata ---------- */

        var data = new FormData(form);

        data.append(
          '_lomake',
          form.getAttribute('data-form')
        );


        /* ---------- loading state ---------- */

        if (button) {
          button.disabled = true;
        }

        if (msg) {
          msg.textContent = 'Lähetetään…';
        }


        /* ---------- lähetys ---------- */

        fetch(
          endpoint,
          {
            method: 'POST',
            body: data,
            headers: {
              Accept: 'application/json'
            }
          }
        )

          .then(function (response) {

            if (!response.ok) {
              throw new Error(
                'HTTP status ' + response.status
              );
            }

            form.reset();

            if (msg) {
              msg.textContent =
                form.getAttribute('data-success') ||
                'Kiitos. Viesti on lähetetty.';
            }

          })

          .catch(function () {

            if (msg) {
              msg.textContent =
                'Lähetys ei onnistunut. Kirjoita osoitteeseen hello@firstfive.fi';
            }

          })

          .finally(function () {

            if (button) {
              button.disabled = false;
            }

          });

      }
    );

  });

})();
