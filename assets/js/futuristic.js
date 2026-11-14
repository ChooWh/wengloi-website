/* Futuristic motion layer, built on anime.js v4 (assets/js/anime.umd.min.js, MIT).
   Purely decorative: all text and links stay in the HTML, and nothing here changes content.
   Skipped entirely for prefers-reduced-motion and Save-Data; the page falls back to the
   original CSS reveal in index.html. */
(function () {
  'use strict';
  var A = window.anime;
  if (!A || !A.animate) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conn = navigator.connection || {};
  if (reduced || conn.saveData) return;

  var animate = A.animate, stagger = A.stagger, rand = A.utils.random;
  var wide = window.innerWidth >= 900;
  var NS = 'http://www.w3.org/2000/svg';
  var hero = document.querySelector('.hero');

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function layer(cls, parent) {
    var d = document.createElement('div');
    d.className = cls; d.setAttribute('aria-hidden', 'true');
    parent.appendChild(d);
    return d;
  }
  /* Pause looping animations while their section is off screen. */
  function pauseOffscreen(target, anims) {
    new IntersectionObserver(function (es) {
      anims.forEach(function (a) { es[0].isIntersecting ? a.play() : a.pause(); });
    }).observe(target);
  }

  /* ---------- Hero: blueprint HUD (draws itself, then idles) ---------- */
  if (hero) {
    var loops = [];

    if (wide) {
      /* Two separate machines, drawn as two separate panels:
         1) long-bed lathe: shafts up to 4,000 mm long, max Ø300 mm
         2) FUJISEIKI face lathe: flanges and plates up to Ø1,600 mm */
      var svg = el('svg', { 'class': 'hud-art', viewBox: '0 0 600 480', 'aria-hidden': 'true', focusable: 'false' });
      hero.insertBefore(svg, hero.querySelector('.hud'));
      var gA = el('g', { transform: 'translate(0,-50)' }, svg), gB = el('g', {}, svg);
      var P = function (g, d, cls) { return el('path', { d: d, 'class': 'd ' + (cls || '') }, g); };
      var T = function (g, x, y, t, anchor) {
        var n = el('text', { x: x, y: y }, g); n.textContent = t;
        if (anchor) n.setAttribute('text-anchor', anchor);
        return n;
      };
      /* panel frames (corner brackets) */
      P(svg, 'M10 40V20H30 M570 20H590V40 M10 270V290H30 M590 270V290H570');
      P(svg, 'M10 340V320H30 M570 320H590V340 M10 450V470H30 M590 450V470H570');
      /* panel 1: long-bed lathe, stepped shaft side view */
      P(gA, 'M20 190H580', 'thin dash');
      P(gA, 'M50 165H120V145H250V120H400V150H530V230H400V260H250V235H120V215H50Z', 'shaft');
      P(gA, 'M250 120V260', 'thin'); P(gA, 'M120 145V235', 'thin'); P(gA, 'M400 120V260', 'thin');
      P(gA, 'M300 178H360V202H300Z', 'thin');
      P(gA, 'M50 300H530', 'dim'); P(gA, 'M50 290V310', 'dim'); P(gA, 'M530 290V310', 'dim');
      P(gA, 'M50 300l12 -5v10Z M530 300l-12 -5v10Z', 'dim');
      P(gA, 'M560 120V260', 'dim'); P(gA, 'M550 120H570', 'dim'); P(gA, 'M550 260H570', 'dim');
      /* panel 2: face lathe, flange seen face-on */
      var cx = 130, cy = 395;
      el('circle', { cx: cx, cy: cy, r: 52, 'class': 'd' }, gB);
      el('circle', { cx: cx, cy: cy, r: 34, 'class': 'd thin' }, gB);
      el('circle', { cx: cx, cy: cy, r: 12, 'class': 'd' }, gB);
      for (var b = 0; b < 6; b++) {
        var a = b * Math.PI / 3;
        el('circle', { cx: cx + 43 * Math.cos(a), cy: cy + 43 * Math.sin(a), r: 3, 'class': 'd thin' }, gB);
      }
      P(gB, 'M' + (cx - 66) + ' ' + cy + 'H' + (cx + 66) + 'M' + cx + ' ' + (cy - 66) + 'V' + (cy + 66), 'thin dash');
      P(gB, 'M' + (cx - 52) + ' 462H' + (cx + 52) + 'M' + (cx - 52) + ' 456V468M' + (cx + 52) + ' 456V468', 'dim');
      /* idle layer */
      var scan = el('line', { 'class': 'hud-scan', x1: 0, y1: 100, x2: 0, y2: 280 }, gA);
      var pulse = el('circle', { 'class': 'hud-pulse', cx: cx, cy: cy, r: 52 }, gB);
      [[120, 145], [250, 120], [400, 150], [530, 190]].forEach(function (p) {
        el('circle', { 'class': 'node', cx: p[0], cy: p[1], r: 3.5 }, gA);
      });
      T(svg, 40, 44, 'LONG-BED LATHE');
      T(gA, 290, 326, '4,000 mm', 'middle'); T(gA, 560, 106, 'Ø300 max', 'middle'); T(gA, 262, 108, '±0.01');
      T(svg, 40, 344, 'FACE LATHE · FLANGES & PLATES');
      T(svg, 240, 392, 'Ø1,600 mm'); T(svg, 240, 414, 'FLANGE / PLATE');

      var geo = A.svg.createDrawable(svg.querySelectorAll('.d'));
      animate(geo, { draw: ['0 0', '0 1'], duration: 1800, delay: stagger(110), ease: 'inOutQuad' });
      animate(svg.querySelectorAll('text'), { opacity: [0, 0.9], duration: 700, delay: stagger(160, { start: 1400 }) });
      animate(svg.querySelectorAll('.node'), { scale: [0, 1], duration: 600, delay: stagger(140, { start: 1700 }), ease: 'outBack' });

      loops.push(animate(scan, { translateX: [50, 530], duration: 4600, ease: 'inOutSine', loop: true, alternate: true, delay: 2200 }));
      loops.push(animate(pulse, { scale: [1, 2.4], opacity: [0.75, 0], duration: 2400, ease: 'outQuad', loop: true, delay: 2000 }));
      loops.push(animate(svg.querySelectorAll('.node'), { opacity: [1, 0.25], duration: 900, ease: 'inOutSine', loop: true, alternate: true, delay: stagger(220, { start: 2400 }) }));
    }

    /* drifting particles */
    var pbox = layer('fx-layer fx-particles', hero);
    var dots = [];
    var n = wide ? 30 : 12;
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i'); d.className = 'fx-dot';
      var s = rand(2, 4);
      d.style.cssText = 'left:' + rand(0, 100) + '%;top:' + rand(0, 100) + '%;width:' + s + 'px;height:' + s + 'px';
      pbox.appendChild(d); dots.push(d);
    }
    loops.push(animate(dots, {
      translateX: function () { return rand(-70, 70); },
      translateY: function () { return rand(-90, 90); },
      opacity: function () { return rand(0.15, 0.85); },
      duration: function () { return rand(4000, 9000); },
      delay: function () { return rand(0, 2500); },
      ease: 'inOutSine', loop: true, alternate: true
    }));

    /* slow vertical scan line */
    var sl = document.createElement('div'); sl.className = 'fx-scanline'; sl.setAttribute('aria-hidden', 'true');
    hero.appendChild(sl);
    loops.push(animate(sl, { translateY: [0, function () { return hero.offsetHeight; }], duration: 7000, ease: 'linear', loop: true, delay: 1500 }));

    pauseOffscreen(hero, loops);

    /* cursor glow (mouse only) */
    if (window.matchMedia('(hover:hover)').matches && wide) {
      var glow = document.createElement('div'); glow.className = 'fx-glow'; glow.setAttribute('aria-hidden', 'true');
      hero.appendChild(glow);
      var gx = 0, gy = 0, raf = 0;
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect(); gx = e.clientX - r.left; gy = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(function () { raf = 0; glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px)'; });
      });
      hero.addEventListener('mouseenter', function () { animate(glow, { opacity: 1, duration: 500 }); });
      hero.addEventListener('mouseleave', function () { animate(glow, { opacity: 0, duration: 500 }); });
    }
  }

  /* ---------- Scroll reveal: anime.js replaces the CSS transition ---------- */
  var reveals = document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
  Array.prototype.forEach.call(reveals, function (n) {
    var dir = n.classList.contains('reveal-left') ? 'l' : n.classList.contains('reveal-right') ? 'r' : 'u';
    n.setAttribute('data-fx', dir);
    n.classList.remove('reveal', 'reveal-left', 'reveal-right', 'show');
    n.classList.add('fx-pre');
  });
  function clean(node) { node.style.opacity = ''; node.style.transform = ''; node.classList.remove('fx-pre'); }
  var rio = new IntersectionObserver(function (es) {
    var k = 0;
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var node = e.target; rio.unobserve(node);
      var dir = node.getAttribute('data-fx');
      var p = { opacity: [0, 1], duration: 900, delay: k++ * 90, ease: 'outExpo', onComplete: function () { clean(node); } };
      if (dir === 'l') p.translateX = [-50, 0]; else if (dir === 'r') p.translateX = [50, 0]; else p.translateY = [44, 0];
      if (!/^(H2|P|DIV)$/.test(node.tagName) || node.classList.contains('card')) p.scale = [0.95, 1];
      animate(node, p);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  Array.prototype.forEach.call(document.querySelectorAll('.fx-pre'), function (n) { rio.observe(n); });
  /* Safety net: never leave content hidden. */
  setTimeout(function () {
    Array.prototype.forEach.call(document.querySelectorAll('.fx-pre'), function (n) {
      var r = n.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0 && n.style.opacity === '') { clean(n); }
    });
  }, 4000);

  /* ---------- Section accents ---------- */
  /* kicker rule draws in (its width comes from the --kw custom property) */
  var kickers = document.querySelectorAll('.kicker');
  Array.prototype.forEach.call(kickers, function (k) {
    var bar = k;
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      animate({ w: 0 }, {
        w: 34, duration: 900, ease: 'outExpo',
        onUpdate: function (a) { bar.style.setProperty('--kw', a.targets[0].w + 'px'); }
      });
    }, { threshold: 0.6 }).observe(bar);
  });

  /* Trust tiles pop in; numbers glow as they count */
  var trust = document.querySelector('.trust');
  if (trust) {
    var tiles = trust.querySelectorAll('.wrap>div');
    Array.prototype.forEach.call(tiles, function (t) { t.classList.add('fx-pre'); });
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      animate(tiles, { opacity: [0, 1], translateY: [30, 0], scale: [0.9, 1], duration: 800, delay: stagger(110), ease: 'outBack',
        onComplete: function () { Array.prototype.forEach.call(tiles, clean); } });
    }, { threshold: 0.3 }).observe(trust);
  }

  /* Capability table rows slide in */
  var rows = document.querySelectorAll('.caps tbody tr');
  if (rows.length) {
    Array.prototype.forEach.call(rows, function (r) { r.classList.add('fx-pre'); });
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      animate(rows, { opacity: [0, 1], translateX: [-30, 0], duration: 700, delay: stagger(90), ease: 'outExpo',
        onComplete: function () { Array.prototype.forEach.call(rows, clean); } });
    }, { threshold: 0.2 }).observe(document.querySelector('.caps table'));
  }

  /* Steps: a light beam connects the three numbered badges */
  var steps = document.querySelector('.steps .grid3');
  if (steps && wide) {
    var line = document.createElement('div'); line.className = 'fx-stepline'; line.setAttribute('aria-hidden', 'true');
    steps.appendChild(line);
    var place = function () {
      var b = steps.querySelectorAll('.n'); if (b.length < 2) return;
      var r0 = steps.getBoundingClientRect(), a = b[0].getBoundingClientRect(), z = b[b.length - 1].getBoundingClientRect();
      line.style.left = (a.left - r0.left + a.width / 2) + 'px';
      line.style.width = (z.left - a.left) + 'px';
      line.style.top = (a.top - r0.top + a.height / 2 - 1) + 'px';
    };
    place(); window.addEventListener('resize', place);
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect(); place();
      animate(line, { scaleX: [0, 1], duration: 1400, delay: 300, ease: 'inOutQuart' });
    }, { threshold: 0.4 }).observe(steps);
  }

  /* Contact: slow drifting light orbs */
  var contact = document.querySelector('.contact');
  if (contact && wide) {
    var orbs = [['-120px', '-80px', 380, '#22d3ee'], ['70%', '55%', 460, '#2563eb'], ['38%', '-140px', 300, '#38bdf8']].map(function (o) {
      var d = layer('fx-orb', contact);
      d.style.cssText = 'left:' + o[0] + ';top:' + o[1] + ';width:' + o[2] + 'px;height:' + o[2] + 'px;background:' + o[3];
      return d;
    });
    var oa = animate(orbs, {
      translateX: function () { return rand(-90, 90); }, translateY: function () { return rand(-70, 70); },
      duration: function () { return rand(6000, 10000); }, ease: 'inOutSine', loop: true, alternate: true
    });
    pauseOffscreen(contact, [oa]);
  }

  /* ---------- Pointer spotlight on cards (CSS variables feed the glow in futuristic.css) ---------- */
  if (window.matchMedia('(hover:hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var t = e.target.closest && e.target.closest('.card,.step,.member,.capstat,.info div');
      if (!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }
})();
