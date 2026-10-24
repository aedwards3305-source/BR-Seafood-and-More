/* ============================================
   B&R Seafood and More - Seasonal Greetings
   Picks a seasonal background and greeting from
   the visitor's local date. Pure date logic lives
   in SeasonalCalendar so it can be tested in Node.
   ============================================ */

const SeasonalCalendar = (() => {

  /*
   * Windows (inclusive, local calendar days):
   *   halloween     Oct 20 - Nov 2
   *   thanksgiving  Monday - Sunday of Thanksgiving week
   *   christmas     Dec 15 - Jan 1 (Christmas Day and New Year's Day greet by name)
   *   federal       each other federal holiday: 3 days before through 1 day after
   * When windows overlap, the first match in this list wins.
   */

  const THURSDAY = 4;
  const MONDAY = 1;

  /** Nth weekday of a month (month 0-11, weekday 0=Sun..6=Sat, n from 1). */
  function nthWeekday(year, month, weekday, n) {
    const first = new Date(year, month, 1);
    const offset = (weekday - first.getDay() + 7) % 7;
    return new Date(year, month, 1 + offset + 7 * (n - 1));
  }

  /** Last weekday of a month. */
  function lastWeekday(year, month, weekday) {
    const last = new Date(year, month + 1, 0);
    const offset = (last.getDay() - weekday + 7) % 7;
    return new Date(year, month, last.getDate() - offset);
  }

  /** Local midnight for a date, so comparisons ignore the time of day. */
  function day(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  /** The federal holidays of a year, with the name each greeting uses. */
  function federalHolidays(year) {
    return [
      { key: 'mlk', name: 'Martin Luther King Jr. Day', date: nthWeekday(year, 0, MONDAY, 3) },
      { key: 'presidents', name: "Presidents' Day", date: nthWeekday(year, 1, MONDAY, 3) },
      { key: 'memorial', name: 'Memorial Day', date: lastWeekday(year, 4, MONDAY) },
      { key: 'juneteenth', name: 'Juneteenth', date: new Date(year, 5, 19) },
      { key: 'independence', name: 'Independence Day', date: new Date(year, 6, 4) },
      { key: 'labor', name: 'Labor Day', date: nthWeekday(year, 8, MONDAY, 1) },
      { key: 'columbus', name: 'Columbus Day', date: nthWeekday(year, 9, MONDAY, 2) },
      { key: 'veterans', name: "Veterans Day", date: new Date(year, 10, 11) },
    ];
  }

  /** Thanksgiving: the fourth Thursday of November. */
  function thanksgiving(year) {
    return nthWeekday(year, 10, THURSDAY, 4);
  }

  function inRange(today, start, end) {
    return today.getTime() >= day(start).getTime() && today.getTime() <= day(end).getTime();
  }

  /**
   * The season for a date: { key, year, greeting, ... } or null.
   * `now` is read by its local calendar date.
   */
  function seasonOn(now) {
    const today = day(now);
    const year = today.getFullYear();

    // Halloween: Oct 20 - Nov 2
    if (inRange(today, new Date(year, 9, 20), new Date(year, 10, 2))) {
      return { key: 'halloween', name: 'Halloween', greeting: 'Happy Halloween from B&R Seafood and More!' };
    }

    // Thanksgiving week (Monday - Sunday)
    const tg = thanksgiving(year);
    if (inRange(today, addDays(tg, -3), addDays(tg, 3))) {
      return { key: 'thanksgiving', name: 'Thanksgiving', greeting: 'Happy Thanksgiving from B&R Seafood and More!' };
    }

    // Christmas and New Year's: Dec 15 - Jan 1
    const month = today.getMonth();
    const dayOfMonth = today.getDate();
    if ((month === 11 && dayOfMonth >= 15) || (month === 0 && dayOfMonth === 1)) {
      if (month === 0) {
        return { key: 'christmas', name: "New Year's Day", greeting: "Happy New Year from B&R Seafood and More!" };
      }
      if (dayOfMonth === 25) {
        return { key: 'christmas', name: 'Christmas', greeting: 'Merry Christmas from B&R Seafood and More!' };
      }
      return { key: 'christmas', name: 'Holidays', greeting: 'Happy Holidays from B&R Seafood and More!' };
    }

    // Other federal holidays: 3 days before through 1 day after
    for (const h of federalHolidays(year)) {
      if (inRange(today, addDays(h.date, -3), addDays(h.date, 1))) {
        return { key: 'federal', holiday: h.key, name: h.name, greeting: federalGreeting(h.key, h.name) };
      }
    }

    return null;
  }

  function federalGreeting(key, name) {
    if (key === 'veterans') return 'Thank you to our veterans, from B&R Seafood and More!';
    if (key === 'mlk') return 'Honoring Dr. Martin Luther King Jr. from B&R Seafood and More!';
    return `Happy ${name} from B&R Seafood and More!`;
  }

  return { seasonOn, federalHolidays, thanksgiving, nthWeekday, lastWeekday };
})();

const Seasonal = (() => {

  const PREVIEW_PARAM = 'seasonal';
  const VALID_KEYS = ['halloween', 'thanksgiving', 'christmas', 'federal'];

  /** A season for preview, e.g. ?seasonal=halloween, or null. */
  function previewFromUrl() {
    try {
      const value = new URLSearchParams(window.location.search).get(PREVIEW_PARAM);
      if (value === 'off') return 'off';
      return VALID_KEYS.includes(value) ? value : null;
    } catch (e) {
      return null;
    }
  }

  /** Which season to show: a preview, else the date's season, unless switched off. */
  function resolve(now, enabled, preview) {
    if (preview === 'off') return null;
    if (preview) {
      const season = SeasonalCalendar.seasonOn(now);
      return { key: preview, name: preview, greeting: season?.greeting || 'Happy Holidays from B&R Seafood and More!' };
    }
    if (!enabled) return null;
    return SeasonalCalendar.seasonOn(now);
  }

  async function seasonalEnabled() {
    try {
      const resp = await fetch('data/site-settings.json?t=' + Date.now());
      if (!resp.ok) return true;
      const data = await resp.json();
      return data.seasonal?.enabled !== false;
    } catch (e) {
      return true;
    }
  }

  const ICONS = {
    halloween: ['fa-ghost', 'fa-spider', 'fa-moon', 'fa-mask'],
    thanksgiving: ['fa-leaf', 'fa-wheat-awn', 'fa-star', 'fa-leaf'],
    christmas: ['fa-snowflake', 'fa-tree', 'fa-gift', 'fa-star'],
    federal: ['fa-star', 'fa-flag-usa', 'fa-star', 'fa-flag-usa'],
  };

  /** Apply the season to the homepage hero: background, greeting and decoration. */
  function apply(season) {
    if (!season) return;
    const hero = document.getElementById('hero');
    const greeting = document.getElementById('seasonGreeting');
    const decor = document.getElementById('seasonDecor');
    if (!hero) return;

    document.body.dataset.season = season.key;
    hero.dataset.season = season.key;

    if (greeting) {
      greeting.textContent = season.greeting;
      greeting.hidden = false;
    }

    if (decor) {
      const icons = ICONS[season.key] || ICONS.federal;
      const count = 14;
      for (let i = 0; i < count; i++) {
        const el = document.createElement('i');
        el.className = `fas ${icons[i % icons.length]} season-icon`;
        el.setAttribute('aria-hidden', 'true');
        el.style.left = `${(i * 97) % 100}%`;
        el.style.animationDuration = `${12 + (i % 5) * 3}s`;
        el.style.animationDelay = `${-(i * 1.7)}s`;
        el.style.fontSize = `${14 + (i % 4) * 6}px`;
        decor.appendChild(el);
      }
    }
  }

  async function init() {
    const preview = previewFromUrl();
    const enabled = preview ? true : await seasonalEnabled();
    apply(resolve(new Date(), enabled, preview));
  }

  return { init, resolve, apply, previewFromUrl };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SeasonalCalendar, Seasonal };
}
