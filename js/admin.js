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
  }

  /* ========== MENU DATA MANAGEMENT ========== */

  async function loadData() {
    try {
      const resp = await fetch(PUBLISHED_URL);
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
    renderSettings();
  }

  function renderItemsList(categoryId, containerId) {
    const container = document.getElementById(containerId);
    const category = getCategory(categoryId);
    if (!container || !category) return;

    const isDinners = categoryId === 'dinners';

    container.innerHTML = category.items.map((item, index) => {
      const priceHtml = isDinners
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
    const isNew = index === -1;
    const item = isNew ? null : category.items[index];

    const descGroup = document.getElementById('descGroup');
    const priceRow = document.getElementById('priceRow');
    const featuredRow = document.getElementById('featuredRow');

    if (isDinners) {
      descGroup.style.display = 'flex';
      priceRow.style.display = 'flex';
      featuredRow.style.display = 'flex';
    } else {
      descGroup.style.display = 'none';
      priceRow.style.display = 'flex';
      featuredRow.style.display = 'none';
      document.getElementById('itemPrice').closest('.form-group').style.display = 'none';
    }

    document.getElementById('modalTitle').textContent =
      isNew ? (isDinners ? 'Add Dinner Item' : 'Add Side') : 'Edit Item';

    const iconSelect = document.getElementById('itemIcon');
    iconSelect.innerHTML = ICON_OPTIONS.map(opt =>
      `<option value="${opt.value}">${opt.label}</option>`
    ).join('');

    document.getElementById('itemId').value = isNew ? '' : item.id;
    document.getElementById('itemCategory').value = categoryId;
    document.getElementById('itemName').value = isNew ? '' : item.name;
    document.getElementById('itemDesc').value = isNew ? '' : (item.description || '');
    document.getElementById('itemPrice').value = isNew ? '' : (item.price || 0);
    document.getElementById('itemIcon').value = isNew ? (isDinners ? 'fas fa-fish' : 'fas fa-seedling') : item.icon;
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

    const name = document.getElementById('itemName').value.trim();
    if (!name) {
      showToast('Name is required', 'error');
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

  /* ================================================================
     EVENTS MANAGEMENT
     ================================================================ */

  async function loadEventsData() {
    try {
      const resp = await fetch(EVENTS_URL);
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
      const dateStr = event.date ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

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

    const id = isNew
      ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : document.getElementById('eventId').value;

    const eventItem = {
      id,
      title,
      date,
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

    // Settings save
    document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
      menuData.settings.sidesIncluded = parseInt(document.getElementById('sidesIncluded').value) || 2;
      menuData.settings.extraSidePrice = parseFloat(document.getElementById('extraSidePrice').value) || 3;
      menuData.settings.menuNote = document.getElementById('menuNote').value.trim();
      saveDraft();
    });

    // Draft discard
    document.getElementById('discardDraftBtn')?.addEventListener('click', discardDraft);

    // Publish buttons
    document.getElementById('downloadBtn')?.addEventListener('click', downloadMenuJson);
    document.getElementById('copyBtn')?.addEventListener('click', copyJsonToClipboard);

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
