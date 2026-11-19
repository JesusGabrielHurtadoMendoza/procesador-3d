/* Procesador 3D — "Panel docente" (M08): consulta de resultados de la evaluación. */
window.PXD = window.PXD || {};
PXD.modes = PXD.modes || {};
PXD.modes.docente = function (ctx) {
  'use strict';
  const D = PXD.data, PIN = String((ctx.CFG && ctx.CFG.docentePIN) || '1234');
  const st = { ok: false, grupo: '', confirm: false, error: '', rows: [] };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fecha = iso => { const d = new Date(iso); return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }); };

  function login() {
    ctx.setDock('');
    ctx.sheet.hidden = false;
    ctx.sheet.innerHTML = '<div class="sheet-empty"><svg class="lock" width="56" height="56" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><h2>Panel docente</h2><p>Inicia sesión con el PIN para ver los resultados de tus alumnos.</p></div>';
    ctx.panel.innerHTML = '<p class="kicker">Panel docente</p><h2>Acceso para docentes</h2>' +
      '<form id="pinForm" class="form"><label for="pin">PIN</label><input id="pin" type="password" inputmode="numeric" maxlength="12" autocomplete="off" required>' +
      (st.error ? '<p class="err">' + st.error + '</p>' : '') + '<button class="btn primary" type="submit">Entrar</button></form>' +
      '<p class="muted small">PIN inicial: 1234. Se cambia en el archivo js/config.js.</p>';
    const f = ctx.panel.querySelector('#pinForm');
    f.addEventListener('submit', e => { e.preventDefault(); if (f.querySelector('#pin').value === PIN) { st.ok = true; st.error = ''; load(); } else { st.error = 'PIN incorrecto. Revisa e inténtalo otra vez.'; login(); } });
    setTimeout(() => { const i = ctx.panel.querySelector('#pin'); if (i) i.focus(); }, 50);
  }
  function load() { PXD.db.api.get('/api/resultados').then(r => { st.rows = r.data || []; render(); }); }

  function render() {
    ctx.setDock('');
    const all = st.rows, grupos = [...new Set(all.map(r => r.grupo).filter(Boolean))].sort();
    const rows = st.grupo ? all.filter(r => r.grupo === st.grupo) : all;
    const alumnos = new Set(rows.map(r => r.usuario_id)).size;
    const prom = rows.length ? Math.round(rows.reduce((s, r) => s + r.puntuacion, 0) / rows.length) : 0;
    const aprob = rows.length ? Math.round(rows.filter(r => r.puntuacion >= 70).length / rows.length * 100) : 0;
    // Cada alumno recibe un examen distinto: se agrupa por tema y por pregunta del banco.
    const resp = rows.flatMap(r => (r.respuestas || []).map(x => Object.assign({ tema: x.tema || D.infoPregunta(x.pregunta_id).tema }, x)));
    const agr = {}; resp.forEach(x => { const a = agr[x.pregunta_id] || (agr[x.pregunta_id] = { q: D.infoPregunta(x.pregunta_id), n: 0, ok: 0 }); a.n++; if (x.correcta) a.ok++; });
    const porPreg = Object.values(agr).sort((a, b) => (a.ok / a.n) - (b.ok / b.n) || b.n - a.n).slice(0, 10);
    const temas = Object.keys(D.TEMAS).map(t => { const rs = resp.filter(x => x.tema === t); return { t, n: rs.length, ok: rs.filter(x => x.correcta).length }; });
    const pct = (ok, n) => n ? Math.round(ok / n * 100) : 0;
    const bar = (label, ok, n) => '<div class="hbar"><span class="lab">' + label + '</span><span class="track"><i style="width:' + pct(ok, n) + '%" class="' + (pct(ok, n) >= 70 ? 'ok' : pct(ok, n) >= 50 ? 'mid' : 'low') + '"></i></span><b>' + (n ? pct(ok, n) + ' %' : '—') + '</b></div>';
    let h = '<div class="dash"><div class="dash-head"><div><p class="kicker">Arquitectura de Computadoras · Evaluación</p><h2>Resultados' + (st.grupo ? ' · grupo ' + esc(st.grupo) : '') + '</h2></div>' +
      (grupos.length ? '<label class="sel">Grupo <select id="grp"><option value="">Todos</option>' + grupos.map(g => '<option' + (g === st.grupo ? ' selected' : '') + '>' + esc(g) + '</option>').join('') + '</select></label>' : '') + '</div>';
    if (!rows.length) {
      h += '<div class="sheet-empty"><h2>Todavía no hay resultados</h2><p>Pide a tus alumnos que hagan la Evaluación en este navegador. Aquí aparecerán sus puntuaciones.</p></div></div>';
    } else {
      h += '<div class="tiles"><div><b>Intentos</b><span>' + rows.length + '</span></div><div><b>Alumnos</b><span>' + alumnos + '</span></div><div><b>Promedio</b><span>' + prom + ' %</span></div><div><b>Aprobados (≥70 %)</b><span>' + aprob + ' %</span></div></div>' +
        '<div class="cols"><section><h3>Aciertos por tema</h3>' + temas.map(x => bar(D.TEMAS[x.t], x.ok, x.n)).join('') + '</section>' +
        '<section><h3>Preguntas más difíciles</h3><p class="muted small">De ' + Object.keys(agr).length + ' preguntas distintas que han salido.</p>' + porPreg.map(x => bar(esc(x.q.texto.slice(0, 38)) + (x.q.texto.length > 38 ? '…' : ''), x.ok, x.n)).join('') + '</section></div>' +
        '<h3>Intentos</h3><div class="tblwrap"><table class="tbl"><thead><tr><th>Alumno</th><th>Grupo</th><th>Fecha</th><th>Puntuación</th><th>Correctas</th><th>Tiempo</th></tr></thead><tbody>' +
        rows.map(r => '<tr><td>' + esc(r.alumno) + '</td><td>' + esc(r.grupo || '—') + '</td><td>' + fecha(r.fecha) + '</td><td><span class="pill ' + (r.puntuacion >= 70 ? 'ok' : 'low') + '">' + r.puntuacion + ' %</span></td><td>' + r.correctas + '/' + r.total + '</td><td class="mono">' + ctx.fmtTime(r.tiempo_s) + '</td></tr>').join('') +
        '</tbody></table></div></div>';
    }
    ctx.sheet.hidden = false; ctx.sheet.innerHTML = h;
    const g = ctx.sheet.querySelector('#grp'); if (g) g.onchange = () => { st.grupo = g.value; render(); };

    ctx.panel.innerHTML = '<p class="kicker">Panel docente</p><h2>Resultados del grupo</h2>' +
      '<p class="lede">Consulta cómo le fue a cada alumno y qué temas cuestan más trabajo.</p>' +
      '<div class="row"><button class="btn primary" id="csv"' + (rows.length ? '' : ' disabled') + '>Exportar CSV</button><button class="btn" id="ref">Actualizar</button></div>' +
      (st.confirm ? '<div class="card badc"><h4>¿Borrar todos los resultados?</h4><p>Esto no se puede deshacer.</p><div class="row"><button class="btn" id="delYes">Sí, borrar</button><button class="btn" id="delNo">Cancelar</button></div></div>'
        : '<div class="row"><button class="btn" id="del"' + (all.length ? '' : ' disabled') + '>Borrar resultados</button><button class="btn" id="out">Cerrar sesión</button></div>') +
      '<div class="fact"><b>Dónde se guardan</b><p>En esta versión los resultados se guardan en este navegador (modo local), con las mismas rutas que la API REST del proyecto (GET /api/resultados). Con un servidor se consultarían desde cualquier computadora.</p></div>';
    const $ = id => ctx.panel.querySelector('#' + id);
    if ($('csv')) $('csv').onclick = () => exportCSV(rows);
    $('ref').onclick = load;
    if ($('del')) $('del').onclick = () => { st.confirm = true; render(); };
    if ($('delNo')) $('delNo').onclick = () => { st.confirm = false; render(); };
    if ($('delYes')) $('delYes').onclick = () => PXD.db.api.del('/api/resultados').then(() => { st.confirm = false; ctx.toast('Resultados borrados'); load(); });
    if ($('out')) $('out').onclick = () => { st.ok = false; login(); };
  }
  function exportCSV(rows) {
    const T = Object.keys(D.TEMAS), head = ['alumno', 'grupo', 'fecha', 'puntuacion', 'correctas', 'total', 'tiempo_s'].concat(T.map(t => 'tema_' + t), ['preguntas']);
    const cell = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const lines = [head.join(',')].concat(rows.map(r => { const rs = r.respuestas || [];
      return [r.alumno, r.grupo, r.fecha, r.puntuacion, r.correctas, r.total, r.tiempo_s].concat(T.map(t => { const x = rs.filter(y => (y.tema || D.infoPregunta(y.pregunta_id).tema) === t); return x.length ? x.filter(y => y.correcta).length + '/' + x.length : ''; }), [rs.map(y => y.pregunta_id + (y.correcta ? '✓' : '✗')).join(' ')]).map(cell).join(','); }));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'resultados-procesador-3d.csv';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    ctx.toast('Descargando resultados-procesador-3d.csv');
  }
  return { enter() { st.confirm = false; if (st.ok) load(); else login(); }, exit() { ctx.sheet.hidden = true; } };
};
