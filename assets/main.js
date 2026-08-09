/* First Five Years — minimal behaviour.
   1. Scroll reveal (respects prefers-reduced-motion)
   2. Forms: post to the endpoint set in FFY_FORM_ENDPOINT, or fail gracefully. */

(function () {
  'use strict';

  /* ---- 1. reveal ---- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.reveal');

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- 2. forms ---- */
  var endpoint = window.FFY_FORM_ENDPOINT || '';
  var configured = endpoint && endpoint.indexOf('LISAA_') !== 0;

  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var msg = form.querySelector('.form-msg');
    var button = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // honeypot
      var hp = form.querySelector('input[name="_gotcha"]');
      if (hp && hp.value) { return; }

      if (!configured) {
        if (msg) {
          msg.textContent = 'Lomake ei ole vielä käytössä. Kirjoita meille: hei@firstfiveyears.fi';
        }
        return;
      }

      var data = new FormData(form);
      data.append('_lomake', form.getAttribute('data-form'));

      if (button) { button.disabled = true; }
      if (msg) { msg.textContent = 'Lähetetään…'; }

      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) { throw new Error('status ' + res.status); }
          form.reset();
          if (msg) { msg.textContent = form.getAttribute('data-success') || 'Kiitos. Olemme yhteydessä.'; }
        })
        .catch(function () {
          if (msg) { msg.textContent = 'Lähetys ei onnistunut. Kirjoita meille: hei@firstfiveyears.fi'; }
        })
        .finally(function () {
          if (button) { button.disabled = false; }
        });
    });
  });
})();
