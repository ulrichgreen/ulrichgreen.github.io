(function () {
  if (!document.body) return;

  /* ── 1. Running header ─────────────────────────────────────────────────── */
  var headerSection = document.querySelector('.running-header__section');
  if (headerSection) {
    var sections = document.querySelectorAll('article section[data-title], article h2[id]');
    if (sections.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var el = e.target;
            headerSection.textContent =
              el.dataset.title || el.textContent.trim().slice(0, 60);
          }
        });
      }, { rootMargin: '-10% 0px -80% 0px' });
      sections.forEach(function (s) { io.observe(s); });
    }
  }

  /* ── 2. Scroll-linked weight shift ────────────────────────────────────── */
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        var progress = Math.min(scrollY / 1000, 1);
        var wght = Math.round(300 + progress * 100);
        document.documentElement.style.setProperty('--wght', wght);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── 3. Footnote reveal ────────────────────────────────────────────────── */
  var hasWideMargin = window.matchMedia('(min-width: 900px)');

  document.addEventListener('click', function (e) {
    var ref = e.target.closest('.fn-ref');
    if (!ref) return;
    e.preventDefault();

    var targetId = ref.getAttribute('href') || ref.dataset.fn;
    if (!targetId) return;
    var fn = document.getElementById(targetId.replace(/^#/, ''));
    if (!fn) return;

    if (hasWideMargin.matches) {
      /* Position as margin note */
      var note = document.querySelector('.margin-note[data-for="' + targetId.replace(/^#/, '') + '"]');
      if (!note) {
        note = document.createElement('aside');
        note.className = 'margin-note';
        note.dataset.for = targetId.replace(/^#/, '');
        note.dataset.ref = ref.textContent.trim();
        note.textContent = fn.textContent;
        var article = ref.closest('article');
        if (article) {
          article.style.position = 'relative';
          article.appendChild(note);
        }
      }
      var refRect = ref.getBoundingClientRect();
      var artRect = ref.closest('article').getBoundingClientRect();
      note.style.top = (refRect.top - artRect.top) + 'px';
    } else {
      /* Toggle inline reveal on narrow screens */
      var inline = document.getElementById('inline-' + targetId.replace(/^#/, ''));
      if (!inline) {
        inline = document.createElement('div');
        inline.className = 'fn-inline';
        inline.id = 'inline-' + targetId.replace(/^#/, '');
        inline.textContent = fn.textContent;
        ref.insertAdjacentElement('afterend', inline);
      }
      inline.classList.toggle('is-open');
    }
  });

  /* ── 4. Page arrival fade ──────────────────────────────────────────────── */
  var SEEN_KEY = 'ps_arrived';
  var arrival = document.querySelector('.page-arrival');
  if (arrival) {
    if (!sessionStorage.getItem(SEEN_KEY)) {
      sessionStorage.setItem(SEEN_KEY, '1');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          arrival.classList.add('is-visible');
        });
      });
    } else {
      arrival.classList.add('is-visible');
    }
  }
})();
