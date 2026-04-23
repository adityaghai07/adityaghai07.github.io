/* ========================================
   Aditya Ghai — Portfolio JS
   ======================================== */

(function () {
  'use strict';

  // --- Nav scroll effect ---
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // --- Mobile menu ---
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });

  // --- Scroll reveal ---
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(el => observer.observe(el));

  // --- Fetch Medium articles ---
  const blogGrid = document.getElementById('blogGrid');
  const MEDIUM_USER = 'adityaghailbdrp1';
  const RSS_URL = `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${MEDIUM_USER}`;

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

        // Extract first image from content or use thumbnail
        let thumb = article.thumbnail;
        if (!thumb || thumb === '') {
          const imgMatch = article.description.match(/<img[^>]+src="([^">]+)"/);
          thumb = imgMatch ? imgMatch[1] : '';
        }

        // Strip HTML for description
        const tmp = document.createElement('div');
        tmp.innerHTML = article.description;
        const desc = tmp.textContent.substring(0, 150) + '...';

        return `
          <a href="${article.link}" target="_blank" rel="noopener" class="blog-card reveal">
            ${thumb ? `<img class="blog-card__thumb" src="${thumb}" alt="" loading="lazy" />` : ''}
            <div class="blog-card__body">
              <span class="blog-card__date mono">${date}</span>
              <h3>${article.title}</h3>
              <p>${desc}</p>
            </div>
          </a>
        `;
      }).join('');

      // Observe new cards
      document.querySelectorAll('.blog-card.reveal').forEach(el => observer.observe(el));
    })
    .catch(() => {
      blogGrid.innerHTML = '<p class="blog__loading mono">Could not load articles. <a href="https://medium.com/@adityaghailbdrp1" target="_blank" style="text-decoration:underline;">Visit Medium &rarr;</a></p>';
    });

})();
