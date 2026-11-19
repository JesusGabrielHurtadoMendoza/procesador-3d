/* Procesador 3D — capa de datos (M07 Progreso).
   Guarda usuarios y resultados en el navegador (localStorage) y los expone con
   las mismas rutas que la API REST del proyecto: así, cuando exista un servidor,
   solo se cambia esta capa y el resto de la aplicación queda igual. */
window.PXD = window.PXD || {};
PXD.db = (function () {
  'use strict';
  const KEY = 'p3d-db-v1';
  let mem = null;
  function empty() { return { v: 1, usuarios: [], resultados: [], seq: { usuario: 1, resultado: 1 } }; }
  function load() {
    if (mem) return mem;
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { d = null; }
    mem = d && d.v === 1 ? d : empty();
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* modo privado: queda en memoria */ } }
  const D = () => PXD.data;

  /* ---- entidades ---- */
  function modulos() { return D().MODULOS.map(m => ({ id: m.id, nombre: m.nombre, descripcion: m.descripcion, disponible: m.disponible })); }
  function preguntas(moduloId) {
    if (moduloId !== 1) return [];
    return D().BANCO.map(q => ({ id: q.id, modulo_id: 1, tipo: q.tipo, tema: q.tema, texto: q.texto, opciones: q.opciones || null, correcta: q.correcta, explicacion: q.explicacion }));
  }
  /* Examen nuevo en cada intento: 10 preguntas al azar (2 por tema), sin repetir las del intento anterior. */
  const KEY_ULT = 'p3d-ultimo-examen';
  function examen(moduloId) {
    if (moduloId !== 1) return [];
    let previo = [];
    try { previo = JSON.parse(localStorage.getItem(KEY_ULT)) || []; } catch (e) { previo = mem && mem.ultimo || []; }
    const ex = D().generarExamen(previo).map(q => Object.assign({ modulo_id: 1 }, q));
    const ids = ex.map(q => q.id);
    try { localStorage.setItem(KEY_ULT, JSON.stringify(ids)); } catch (e) { load().ultimo = ids; }
    return ex;
  }
  function componentes(moduloId) {
    if (moduloId !== 1) return [];
    const P = D().PIECES, R = D().REGION_INFO; let id = 1;
    return Object.keys(P).map(k => ({ id: id++, modulo_id: 1, clave: k, nombre: P[k].name, descripcion: P[k].what }))
      .concat(Object.keys(R).map(k => ({ id: id++, modulo_id: 1, clave: k, nombre: R[k][0], descripcion: R[k][1] })));
  }
  function usuarioPorNombre(nombre, grupo) {
    const db = load(), n = String(nombre || '').trim(), g = String(grupo || '').trim();
    let u = db.usuarios.find(x => x.nombre.toLowerCase() === n.toLowerCase() && (x.grupo || '') === g);
    if (!u) { u = { id: db.seq.usuario++, nombre: n, grupo: g, correo: '', rol: 'alumno' }; db.usuarios.push(u); save(); }
    return u;
  }
  function guardarResultado(b) {
    const db = load();
    if (!b || !b.nombre || !Array.isArray(b.respuestas)) return { status: 400, data: { error: 'Faltan datos: nombre y respuestas.' } };
    const u = usuarioPorNombre(b.nombre, b.grupo);
    const total = b.respuestas.length, correctas = b.respuestas.filter(r => r.correcta).length;
    const r = { id: db.seq.resultado++, usuario_id: u.id, modulo_id: b.modulo_id || 1, puntuacion: total ? Math.round(correctas / total * 100) : 0,
      correctas, total, tiempo_s: Math.round(b.tiempo_s || 0), fecha: new Date().toISOString(),
      respuestas: b.respuestas.map(x => ({ pregunta_id: x.pregunta_id, tema: x.tema || (D().infoPregunta(x.pregunta_id) || {}).tema || '', correcta: !!x.correcta })) };
    db.resultados.push(r); save();
    return { status: 201, data: r };
  }
  function conUsuario(r) { const u = load().usuarios.find(x => x.id === r.usuario_id) || {}; return Object.assign({}, r, { alumno: u.nombre || '—', grupo: u.grupo || '' }); }

  /* ---- enrutador con las rutas de la API REST ---- */
  const routes = [
    ['GET', /^\/api\/modulos$/, () => modulos()],
    ['GET', /^\/api\/modulos\/(\d+)$/, m => modulos().find(x => x.id === +m[1]) || null],
    ['GET', /^\/api\/modulos\/(\d+)\/preguntas$/, m => preguntas(+m[1])],
    ['GET', /^\/api\/modulos\/(\d+)\/examen$/, m => examen(+m[1])],
    ['GET', /^\/api\/modulos\/(\d+)\/componentes$/, m => componentes(+m[1])],
    ['POST', /^\/api\/resultados$/, (m, body) => guardarResultado(body)],
    ['GET', /^\/api\/resultados$/, () => load().resultados.map(conUsuario).reverse()],
    ['DELETE', /^\/api\/resultados$/, () => { const db = load(); db.resultados = []; db.usuarios = []; db.seq = { usuario: 1, resultado: 1 }; save(); return { borrados: true }; }],
    ['GET', /^\/api\/alumnos$/, () => load().usuarios.slice()],
    ['GET', /^\/api\/alumnos\/(\d+)\/resultados$/, m => load().resultados.filter(r => r.usuario_id === +m[1]).map(conUsuario)]
  ];
  function request(method, url, body) {
    return Promise.resolve().then(() => {
      for (const [mth, re, fn] of routes) {
        const m = url.match(re);
        if (mth === method && m) {
          const out = fn(m, body);
          if (out && out.status) return out;
          return out == null ? { status: 404, data: { error: 'No encontrado' } } : { status: 200, data: out };
        }
      }
      return { status: 404, data: { error: 'Ruta no encontrada: ' + method + ' ' + url } };
    });
  }
  return {
    api: { get: u => request('GET', u), post: (u, b) => request('POST', u, b), del: u => request('DELETE', u) },
    modo: 'local'
  };
})();
