/* ============================================
   B&R Seafood and More - Site Settings Loader
   Loads data/site-settings.json and applies
   dynamic content to all public pages.
   Hardcoded HTML remains as fallback if fetch fails.
   ============================================ */

const SiteSettings = (() => {

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async function load() {
    try {
      const resp = await fetch('data/site-settings.json');
      if (!resp.ok) return null;
      return await resp.json();
    } catch (e) {
      return null;
    }
  }

  function applyAll(data) {
    if (!data) return;
    applyFooter(data);
    applyAnnouncement(data);

    const page = detectPage();
    if (page === 'index') {
      applyHero(data);
      applyAboutTeaser(data);
      applyContactSection(data);
      applyOrderSection(data);
    }
    if (page === 'about') {
      applyAboutFull(data);
    }
    if (page === 'menu') {
      applyMenuCta(data);
    }
  }

  function detectPage() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('about')) return 'about';
    if (path.includes('menu')) return 'menu';
    if (path.includes('events')) return 'events';
    return 'index';
  }

  /* ---- Footer (all pages) ---- */
  function applyFooter(data) {
    const footerContact = document.querySelector('.footer-contact');
    if (!footerContact) return;

    // Phone
    const phoneLink = footerContact.querySelector('a[href^="tel:"]');
    if (phoneLink) {
      phoneLink.href = 'tel:' + data.contact.phoneRaw;
      phoneLink.textContent = data.contact.phone;
    }

    // Email
    const emailLink = footerContact.querySelector('a[href^="mailto:"]');
    if (emailLink) {
      emailLink.href = 'mailto:' + data.contact.email;
      emailLink.textContent = data.contact.email;
    }

    // Address
    const addressIcon = footerContact.querySelector('.fa-map-marker-alt');
    if (addressIcon && addressIcon.parentElement) {
      addressIcon.parentElement.innerHTML = '<i class="fas fa-map-marker-alt"></i> ' + escapeHtml(data.location.address);
    }

    // Social links
    const socialContainer = footerContact.querySelector('.social-links');
    if (socialContainer) {
      const links = {
        Facebook: data.social.facebook,
        Instagram: data.social.instagram,
        TikTok: data.social.tiktok
      };
      Object.entries(links).forEach(([label, url]) => {
        const el = socialContainer.querySelector(`a[aria-label="${label}"]`);
        if (el) {
          if (url && url !== '#') {
            el.href = url;
            el.style.display = '';
          } else {
            el.style.display = 'none';
          }
        }
      });
    }
  }

  /* ---- Hero (index only) ---- */
  function applyHero(data) {
    const h = data.hero;
    if (!h) return;

    const tagline = document.querySelector('.hero-tagline');
    const title = document.querySelector('.hero-title');
    const subtitle = document.querySelector('.hero-subtitle');
    const badge = document.querySelector('.hero-badge span');

    if (tagline) tagline.textContent = h.tagline;
    if (title) {
      title.innerHTML = escapeHtml(h.titleLine1) + '<br><span class="hero-highlight">' + escapeHtml(h.titleLine2) + '</span>';
    }
    if (subtitle) {
      subtitle.innerHTML = escapeHtml(h.subtitle).replace(/\n/g, '<br>');
    }
    if (badge) badge.textContent = h.badgeText;
  }

  /* ---- Contact Section (index only) ---- */
  function applyContactSection(data) {
    const contactSection = document.getElementById('contact');
    if (!contactSection) return;

    // Phone link
    const phoneLink = contactSection.querySelector('.contact-card a[href^="tel:"]');
    if (phoneLink) {
      phoneLink.href = 'tel:' + data.contact.phoneRaw;
      phoneLink.textContent = data.contact.phone;
    }

    // Hours
    const hoursTexts = contactSection.querySelectorAll('.hours-text');
    if (hoursTexts.length && data.hours && data.hours.length) {
      const parent = hoursTexts[0].parentElement;
      hoursTexts.forEach(el => el.remove());
      data.hours.forEach(h => {
        const p = document.createElement('p');
        p.className = 'hours-text';
        p.textContent = h.days + ': ' + h.time;
        parent.appendChild(p);
      });
    }

    // Location card
    const locationIcon = contactSection.querySelector('.contact-card .fa-map-marker-alt');
    if (locationIcon) {
      const card = locationIcon.closest('.contact-card');
      if (card) {
        const paragraphs = card.querySelectorAll('p');
        if (paragraphs[0]) paragraphs[0].textContent = data.location.address;
        if (paragraphs[1]) paragraphs[1].textContent = data.location.note;
      }
    }

    // Catering email
    const emailLink = contactSection.querySelector('.contact-card a[href^="mailto:"]');
    if (emailLink) {
      const subject = encodeURIComponent(data.contact.emailSubject || 'Catering Inquiry');
      emailLink.href = 'mailto:' + data.contact.email + '?subject=' + subject;
      emailLink.textContent = data.contact.email;
    }
  }

  /* ---- Order Section (index only) ---- */
  function applyOrderSection(data) {
    const orderSection = document.getElementById('order');
    if (!orderSection) return;

    // Phone links in order section
    orderSection.querySelectorAll('a[href^="tel:"]').forEach(link => {
      link.href = 'tel:' + data.contact.phoneRaw;
      const span = link.querySelector('span');
      if (span) {
        span.textContent = data.contact.phone;
      } else if (link.childNodes.length === 1) {
        link.textContent = data.contact.phone;
      }
    });
  }

  /* ---- About Teaser (index only) ---- */
  function applyAboutTeaser(data) {
    const a = data.about;
    if (!a) return;

    // Teaser paragraph
    const teaserSection = document.querySelector('.teaser-text');
    if (teaserSection) {
      const p = teaserSection.querySelector('p');
      if (p) p.textContent = a.teaserParagraph;
    }

    // Teaser cards
    const teaserCards = document.querySelectorAll('.teaser-card');
    if (a.cards) {
      a.cards.forEach((card, i) => {
        if (teaserCards[i]) {
          const h3 = teaserCards[i].querySelector('h3');
          const p = teaserCards[i].querySelector('p');
          const icon = teaserCards[i].querySelector('.about-icon i');
          if (h3) h3.textContent = card.teaserTitle || card.title;
          if (p) p.textContent = card.teaserDescription;
          if (icon) icon.className = card.icon;
        }
      });
    }
  }

  /* ---- About Page (about only) ---- */
  function applyAboutFull(data) {
    const a = data.about;
    if (!a) return;

    // Story paragraphs
    const storyContainer = document.querySelector('.about-story-text');
    if (storyContainer && a.storyParagraphs) {
      storyContainer.innerHTML = a.storyParagraphs
        .filter(p => p)
        .map(p => '<p>' + escapeHtml(p) + '</p>')
        .join('');
    }

    // About cards
    const aboutCards = document.querySelectorAll('.about-card');
    if (a.cards) {
      a.cards.forEach((card, i) => {
        if (aboutCards[i]) {
          const h3 = aboutCards[i].querySelector('h3');
          const p = aboutCards[i].querySelector('p');
          const icon = aboutCards[i].querySelector('.about-icon i');
          if (h3) h3.textContent = card.title;
          if (p) p.textContent = card.description;
          if (icon) icon.className = card.icon;
        }
      });
    }

    // Footer contact on about page
    applyFooter(data);
  }

  /* ---- Menu CTA (menu page) ---- */
  function applyMenuCta(data) {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
      link.href = 'tel:' + data.contact.phoneRaw;
      // Update text if it contains the phone number pattern
      if (link.textContent.match(/\(\d{3}\)/)) {
        link.textContent = data.contact.phone;
      }
    });
  }

  /* ---- Announcement Banner (all pages) ---- */
  function applyAnnouncement(data) {
    const a = data.announcement;
    if (!a || !a.enabled || !a.message) return;

    // Check if user dismissed this specific announcement
    const dismissKey = 'br-announcement-dismissed-' + btoa(unescape(encodeURIComponent(a.message))).slice(0, 20);
    if (a.dismissible && localStorage.getItem(dismissKey) === 'true') return;

    const banner = document.createElement('div');
    banner.className = 'site-announcement announcement-' + (a.type || 'info');

    let inner = '<div class="container announcement-inner">';
    inner += '<span class="announcement-message">' + escapeHtml(a.message) + '</span>';
    if (a.dismissible) {
      inner += '<button class="announcement-dismiss" aria-label="Dismiss"><i class="fas fa-times"></i></button>';
    }
    inner += '</div>';
    banner.innerHTML = inner;

    // Insert after navbar
    const navbar = document.getElementById('navbar');
    if (navbar && navbar.nextSibling) {
      navbar.parentNode.insertBefore(banner, navbar.nextSibling);
    } else {
      document.body.prepend(banner);
    }

    if (a.dismissible) {
      banner.querySelector('.announcement-dismiss').addEventListener('click', () => {
        banner.remove();
        localStorage.setItem(dismissKey, 'true');
      });
    }
  }

  return { load, applyAll };
})();

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  const data = await SiteSettings.load();
  SiteSettings.applyAll(data);
});
