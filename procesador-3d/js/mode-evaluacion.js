/* Procesador 3D — modo "Evaluación" (M06): quiz de 10 preguntas.
   Algunas preguntas se responden tocando la pieza en el modelo 3D. El resultado se guarda con la capa de datos (M07). */
window.PXD = window.PXD || {};
PXD.modes = PXD.modes || {};
PXD.modes.evaluacion = function (ctx) {
  'use strict';
  const D = PXD.data, TEMAS = D.TEMAS;
  const REPASO = { componentes: 'desarmar', unidades: 'funciona', ciclo: 'funciona', memoria: 'funciona', enfriamiento: 'armar' };
  const MODE_NAME = { desarmar: 'Desarmar', funciona: 'Cómo funciona', armar: 'Armar' };
  const st = { fase: 'inicio', i: 0, preg: [], orden: [], resp: [], t0: 0, fb: null, nombre: '', grupo: '', result: null, error: '' };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function render() {
    const p = ctx.panel;
    if (st.fase === 'inicio') {
      ctx.setDock('');
      const last = ctx.store.get('p3d-alumno') || {};
      p.innerHTML = '<p class="kicker">Evaluación</p><h2>Pon a prueba lo que aprendiste</h2>' +
        '<p class="lede">Son 10 preguntas, 2 de cada tema. Algunas se contestan tocando la pieza correcta en el modelo 3D.</p>' +
        '<p class="muted small">El examen cambia en cada intento: las preguntas se eligen al azar de un banco de ' + (D.BANCO.length + D.GENERADORES.length) + ' y algunas traen números nuevos cada vez.</p>' +
        '<form id="evForm" class="form" autocomplete="on"><label for="evName">Tu nombre</label><input id="evName" name="nombre" required maxlength="60" value="' + esc(last.nombre || '') + '" placeholder="Nombre y apellido">' +
        '<label for="evGroup">Grupo <span class="muted">(opcional)</span></label><input id="evGroup" name="grupo" maxlength="20" value="' + esc(last.grupo || '') + '" placeholder="Ej. 5A">' +
        (st.error ? '<p class="err">' + st.error + '</p>' : '') +
        '<button class="btn primary" type="submit">Comenzar evaluación</button></form>' +
        (ctx.modeEnabled('docente') ? '<p class="muted small">Tu resultado queda guardado para que el docente lo consulte.</p>' : '');
      p.querySelector('#evForm').addEventListener('submit', e => {
        e.preventDefault();
        const n = p.querySelector('#evName').value.trim(), g = p.querySelector('#evGroup').value.trim();
        if (n.length < 2) { st.error = 'Escribe tu nombre para guardar el resultado.'; render(); return; }
        st.error = ''; st.nombre = n; st.grupo = g; ctx.store.set('p3d-alumno', { nombre: n, grupo: g }); start();
      });
      return;
    }
    if (st.fase === 'pregunta') {
      const q = st.preg[st.i], n = st.preg.length;
      ctx.setDock('<div class="dots">' + st.preg.map((_, k) => '<i class="' + (k < st.i ? (st.resp[k].correcta ? 'ok' : 'bad') : k === st.i ? 'on' : '') + '"></i>').join('') + '</div><span class="count">' + (st.i + 1) + ' / ' + n + '</span>');
      let html = '<p class="kicker">Pregunta ' + (st.i + 1) + ' de ' + n + ' · ' + TEMAS[q.tema] + '</p><h2 class="q">' + q.texto + '</h2>';
      if (q.tipo === 'opcion') {
        html += '<div class="opts">' + st.orden[st.i].map((oi, k) => {
          let cls = '';
          if (st.fb) { if (oi === q.correcta) cls = ' right'; else if (oi === st.fb.chosen) cls = ' wrong'; }
          return '<button class="opt' + cls + '" data-o="' + oi + '"' + (st.fb ? ' disabled' : '') + '><b>' + 'ABCD'[k] + '</b><span>' + q.opciones[oi] + '</span></button>';
        }).join('') + '</div>';
      } else {
        html += '<div class="card touch"><h4>Toca la pieza en el modelo 3D</h4><p class="muted">Puedes girar el modelo arrastrando. Los nombres están ocultos.</p>' + (st.fb ? '' : '<button class="btn" id="evSkip">No sé</button>') + '</div>';
      }
      if (st.fb) {
        html += '<div class="card ' + (st.fb.correct ? 'okc' : 'badc') + '"><h4>' + (st.fb.correct ? '¡Correcto!' : 'No es correcto') + '</h4><p>' + q.explicacion + '</p></div>' +
          '<div class="row"><button class="btn primary" id="evNext">' + (st.i === n - 1 ? 'Ver resultado' : 'Siguiente pregunta') + '</button></div>';
      }
      p.innerHTML = html;
      p.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => answer(+b.dataset.o)));
      const sk = p.querySelector('#evSkip'); if (sk) sk.onclick = () => answer(null);
      const nx = p.querySelector('#evNext'); if (nx) nx.onclick = next;
      return;
    }
    // resultado
    ctx.setDock('');
    const r = st.result, porTema = {};
    st.resp.forEach(x => { const t = porTema[x.tema] || (porTema[x.tema] = { ok: 0, n: 0 }); t.n++; if (x.correcta) t.ok++; });
    const dom = Object.keys(porTema).filter(k => porTema[k].ok === porTema[k].n), ref = Object.keys(porTema).filter(k => porTema[k].ok < porTema[k].n);
    const nivel = r.puntuacion >= 90 ? 'Excelente' : r.puntuacion >= 70 ? 'Aprobado' : 'Necesitas repasar';
    let html = '<p class="kicker">Resultado · ' + esc(st.nombre) + (st.grupo ? ' · ' + esc(st.grupo) : '') + '</p>' +
      '<div class="score ' + (r.puntuacion >= 70 ? 'ok' : 'low') + '"><span><em id="evScore">0</em><small>%</small></span><div><b>' + nivel + '</b><p>' + r.correctas + ' de ' + r.total + ' correctas · ' + ctx.fmtTime(r.tiempo_s) + '</p></div></div>' +
      '<h3>Por tema</h3><ul class="temas">' + Object.keys(porTema).map(k => '<li class="' + (porTema[k].ok === porTema[k].n ? 'ok' : 'no') + '"><span>' + TEMAS[k] + '</span><b>' + porTema[k].ok + '/' + porTema[k].n + '</b></li>').join('') + '</ul>';
    if (dom.length) html += '<div class="card okc"><h4>Conceptos dominados</h4><p>' + dom.map(k => TEMAS[k]).join(', ') + '.</p></div>';
    if (ref.length) {
      const modos = [...new Set(ref.map(k => REPASO[k]))].filter(m => ctx.modeEnabled(m));
      html += '<div class="card"><h4>Para reforzar</h4><p>' + ref.map(k => TEMAS[k]).join(', ') + '.</p>' + (modos.length ? '<div class="row">' + modos.map(m => '<button class="btn" data-go="' + m + '">Repasar en “' + MODE_NAME[m] + '”</button>').join('') + '</div>' : '') + '</div>';
    }
    html += '<div class="row"><button class="btn primary" id="evAgain">Intentar de nuevo</button></div>' +
      '<p class="muted small">Resultado guardado' + (ctx.modeEnabled('docente') ? '. El docente lo puede consultar en el panel Docente.' : ' en este navegador.') + '</p>';
    p.innerHTML = html;
    p.querySelector('#evAgain').onclick = start;
    PXD.fx.countUp(p.querySelector('#evScore'), r.puntuacion, 1000);
    p.querySelectorAll('[data-go]').forEach(b => b.onclick = () => ctx.setMode(b.dataset.go));
  }

  function start() {
    PXD.db.api.get('/api/modulos/1/examen').then(r => {
      st.preg = r.data; st.orden = st.preg.map(q => q.opciones ? shuffle(q.opciones.map((_, i) => i)) : null);
      st.i = 0; st.resp = []; st.fb = null; st.t0 = performance.now(); st.fase = 'pregunta'; ctx.bench.clear(); render(); PXD.fx.panelIn(ctx.panel);
    });
  }
  function answer(choice) {
    if (st.fb) return;
    const q = st.preg[st.i], correct = choice === q.correcta;
    st.resp.push({ pregunta_id: q.id, tema: q.tema, correcta: correct });
    st.fb = { correct, chosen: choice };
    ctx.audio.play(correct ? 'place' : 'wrong');
    if (q.tipo === 'modelo') {
      if (!correct && choice) ctx.bench.highlight(choice, 0xe0685a, 1.2);
      setTimeout(() => ctx.bench.highlight(q.correcta, 0x6bcb8b, 4), correct ? 0 : 900);
    }
    render();
  }
  function next() {
    st.fb = null; ctx.bench.clear();
    if (st.i < st.preg.length - 1) { st.i++; render(); PXD.fx.panelIn(ctx.panel); return; }
    const tiempo = (performance.now() - st.t0) / 1000;
    PXD.db.api.post('/api/resultados', { nombre: st.nombre, grupo: st.grupo, modulo_id: 1, tiempo_s: tiempo, respuestas: st.resp.map(x => ({ pregunta_id: x.pregunta_id, tema: x.tema, correcta: x.correcta })) })
      .then(r => { st.result = r.data; st.fase = 'resultado'; ctx.audio.play(r.data.puntuacion >= 70 ? 'record' : 'done'); render(); PXD.fx.panelIn(ctx.panel);
        if (r.data.puntuacion >= 80) setTimeout(() => PXD.fx.confetti({ x: 0.75, y: 0.35, n: r.data.puntuacion === 100 ? 240 : 150 }), 700); });
  }

  return {
    enter() {
      st.fase = 'inicio'; st.fb = null;
      ctx.bench.setExplode(1);
      const f = ctx.bench.frame(1); ctx.flyTo(f[0], f[1], 1.3);
      render();
    },
    exit() { ctx.bench.clear(); },
    pickPiece(id) {
      if (st.fase !== 'pregunta' || st.fb) return;
      const q = st.preg[st.i];
      if (q.tipo === 'modelo') answer(id);
      else ctx.toast('En esta pregunta elige una opción del panel.');
    }
  };
};
