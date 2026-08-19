/* ========================================
   Aditya Ghai Portfolio JS
   ======================================== */

(function () {
  'use strict';

  // --- Nav scroll effect ---
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // --- Mobile menu ---
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  const closeMenu = () => {
    toggle.classList.remove('active');
    links.classList.remove('open');
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('active', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  // --- Active nav link on scroll ---
  const navLinkMap = new Map();
  links.querySelectorAll('a[href^="#"]').forEach(a => {
    navLinkMap.set(a.getAttribute('href').slice(1), a);
  });

  const trackedSections = Array.from(document.querySelectorAll('section[id]'))
    .filter(s => navLinkMap.has(s.id));

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const link = navLinkMap.get(entry.target.id);
        if (link) link.classList.toggle('active', entry.isIntersecting);
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  trackedSections.forEach(s => spy.observe(s));

  // --- Scroll reveal ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // --- Defer project videos until they are close to the viewport ---
  // They carry data-src instead of src so nothing downloads on first paint;
  // the poster stands in until then.
  const lazyVideos = document.querySelectorAll('video[data-src]');

  if (lazyVideos.length) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const video = entry.target;
          videoObserver.unobserve(video);
          video.src = video.dataset.src;
          video.removeAttribute('data-src');
          video.load();
          const play = video.play();
          if (play) play.catch(() => { video.controls = true; });
        });
      },
      { rootMargin: '300px 0px' }
    );

    lazyVideos.forEach(v => videoObserver.observe(v));
  }

  // --- Fetch Medium articles ---
  const blogGrid = document.getElementById('blogGrid');
  const MEDIUM_USER = 'adityaghailbdrp1';
  const MEDIUM_URL = `https://medium.com/@${MEDIUM_USER}`;
  const RSS_URL = `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${MEDIUM_USER}`;

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

  fetch(RSS_URL)
    .then(res => res.json())
    .then(data => {
      if (data.status !== 'ok' || !data.items || data.items.length === 0) {
        blogGrid.innerHTML = '<p class="blog__loading mono">No articles found.</p>';
        return;
      }

      const articles = data.items.slice(0, 6);
      blogGrid.innerHTML = articles.map(article => {
        const date = new Date(article.pubDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        // Prefer the feed thumbnail, else the first image in the content
        let thumb = article.thumbnail;
        if (!thumb) {
          const imgMatch = (article.description || '').match(/<img[^>]+src="([^">]+)"/);
          thumb = imgMatch ? imgMatch[1] : '';
        }

        // Strip HTML for the excerpt (parsed inertly so Medium's tracking
        // pixels in the feed HTML are never requested)
        const doc = new DOMParser().parseFromString(article.description || '', 'text/html');
        const text = doc.body.textContent
          .replace(/https?:\/\/\S+/g, '')   // drop bare Medium embed URLs
          .replace(/\s+/g, ' ')
          .trim();
        const desc = text.length > 150 ? text.slice(0, 150).trimEnd() + '…' : text;

        return `
          <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener" class="blog-card reveal">
            ${thumb ? `<div class="blog-card__media"><img class="blog-card__thumb" src="${escapeHtml(thumb)}" alt="" loading="lazy" /></div>` : ''}
            <div class="blog-card__body">
              <span class="blog-card__date mono">${escapeHtml(date)}</span>
              <h3>${escapeHtml(article.title)}</h3>
              <p>${escapeHtml(desc)}</p>
            </div>
          </a>
        `;
      }).join('');

      // Observe the newly injected cards
      blogGrid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    })
    .catch(() => {
      blogGrid.innerHTML =
        `<p class="blog__loading mono">Could not load articles. <a href="${MEDIUM_URL}" target="_blank" rel="noopener" style="text-decoration:underline;">Visit Medium &rarr;</a></p>`;
    });

})();
