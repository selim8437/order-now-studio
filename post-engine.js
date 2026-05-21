/* OrderNow daily-post renderer — shared by the HTML creator and the node preview. */
(function (root) {
  'use strict';

  var THEMES = {
    espresso: {
      label: 'Espresso',
      bg: 'url(#bgEsp)', grid: 0.04,
      head: '#fdf6ec', accent: 'url(#amber)', accentSolid: '#f59e0b',
      body: '#c7b29a', chipBg: 'url(#amber)', chipText: '#1a1206',
      motif: '#f59e0b', motifNode: '#fbbf24', node2: '#241708',
      ctaBg: 'url(#amber)', ctaText: '#1a1206', handle: '#8a7257', wordSecond: 'url(#amber)'
    },
    amber: {
      label: 'Amber',
      bg: 'url(#bgAmber)', grid: 0.07,
      head: '#1a1206', accent: '#1a1206', accentSolid: '#1a1206',
      body: 'rgba(26,18,6,0.74)', chipBg: '#1a1206', chipText: '#fbbf24',
      motif: '#1a1206', motifNode: '#1a1206', node2: 'rgba(26,18,6,0.12)',
      ctaBg: '#1a1206', ctaText: '#fbbf24', handle: 'rgba(26,18,6,0.6)', wordSecond: '#1a1206'
    }
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Coffee-cup mark drawn in 512-space, centred ~ (256,256). `fill` paints the
     cup/handle/saucer, `steam` the rising curls. Draw order: saucer + handle
     sit behind the cup body, with a soft coffee-surface ellipse on top. */
  function cupMark(fill, steam) {
    return '<g transform="translate(0,12)">' +
      '<g fill="none" stroke="' + steam + '" stroke-width="13" stroke-linecap="round" opacity="0.8">' +
        '<path d="M230 196 C 208 172 250 150 230 124 C 214 103 236 86 230 68"/>' +
        '<path d="M292 196 C 270 172 312 150 292 124 C 276 103 298 86 292 68"/>' +
      '</g>' +
      '<ellipse cx="256" cy="388" rx="150" ry="24" fill="none" stroke="' + fill + '" stroke-width="16"/>' +
      '<path d="M360 238 C 412 238 412 320 360 320" fill="none" stroke="' + fill + '" stroke-width="22" stroke-linecap="round"/>' +
      '<path d="M150 214 H362 L344 320 a46 46 0 0 1 -45 38 H195 a46 46 0 0 1 -45 -38 Z" fill="' + fill + '"/>' +
      '<ellipse cx="256" cy="214" rx="106" ry="18" fill="#1a1206" opacity="0.22"/>' +
      '</g>';
  }

  /* Greedy word-wrap to a max character count per line. */
  function wrap(text, max) {
    var words = String(text || '').trim().split(/\s+/).filter(Boolean);
    var lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (!cur) { cur = w; }
      else if ((cur + ' ' + w).length <= max) { cur += ' ' + w; }
      else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }

  function longest(lines) {
    return lines.reduce(function (m, l) { return Math.max(m, l.length); }, 0);
  }

  /* Build the 1080x1080 post SVG.  v = field values, dir = 'ltr'|'rtl', themeKey. */
  function buildPost(v, dir, themeKey) {
    var t = THEMES[themeKey] || THEMES.espresso;
    var rtl = dir === 'rtl';
    var fam = rtl ? "'Cairo','Segoe UI','Tahoma',sans-serif"
                  : "'Poppins','Inter',system-ui,sans-serif";
    var W = 1080, H = 1080, M = 84;
    var ax = rtl ? W - M : M;             // text anchor x
    var anchor = rtl ? 'end' : 'start';

    /* Headline: wrap + auto-size so the longest line fits the width. */
    var hl = wrap(v.headline, 17);
    if (hl.length > 4) { hl = hl.slice(0, 4); }
    var avail = W - M * 2;
    // 0.64 em/char ≈ Poppins/Cairo average advance — keeps the longest line
    // inside the frame instead of bleeding past the edge.
    var size = Math.min(108, Math.max(46, avail / (0.64 * Math.max(longest(hl), 1))));
    var lh = size * 1.08;
    var headBlock = hl.length * lh;

    /* Body: smaller, wraps to up to 3 lines. */
    var bl = v.body ? wrap(v.body, 42).slice(0, 3) : [];
    var bsize = 34, blh = bsize * 1.32;
    var bodyBlock = bl.length ? (bl.length * blh + 40) : 0;

    /* Vertically centre the headline+body block in the middle band. */
    var bandTop = 360, bandBot = 880, bandMid = (bandTop + bandBot) / 2;
    var total = headBlock + bodyBlock;
    var top = bandMid - total / 2;

    var out = [];
    out.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H +
      '" viewBox="0 0 ' + W + ' ' + H + '" font-family="' + fam + '">');

    /* defs */
    out.push('<defs>' +
      '<radialGradient id="bgEsp" cx="50%" cy="30%" r="85%">' +
        '<stop offset="0%" stop-color="#241708"/><stop offset="52%" stop-color="#160f06"/><stop offset="100%" stop-color="#0d0905"/></radialGradient>' +
      '<linearGradient id="bgAmber" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#fde68a"/><stop offset="55%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient>' +
      '<linearGradient id="amber" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#d97706"/></linearGradient>' +
      '<filter id="soft" x="-60%" y="-60%" width="220%" height="220%">' +
        '<feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs>');

    /* canvas + grid */
    out.push('<rect width="' + W + '" height="' + H + '" fill="' + t.bg + '"/>');
    out.push('<g stroke="#ffffff" stroke-opacity="' + t.grid + '" stroke-width="1">' +
      '<path d="M0 270 H1080 M0 540 H1080 M0 810 H1080 M270 0 V1080 M540 0 V1080 M810 0 V1080"/></g>');

    /* logo lockup, top-left (mirrors in rtl) */
    var logoX = rtl ? W - M - 64 : M;
    out.push('<g transform="translate(' + logoX + ',74)">');
    out.push('<rect width="64" height="64" rx="16" fill="#0d0905" stroke="' + t.accentSolid + '" stroke-opacity="0.4" stroke-width="1.5"/>');
    out.push('<g transform="translate(8,8) scale(0.094)">' + cupMark('url(#amber)', '#fbbf24') + '</g>');
    var wmX = rtl ? -16 : 80, wmAnchor = rtl ? 'end' : 'start';
    out.push('<text x="' + wmX + '" y="42" text-anchor="' + wmAnchor + '" font-size="34" font-weight="700" letter-spacing="-0.5" fill="' + t.head + '">Order<tspan fill="' + t.wordSecond + '">Now</tspan></text>');
    out.push('</g>');

    /* tag chip */
    if (v.tag) {
      var chipW = Math.max(110, v.tag.length * 17 + 52);
      var chipX = rtl ? ax - chipW : ax;
      out.push('<g transform="translate(' + chipX + ',210)">' +
        '<rect width="' + chipW + '" height="50" rx="25" fill="' + t.chipBg + '"/>' +
        '<text x="' + (chipW / 2) + '" y="33" text-anchor="middle" font-size="22" font-weight="700" letter-spacing="2" fill="' + t.chipText + '">' + esc(v.tag.toUpperCase()) + '</text></g>');
    }

    /* headline */
    out.push('<text x="' + ax + '" text-anchor="' + anchor + '" font-size="' + size.toFixed(1) +
      '" font-weight="700" letter-spacing="' + (rtl ? 0 : -1.5) + '" fill="' + t.head + '">');
    for (var i = 0; i < hl.length; i++) {
      out.push('<tspan x="' + ax + '" y="' + (top + size * 0.82 + i * lh).toFixed(1) + '">' + esc(hl[i]) + '</tspan>');
    }
    out.push('</text>');

    /* body */
    if (bl.length) {
      var by = top + headBlock + 40 + bsize * 0.5;
      out.push('<text x="' + ax + '" text-anchor="' + anchor + '" font-size="' + bsize +
        '" font-weight="500" fill="' + t.body + '">');
      for (var j = 0; j < bl.length; j++) {
        out.push('<tspan x="' + ax + '" y="' + (by + j * blh).toFixed(1) + '">' + esc(bl[j]) + '</tspan>');
      }
      out.push('</text>');
    }

    /* CTA pill (bottom, text-start side) */
    if (v.cta) {
      var pillW = Math.max(220, v.cta.length * 19 + 80), pillH = 84;
      var pillX = rtl ? ax - pillW : ax;
      out.push('<g transform="translate(' + pillX + ',936)">' +
        '<rect width="' + pillW + '" height="' + pillH + '" rx="42" fill="' + t.ctaBg + '" filter="url(#soft)"/>' +
        '<text x="' + (pillW / 2) + '" y="' + (pillH / 2 + 12) + '" text-anchor="middle" font-size="34" font-weight="700" fill="' + t.ctaText + '">' + esc(v.cta) + '</text></g>');
    }

    /* handle, opposite bottom corner */
    if (v.handle) {
      var hx = rtl ? M : W - M;
      out.push('<text x="' + hx + '" y="990" text-anchor="' + (rtl ? 'start' : 'end') +
        '" font-size="28" font-weight="600" letter-spacing="0.5" fill="' + t.handle + '" direction="ltr">' + esc(v.handle) + '</text>');
    }

    out.push('</svg>');
    return out.join('');
  }

  var api = { buildPost: buildPost, wrap: wrap, cupMark: cupMark, THEMES: THEMES };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { root.ONPost = api; }
})(typeof window !== 'undefined' ? window : this);
