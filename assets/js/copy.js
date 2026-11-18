// Copy buttons next to the bank details (layouts/_partials/bank-card.html).
// Buttons stay hidden where the browser can't copy (no Clipboard API, or a
// page not served over https/localhost).
(function () {
  if (window.copyButtonsReady || !(navigator.clipboard && window.isSecureContext)) return;
  window.copyButtonsReady = true;
  document.querySelectorAll('.copy-btn').forEach(function (b) {
    b.hidden = false;
    b.addEventListener('click', function () {
      navigator.clipboard.writeText(b.dataset.copy).then(function () {
        b.textContent = 'Kopiert';
        b.classList.add('copied');
        setTimeout(function () { b.textContent = 'Kopieren'; b.classList.remove('copied'); }, 2000);
      });
    });
  });
})();
