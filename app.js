(async function () {
  const $ = (id) => document.getElementById(id);
  let data;
  try {
    data = await (await fetch('menu.json')).json();
  } catch (e) {
    $('menu').innerHTML = '<p class="empty">No se pudo cargar el menú. Abre el sitio desde un servidor web (no con doble clic al archivo).</p>';
    return;
  }
  const r = data.restaurante;

  // Marca y datos del restaurante
  document.title = r.nombre + ' | Menú';
  $('slogan').textContent = r.slogan;
  $('horario').textContent = r.horario.texto;
  $('direccion').textContent = r.direccion;
  if (r.banner) $('hero').style.backgroundImage = 'url("' + r.banner + '")';
  $('btn-wa').href = 'https://wa.me/' + r.whatsapp + '?text=' + encodeURIComponent(r.mensajeWhatsapp);
  $('btn-mapa').href = r.mapsUrl;

  // Estado Abierto / Cerrado
  const h = new Date().getHours();
  const abierto = h >= r.horario.abre && h < r.horario.cierra;
  const est = $('estado');
  est.textContent = abierto ? 'Abierto' : 'Cerrado';
  est.classList.add(abierto ? 'abierto' : 'cerrado');

  const precio = (n) => '$' + n + ' MXN';
  const placeholder = (t) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112"><rect width="112" height="112" fill="#2a0407"/>' +
    '<circle cx="56" cy="56" r="34" fill="#d9141c"/><text x="56" y="68" font-size="34" font-family="Impact,sans-serif" fill="#ffc928" text-anchor="middle">' +
    t.charAt(0) + '</text></svg>');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const card = (p) =>
    '<article class="card" data-q="' + esc((p.nombre + ' ' + p.descripcion).toLowerCase()) + '">' +
    '<img loading="lazy" width="112" height="112" alt="' + esc(p.nombre) + '" src="' + esc(p.foto || placeholder(p.nombre)) +
    '" onerror="this.onerror=null;this.src=\'' + placeholder(p.nombre) + '\'">' +
    '<div><h4>' + esc(p.nombre) + (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') + '</h4>' +
    '<p>' + esc(p.descripcion) + '</p><p class="precio">' + precio(p.precio) + '</p></div></article>';

  // Render del menú y navegación (un enlace por subcategoría; Bebidas se agrupa en uno)
  let html = '', nav = '';
  data.categorias.forEach((c) => {
    html += '<section class="categoria"><h2>' + esc(c.nombre) + '</h2>';
    c.subcategorias.forEach((s, i) => {
      html += '<section class="subcategoria" id="' + s.id + '"><h3>' + esc(s.nombre) + '</h3><div class="grid">' +
        s.platillos.map(card).join('') + '</div></section>';
      if (c.id !== 'bebidas' || i === 0) nav += '<a href="#' + s.id + '">' + esc(c.id === 'bebidas' ? c.nombre : s.nombre) + '</a>';
    });
    html += '</section>';
  });
  $('menu').innerHTML = html;
  $('nav').innerHTML = nav;

  // Buscador
  $('buscador').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    let total = 0;
    document.querySelectorAll('.card').forEach((el) => {
      const ok = el.dataset.q.includes(q);
      el.hidden = !ok; total += ok;
    });
    document.querySelectorAll('.subcategoria').forEach((s) => { s.hidden = !s.querySelector('.card:not([hidden])'); });
    document.querySelectorAll('.categoria').forEach((c) => { c.hidden = !c.querySelector('.subcategoria:not([hidden])'); });
    $('vacio').hidden = total > 0;
  });

  // Marca el botón activo al hacer scroll
  const links = [...document.querySelectorAll('.nav-track a')];
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.id;
      const key = (id === 'te' || id === 'coca-cola') ? 'te' : id;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + key));
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  document.querySelectorAll('.subcategoria').forEach((s) => obs.observe(s));
})();