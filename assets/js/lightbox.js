// Lightbox for content images (render-image.html): every <a class="zoom">
// on the page opens in one <dialog>, with back/forward through all of them.
// Arrow keys and swipe navigate; Esc, the close button or a click next to
// the image close it. Without JavaScript the links simply open the image.
(function () {
  // Labels in the page's language, from the script tag (baseof.html).
  var t = (document.currentScript && document.currentScript.dataset) || {};
  var links = [].slice.call(document.querySelectorAll('a.zoom'));
  if (!links.length || !window.HTMLDialogElement) return;

  var icon = function (d) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
  };
  var d = document.createElement('dialog');
  d.className = 'lightbox' + (links.length === 1 ? ' single' : '');
  d.setAttribute('aria-label', t.label || 'Bildansicht');
  d.innerHTML =
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<p class="lb-count"></p>' +
    '<button type="button" class="lb-close" aria-label="' + (t.close || 'Schließen') + '">' + icon('M6 6l12 12M18 6L6 18') + '</button>' +
    '<button type="button" class="lb-prev" aria-label="' + (t.prev || 'Vorheriges Bild') + '">' + icon('M15 5l-7 7 7 7') + '</button>' +
    '<button type="button" class="lb-next" aria-label="' + (t.next || 'Nächstes Bild') + '">' + icon('M9 5l7 7-7 7') + '</button>';
  document.body.appendChild(d);
  var img = d.querySelector('img'), cap = d.querySelector('figcaption'),
      count = d.querySelector('.lb-count'), i = 0;

  // The smallest WebP from the thumbnail's srcset that covers the screen,
  // else the largest. A plain src (no srcset) keeps the image's real pixel
  // size, so small images are never blown up.
  function pick(a) {
    var need = window.innerWidth * (window.devicePixelRatio || 1), best = null;
    (a.querySelector('img').getAttribute('srcset') || '').split(',').forEach(function (c) {
      var p = c.trim().split(/\s+/), w = parseInt(p[1], 10);
      if (!p[0] || !w) return;
      if (!best || (best.w < need ? w > best.w : w >= need && w < best.w)) best = { url: p[0], w: w };
    });
    return best ? best.url : a.href;
  }
  function show(n) {
    i = (n + links.length) % links.length;
    var a = links[i];
    img.src = pick(a);
    img.alt = cap.textContent = a.querySelector('img').alt;
    count.textContent = (i + 1) + ' / ' + links.length;
    if (links.length > 1) {  // preload the neighbours
      new Image().src = pick(links[(i + 1) % links.length]);
      new Image().src = pick(links[(i - 1 + links.length) % links.length]);
    }
  }

  links.forEach(function (a, n) {
    a.addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;  // new tab etc.
      e.preventDefault();
      show(n);
      d.showModal();
    });
  });
  d.querySelector('.lb-close').addEventListener('click', function () { d.close(); });
  d.querySelector('.lb-prev').addEventListener('click', function () { show(i - 1); });
  d.querySelector('.lb-next').addEventListener('click', function () { show(i + 1); });
  var swiped = 0;
  d.addEventListener('click', function (e) {  // the dark area around the image
    if (Date.now() - swiped < 400) return;    // end of a swipe, not a click
    if (e.target === d || e.target.tagName === 'FIGURE') d.close();
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
  var x0 = null;
  d.addEventListener('pointerdown', function (e) { x0 = e.isPrimary ? e.clientX : null; });
  d.addEventListener('pointerup', function (e) {
    if (x0 === null || e.pointerType === 'mouse') return;
    var dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50 && links.length > 1) { swiped = Date.now(); show(dx < 0 ? i + 1 : i - 1); }
  });
  // Back on the page: focus the image last shown.
  d.addEventListener('close', function () { links[i].focus({ preventScroll: false }); });
})();
