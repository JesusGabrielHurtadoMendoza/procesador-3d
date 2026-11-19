/* Procesador 3D — pantalla de inicio y selección de módulo (M01). */
window.PXD = window.PXD || {};
PXD.modes = PXD.modes || {};
PXD.modes.inicio = function (ctx) {
  'use strict';
  const ACTS = [
    ['desarmar', 'Desarmar', 'Las 9 capas del procesador y qué hace cada una.'],
    ['armar', 'Armar', 'Coloca las piezas en orden y prueba la temperatura.'],
    ['funciona', 'Cómo funciona', 'ALU, unidad de control, registros y caché en el ciclo de instrucción.'],
    ['evaluacion', 'Evaluación', 'Examen de 10 preguntas que cambia en cada intento.'],
    ['fabricacion', 'Fabricación', 'De la arena al procesador en 10 pasos.'],
    ['comparar', 'Comparar', 'Celular, laptop, escritorio y 1993 contra hoy.'],
    ['sockets', 'Sockets', 'LGA contra PGA.'],
    ['docente', 'Panel docente', 'Resultados de los alumnos.']
  ];
  function first() { const a = ACTS.find(x => ctx.modeEnabled(x[0]) && x[0] !== 'docente'); return a ? a[0] : null; }
  function render() {
    ctx.setDock('');
    const mods = (PXD.data.MODULOS || []).filter(m => m.disponible);
    const acts = ACTS.filter(a => ctx.modeEnabled(a[0]));
    ctx.sheet.hidden = false;
    ctx.sheet.innerHTML = '<div class="home">' +
      '<div class="hero"><div class="chip-art" aria-hidden="true"><i></i></div><div><h1>Procesador 3D</h1><p>Aprende Arquitectura de Computadoras con un procesador en 3D que puedes desarmar, armar y ver funcionar.</p></div></div>' +
      '<h3>Módulo</h3><div class="mods">' + mods.map(m => '<article class="mod' + (m.disponible ? '' : ' off') + '"><h4>' + m.nombre + '</h4><p>' + m.descripcion + '</p>' +
        (m.disponible ? '<button class="btn primary" data-enter="1">Entrar</button>' : '<span class="soon">Próximamente</span>') + '</article>').join('') + '</div>' +
      (acts.length ? '<h3>Actividades del módulo Arquitectura de Computadoras</h3><div class="acts">' + acts.map(a => '<button class="act" data-go="' + a[0] + '"><b>' + a[1] + '</b><span>' + a[2] + '</span></button>').join('') + '</div>' : '') +
      '<div class="manual"><img src="assets/qr-manual.png" alt="Código QR para descargar el manual de usuario" width="132" height="132">' +
        '<div><h4>Manual de usuario</h4><p>Escanea el código con tu celular o descárgalo aquí. Explica paso a paso cómo usar cada parte de la página.</p>' +
        '<a class="btn primary" href="docs/Manual_de_Usuario_Procesador3D.pdf" download>Descargar manual (PDF)</a></div></div>' +
      '<div class="credits"><span>Hecho por <b>Jesús Gabriel Hurtado Mendoza</b> y <b>Alan Zabdiel Gómez Martín</b></span><span>Ingeniería en Sistemas Computacionales · TESJI</span></div>' +
      '</div>';
    // si la página está publicada, el QR se genera con su dirección real (así sirve aunque cambie el nombre del repositorio)
    try {
      if (/^https?:$/.test(location.protocol) && window.qrcode) {
        const q = qrcode(0, 'M'); q.addData(new URL('docs/Manual_de_Usuario_Procesador3D.pdf', location.href).href); q.make();
        ctx.sheet.querySelector('.manual img').src = q.createDataURL(6, 2);
      }
    } catch (e) { /* se queda la imagen guardada */ }
    ctx.sheet.querySelectorAll('[data-enter]').forEach(b => b.onclick = () => { const m = first(); if (m) ctx.setMode(m); });
    ctx.sheet.querySelectorAll('[data-go]').forEach(b => b.onclick = () => ctx.setMode(b.dataset.go));
    ctx.panel.innerHTML = '<p class="kicker">Inicio</p><h2>Bienvenido</h2><p class="lede">Así se usa:</p>' +
      '<ol class="howto"><li>Elige el módulo <b>Arquitectura de Computadoras</b>.</li><li>Gira y acerca el procesador con el mouse o el dedo.</li><li>Toca una pieza para leer qué es y para qué sirve.</li><li>Ármalo tú mismo y mira el ciclo de instrucción.</li><li>Termina con la evaluación y revisa tu resultado.</li></ol>' +
      '<p class="muted small">Funciona en computadora y en celular, sin instalar nada.</p>';
  }
  return { enter: render, exit() { ctx.sheet.hidden = true; } };
};
