/* ============================================
   B&R Seafood and More - Events Renderer
   Shared by public events page and admin preview
   ============================================ */

const EventsRenderer = (() => {

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getMonthShort(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  }

  function getDay(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDate();
  }

  function isUpcoming(dateStr) {
    const eventDate = new Date(dateStr + 'T23:59:59');
    return eventDate >= new Date();
  }

  function renderEventCard(event) {
    if (!event.active) return '';
    const featuredClass = event.featured ? ' featured' : '';
    const pastClass = !isUpcoming(event.date) ? ' past-event' : '';
    const pastBadge = !isUpcoming(event.date)
      ? '<span class="event-past-badge">Past Event</span>'
      : '';
    const featuredBadge = event.featured && isUpcoming(event.date)
      ? '<span class="event-featured-badge"><i class="fas fa-star"></i> Featured</span>'
      : '';

    return `
      <div class="event-card${featuredClass}${pastClass}">
        <div class="event-date-badge">
          <span class="event-month">${getMonthShort(event.date)}</span>
          <span class="event-day">${getDay(event.date)}</span>
        </div>
        <div class="event-card-content">
          <div class="event-card-header">
            <h3 class="event-title">
              <i class="${escapeHtml(event.icon)}"></i>
              ${escapeHtml(event.title)}
            </h3>
            ${featuredBadge}
            ${pastBadge}
          </div>
          <div class="event-details">
            <span class="event-detail">
              <i class="fas fa-calendar"></i> ${formatDate(event.date)}
            </span>
            <span class="event-detail">
              <i class="fas fa-clock"></i> ${escapeHtml(event.time)}
            </span>
            <span class="event-detail">
              <i class="fas fa-location-dot"></i> ${escapeHtml(event.location)}
            </span>
          </div>
          <p class="event-description">${escapeHtml(event.description)}</p>
        </div>
      </div>`;
  }

  function renderEvents(data, container) {
    if (!data || !data.events || data.events.length === 0) {
      container.innerHTML = `
        <div class="no-events">
          <div class="no-events-icon"><i class="fas fa-calendar-xmark"></i></div>
          <h3>No Upcoming Events</h3>
          <p>Check back soon! Follow us on social media for the latest updates.</p>
        </div>`;
      return;
    }

    const activeEvents = data.events.filter(e => e.active);

    if (activeEvents.length === 0) {
      container.innerHTML = `
        <div class="no-events">
          <div class="no-events-icon"><i class="fas fa-calendar-xmark"></i></div>
          <h3>No Upcoming Events</h3>
          <p>Check back soon! Follow us on social media for the latest updates.</p>
        </div>`;
      return;
    }

    // Sort: upcoming first (by date asc), then past (by date desc)
    const upcoming = activeEvents.filter(e => isUpcoming(e.date))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const past = activeEvents.filter(e => !isUpcoming(e.date))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = '';

    if (upcoming.length > 0) {
      html += '<h2 class="events-group-title"><i class="fas fa-calendar-check"></i> Upcoming Events</h2>';
      html += '<div class="events-list">';
      html += upcoming.map(renderEventCard).join('');
      html += '</div>';
    }

    if (past.length > 0) {
      html += '<h2 class="events-group-title past"><i class="fas fa-clock-rotate-left"></i> Past Events</h2>';
      html += '<div class="events-list">';
      html += past.map(renderEventCard).join('');
      html += '</div>';
    }

    container.innerHTML = html;
  }

  return { renderEvents, escapeHtml, formatDate, isUpcoming };
})();
