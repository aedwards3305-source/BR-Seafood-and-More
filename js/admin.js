/* ============================================
   B&R Seafood and More - Admin JavaScript
   Auth, CRUD editor, preview, and export
   ============================================ */

const Admin = (() => {
  /* ---------- Constants ---------- */
  const STORAGE_KEY = 'br-seafood-menu-draft';
  const EVENTS_STORAGE_KEY = 'br-seafood-events-draft';
  const AUTH_KEY = 'br-seafood-admin-auth';
  const PUBLISHED_URL = 'data/menu.json';
  const EVENTS_URL = 'data/events.json';

  // SHA-256 hash of "BRseafood2026" (default password)
  // To change: run in console: Admin.hashPassword('YourNewPassword').then(h => console.log(h))
  const PASSWORD_HASH = '774a32e2e15b3fef60d58578c434b5c7232a6fc332698fa7b546bd4012320732';

  // Curated icon options for the picker
  const ICON_OPTIONS = [
    { value: 'fas fa-star',          label: 'Star' },
    { value: 'fas fa-shrimp',        label: 'Shrimp' },
    { value: 'fas fa-fish',          label: 'Fish' },
    { value: 'fas fa-drumstick-bite',label: 'Drumstick' },
    { value: 'fas fa-burger',        label: 'Burger' },
    { value: 'fas fa-hotdog',        label: 'Hot Dog' },
    { value: 'fas fa-pepper-hot',    label: 'Pepper' },
    { value: 'fas fa-seedling',      label: 'Seedling' },
    { value: 'fas fa-bowl-food',     label: 'Bowl' },
    { value: 'fas fa-bowl-rice',     label: 'Rice Bowl' },
    { value: 'fas fa-bread-slice',   label: 'Bread' },
    { value: 'fas fa-wheat-awn',     label: 'Wheat/Corn' },
    { value: 'fas fa-french-fries',  label: 'Fries' },
    { value: 'fas fa-fire',          label: 'Fire/Hot' },
    { value: 'fas fa-plate-wheat',   label: 'Plate' },
    { value: 'fas fa-cookie',        label: 'Cookie' },
    { value: 'fas fa-lemon',         label: 'Lemon' },
    { value: 'fas fa-carrot',        label: 'Carrot' },
  ];

  const EVENT_ICON_OPTIONS = [
    { value: 'fas fa-calendar-days', label: 'Calendar' },
    { value: 'fas fa-store',         label: 'Market' },
    { value: 'fas fa-people-group',  label: 'Community' },
    { value: 'fas fa-truck',         label: 'Food Truck' },
    { value: 'fas fa-heart',         label: 'Heart' },
    { value: 'fas fa-music',         label: 'Music' },
    { value: 'fas fa-flag',          label: 'Flag' },
    { value: 'fas fa-cake-candles',  label: 'Celebration' },
    { value: 'fas fa-utensils',      label: 'Dining' },
    { value: 'fas fa-star',          label: 'Star' },
    { value: 'fas fa-gift',          label: 'Gift' },
    { value: 'fas fa-tree',          label: 'Outdoors' },
    { value: 'fas fa-church',        label: 'Church' },
    { value: 'fas fa-building',      label: 'Venue' },
    { value: 'fas fa-baseball',      label: 'Sports' },
    { value: 'fas fa-graduation-cap',label: 'School' },
  ];

  let menuData = null;
  let publishedData = null;
  let hasDraft = false;

  let eventsData = null;
  let publishedEventsData = null;
  let hasEventsDraft = false;

  const SETTINGS_STORAGE_KEY = 'br-seafood-settings-draft';
  const SETTINGS_URL = 'data/site-settings.json';

  const ABOUT_ICON_OPTIONS = [
    { value: 'fas fa-heart',              label: 'Heart' },
    { value: 'fas fa-fire',               label: 'Fire' },
    { value: 'fas fa-users',              label: 'Community' },
    { value: 'fas fa-star',               label: 'Star' },
    { value: 'fas fa-utensils',           label: 'Utensils' },
    { value: 'fas fa-fish',               label: 'Fish' },
    { value: 'fas fa-hand-holding-heart', label: 'Giving' },
    { value: 'fas fa-seedling',           label: 'Growth' },
    { value: 'fas fa-award',              label: 'Award' },
    { value: 'fas fa-truck',              label: 'Truck' },
    { value: 'fas fa-shrimp',             label: 'Shrimp' },
    { value: 'fas fa-plate-wheat',        label: 'Plate' },
  ];

  let settingsData = null;
  let publishedSettingsData = null;
  let hasSettingsDraft = false;

  /* ---------- Initialization ---------- */
  function init() {
    if (checkAuth()) {
      showDashboard();
    }
    bindLoginEvents();
    bindTabEvents();
  }

  /* ========== AUTHENTICATION ========== */

  async function hashPassword(pwd) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function checkAuth() {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  }

  function bindLoginEvents() {
    const form = document.getElementById('loginForm');
    const toggleBtn = document.getElementById('togglePassword');
    const logoutBtn = document.getElementById('logoutBtn');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pwd = document.getElementById('password').value;
        const hash = await hashPassword(pwd);

        if (hash === PASSWORD_HASH) {
          sessionStorage.setItem(AUTH_KEY, 'true');
          showDashboard();
        } else {
          document.getElementById('loginError').textContent = 'Incorrect password. Please try again.';
        }
      });
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const input = document.getElementById('password');
        const icon = toggleBtn.querySelector('i');
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem(AUTH_KEY);
        location.reload();
      });
    }
  }

  /* ========== ADMIN TABS ========== */

  function bindTabEvents() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.admin-tab-content').forEach(c => {
          c.classList.remove('active');
          c.style.display = 'none';
        });

        const targetEl = document.getElementById(target + 'Tab');
        if (targetEl) {
          targetEl.classList.add('active');
          targetEl.style.display = 'block';
        }
      });
    });
  }

  function showDashboard() {
    const login = document.getElementById('loginScreen');
    const dash = document.getElementById('adminDashboard');
    if (login) login.style.display = 'none';
    if (dash) dash.style.display = 'block';
    loadData();
    loadEventsData();
    loadSettingsData();
  }

  /* ========== MENU DATA MANAGEMENT ========== */

  async function loadData() {
    try {
      const resp = await fetch(PUBLISHED_URL + '?t=' + Date.now());
      if (resp.ok) {
        publishedData = await resp.json();
      }
    } catch (e) {
      publishedData = null;
    }

    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        menuData = JSON.parse(draft);
        hasDraft = true;
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
        menuData = publishedData ? JSON.parse(JSON.stringify(publishedData)) : null;
        hasDraft = false;
      }
    } else {
      menuData = publishedData ? JSON.parse(JSON.stringify(publishedData)) : null;
      hasDraft = false;
    }

    if (!menuData) {
      showToast('Could not load menu data', 'error');
      return;
    }

    // Merge in any new categories from published data missing in an old draft
    if (hasDraft && publishedData) {
      publishedData.categories.forEach(pubCat => {
        if (!menuData.categories.find(c => c.id === pubCat.id)) {
          menuData.categories.push(JSON.parse(JSON.stringify(pubCat)));
        }
      });
    }

    // Ensure specialty-sides category always exists
    if (!menuData.categories.find(c => c.id === 'specialty-sides')) {
      menuData.categories.push({
        id: 'specialty-sides',
        name: 'Specialty Items',
        icon: 'fas fa-star',
        badge: 'Premium Add-Ons',
        items: []
      });
    }

    renderEditor();
    refreshPreview();
    updateDraftBanner();
    updateLastUpdated();
    bindEditorEvents();
  }

  function saveDraft() {
    menuData.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menuData));
    hasDraft = true;
    renderEditor();
    refreshPreview();
    updateDraftBanner();
    updateLastUpdated();
    showToast('Changes saved', 'success');
  }

  function discardDraft() {
    if (!confirm('Discard all unpublished menu changes? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY);
    menuData = publishedData ? JSON.parse(JSON.stringify(publishedData)) : null;
    hasDraft = false;
    renderEditor();
    refreshPreview();
    updateDraftBanner();
    updateLastUpdated();
    showToast('Draft discarded', 'success');
  }

  function updateDraftBanner() {
    const banner = document.getElementById('draftBanner');
    if (banner) banner.style.display = hasDraft ? 'block' : 'none';
  }

  function updateLastUpdated() {
    const el = document.getElementById('lastUpdated');
    if (el && menuData) {
      const d = new Date(menuData.lastUpdated);
      el.textContent = `Last updated: ${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`;
    }
  }

  /* ========== MENU EDITOR RENDERING ========== */

  function getCategory(id) {
    return menuData.categories.find(c => c.id === id);
  }

  function renderEditor() {
    renderItemsList('dinners', 'dinnersList');
    renderItemsList('sides', 'sidesList');
    renderItemsList('specialty-sides', 'specialtySidesList');
    renderSettings();
  }

  function renderItemsList(categoryId, containerId) {
    const container = document.getElementById(containerId);
    const category = getCategory(categoryId);
    if (!container || !category) return;

    const isDinners = categoryId === 'dinners';
    const isSpecialtySides = categoryId === 'specialty-sides';
    const hasPrice = isDinners || isSpecialtySides;

    container.innerHTML = category.items.map((item, index) => {
      const priceHtml = hasPrice
        ? `<span class="item-price">${MenuRenderer.formatPrice(item.price)}</span>`
        : '';
      const featuredStar = item.featured
        ? '<i class="fas fa-star featured-star"></i>'
        : '';
      const inactiveClass = item.active ? '' : ' inactive';

      return `
        <div class="item-card${inactiveClass}" draggable="true" data-index="${index}" data-category="${categoryId}">
          <span class="item-drag"><i class="fas fa-grip-vertical"></i></span>
          <div class="item-icon"><i class="${escapeAttr(item.icon)}"></i></div>
          <div class="item-info">
            <span class="item-name">${MenuRenderer.escapeHtml(item.name)} ${featuredStar}</span>
          </div>
          ${priceHtml}
          <div class="item-actions">
            <button class="item-btn edit" title="Edit" data-action="edit" data-index="${index}" data-category="${categoryId}">
              <i class="fas fa-pen"></i>
            </button>
            <button class="item-btn delete" title="Delete" data-action="delete" data-index="${index}" data-category="${categoryId}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>`;
    }).join('');

    initDragDrop(container, categoryId);

    container.querySelectorAll('.item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const idx = parseInt(btn.dataset.index);
        const cat = btn.dataset.category;
        if (action === 'edit') openItemModal(cat, idx);
        if (action === 'delete') deleteItem(cat, idx);
      });
    });
  }

  function renderSettings() {
    const s = menuData.settings;
    const sidesInput = document.getElementById('sidesIncluded');
    const priceInput = document.getElementById('extraSidePrice');
    const noteInput = document.getElementById('menuNote');

    if (sidesInput) sidesInput.value = s.sidesIncluded;
    if (priceInput) priceInput.value = s.extraSidePrice;
    if (noteInput) noteInput.value = s.menuNote;
  }

  /* ========== DRAG AND DROP ========== */

  function initDragDrop(container, categoryId) {
    let dragIndex = null;

    container.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        dragIndex = parseInt(card.dataset.index);
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        dragIndex = null;
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropIndex = parseInt(card.dataset.index);
        if (dragIndex === null || dragIndex === dropIndex) return;

        const category = getCategory(categoryId);
        const [moved] = category.items.splice(dragIndex, 1);
        category.items.splice(dropIndex, 0, moved);
        saveDraft();
      });
    });
  }

  /* ========== ITEM MODAL (ADD/EDIT) ========== */

  function openItemModal(categoryId, index) {
    const category = getCategory(categoryId);
    const isDinners = categoryId === 'dinners';
    const isSpecialtySides = categoryId === 'specialty-sides';
    const isNew = index === -1;
    const item = isNew ? null : category.items[index];

    const descGroup = document.getElementById('descGroup');
    const priceRow = document.getElementById('priceRow');
    const featuredRow = document.getElementById('featuredRow');
    const priceGroup = document.getElementById('itemPrice').closest('.form-group');

    if (isDinners) {
      descGroup.style.display = 'flex';
      priceRow.style.display = 'flex';
      featuredRow.style.display = 'flex';
      priceGroup.style.display = '';
      document.getElementById('itemPrice').required = true;
    } else if (isSpecialtySides) {
      descGroup.style.display = 'none';
      priceRow.style.display = 'flex';
      featuredRow.style.display = 'none';
      priceGroup.style.display = '';
      document.getElementById('itemPrice').required = true;
    } else {
      descGroup.style.display = 'none';
      priceRow.style.display = 'flex';
      featuredRow.style.display = 'none';
      priceGroup.style.display = 'none';
      document.getElementById('itemPrice').required = false;
    }

    const modalLabels = { dinners: 'Add Dinner Item', sides: 'Add Side', 'specialty-sides': 'Add Specialty Item' };
    document.getElementById('modalTitle').textContent =
      isNew ? (modalLabels[categoryId] || 'Add Item') : 'Edit Item';

    const iconSelect = document.getElementById('itemIcon');
    iconSelect.innerHTML = ICON_OPTIONS.map(opt =>
      `<option value="${opt.value}">${opt.label}</option>`
    ).join('');

    const defaultIcons = { dinners: 'fas fa-fish', sides: 'fas fa-seedling', 'specialty-sides': 'fas fa-bowl-food' };
    document.getElementById('itemId').value = isNew ? '' : item.id;
    document.getElementById('itemCategory').value = categoryId;
    document.getElementById('itemName').value = isNew ? '' : item.name;
    document.getElementById('itemDesc').value = isNew ? '' : (item.description || '');
    document.getElementById('itemPrice').value = isNew ? '' : (item.price || 0);
    document.getElementById('itemIcon').value = isNew ? (defaultIcons[categoryId] || 'fas fa-star') : item.icon;
    document.getElementById('itemFeatured').checked = isNew ? false : !!item.featured;
    document.getElementById('itemBadge').value = isNew ? '' : (item.badgeText || '');
    document.getElementById('itemActive').checked = isNew ? true : item.active;

    updateBadgeVisibility();
    updateIconPreview();

    document.getElementById('itemForm').dataset.editIndex = index;

    document.getElementById('itemModal').style.display = 'flex';
    document.getElementById('itemName').focus();
  }

  function closeItemModal() {
    document.getElementById('itemModal').style.display = 'none';
  }

  function saveItemFromModal() {
    const form = document.getElementById('itemForm');
    const categoryId = document.getElementById('itemCategory').value;
    const editIndex = parseInt(form.dataset.editIndex);
    const isNew = editIndex === -1;
    const category = getCategory(categoryId);
    const isDinners = categoryId === 'dinners';
    const isSpecialtySides = categoryId === 'specialty-sides';

    const name = document.getElementById('itemName').value.trim();
    if (!name) {
      showToast('Name is required', 'error');
      return;
    }

    if ((isDinners || isSpecialtySides) && !document.getElementById('itemPrice').value) {
      showToast('Price is required', 'error');
      return;
    }

    const id = isNew
      ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : document.getElementById('itemId').value;

    const itemData = {
      id,
      name,
      icon: document.getElementById('itemIcon').value,
      active: document.getElementById('itemActive').checked,
    };

    if (isDinners) {
      itemData.description = document.getElementById('itemDesc').value.trim();
      itemData.price = parseFloat(document.getElementById('itemPrice').value) || 0;
      itemData.featured = document.getElementById('itemFeatured').checked;
      itemData.badgeText = itemData.featured ? document.getElementById('itemBadge').value.trim() : '';
    }

    if (isSpecialtySides) {
      itemData.price = parseFloat(document.getElementById('itemPrice').value) || 0;
    }

    if (isNew) {
      category.items.push(itemData);
    } else {
      category.items[editIndex] = itemData;
    }

    closeItemModal();
    saveDraft();
  }

  function deleteItem(categoryId, index) {
    const category = getCategory(categoryId);
    const item = category.items[index];
    if (!confirm(`Remove "${item.name}" from the menu?`)) return;
    category.items.splice(index, 1);
    saveDraft();
  }

  function updateBadgeVisibility() {
    const checked = document.getElementById('itemFeatured').checked;
    document.getElementById('badgeGroup').style.display = checked ? 'flex' : 'none';
  }

  function updateIconPreview() {
    const val = document.getElementById('itemIcon').value;
    document.getElementById('iconPreview').innerHTML = `<i class="${escapeAttr(val)}"></i>`;
  }

  /* ========== MENU PREVIEW ========== */

  function refreshPreview() {
    const container = document.getElementById('previewContainer');
    if (container && menuData) {
      MenuRenderer.renderMenu(menuData, container);
    }
  }

  /* ========== MENU EXPORT / PUBLISH ========== */

  function downloadMenuJson() {
    if (!confirm('Download menu.json for publishing?')) return;
    const json = JSON.stringify(menuData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('menu.json downloaded!', 'success');
  }

  function copyJsonToClipboard() {
    if (!confirm('Copy menu JSON to clipboard?')) return;
    const json = JSON.stringify(menuData, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      showToast('JSON copied to clipboard!', 'success');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = json;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('JSON copied to clipboard!', 'success');
    });
  }

  /* ========== MENU PRINT / SAVE AS PDF ========== */

  // Builds a complete, self-contained HTML document for printing the menu.
  // Renders active items only, mirroring the public page, and embeds a print
  // stylesheet so the browser's print dialog (Save as PDF) produces crisp,
  // vector, brand-matched output.
  function buildPrintableMenuDoc() {
    const esc = MenuRenderer.escapeHtml;
    const price = MenuRenderer.formatPrice;

    // The brand header lives in a <thead> so the browser repeats it at the top
    // of every printed page; the menu content lives in a single <tbody> cell.
    let head = '';
    head += '<header class="m-head">';
    head += '<h1>B&amp;R Seafood and More</h1>';
    head += '<p class="m-tag">Golden Fried Seafood &amp; Southern Sides</p>';
    head += '<div class="m-rule"></div>';
    head += '</header>';

    let body = '';

    menuData.categories.forEach(category => {
      const activeItems = category.items.filter(i => i.active);
      if (activeItems.length === 0) return;

      body += '<section class="m-cat">';
      body += '<div class="m-cat-head">';
      body += '<h2>' + esc(category.name) + '</h2>';
      if (category.badge) body += '<span class="m-badge">' + esc(category.badge) + '</span>';
      body += '</div>';

      if (category.id === 'dinners') {
        body += '<div class="m-dinners">';
        activeItems.forEach(item => {
          const star = item.featured ? '<span class="m-star">&#9733;</span>' : '';
          const tag = item.featured && item.badgeText
            ? '<span class="m-item-badge">' + esc(item.badgeText) + '</span>'
            : '';
          body += '<div class="m-item">';
          body += '<div class="m-item-row">';
          body += '<div class="m-item-name">' + star + esc(item.name) + tag + '</div>';
          body += '<span class="m-item-price">' + price(item.price) + '</span>';
          body += '</div>';
          if (item.description) {
            body += '<p class="m-item-desc">' + esc(item.description) + '</p>';
          }
          body += '</div>';
        });
        body += '</div>';
      } else if (category.id === 'specialty-sides') {
        body += '<div class="m-chips">';
        activeItems.forEach(item => {
          body += '<span class="m-chip">' + esc(item.name)
            + ' <span class="m-chip-price">' + price(item.price) + '</span></span>';
        });
        body += '</div>';
      } else {
        body += '<div class="m-chips">';
        activeItems.forEach(item => {
          body += '<span class="m-chip">' + esc(item.name) + '</span>';
        });
        body += '</div>';
      }

      body += '</section>';
    });

    // Menu note
    if (menuData.settings && menuData.settings.menuNote) {
      body += '<div class="m-note">' + esc(menuData.settings.menuNote) + '</div>';
    }

    // Footer
    body += '<footer class="m-foot">B&amp;R Seafood and More &bull; '
      + '6 2nd St NE, Minot, ND 58703 &bull; (701) 818-3664</footer>';

    const sheet = '<table class="m-sheet">'
      + '<thead><tr><td class="m-head-cell">' + head + '</td></tr></thead>'
      + '<tbody><tr><td class="m-body-cell">' + body + '</td></tr></tbody>'
      + '</table>';

    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
      + '<title>B&amp;R Seafood Menu</title>'
      + '<link rel="preconnect" href="https://fonts.googleapis.com">'
      + '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
      + '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">'
      + '<style>' + PRINT_MENU_CSS + '</style></head><body>' + sheet + '</body></html>';
  }

  const PRINT_MENU_CSS = [
    // margin:0 leaves no room for the browser-injected date/title header and
    // URL/page footer, so they are suppressed. Page spacing comes from body padding.
    '@page { size: letter portrait; margin: 0; }',
    '* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
    'body { font-family: "Poppins", system-ui, sans-serif; color: #0a1628; margin: 0; padding: 0; }',
    // Table layout lets <thead> repeat the brand header on every printed page.
    '.m-sheet { width: 100%; border-collapse: collapse; }',
    '.m-head-cell { padding: 0.45in 0.5in 0; }',
    '.m-body-cell { padding: 4px 0.5in 0.5in; }',
    '.m-head { text-align: center; margin-bottom: 18px; }',
    '.m-head h1 { font-family: "Playfair Display", Georgia, serif; font-size: 30px; margin: 0; color: #0a1628; letter-spacing: .5px; }',
    '.m-tag { color: #6b7280; font-size: 13px; margin: 6px 0 0; }',
    '.m-rule { width: 60px; height: 3px; background: #f59e0b; margin: 14px auto 0; }',
    '.m-cat { margin-bottom: 22px; }',
    '.m-cat-head { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0d9488; padding-bottom: 7px; margin-bottom: 14px; break-inside: avoid; break-after: avoid; }',
    '.m-cat-head h2 { font-family: "Playfair Display", Georgia, serif; font-size: 21px; margin: 0; color: #0a1628; }',
    '.m-badge { background: #0d9488; color: #fff; padding: 4px 13px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }',
    '.m-item { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; break-inside: avoid; }',
    '.m-item-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }',
    '.m-item-name { font-weight: 600; font-size: 14px; }',
    '.m-star { color: #f59e0b; margin-right: 6px; }',
    '.m-item-badge { background: #f59e0b; color: #fff; padding: 2px 9px; border-radius: 12px; font-size: 10px; font-weight: 600; margin-left: 8px; white-space: nowrap; }',
    '.m-item-price { font-weight: 700; color: #0d9488; font-size: 15px; white-space: nowrap; }',
    '.m-item-desc { margin: 4px 0 0; color: #6b7280; font-size: 12px; }',
    '.m-chips { display: flex; flex-wrap: wrap; gap: 9px; }',
    '.m-chip { background: #f3f4f6; padding: 7px 15px; border-radius: 8px; font-size: 13px; font-weight: 500; break-inside: avoid; }',
    '.m-chip-price { color: #0d9488; font-weight: 700; margin-left: 5px; }',
    '.m-note { margin-top: 18px; padding: 13px 17px; background: #f9fafb; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 12px; color: #6b7280; break-inside: avoid; }',
    '.m-foot { text-align: center; margin-top: 26px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }'
  ].join('\n');

  // Opens the browser print dialog with a brand-styled menu built from the
  // current (in-memory) menu data, so the admin can Save as PDF or print.
  function printMenu() {
    if (!menuData || !menuData.categories) {
      showToast('No menu data to print', 'error');
      return;
    }

    // The iframe must have a real (non-collapsed) layout box, or Chromium
    // prints blank pages. Give it letter width and position it off-screen so
    // the user never sees it; its height is set to the full content height
    // once the document loads so the whole menu is laid out for printing.
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position: fixed; left: -10000px; top: 0; width: 8.5in; height: 11in; border: 0; background: #fff;';
    document.body.appendChild(iframe);

    let printed = false;
    const triggerPrint = () => {
      if (printed) return;
      printed = true;
      const win = iframe.contentWindow;
      win.focus();
      win.print();
    };

    const cleanup = () => {
      // Remove after the dialog is dismissed; guard against premature removal.
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    };

    iframe.onload = () => {
      const win = iframe.contentWindow;
      // Expand the iframe box to the full content height so every page of a
      // multi-page menu is laid out and rendered into the print job.
      const contentHeight = win.document.documentElement.scrollHeight;
      if (contentHeight) iframe.style.height = contentHeight + 'px';
      win.addEventListener('afterprint', cleanup);
      const fontsReady = win.document.fonts ? win.document.fonts.ready : Promise.resolve();
      // Wait for brand fonts, but never block the dialog indefinitely.
      Promise.race([
        fontsReady,
        new Promise(resolve => win.setTimeout(resolve, 1500))
      ]).then(triggerPrint);
    };

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(buildPrintableMenuDoc());
    doc.close();
  }

  /* ========== TV DISPLAY MENU EXPORT ========== */

  // Renders the live menu as a set of 1920x1080 slides for the TV above the
  // checkout window: a USB-drive-ready JPG set (phase 1, flash drive straight
  // into the TV's own Media Player) and a PowerPoint of the same slides
  // (phase 2, laptop over HDMI). Item descriptions are left off these slides
  // by design — a menu board favors large, scannable name + price over
  // paragraph copy read from a few feet away — and empty categories are
  // skipped, mirroring the public renderer and the print menu above.

  const TV_W = 1920;
  const TV_H = 1080;
  const TV_PAGE_SIZE = 8; // dinner items per slide (2 cols x 4 rows)
  const TV_COLORS = {
    bg: '#0a1628',
    bgLight: '#13284a',
    white: '#ffffff',
    muted: 'rgba(255,255,255,.62)',
    teal: '#0d9488',
    tealLight: '#14b8a6',
    gold: '#f59e0b',
    line: 'rgba(255,255,255,.14)'
  };

  // Greedy word-wrap: returns an array of lines that each fit maxWidth at
  // the canvas context's current font.
  function tvWrapText(ctx, text, maxWidth) {
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    words.forEach(word => {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function tvRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Shared background, footer, and page-label chrome for every slide.
  function tvBaseSlide(ctx, label) {
    const grad = ctx.createLinearGradient(0, 0, 0, TV_H);
    grad.addColorStop(0, TV_COLORS.bg);
    grad.addColorStop(1, TV_COLORS.bgLight);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, TV_W, TV_H);

    ctx.fillStyle = TV_COLORS.muted;
    ctx.font = '500 24px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('6 2nd St NE, Minot, ND  •  (701) 818-3664', TV_W / 2, TV_H - 40);

    if (label) {
      ctx.fillStyle = TV_COLORS.muted;
      ctx.font = '600 22px Poppins, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(label, TV_W - 70, 58);
    }
  }

  function tvDrawWelcomeSlide(ctx) {
    tvBaseSlide(ctx, '');
    ctx.textAlign = 'center';
    ctx.fillStyle = TV_COLORS.white;
    ctx.font = '800 130px "Playfair Display", Georgia, serif';
    ctx.fillText('B&R Seafood', TV_W / 2, 460);
    ctx.fillText('and More', TV_W / 2, 590);

    ctx.fillStyle = TV_COLORS.gold;
    ctx.fillRect(TV_W / 2 - 90, 640, 180, 6);

    ctx.fillStyle = TV_COLORS.tealLight;
    ctx.font = '500 42px Poppins, sans-serif';
    ctx.fillText('Golden Fried Seafood & Southern Sides', TV_W / 2, 725);

    ctx.fillStyle = TV_COLORS.muted;
    ctx.font = '500 28px Poppins, sans-serif';
    ctx.fillText('Family Owned & Operated', TV_W / 2, 785);
  }

  // A 2-column, fixed 4-row grid (TV_PAGE_SIZE items max). The row height is
  // derived from the fixed grid rather than this page's own item count, so
  // spacing stays identical across paginated dinner slides.
  function tvDrawDinnerSlide(ctx, items, badge, pageLabel) {
    tvBaseSlide(ctx, pageLabel);

    ctx.textAlign = 'left';
    ctx.fillStyle = TV_COLORS.white;
    ctx.font = '800 68px "Playfair Display", Georgia, serif';
    ctx.fillText('Dinner Plates', 70, 118);

    ctx.font = '600 26px Poppins, sans-serif';
    const badgeW = ctx.measureText(badge).width + 56;
    ctx.fillStyle = TV_COLORS.teal;
    tvRoundRect(ctx, TV_W - 70 - badgeW, 62, badgeW, 58, 29);
    ctx.fill();
    ctx.fillStyle = TV_COLORS.white;
    ctx.textAlign = 'center';
    ctx.fillText(badge, TV_W - 70 - badgeW / 2, 99);

    ctx.strokeStyle = TV_COLORS.teal;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(70, 158);
    ctx.lineTo(TV_W - 70, 158);
    ctx.stroke();

    const cols = 2, gutter = 60, top = 200, bottom = TV_H - 90, left = 70, right = TV_W - 70;
    const colW = (right - left - gutter) / cols;
    const rows = Math.ceil(TV_PAGE_SIZE / cols);
    const rowH = (bottom - top) / rows;

    items.forEach((item, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = left + col * (colW + gutter);
      const y = top + row * rowH;

      if (item.featured) {
        ctx.fillStyle = TV_COLORS.gold;
        ctx.fillRect(x, y + 10, 6, rowH - 40);
      }
      const textX = x + (item.featured ? 24 : 0);

      ctx.textAlign = 'left';
      ctx.fillStyle = TV_COLORS.white;
      ctx.font = '600 32px Poppins, sans-serif';
      const nameMaxW = colW - 190 - (item.featured ? 24 : 0);
      const lines = tvWrapText(ctx, item.name.trim(), nameMaxW).slice(0, 2);
      const ty = y + 46;
      lines.forEach((line, li) => ctx.fillText(line, textX, ty + li * 38));

      ctx.textAlign = 'right';
      ctx.fillStyle = TV_COLORS.gold;
      ctx.font = '700 42px Poppins, sans-serif';
      ctx.fillText(MenuRenderer.formatPrice(item.price), x + colW, y + 46);

      if (item.featured && item.badgeText) {
        ctx.font = '700 19px Poppins, sans-serif';
        const bw = ctx.measureText(item.badgeText).width + 30;
        ctx.fillStyle = TV_COLORS.gold;
        tvRoundRect(ctx, x + colW - bw, y + 60, bw, 34, 17);
        ctx.fill();
        ctx.fillStyle = TV_COLORS.bg;
        ctx.textAlign = 'center';
        ctx.font = '700 17px Poppins, sans-serif';
        ctx.fillText(item.badgeText, x + colW - bw / 2, y + 84);
      }

      ctx.strokeStyle = TV_COLORS.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + rowH - 16);
      ctx.lineTo(x + colW, y + rowH - 16);
      ctx.stroke();
    });
  }

  function tvDrawSidesSlide(ctx, sides, specialty, note) {
    tvBaseSlide(ctx, '');

    ctx.textAlign = 'left';
    ctx.fillStyle = TV_COLORS.white;
    ctx.font = '800 68px "Playfair Display", Georgia, serif';
    ctx.fillText('Southern Sides', 70, 118);

    ctx.font = '600 26px Poppins, sans-serif';
    const badge = 'Choose 2 with any dinner';
    const badgeW = ctx.measureText(badge).width + 56;
    ctx.fillStyle = TV_COLORS.teal;
    tvRoundRect(ctx, TV_W - 70 - badgeW, 62, badgeW, 58, 29);
    ctx.fill();
    ctx.fillStyle = TV_COLORS.white;
    ctx.textAlign = 'center';
    ctx.fillText(badge, TV_W - 70 - badgeW / 2, 99);

    ctx.strokeStyle = TV_COLORS.teal;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(70, 158);
    ctx.lineTo(TV_W - 70, 158);
    ctx.stroke();

    const left = 70, right = TV_W - 70;
    let cx = left, cy = 210;
    const chipH = 70, chipGap = 20, rowGap = 22;
    ctx.font = '600 28px Poppins, sans-serif';
    sides.forEach(item => {
      const w = ctx.measureText(item.name).width + 64;
      if (cx + w > right) { cx = left; cy += chipH + rowGap; }
      ctx.fillStyle = 'rgba(255,255,255,.08)';
      tvRoundRect(ctx, cx, cy, w, chipH, 14);
      ctx.fill();
      ctx.strokeStyle = TV_COLORS.line;
      ctx.lineWidth = 1;
      tvRoundRect(ctx, cx, cy, w, chipH, 14);
      ctx.stroke();
      ctx.fillStyle = TV_COLORS.white;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.name, cx + 28, cy + chipH / 2 + 2);
      ctx.textBaseline = 'alphabetic';
      cx += w + chipGap;
    });

    let noteY = cy + chipH + 50;

    if (note) {
      ctx.textAlign = 'left';
      ctx.font = '400 24px Poppins, sans-serif';
      const noteLines = tvWrapText(ctx, note, right - left - 60);
      const noteH = 36 + noteLines.length * 32;
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      tvRoundRect(ctx, left, noteY, right - left, noteH, 10);
      ctx.fill();
      ctx.fillStyle = TV_COLORS.gold;
      ctx.fillRect(left, noteY, 6, noteH);
      ctx.fillStyle = TV_COLORS.muted;
      noteLines.forEach((line, i) => ctx.fillText(line, left + 36, noteY + 38 + i * 32));
      noteY += noteH + 40;
    }

    if (specialty && specialty.length) {
      ctx.textAlign = 'left';
      ctx.fillStyle = TV_COLORS.gold;
      ctx.font = '700 28px Poppins, sans-serif';
      ctx.fillText('SPECIALTY ITEMS', left, noteY + 8);
      let sx = left, sy = noteY + 34;
      ctx.font = '600 26px Poppins, sans-serif';
      specialty.forEach(item => {
        const priceText = '  ' + MenuRenderer.formatPrice(item.price);
        const label = item.name + priceText;
        const w = ctx.measureText(label).width + 56;
        if (sx + w > right) { sx = left; sy += 64; }
        ctx.fillStyle = 'rgba(245,158,11,.14)';
        tvRoundRect(ctx, sx, sy, w, 54, 12);
        ctx.fill();
        ctx.fillStyle = TV_COLORS.white;
        ctx.textBaseline = 'middle';
        ctx.fillText(item.name, sx + 24, sy + 29);
        const nameW = ctx.measureText(item.name).width;
        ctx.fillStyle = TV_COLORS.gold;
        ctx.fillText(priceText, sx + 24 + nameW, sy + 29);
        ctx.textBaseline = 'alphabetic';
        sx += w + chipGap;
      });
    }
  }

  function tvChunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  // Builds the ordered slide list, waits for brand fonts, and returns
  // [{ name, dataUrl }] — JPEG data URLs at 1920x1080, ready to zip or embed
  // into a PowerPoint. Reflects the current (in-memory) menuData, same as
  // the print menu above.
  async function buildTvSlides() {
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    await Promise.race([fontsReady, new Promise(resolve => setTimeout(resolve, 1500))]);

    const dinnersCat = getCategory('dinners');
    const sidesCat = getCategory('sides');
    const specialtyCat = getCategory('specialty-sides');
    const dinners = dinnersCat ? dinnersCat.items.filter(i => i.active) : [];
    const sides = sidesCat ? sidesCat.items.filter(i => i.active) : [];
    const specialty = specialtyCat ? specialtyCat.items.filter(i => i.active) : [];
    const note = menuData.settings && menuData.settings.menuNote;
    const dinnerBadge = (dinnersCat && dinnersCat.badge) || 'Includes 2 Sides';

    const slides = [{ name: '00-welcome', draw: tvDrawWelcomeSlide }];

    const pages = tvChunk(dinners, TV_PAGE_SIZE);
    pages.forEach((page, i) => {
      const label = pages.length > 1 ? (i + 1) + ' of ' + pages.length : '';
      slides.push({
        name: 'dinner-plates-' + (i + 1),
        draw: ctx => tvDrawDinnerSlide(ctx, page, dinnerBadge, label)
      });
    });

    if (sides.length || specialty.length || note) {
      slides.push({
        name: 'southern-sides',
        draw: ctx => tvDrawSidesSlide(ctx, sides, specialty, note)
      });
    }

    return slides.map(s => {
      const canvas = document.createElement('canvas');
      canvas.width = TV_W;
      canvas.height = TV_H;
      s.draw(canvas.getContext('2d'));
      return { name: s.name, dataUrl: canvas.toDataURL('image/jpeg', 0.92) };
    });
  }

  async function downloadTvImages() {
    if (!menuData || !menuData.categories) {
      showToast('No menu data to export', 'error');
      return;
    }
    if (typeof JSZip === 'undefined') {
      showToast('TV export library failed to load — check your connection', 'error');
      return;
    }
    showToast('Building TV slideshow…');
    try {
      const slides = await buildTvSlides();
      const zip = new JSZip();
      slides.forEach((s, i) => {
        const num = String(i + 1).padStart(2, '0');
        const base64 = s.dataUrl.split(',')[1];
        zip.file(num + '-' + s.name + '.jpg', base64, { base64: true });
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'br-seafood-tv-menu.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(slides.length + ' slides downloaded — unzip onto the USB drive', 'success');
    } catch (err) {
      showToast('TV slideshow export failed: ' + err.message, 'error');
    }
  }

  async function downloadTvPowerPoint() {
    if (!menuData || !menuData.categories) {
      showToast('No menu data to export', 'error');
      return;
    }
    if (typeof PptxGenJS === 'undefined') {
      showToast('PowerPoint export library failed to load — check your connection', 'error');
      return;
    }
    showToast('Building PowerPoint…');
    try {
      const slides = await buildTvSlides();
      const pres = new PptxGenJS();
      pres.layout = 'LAYOUT_WIDE'; // 13.333in x 7.5in, native 16:9 widescreen
      slides.forEach(s => {
        const slide = pres.addSlide();
        slide.addImage({ data: s.dataUrl, x: 0, y: 0, w: 13.333, h: 7.5 });
      });
      await pres.writeFile({ fileName: 'br-seafood-tv-menu.pptx' });
      showToast('PowerPoint downloaded — set Slide Show > Set Up Show to loop before using it on the laptop', 'success');
    } catch (err) {
      showToast('PowerPoint export failed: ' + err.message, 'error');
    }
  }

  /* ================================================================
     EVENTS MANAGEMENT
     ================================================================ */

  async function loadEventsData() {
    try {
      const resp = await fetch(EVENTS_URL + '?t=' + Date.now());
      if (resp.ok) {
        publishedEventsData = await resp.json();
      }
    } catch (e) {
      publishedEventsData = null;
    }

    const draft = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (draft) {
      try {
        eventsData = JSON.parse(draft);
        hasEventsDraft = true;
      } catch (e) {
        localStorage.removeItem(EVENTS_STORAGE_KEY);
        eventsData = publishedEventsData ? JSON.parse(JSON.stringify(publishedEventsData)) : null;
        hasEventsDraft = false;
      }
    } else {
      eventsData = publishedEventsData ? JSON.parse(JSON.stringify(publishedEventsData)) : null;
      hasEventsDraft = false;
    }

    if (!eventsData) {
      eventsData = { lastUpdated: new Date().toISOString(), events: [] };
    }

    renderEventsEditor();
    refreshEventsPreview();
    updateEventsDraftBanner();
    updateEventsLastUpdated();
    bindEventsEditorEvents();
  }

  function saveEventsDraft() {
    eventsData.lastUpdated = new Date().toISOString();
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(eventsData));
    hasEventsDraft = true;
    renderEventsEditor();
    refreshEventsPreview();
    updateEventsDraftBanner();
    updateEventsLastUpdated();
    showToast('Event changes saved', 'success');
  }

  function discardEventsDraft() {
    if (!confirm('Discard all unpublished event changes? This cannot be undone.')) return;
    localStorage.removeItem(EVENTS_STORAGE_KEY);
    eventsData = publishedEventsData ? JSON.parse(JSON.stringify(publishedEventsData)) : null;
    if (!eventsData) eventsData = { lastUpdated: new Date().toISOString(), events: [] };
    hasEventsDraft = false;
    renderEventsEditor();
    refreshEventsPreview();
    updateEventsDraftBanner();
    updateEventsLastUpdated();
    showToast('Events draft discarded', 'success');
  }

  function updateEventsDraftBanner() {
    const banner = document.getElementById('eventsDraftBanner');
    if (banner) banner.style.display = hasEventsDraft ? 'block' : 'none';
  }

  function updateEventsLastUpdated() {
    const el = document.getElementById('eventsLastUpdated');
    if (el && eventsData) {
      const d = new Date(eventsData.lastUpdated);
      el.textContent = `Last updated: ${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`;
    }
  }

  /* ========== EVENTS EDITOR RENDERING ========== */

  function renderEventsEditor() {
    const container = document.getElementById('eventsList');
    if (!container || !eventsData) return;

    if (eventsData.events.length === 0) {
      container.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 20px;">No events yet. Click "Add Event" to create one.</p>';
      return;
    }

    container.innerHTML = eventsData.events.map((event, index) => {
      const inactiveClass = event.active ? '' : ' inactive';
      const featuredStar = event.featured ? '<i class="fas fa-star featured-star"></i>' : '';
      let dateStr = '';
      if (event.date) {
        const startD = new Date(event.date + 'T00:00:00');
        dateStr = startD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (event.endDate) {
          const endD = new Date(event.endDate + 'T00:00:00');
          dateStr += ' – ' + endD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }

      return `
        <div class="item-card${inactiveClass}" draggable="true" data-index="${index}" data-type="event">
          <span class="item-drag"><i class="fas fa-grip-vertical"></i></span>
          <div class="item-icon"><i class="${escapeAttr(event.icon)}"></i></div>
          <div class="item-info">
            <span class="item-name">${EventsRenderer.escapeHtml(event.title)} ${featuredStar}</span>
            <span class="event-admin-date">${dateStr}</span>
          </div>
          <div class="item-actions">
            <button class="item-btn edit" title="Edit" data-action="edit-event" data-index="${index}">
              <i class="fas fa-pen"></i>
            </button>
            <button class="item-btn delete" title="Delete" data-action="delete-event" data-index="${index}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>`;
    }).join('');

    // Drag-and-drop for events
    initEventsDragDrop(container);

    // Bind action buttons
    container.querySelectorAll('.item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const idx = parseInt(btn.dataset.index);
        if (action === 'edit-event') openEventModal(idx);
        if (action === 'delete-event') deleteEvent(idx);
      });
    });
  }

  function initEventsDragDrop(container) {
    let dragIndex = null;

    container.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        dragIndex = parseInt(card.dataset.index);
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        dragIndex = null;
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropIndex = parseInt(card.dataset.index);
        if (dragIndex === null || dragIndex === dropIndex) return;

        const [moved] = eventsData.events.splice(dragIndex, 1);
        eventsData.events.splice(dropIndex, 0, moved);
        saveEventsDraft();
      });
    });
  }

  /* ========== EVENT MODAL (ADD/EDIT) ========== */

  function openEventModal(index) {
    const isNew = index === -1;
    const event = isNew ? null : eventsData.events[index];

    document.getElementById('eventModalTitle').textContent = isNew ? 'Add Event' : 'Edit Event';

    // Populate icon select
    const iconSelect = document.getElementById('eventIcon');
    iconSelect.innerHTML = EVENT_ICON_OPTIONS.map(opt =>
      `<option value="${opt.value}">${opt.label}</option>`
    ).join('');

    // Fill form
    document.getElementById('eventId').value = isNew ? '' : event.id;
    document.getElementById('eventTitle').value = isNew ? '' : event.title;
    document.getElementById('eventDate').value = isNew ? '' : event.date;
    document.getElementById('eventEndDate').value = isNew ? '' : (event.endDate || '');
    document.getElementById('eventTime').value = isNew ? '' : event.time;
    document.getElementById('eventLocation').value = isNew ? '' : event.location;
    document.getElementById('eventDesc').value = isNew ? '' : (event.description || '');
    document.getElementById('eventIcon').value = isNew ? 'fas fa-calendar-days' : event.icon;
    document.getElementById('eventFeatured').checked = isNew ? false : !!event.featured;
    document.getElementById('eventActive').checked = isNew ? true : event.active;

    updateEventIconPreview();

    document.getElementById('eventForm').dataset.editIndex = index;

    document.getElementById('eventModal').style.display = 'flex';
    document.getElementById('eventTitle').focus();
  }

  function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
  }

  function saveEventFromModal() {
    const form = document.getElementById('eventForm');
    const editIndex = parseInt(form.dataset.editIndex);
    const isNew = editIndex === -1;

    const title = document.getElementById('eventTitle').value.trim();
    if (!title) {
      showToast('Event title is required', 'error');
      return;
    }

    const date = document.getElementById('eventDate').value;
    if (!date) {
      showToast('Event date is required', 'error');
      return;
    }

    const endDate = document.getElementById('eventEndDate').value;
    if (endDate && endDate < date) {
      showToast('End date must be on or after the start date', 'error');
      return;
    }

    const id = isNew
      ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : document.getElementById('eventId').value;

    const eventItem = {
      id,
      title,
      date,
      endDate: endDate || '',
      time: document.getElementById('eventTime').value.trim(),
      location: document.getElementById('eventLocation').value.trim(),
      description: document.getElementById('eventDesc').value.trim(),
      icon: document.getElementById('eventIcon').value,
      featured: document.getElementById('eventFeatured').checked,
      active: document.getElementById('eventActive').checked,
    };

    if (isNew) {
      eventsData.events.push(eventItem);
    } else {
      eventsData.events[editIndex] = eventItem;
    }

    closeEventModal();
    saveEventsDraft();
  }

  function deleteEvent(index) {
    const event = eventsData.events[index];
    if (!confirm(`Remove "${event.title}" from events?`)) return;
    eventsData.events.splice(index, 1);
    saveEventsDraft();
  }

  function updateEventIconPreview() {
    const val = document.getElementById('eventIcon').value;
    document.getElementById('eventIconPreview').innerHTML = `<i class="${escapeAttr(val)}"></i>`;
  }

  /* ========== EVENTS PREVIEW ========== */

  function refreshEventsPreview() {
    const container = document.getElementById('eventsPreviewContainer');
    if (container && eventsData) {
      EventsRenderer.renderEvents(eventsData, container);
    }
  }

  /* ========== EVENTS EXPORT ========== */

  function downloadEventsJson() {
    if (!confirm('Download events.json for publishing?')) return;
    const json = JSON.stringify(eventsData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('events.json downloaded!', 'success');
  }

  function copyEventsJsonToClipboard() {
    if (!confirm('Copy events JSON to clipboard?')) return;
    const json = JSON.stringify(eventsData, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      showToast('Events JSON copied to clipboard!', 'success');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = json;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Events JSON copied to clipboard!', 'success');
    });
  }

  /* ========== EVENT BINDING ========== */

  function bindEditorEvents() {
    // Add buttons
    document.getElementById('addDinnerBtn')?.addEventListener('click', () => openItemModal('dinners', -1));
    document.getElementById('addSideBtn')?.addEventListener('click', () => openItemModal('sides', -1));
    document.getElementById('addSpecialtySideBtn')?.addEventListener('click', () => openItemModal('specialty-sides', -1));

    // Menu settings save
    document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
      if (!confirm('Save menu settings changes?')) return;
      menuData.settings.sidesIncluded = parseInt(document.getElementById('sidesIncluded').value) || 2;
      menuData.settings.extraSidePrice = parseFloat(document.getElementById('extraSidePrice').value) || 3;
      menuData.settings.menuNote = document.getElementById('menuNote').value.trim();
      saveDraft();
    });

    // Draft discard
    document.getElementById('discardDraftBtn')?.addEventListener('click', discardDraft);

    // Publish buttons
    document.getElementById('publishMenuBtn')?.addEventListener('click', () => publishToSite('menu'));
    document.getElementById('downloadBtn')?.addEventListener('click', downloadMenuJson);
    document.getElementById('copyBtn')?.addEventListener('click', copyJsonToClipboard);
    document.getElementById('printMenuBtn')?.addEventListener('click', printMenu);
    document.getElementById('tvImagesBtn')?.addEventListener('click', downloadTvImages);
    document.getElementById('tvPptBtn')?.addEventListener('click', downloadTvPowerPoint);

    // Modal events
    document.getElementById('itemForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      saveItemFromModal();
    });
    document.getElementById('modalClose')?.addEventListener('click', closeItemModal);
    document.getElementById('modalCancel')?.addEventListener('click', closeItemModal);
    document.getElementById('itemModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'itemModal') closeItemModal();
    });

    // Featured toggle
    document.getElementById('itemFeatured')?.addEventListener('change', updateBadgeVisibility);

    // Icon preview
    document.getElementById('itemIcon')?.addEventListener('change', updateIconPreview);

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeItemModal();
        closeEventModal();
      }
    });
  }

  function bindEventsEditorEvents() {
    document.getElementById('addEventBtn')?.addEventListener('click', () => openEventModal(-1));
    document.getElementById('discardEventsDraftBtn')?.addEventListener('click', discardEventsDraft);
    document.getElementById('publishEventsBtn')?.addEventListener('click', () => publishToSite('events'));
    document.getElementById('downloadEventsBtn')?.addEventListener('click', downloadEventsJson);
    document.getElementById('copyEventsBtn')?.addEventListener('click', copyEventsJsonToClipboard);

    // Event modal events
    document.getElementById('eventForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      saveEventFromModal();
    });
    document.getElementById('eventModalClose')?.addEventListener('click', closeEventModal);
    document.getElementById('eventModalCancel')?.addEventListener('click', closeEventModal);
    document.getElementById('eventModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'eventModal') closeEventModal();
    });

    // Event icon preview
    document.getElementById('eventIcon')?.addEventListener('change', updateEventIconPreview);
  }

  /* ================================================================
     SITE SETTINGS MANAGEMENT
     ================================================================ */

  async function loadSettingsData() {
    try {
      const resp = await fetch(SETTINGS_URL + '?t=' + Date.now());
      if (resp.ok) {
        publishedSettingsData = await resp.json();
      }
    } catch (e) {
      publishedSettingsData = null;
    }

    const draft = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (draft) {
      try {
        settingsData = JSON.parse(draft);
        hasSettingsDraft = true;
      } catch (e) {
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
        settingsData = publishedSettingsData ? JSON.parse(JSON.stringify(publishedSettingsData)) : null;
        hasSettingsDraft = false;
      }
    } else {
      settingsData = publishedSettingsData ? JSON.parse(JSON.stringify(publishedSettingsData)) : null;
      hasSettingsDraft = false;
    }

    if (!settingsData) {
      // Create default settings if none exist
      settingsData = {
        lastUpdated: new Date().toISOString(),
        contact: { phone: '', phoneRaw: '', email: '', emailSubject: 'Catering Inquiry' },
        location: { address: '', note: '', googleMapsUrl: '' },
        hours: [],
        social: { facebook: '', instagram: '', tiktok: '' },
        hero: { tagline: '', titleLine1: '', titleLine2: '', subtitle: '', badgeText: '' },
        about: {
          teaserParagraph: '',
          storyParagraphs: ['', ''],
          cards: [
            { icon: 'fas fa-heart', title: '', teaserTitle: '', description: '', teaserDescription: '' },
            { icon: 'fas fa-fire', title: '', teaserTitle: '', description: '', teaserDescription: '' },
            { icon: 'fas fa-users', title: '', teaserTitle: '', description: '', teaserDescription: '' }
          ]
        },
        announcement: { enabled: false, message: '', type: 'info', dismissible: true }
      };
    }

    renderSettingsEditor();
    updateSettingsDraftBanner();
    updateSettingsLastUpdated();
    bindSettingsEvents();
  }

  function renderSettingsEditor() {
    if (!settingsData) return;

    // Contact
    document.getElementById('settingsPhone').value = settingsData.contact.phone || '';
    document.getElementById('settingsPhoneRaw').value = settingsData.contact.phoneRaw || '';
    document.getElementById('settingsEmail').value = settingsData.contact.email || '';
    document.getElementById('settingsEmailSubject').value = settingsData.contact.emailSubject || '';

    // Location
    document.getElementById('settingsAddress').value = settingsData.location.address || '';
    document.getElementById('settingsLocationNote').value = settingsData.location.note || '';
    document.getElementById('settingsGoogleMapsUrl').value = settingsData.location.googleMapsUrl || '';

    // Hours
    renderHoursList();

    // Social
    document.getElementById('settingsFacebook').value = settingsData.social.facebook || '';
    document.getElementById('settingsInstagram').value = settingsData.social.instagram || '';
    document.getElementById('settingsTiktok').value = settingsData.social.tiktok || '';

    // Hero
    document.getElementById('settingsHeroTagline').value = settingsData.hero.tagline || '';
    document.getElementById('settingsHeroTitle1').value = settingsData.hero.titleLine1 || '';
    document.getElementById('settingsHeroTitle2').value = settingsData.hero.titleLine2 || '';
    document.getElementById('settingsHeroSubtitle').value = settingsData.hero.subtitle || '';
    document.getElementById('settingsHeroBadge').value = settingsData.hero.badgeText || '';

    // About
    document.getElementById('settingsAboutTeaser').value = settingsData.about.teaserParagraph || '';
    const paragraphs = settingsData.about.storyParagraphs || ['', ''];
    document.getElementById('settingsAboutStory1').value = paragraphs[0] || '';
    document.getElementById('settingsAboutStory2').value = paragraphs[1] || '';

    // About cards
    const cards = settingsData.about.cards || [];
    for (let i = 0; i < 3; i++) {
      const idx = i + 1;
      const card = cards[i] || {};
      populateAboutIconSelect(`aboutCard${idx}Icon`, card.icon || ABOUT_ICON_OPTIONS[0].value);
      document.getElementById(`aboutCard${idx}Title`).value = card.title || '';
      document.getElementById(`aboutCard${idx}TeaserTitle`).value = card.teaserTitle || '';
      document.getElementById(`aboutCard${idx}Desc`).value = card.description || '';
      document.getElementById(`aboutCard${idx}TeaserDesc`).value = card.teaserDescription || '';
    }

    // Announcement
    document.getElementById('announcementEnabled').checked = settingsData.announcement.enabled || false;
    document.getElementById('announcementMessage').value = settingsData.announcement.message || '';
    document.getElementById('announcementType').value = settingsData.announcement.type || 'info';
    document.getElementById('announcementDismissible').checked = settingsData.announcement.dismissible !== false;
    updateAnnouncementPreview();
  }

  function populateAboutIconSelect(selectId, selectedValue) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = ABOUT_ICON_OPTIONS.map(opt =>
      `<option value="${escapeAttr(opt.value)}" ${opt.value === selectedValue ? 'selected' : ''}>${opt.label}</option>`
    ).join('');
  }

  function renderHoursList() {
    const container = document.getElementById('hoursList');
    if (!container) return;

    const hours = settingsData.hours || [];
    if (hours.length === 0) {
      container.innerHTML = '<p style="color:var(--text-secondary);font-size:.9rem;padding:12px;">No hours set. Click "Add Hours" to add your schedule.</p>';
      return;
    }

    container.innerHTML = hours.map((h, i) => `
      <div class="hours-row" data-index="${i}">
        <input type="text" class="form-input hours-days" value="${escapeAttr(h.days || '')}" placeholder="e.g. Wed & Thu">
        <input type="text" class="form-input hours-time" value="${escapeAttr(h.time || '')}" placeholder="e.g. 5 PM – 9 PM">
        <button class="btn-icon-delete" data-action="remove-hours" data-index="${i}" title="Remove">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
  }

  function addHoursRow() {
    if (!settingsData.hours) settingsData.hours = [];
    settingsData.hours.push({ days: '', time: '' });
    renderHoursList();
  }

  function removeHoursRow(index) {
    settingsData.hours.splice(index, 1);
    renderHoursList();
  }

  function collectSettingsFromForm() {
    // Contact
    settingsData.contact.phone = document.getElementById('settingsPhone').value.trim();
    settingsData.contact.phoneRaw = document.getElementById('settingsPhoneRaw').value.trim()
      || settingsData.contact.phone.replace(/\D/g, '');
    settingsData.contact.email = document.getElementById('settingsEmail').value.trim();
    settingsData.contact.emailSubject = document.getElementById('settingsEmailSubject').value.trim();

    // Location
    settingsData.location.address = document.getElementById('settingsAddress').value.trim();
    settingsData.location.note = document.getElementById('settingsLocationNote').value.trim();
    settingsData.location.googleMapsUrl = document.getElementById('settingsGoogleMapsUrl').value.trim();

    // Hours (read from DOM rows)
    settingsData.hours = [];
    document.querySelectorAll('#hoursList .hours-row').forEach(row => {
      const days = row.querySelector('.hours-days').value.trim();
      const time = row.querySelector('.hours-time').value.trim();
      if (days || time) {
        settingsData.hours.push({ days, time });
      }
    });

    // Social
    settingsData.social.facebook = document.getElementById('settingsFacebook').value.trim();
    settingsData.social.instagram = document.getElementById('settingsInstagram').value.trim();
    settingsData.social.tiktok = document.getElementById('settingsTiktok').value.trim();

    // Hero
    settingsData.hero.tagline = document.getElementById('settingsHeroTagline').value.trim();
    settingsData.hero.titleLine1 = document.getElementById('settingsHeroTitle1').value.trim();
    settingsData.hero.titleLine2 = document.getElementById('settingsHeroTitle2').value.trim();
    settingsData.hero.subtitle = document.getElementById('settingsHeroSubtitle').value.trim();
    settingsData.hero.badgeText = document.getElementById('settingsHeroBadge').value.trim();

    // About
    settingsData.about.teaserParagraph = document.getElementById('settingsAboutTeaser').value.trim();
    settingsData.about.storyParagraphs = [
      document.getElementById('settingsAboutStory1').value.trim(),
      document.getElementById('settingsAboutStory2').value.trim()
    ].filter(p => p);

    // About cards
    settingsData.about.cards = [];
    for (let i = 0; i < 3; i++) {
      const idx = i + 1;
      settingsData.about.cards.push({
        icon: document.getElementById(`aboutCard${idx}Icon`).value,
        title: document.getElementById(`aboutCard${idx}Title`).value.trim(),
        teaserTitle: document.getElementById(`aboutCard${idx}TeaserTitle`).value.trim(),
        description: document.getElementById(`aboutCard${idx}Desc`).value.trim(),
        teaserDescription: document.getElementById(`aboutCard${idx}TeaserDesc`).value.trim()
      });
    }

    // Announcement
    settingsData.announcement.enabled = document.getElementById('announcementEnabled').checked;
    settingsData.announcement.message = document.getElementById('announcementMessage').value.trim();
    settingsData.announcement.type = document.getElementById('announcementType').value;
    settingsData.announcement.dismissible = document.getElementById('announcementDismissible').checked;
  }

  function saveSettingsDraft() {
    collectSettingsFromForm();
    settingsData.lastUpdated = new Date().toISOString();
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsData));
    hasSettingsDraft = true;
    updateSettingsDraftBanner();
    updateSettingsLastUpdated();
    showToast('Site settings saved', 'success');
  }

  function discardSettingsDraft() {
    if (!confirm('Discard all unpublished site setting changes? This cannot be undone.')) return;
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    settingsData = publishedSettingsData ? JSON.parse(JSON.stringify(publishedSettingsData)) : null;
    hasSettingsDraft = false;
    if (settingsData) {
      renderSettingsEditor();
    }
    updateSettingsDraftBanner();
    updateSettingsLastUpdated();
    showToast('Settings draft discarded', 'success');
  }

  function updateSettingsDraftBanner() {
    const banner = document.getElementById('settingsDraftBanner');
    if (banner) banner.style.display = hasSettingsDraft ? 'block' : 'none';
  }

  function updateSettingsLastUpdated() {
    const el = document.getElementById('settingsLastUpdated');
    if (el && settingsData) {
      const d = new Date(settingsData.lastUpdated);
      el.textContent = 'Last updated: ' + d.toLocaleDateString() + ' at ' + d.toLocaleTimeString();
    }
  }

  function downloadSettingsJson() {
    if (!confirm('Download site-settings.json for publishing?')) return;
    collectSettingsFromForm();
    const json = JSON.stringify(settingsData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('site-settings.json downloaded!', 'success');
  }

  function copySettingsJson() {
    if (!confirm('Copy site settings JSON to clipboard?')) return;
    collectSettingsFromForm();
    const json = JSON.stringify(settingsData, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      showToast('Settings JSON copied to clipboard!', 'success');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = json;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Settings JSON copied to clipboard!', 'success');
    });
  }

  function updateAnnouncementPreview() {
    const preview = document.getElementById('announcementPreview');
    if (!preview) return;
    const enabled = document.getElementById('announcementEnabled').checked;
    const message = document.getElementById('announcementMessage').value.trim();
    const type = document.getElementById('announcementType').value;

    if (enabled && message) {
      preview.style.display = 'block';
      preview.className = 'announcement-preview ' + type;
      preview.textContent = message;
    } else {
      preview.style.display = 'none';
    }
  }

  function bindSettingsEvents() {
    // Save button
    document.getElementById('saveSiteSettingsBtn')?.addEventListener('click', () => {
      if (!confirm('Save all site setting changes?')) return;
      saveSettingsDraft();
    });

    // Discard draft
    document.getElementById('discardSettingsDraftBtn')?.addEventListener('click', discardSettingsDraft);

    // Publish / Download / Copy
    document.getElementById('publishSettingsBtn')?.addEventListener('click', () => publishToSite('settings'));
    document.getElementById('downloadSettingsBtn')?.addEventListener('click', downloadSettingsJson);
    document.getElementById('copySettingsBtn')?.addEventListener('click', copySettingsJson);

    // Add hours
    document.getElementById('addHoursBtn')?.addEventListener('click', addHoursRow);

    // Remove hours (delegated)
    document.getElementById('hoursList')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="remove-hours"]');
      if (btn) {
        removeHoursRow(parseInt(btn.dataset.index));
      }
    });

    // Announcement preview updates
    document.getElementById('announcementEnabled')?.addEventListener('change', updateAnnouncementPreview);
    document.getElementById('announcementMessage')?.addEventListener('input', updateAnnouncementPreview);
    document.getElementById('announcementType')?.addEventListener('change', updateAnnouncementPreview);
  }

  /* ========== PUBLISH TO SITE ========== */

  async function publishToSite(type) {
    const dataMap = { menu: menuData, events: eventsData, settings: settingsData };
    const storageMap = { menu: STORAGE_KEY, events: EVENTS_STORAGE_KEY, settings: SETTINGS_STORAGE_KEY };
    const typeData = dataMap[type];

    if (!typeData) {
      showToast('No data to publish', 'error');
      return;
    }

    if (!confirm('Publish ' + type + ' changes to the live website?')) return;

    // Collect latest form values for settings
    if (type === 'settings') collectSettingsFromForm();

    typeData.lastUpdated = new Date().toISOString();

    showToast('Publishing to site...', '');

    try {
      const resp = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + PASSWORD_HASH
        },
        body: JSON.stringify({ type: type, data: typeData })
      });

      const result = await resp.json();

      if (!resp.ok) {
        throw new Error(result.error || 'Publish failed');
      }

      // Clear draft on success
      localStorage.removeItem(storageMap[type]);

      if (type === 'menu') {
        publishedData = JSON.parse(JSON.stringify(menuData));
        hasDraft = false;
        updateDraftBanner();
        updateLastUpdated();
      } else if (type === 'events') {
        publishedEventsData = JSON.parse(JSON.stringify(eventsData));
        hasEventsDraft = false;
        updateEventsDraftBanner();
        updateEventsLastUpdated();
      } else if (type === 'settings') {
        publishedSettingsData = JSON.parse(JSON.stringify(settingsData));
        hasSettingsDraft = false;
        updateSettingsDraftBanner();
        updateSettingsLastUpdated();
      }

      showToast('Published! Site updates in ~30 seconds.', 'success');
    } catch (err) {
      if (err.message.includes('not configured')) {
        showToast('Publishing not set up yet. Use manual export below.', 'error');
      } else {
        showToast('Publish failed: ' + err.message, 'error');
      }
    }
  }

  /* ========== UTILITIES ========== */

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  let toastTimer;
  function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = 'toast show' + (type ? ' ' + type : '');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  /* ---------- Public API ---------- */
  return { init, hashPassword };
})();

// Start
document.addEventListener('DOMContentLoaded', Admin.init);
