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

  function formatDateRange(startStr, endStr) {
    if (!endStr) return formatDate(startStr);
    const s = new Date(startStr + 'T00:00:00');
    const e = new Date(endStr + 'T00:00:00');
    const sMonth = s.toLocaleDateString('en-US', { month: 'long' });
    const eMonth = e.toLocaleDateString('en-US', { month: 'long' });
    const sDay = s.getDate();
    const eDay = e.getDate();
    const year = s.getFullYear();

    if (sMonth === eMonth && s.getFullYear() === e.getFullYear()) {
      return sMonth + ' ' + sDay + ' \u2013 ' + eDay + ', ' + year;
    }
    return sMonth + ' ' + sDay + ' \u2013 ' + eMonth + ' ' + eDay + ', ' + e.getFullYear();
  }

  function getMonthShort(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  }

  function getDay(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDate();
  }

  function isUpcoming(dateStr, endDateStr) {
    const checkDate = endDateStr || dateStr;
    const eventDate = new Date(checkDate + 'T23:59:59');
    return eventDate >= new Date();
  }

  function renderDateBadge(event) {
    const hasEnd = event.endDate && event.endDate !== event.date;
    if (!hasEnd) {
      return `
        <div class="event-date-badge">
          <span class="event-month">${getMonthShort(event.date)}</span>
          <span class="event-day">${getDay(event.date)}</span>
        </div>`;
    }

    const startMonth = getMonthShort(event.date);
    const endMonth = getMonthShort(event.endDate);
    const startDay = getDay(event.date);
    const endDay = getDay(event.endDate);

    if (startMonth === endMonth) {
      return `
        <div class="event-date-badge">
          <span class="event-month">${startMonth}</span>
          <span class="event-day">${startDay}\u2013${endDay}</span>
        </div>`;
    }

    return `
      <div class="event-date-badge multi-month">
        <span class="event-month">${startMonth} ${startDay}</span>
        <span class="event-day-divider">\u2013</span>
        <span class="event-month">${endMonth} ${endDay}</span>
      </div>`;
  }

  function renderEventCard(event) {
    if (!event.active) return '';
    const upcoming = isUpcoming(event.date, event.endDate);
    const featuredClass = event.featured ? ' featured' : '';
    const pastClass = !upcoming ? ' past-event' : '';
    const pastBadge = !upcoming
      ? '<span class="event-past-badge">Past Event</span>'
      : '';
    const featuredBadge = event.featured && upcoming
      ? '<span class="event-featured-badge"><i class="fas fa-star"></i> Featured</span>'
      : '';

    const dateDisplay = event.endDate
      ? formatDateRange(event.date, event.endDate)
      : formatDate(event.date);

    return `
      <div class="event-card${featuredClass}${pastClass}">
        ${renderDateBadge(event)}
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
              <i class="fas fa-calendar"></i> ${dateDisplay}
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

    // Sort: upcoming first (by start date asc), then past (by start date desc)
    const upcoming = activeEvents.filter(e => isUpcoming(e.date, e.endDate))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const past = activeEvents.filter(e => !isUpcoming(e.date, e.endDate))
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

  return { renderEvents, escapeHtml, formatDate, formatDateRange, isUpcoming };
})();
