/* ============================================
   B&R Seafood and More - Shared Menu Renderer
   Used by both public page and admin preview
   ============================================ */

const MenuRenderer = (() => {

  function formatPrice(price) {
    return price % 1 === 0 ? '$' + price : '$' + price.toFixed(2);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderMenuItem(item) {
    if (!item.active) return '';
    const featuredClass = item.featured ? ' featured' : '';
    const badge = item.featured && item.badgeText
      ? `<div class="menu-item-badge">${escapeHtml(item.badgeText)}</div>`
      : '';

    return `
      <div class="menu-item${featuredClass}">
        ${badge}
        <div class="menu-item-icon"><i class="${escapeHtml(item.icon)}"></i></div>
        <div class="menu-item-content">
          <div class="menu-item-header">
            <h4 class="menu-item-name">${escapeHtml(item.name)}</h4>
            <span class="menu-item-price">${formatPrice(item.price)}</span>
          </div>
          <p class="menu-item-desc">${escapeHtml(item.description)}</p>
        </div>
      </div>`;
  }

  function renderSideItem(item) {
    if (!item.active) return '';
    return `
      <div class="side-item">
        <i class="${escapeHtml(item.icon)}"></i>
        <span>${escapeHtml(item.name)}</span>
      </div>`;
  }

  function renderCategory(category) {
    const activeItems = category.items.filter(i => i.active);
    if (activeItems.length === 0) return '';

    const isDinners = category.id === 'dinners';
    const gridClass = isDinners ? 'menu-grid' : 'sides-grid';
    const renderFn = isDinners ? renderMenuItem : renderSideItem;

    return `
      <div class="menu-category">
        <div class="category-header">
          <h3 class="category-title">
            <i class="${escapeHtml(category.icon)}"></i>
            ${escapeHtml(category.name)}
          </h3>
          <span class="category-badge">${escapeHtml(category.badge)}</span>
        </div>
        <div class="${gridClass}">
          ${activeItems.map(renderFn).join('')}
        </div>
      </div>`;
  }

  function renderMenuNote(settings) {
    if (!settings.menuNote) return '';
    return `
      <div class="menu-note">
        <i class="fas fa-info-circle"></i>
        <p>${escapeHtml(settings.menuNote)}</p>
      </div>`;
  }

  /**
   * Render the full menu into a container element.
   * @param {Object} data - The menu data object (from menu.json)
   * @param {HTMLElement} container - The DOM element to render into
   */
  function renderMenu(data, container) {
    if (!data || !data.categories) {
      container.innerHTML = `
        <p style="text-align:center; color: rgba(255,255,255,.5); padding: 40px 0;">
          Our menu is temporarily unavailable.<br>
          Please call us for current items and pricing.
        </p>`;
      return;
    }

    const html = data.categories.map(renderCategory).join('')
      + renderMenuNote(data.settings);

    container.innerHTML = html;
  }

  // Public API
  return { renderMenu, formatPrice, escapeHtml };
})();
