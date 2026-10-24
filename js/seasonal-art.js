/* ============================================
   B&R Seafood and More - Seasonal Art
   Inline SVG scenes for the homepage hero:
   Halloween (bats, jack-o'-lanterns, lightning),
   Thanksgiving (a turkey running across) and
   Christmas (Santa's sled crossing the sky).
   Draws nothing for other seasons. Decorative only.
   ============================================ */

const SeasonalArt = (() => {

  const BAT_PATH =
    'M0 1.6C1.8 .6 3.8 .6 5.4 1.9L6.1 .5 6.6 1.5H7.4L7.9 .5 8.6 1.9C10.2 .6 12.2 .6 14 1.6 ' +
    'C12.6 2.2 11.8 3.2 11.6 4.4 10.8 3.7 9.9 3.7 9.3 4.5 8.6 4 7.8 4.6 7 5.8 ' +
    '6.2 4.6 5.4 4 4.7 4.5 4.1 3.7 3.2 3.7 2.4 4.4 2.2 3.2 1.4 2.2 0 1.6Z';

  const TIP = '#F3E2BF';
  const BAND = '#3E2314';
  const OUTER = ['#9A5A2C', '#B8733A', '#8C4F25', '#C2803F', '#9A5A2C', '#B8733A', '#8C4F25', '#C2803F', '#9A5A2C'];
  const INNER = ['#7A4321', '#94562B', '#6E3B1C', '#94562B', '#7A4321', '#94562B', '#6E3B1C'];
  const SKIN = '#8FA9C9';
  const RED = '#C8352B';
  const BEAK = '#E9B24A';
  const LEG = '#E0954A';

  // ---------- Halloween ----------

  function bareTree(x, s, flip) {
    return `<g transform="translate(${x} 206) scale(${flip ? -s : s} ${s})" fill="none" stroke="#0B1120" stroke-linecap="round">
      <path d="M0 0C1 -14 -2 -30 2 -46" stroke-width="6"/>
      <path d="M1 -26C-8 -34 -14 -36 -22 -46M-22 -46l-6 -2M-22 -46l-1 -7" stroke-width="3"/>
      <path d="M2 -36C10 -42 14 -50 22 -54M22 -54l6 -1M22 -54l2 -6" stroke-width="3"/>
      <path d="M2 -46C2 -54 -2 -60 0 -68M0 -68l-5 -4M0 -68l4 -5" stroke-width="2.4"/>
    </g>`;
  }

  function jackOLantern(x, s, delay) {
    return `<g transform="translate(${x} 206) scale(${s})">
      <circle cx="0" cy="-9" r="30" fill="url(#season-glow)"/>
      <ellipse cx="0" cy="-9" rx="11" ry="9" fill="#D9772F"/>
      <path d="M-5 -2V-16M5 -2V-16" stroke="#B85A22" stroke-width="1" opacity="0.8"/>
      <path d="M0 -18C1 -21 3 -22 4 -22" stroke="#4E6A2E" stroke-width="2" stroke-linecap="round" fill="none"/>
      <g class="season-flicker" style="animation-delay:${delay}" fill="#FFD36B">
        <path d="M-6 -12l3 -3 3 3Z"/>
        <path d="M1 -12l3 -3 3 3Z"/>
        <path d="M-6 -6C-3 -3 3 -3 6 -6L3 -5L1 -7L-1 -5L-3 -7Z"/>
      </g>
    </g>`;
  }

  function hauntedHouse() {
    return `<g transform="translate(760 206) scale(1.5)" fill="#0B1120">
      <path d="M-46 0V-34L-24 -52L-2 -34V0Z"/>
      <path d="M-6 0V-46L10 -66L26 -46V0Z"/>
      <path d="M26 0V-28L44 -40L58 -28V0Z"/>
      <rect x="6" y="-82" width="8" height="18"/>
      <path d="M-2 -66L10 -86L22 -66Z"/>
      <g fill="#FFD36B" class="season-flicker">
        <rect x="-34" y="-28" width="7" height="9"/>
        <rect x="-20" y="-28" width="7" height="9" opacity="0.6"/>
        <rect x="5" y="-40" width="8" height="11"/>
        <rect x="36" y="-22" width="7" height="8" opacity="0.7"/>
      </g>
    </g>`;
  }

  function halloweenScene() {
    return `<svg class="season-scene" viewBox="0 0 1200 230" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="season-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#FFD36B" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#FFD36B" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <path d="M0 206C160 194 300 202 460 200S760 190 920 198 1120 200 1200 194V230H0Z" fill="#141A2E"/>
      ${bareTree(120, 1.9, false)}
      ${bareTree(250, 1.3, true)}
      ${bareTree(1110, 1.8, true)}
      ${hauntedHouse()}
      ${jackOLantern(500, 1.6, '0s')}
      ${jackOLantern(540, 1.15, '-0.7s')}
      ${jackOLantern(930, 1.5, '-1.3s')}
    </svg>`;
  }

  const BOLT_SVG = `<svg class="season-bolt" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
    <path transform="translate(-300 0) scale(1.5)" d="M592 0L576 34L592 36L568 78L580 80L556 122L602 62L586 60L610 22L594 20Z" fill="#F7F3D6"/>
  </svg>`;

  function batTrack(top, duration, delay, width) {
    return `<div class="season-bat-track" style="top:${top}%;animation-duration:${duration}s;animation-delay:${delay}s">
      <svg class="season-bat" style="width:${width}px" viewBox="0 0 14 6" aria-hidden="true" focusable="false">
        <path d="${BAT_PATH}"/>
      </svg>
    </div>`;
  }

  const BATS = [
    batTrack(18, 24, 0, 46),
    batTrack(34, 30, -9, 30),
    batTrack(26, 27, -17, 38),
    batTrack(46, 33, -4, 26),
    batTrack(12, 28, -21, 34),
  ].join('');

  // ---------- Thanksgiving ----------

  function featherPath(L, W) {
    return `M0 0C${-W / 2} ${-L * 0.3} ${-W / 2} ${-L * 0.82} 0 ${-L}C${W / 2} ${-L * 0.82} ${W / 2} ${-L * 0.3} 0 0Z`;
  }

  function feather(angle, L, W, color) {
    return `<g transform="rotate(${angle})">
      <path d="${featherPath(L, W)}" fill="${TIP}"/>
      <path d="${featherPath(L * 0.9, W * 0.96)}" fill="${BAND}"/>
      <path d="${featherPath(L * 0.8, W * 0.92)}" fill="${color}"/>
    </g>`;
  }

  function turkeyLeg(x, y, running, delay) {
    const cls = running ? ' class="season-turkey-leg"' : '';
    const style = running ? ` style="animation-delay:${delay}"` : '';
    return `<g${cls}${style}>
      <path d="M${x - 5} ${y - 2}C${x - 6} ${y + 8} ${x + 6} ${y + 8} ${x + 5} ${y - 2}Z" fill="#4E2C16"/>
      <path d="M${x} ${y + 6}L${x + 1} ${y + 20}L${x - 1} ${y + 30}" stroke="${LEG}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M${x - 1} ${y + 30}l9 2M${x - 1} ${y + 30}l7 5M${x - 1} ${y + 30}l-1 6M${x - 1} ${y + 30}l-6 1" stroke="${LEG}" stroke-width="2.2" stroke-linecap="round"/>
    </g>`;
  }

  /** The turkey, facing right, in a 160 x 140 box. */
  function turkeySvg(running) {
    const tail = OUTER.map((c, i) => feather(-92 + i * 13, 60, 18, c)).join('')
      + INNER.map((c, i) => feather(-84 + i * 14, 44, 15, c)).join('');
    return `<svg viewBox="0 0 160 140" aria-hidden="true" focusable="false" class="season-turkey-svg">
      <defs>
        <radialGradient id="turkey-body" cx="0.42" cy="0.36" r="0.75">
          <stop offset="0" stop-color="#9C6534"/><stop offset="0.65" stop-color="#6B3D1E"/><stop offset="1" stop-color="#452512"/>
        </radialGradient>
        <linearGradient id="turkey-wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7A4723"/><stop offset="1" stop-color="#3F2311"/>
        </linearGradient>
        <radialGradient id="turkey-head" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stop-color="#B7CBE3"/><stop offset="1" stop-color="${SKIN}"/>
        </radialGradient>
      </defs>
      <ellipse cx="80" cy="134" rx="34" ry="3.6" fill="#0F2B46" opacity="0.12"/>
      ${turkeyLeg(74, 102, running, '0s')}
      ${turkeyLeg(88, 102, running, '-0.18s')}
      <g${running ? ' class="season-turkey-bob"' : ''}>
        <g transform="translate(66 80)">${tail}</g>
        <ellipse cx="83" cy="87" rx="33" ry="23" fill="url(#turkey-body)" transform="rotate(-20 83 87)"/>
        <g stroke="#C08A52" stroke-width="1.2" fill="none" opacity="0.55" stroke-linecap="round">
          <path d="M98 74q4 3 8 0"/><path d="M96 82q4 3 8 0"/><path d="M101 88q4 3 8 0"/><path d="M93 90q4 3 8 0"/><path d="M98 97q4 3 8 0"/>
        </g>
        <path d="M60 80C70 68 92 70 98 84C92 98 74 102 62 96C58 92 57 86 60 80Z" fill="url(#turkey-wing)"/>
        <g stroke="${TIP}" stroke-width="1.4" opacity="0.75" stroke-linecap="round">
          <path d="M66 92l6 -3"/><path d="M71 95l6 -3"/><path d="M76 97l6 -3"/><path d="M81 98l6 -3"/>
        </g>
        <path d="M104 72C110 64 113 55 116 44" stroke="${SKIN}" stroke-width="10" stroke-linecap="round" fill="none"/>
        <ellipse cx="103" cy="73" rx="9" ry="7" fill="#6B3D1E" transform="rotate(-35 103 73)"/>
        <path d="M108 82C110 88 109 94 106 98M110 82C113 88 112 94 109 99M106 83C107 89 105 94 103 97" stroke="#2A170C" stroke-width="1.6" stroke-linecap="round" fill="none"/>
        <circle cx="113" cy="56" r="2.6" fill="${RED}"/><circle cx="111" cy="62" r="2.2" fill="${RED}"/><circle cx="115" cy="50" r="2" fill="${RED}"/>
        <ellipse cx="120" cy="36" rx="10" ry="9" fill="url(#turkey-head)"/>
        <path d="M128 34C134 34 138 36 139 38C135 39 131 39 128 39Z" fill="${BEAK}"/>
        <path d="M126 30C129 31 131 36 130 43C129 46 126 46 126 43C127 39 126 34 124 32Z" fill="${RED}"/>
        <path d="M121 42C125 44 126 52 122 57C118 56 117 49 118 44Z" fill="${RED}"/>
        <circle cx="121" cy="33" r="2.6" fill="#FFFFFF"/><circle cx="121.6" cy="33.2" r="1.5" fill="#1A1A1A"/>
      </g>
    </svg>`;
  }

  // ---------- Christmas ----------

  function reindeer(x) {
    return `<g transform="translate(${x} 0)" fill="#0B1A30">
      <ellipse cx="12" cy="62" rx="14" ry="9" fill="#7A4B2A"/>
      <path d="M22 58Q28 46 34 42" stroke="#7A4B2A" stroke-width="7" stroke-linecap="round" fill="none"/>
      <ellipse cx="36" cy="40" rx="7" ry="5.5" fill="#7A4B2A"/>
      <circle cx="42" cy="40" r="2" fill="${RED}"/>
      <path d="M32 34L28 22M28 22l-6 -3M28 22l2 -6M36 34L40 22M40 22l6 -3M40 22l-2 -6" stroke="#5A3A1A" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M4 70L2 86M10 70L10 86M18 70L20 86M24 68L28 84" stroke="#7A4B2A" stroke-width="2.4" stroke-linecap="round"/>
    </g>`;
  }

  /** Santa in his sled, with two reindeer ahead, facing right. 260 x 120 box. */
  function sledSvg() {
    return `<svg viewBox="0 0 260 120" aria-hidden="true" focusable="false" class="season-sled-svg">
      <path d="M14 100Q70 112 150 104" stroke="#C9D6E8" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M26 64H142Q140 92 116 96H50Q28 88 26 64Z" fill="#B3262E"/>
      <path d="M28 66H140" stroke="#E9B24A" stroke-width="3"/>
      <path d="M66 50Q84 66 100 60" stroke="${RED}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="74" cy="48" rx="22" ry="18" fill="${RED}"/>
      <rect x="54" y="56" width="40" height="5" fill="#2B1B10"/>
      <circle cx="96" cy="28" r="11" fill="#F2C9A0"/>
      <ellipse cx="96" cy="38" rx="9" ry="7" fill="#F4F4F4"/>
      <circle cx="100" cy="26" r="1.4" fill="#1A1A1A"/>
      <path d="M84 22Q96 -6 116 14L110 22Z" fill="${RED}"/>
      <rect x="84" y="20" width="28" height="5" rx="2" fill="#F4F4F4"/>
      <circle cx="116" cy="12" r="4" fill="#F4F4F4"/>
      <path d="M100 60L182 46" stroke="#5A3A1A" stroke-width="1.5"/>
      ${reindeer(150)}
      ${reindeer(192)}
    </svg>`;
  }

  // ---------- Assembly ----------

  function reducedMotion() {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Builds the scene for a season and inserts it into the hero before its content. */
  function render(key, hero, still) {
    const anchor = hero.querySelector('.hero-content');
    const put = (html) => {
      const wrap = document.createElement('div');
      wrap.innerHTML = html.trim();
      const el = wrap.firstElementChild;
      if (anchor) hero.insertBefore(el, anchor); else hero.appendChild(el);
      return el;
    };

    if (key === 'halloween') {
      put(`<div class="season-flash${still ? ' is-still' : ''}" aria-hidden="true"></div>`);
      if (!still) put(BOLT_SVG);
      if (!still) put(`<div class="season-bats" aria-hidden="true">${BATS}</div>`);
      put(`<div class="season-art" aria-hidden="true">${halloweenScene()}</div>`);
    } else if (key === 'thanksgiving') {
      put(`<div class="season-art" aria-hidden="true">
        <div class="season-turkey-run${still ? ' is-still' : ''}">${turkeySvg(!still)}</div>
      </div>`);
    } else if (key === 'christmas') {
      if (!still) {
        put(`<div class="season-art season-art-sled" aria-hidden="true">
          <div class="season-sled-run">${sledSvg()}</div>
        </div>`);
      }
    }
  }

  return { render, reducedMotion };
})();
