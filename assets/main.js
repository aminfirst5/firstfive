/* =========================================================
   First Five Years — main.js

   1. Progressive reveal enhancement
   2. Form handling
   ========================================================= */

(function () {
  'use strict';

  /* =======================================================
     1. Reveal
     ======================================================= */

  var reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  var supportsObserver = 'IntersectionObserver' in window;

  var targets = document.querySelectorAll('.reveal');

  /*
   * CSS keeps all content visible by default.
   * JavaScript adds .reveal-ready only when reveal behaviour
   * is available. This prevents content disappearing if JS fails.
   */

  if (!reduceMotion && supportsObserver && targets.length) {
    document.documentElement.classList.add('reveal-ready');

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.05
      }
    );

    targets.forEach(function (element) {
      observer.observe(element);
    });
  } else {
    targets.forEach(function (element) {
      element.classList.add('in');
    });
  }


  /* =======================================================
     2. Forms
     ======================================================= */

  var endpoint = window.FFY_FORM_ENDPOINT || '';

  var configured =
    endpoint &&
    endpoint.indexOf('LISAA_') !== 0 &&
    endpoint !== '#';

  var forms = document.querySelectorAll('form[data-form]');

  forms.forEach(function (form) {
    var message = form.querySelector('.form-msg');
    var button = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      /*
       * Let browser validate required fields first.
       */
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      /*
       * Honeypot.
       * Real users should never fill this.
       */
      var honeypot = form.querySelector('input[name="_gotcha"]');

      if (honeypot && honeypot.value) {
        return;
      }

      /*
       * Graceful fallback while no form endpoint exists.
       */
      if (!configured) {
        if (message) {
          message.textContent =
            'Lomake ei ole vielä käytössä. Kirjoita: hello@firstfive.fi';
        }

        return;
      }

      var data = new FormData(form);

      data.append(
        '_lomake',
        form.getAttribute('data-form') || 'yhteys'
      );

      if (button) {
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
      }

      if (message) {
        message.textContent = 'Lähetetään...';
      }

      fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: {
          Accept: 'application/json'
        }
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('HTTP ' + response.status);
          }

          form.reset();

          if (message) {
            message.textContent =
              form.getAttribute('data-success') ||
              'Kiitos. Viesti on lähetetty.';
          }
        })
        .catch(function (error) {
          console.error('Form submission failed:', error);

          if (message) {
            message.textContent =
              'Lähetys ei onnistunut. Kirjoita: hello@firstfive.fi';
          }
        })
        .finally(function () {
          if (button) {
            button.disabled = false;
            button.removeAttribute('aria-disabled');
          }
        });
    });
  });
})();
