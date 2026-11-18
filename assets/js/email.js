// Email addresses are in the HTML without "@" (layouts/_partials/email.html):
// <span class="email" data-u="kontakt" data-d="example.org">. Turn each into
// a mailto: link showing the real address (or its label).
(function () {
  document.querySelectorAll('span.email[data-u][data-d]').forEach(function (s) {
    var addr = s.dataset.u + '@' + s.dataset.d;
    var a = document.createElement('a');
    a.href = 'mailto:' + addr;
    a.textContent = s.dataset.label || addr;
    a.className = s.className;
    s.replaceWith(a);
  });
})();
