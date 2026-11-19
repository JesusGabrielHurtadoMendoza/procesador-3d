/* Procesador 3D — módulos, temas y BANCO de preguntas de la evaluación.
   Cada examen toma 10 preguntas al azar (2 por tema), con al menos 2 que se responden
   tocando la pieza en el modelo 3D, y evita repetir las preguntas del examen anterior.
   Algunas preguntas se generan con números al azar, así que nunca salen iguales.
   tipo 'opcion' = opción múltiple (la primera opción es la correcta; se revuelven al mostrar)
   tipo 'modelo' = tocar la pieza correcta en el modelo 3D (correcta = id de la pieza) */
window.PXD = window.PXD || {};
(function () {
  'use strict';
  const MODULOS = [
    { id: 1, clave: 'arquitectura', nombre: 'Arquitectura de Computadoras', descripcion: 'Procesador 3D: capas, unidades internas, ciclo de instrucción, fabricación y enfriamiento.', disponible: true },
    { id: 2, clave: 'redes', nombre: 'Redes de Computadoras', descripcion: 'Router, switch, topologías y viaje de un paquete.', disponible: false },
    { id: 3, clave: 'digitales', nombre: 'Sistemas Digitales', descripcion: 'Compuertas lógicas, circuitos y tablas de verdad.', disponible: false },
    { id: 4, clave: 'electronica', nombre: 'Electrónica', descripcion: 'Resistencias, capacitores, sensores y circuitos.', disponible: false }
  ];
  const TEMAS = {
    componentes: 'Partes del procesador',
    unidades: 'Unidades internas (ALU y UC)',
    ciclo: 'Ciclo de instrucción y reloj',
    memoria: 'Registros y memoria caché',
    enfriamiento: 'Temperatura y enfriamiento'
  };
  const O = (id, tema, texto, opciones, explicacion) => ({ id, tipo: 'opcion', tema, texto, opciones, correcta: 0, explicacion });
  const T = (id, tema, texto, pieza, explicacion) => ({ id, tipo: 'modelo', tema, texto, correcta: pieza, explicacion });

  /* ---------- preguntas fijas ---------- */
  const BANCO = [
    // Partes del procesador
    O('c1', 'componentes', '¿Qué pieza es el “cerebro” del procesador, con miles de millones de transistores?', ['El die (chip de silicio)', 'El sustrato', 'La tapa metálica (IHS)', 'El disipador'], 'El die es el pedacito de silicio donde están los transistores, los núcleos y la caché.'),
    O('c2', 'componentes', '¿Para qué sirve el sustrato?', ['Conectar el chip con los contactos que tocan la tarjeta madre', 'Enfriar el procesador', 'Guardar los programas', 'Mover aire'], 'El sustrato “agranda” las conexiones microscópicas del chip hasta los contactos.'),
    O('c3', 'componentes', '¿Por qué los contactos del procesador son de oro?', ['Porque no se oxida y conduce muy bien', 'Porque es más barato', 'Porque es magnético', 'Porque enfría mejor'], 'El oro no se oxida, así que el contacto eléctrico se mantiene bueno por años.'),
    O('c4', 'componentes', '¿Qué hacen los capacitores del procesador?', ['Guardan un poco de energía y la sueltan al instante', 'Hacen las sumas', 'Guardan archivos', 'Miden la temperatura'], 'Mantienen el voltaje estable cuando el procesador pide más corriente de golpe.'),
    O('c5', 'componentes', '¿Cuáles piezas pone la fábrica y no el usuario?', ['Contactos, sustrato, die y tapa metálica', 'Pasta térmica y disipador', 'Ventilador y pasta térmica', 'Solo el ventilador'], 'La pasta, el disipador y el ventilador los pone quien arma la computadora.'),
    O('c6', 'componentes', '¿Cuál es el orden correcto de abajo hacia arriba?', ['Sustrato → die → tapa → pasta → disipador', 'Die → sustrato → pasta → tapa → disipador', 'Tapa → die → sustrato → disipador → pasta', 'Disipador → pasta → tapa → die → sustrato'], 'El calor sale del die hacia arriba: tapa, pasta, disipador y aire.'),
    O('c7', 'componentes', '¿Dónde están los pines en un socket LGA?', ['En la tarjeta madre', 'Debajo del procesador', 'En el disipador', 'No hay pines'], 'En LGA los pines son resortitos del socket; el procesador solo tiene contactos planos.'),
    O('c8', 'componentes', 'En laptops y celulares, ¿cómo va el procesador normalmente?', ['Soldado a la tarjeta (BGA)', 'En un socket con palanca', 'Pegado con pasta térmica', 'Atornillado al ventilador'], 'BGA significa que va soldado con bolitas de estaño; no se puede cambiar.'),
    O('c9', 'componentes', '¿Qué pasa en el paso de litografía de la fabricación?', ['Se “imprime” el dibujo del circuito con luz', 'Se corta la oblea', 'Se pega la tapa', 'Se prueba cada chip'], 'Una máquina proyecta luz ultravioleta a través de una máscara con el dibujo del circuito.'),
    O('c10', 'componentes', '¿De qué material se hace el chip del procesador?', ['Silicio', 'Cobre', 'Aluminio', 'Plástico'], 'El silicio se obtiene de la arena y se purifica hasta casi 100 %.'),
    T('m1', 'componentes', 'Toca en el modelo 3D la pieza que protege al chip y reparte su calor.', 'ihs', 'Es la tapa metálica (IHS).'),
    T('m2', 'componentes', 'Toca en el modelo 3D el chip de silicio (el die).', 'die', 'El die es la pieza morada del centro, donde están los transistores.'),
    T('m3', 'componentes', 'Toca en el modelo 3D la placa verde que conecta el chip con los contactos.', 'sustrato', 'Es el sustrato.'),
    T('m4', 'componentes', 'Toca en el modelo 3D los contactos dorados que tocan la tarjeta madre.', 'contactos', 'Son los contactos, en la parte de abajo.'),
    T('m5', 'componentes', 'Toca en el modelo 3D las “pilas instantáneas” que mantienen estable el voltaje.', 'capacitores', 'Son los capacitores, alrededor del sustrato.'),
    // Unidades internas
    O('u1', 'unidades', '¿Qué hace la ALU (unidad aritmética y lógica)?', ['Hace cuentas y comparaciones', 'Guarda los programas al apagar', 'Enfría el procesador', 'Conecta a internet'], 'La ALU es la calculadora del núcleo.'),
    O('u2', 'unidades', '¿Qué parte decodifica la instrucción y da las órdenes al resto del núcleo?', ['La unidad de control (UC)', 'La caché L3', 'El controlador de memoria', 'La gráfica integrada'], 'La UC interpreta la instrucción y dirige registros y ALU.'),
    O('u3', 'unidades', '¿Qué es un núcleo?', ['Un procesador completo en miniatura dentro del chip', 'Un tipo de memoria RAM', 'Un cable del sustrato', 'Un ventilador pequeño'], 'Cada núcleo ejecuta su propia secuencia de instrucciones.'),
    O('u4', 'unidades', 'Si un chip tiene 8 núcleos, ¿qué puede hacer?', ['Trabajar en hasta 8 tareas al mismo tiempo', 'Ir 8 veces más frío', 'Tener 8 GB de RAM', 'Usar 8 ventiladores'], 'Cada núcleo trabaja en paralelo con los demás.'),
    O('u5', 'unidades', '¿Para qué sirve el controlador de memoria?', ['Comunicar al procesador con la RAM', 'Dibujar la pantalla', 'Hacer sumas', 'Mover el ventilador'], 'Es la puerta del chip hacia la memoria RAM.'),
    O('u6', 'unidades', '¿Qué hace la gráfica integrada?', ['Dibuja lo que ves en la pantalla', 'Guarda los resultados', 'Decodifica instrucciones', 'Regula el voltaje'], 'Tiene muchos “mini núcleos” especializados en imágenes.'),
    O('u7', 'unidades', '¿Qué parte del núcleo compara dos números para saber cuál es mayor?', ['La ALU', 'La caché L2', 'El sustrato', 'El controlador de memoria'], 'Además de sumar y restar, la ALU compara y hace operaciones lógicas.'),
    O('u8', 'unidades', '¿Por dónde viajan los datos entre las partes del chip?', ['Por los buses (caminos internos)', 'Por el ventilador', 'Por la pasta térmica', 'Por el aire'], 'Los buses son las “carreteras” por donde viajan los datos.'),
    // Ciclo y reloj
    O('k1', 'ciclo', '¿Cuál es el orden correcto del ciclo de instrucción?', ['Buscar → Decodificar → Ejecutar → Guardar', 'Decodificar → Buscar → Guardar → Ejecutar', 'Ejecutar → Buscar → Decodificar → Guardar', 'Guardar → Ejecutar → Decodificar → Buscar'], 'Fetch, decode, execute y store.'),
    O('k2', 'ciclo', '¿Qué pasa en el paso “buscar” (fetch)?', ['El núcleo trae la siguiente instrucción', 'La ALU hace la cuenta', 'Se guarda el resultado', 'Se enciende el ventilador'], 'Primero hay que traer la instrucción desde la caché.'),
    O('k3', 'ciclo', '¿Qué pasa en el paso “ejecutar”?', ['La ALU realiza la operación', 'Se trae la instrucción', 'Se traduce la instrucción', 'Se apaga el procesador'], 'Ejecutar es hacer la operación, por ejemplo una suma.'),
    O('k4', 'ciclo', '¿Para qué sirve el reloj del procesador?', ['Marcar el ritmo: en cada pulso las partes dan un paso', 'Mostrar la hora', 'Enfriar el chip', 'Guardar datos'], 'Cada pulso del reloj coordina a todas las partes.'),
    O('k5', 'ciclo', '¿En qué paso trabaja la unidad de control?', ['Decodificar', 'Guardar', 'Enfriar', 'Fabricar'], 'La UC decodifica la instrucción y prepara los registros.'),
    O('k6', 'ciclo', 'Después de ejecutar una suma, ¿qué sigue?', ['Guardar el resultado', 'Buscar la RAM de nuevo sin guardar', 'Apagar el núcleo', 'Pulir la oblea'], 'El resultado se guarda en un registro y luego en la caché.'),
    // Memoria
    O('r1', 'memoria', '¿Para qué sirve la memoria caché?', ['Tener cerca de los núcleos los datos que se usan seguido', 'Guardar archivos al apagar', 'Medir la temperatura', 'Dar energía'], 'Así no hay que esperar a la RAM, que está lejos.'),
    O('r2', 'memoria', '¿Dónde guarda el núcleo los datos con los que calcula en este instante?', ['En los registros', 'En la caché L3', 'En el disco duro', 'En la tarjeta de video'], 'Los registros son la memoria más rápida, dentro del núcleo.'),
    O('r3', 'memoria', '¿Cuál de estas memorias es la más rápida?', ['Los registros', 'La caché L3', 'La RAM', 'El disco SSD'], 'Entre más cerca del núcleo, más rápida y más pequeña.'),
    O('r4', 'memoria', '¿Qué caché comparten todos los núcleos?', ['La L3', 'La L1', 'Los registros', 'Ninguna'], 'L1 y L2 son de cada núcleo; la L3 es compartida.'),
    O('r5', 'memoria', '¿Por qué el procesador no trabaja directo con la RAM todo el tiempo?', ['Porque la RAM está lejos y es lenta para el procesador', 'Porque la RAM está apagada', 'Porque la RAM solo guarda imágenes', 'Porque la RAM es más rápida que la caché'], 'Ir a la RAM tarda mucho comparado con la caché.'),
    O('r6', 'memoria', 'Ordena de la más pequeña a la más grande:', ['Registros → L1 → L2 → L3 → RAM', 'RAM → L3 → L2 → L1 → Registros', 'L3 → Registros → L1 → RAM → L2', 'L1 → RAM → Registros → L2 → L3'], 'Entre más cerca del núcleo, más pequeña y más rápida.'),
    // Enfriamiento
    O('e1', 'enfriamiento', '¿Qué hace el procesador si se va a calentar a más de unos 95 °C?', ['Baja su velocidad para protegerse (thermal throttling)', 'Sube su velocidad', 'Borra la RAM', 'Nada'], 'Reduce su frecuencia para producir menos calor.'),
    O('e2', 'enfriamiento', '¿Por qué se pone pasta térmica?', ['Para rellenar huecos microscópicos y que no quede aire', 'Para pegar el ventilador', 'Para que brille', 'Para aislar la electricidad del socket'], 'El aire casi no deja pasar el calor; la pasta sí.'),
    O('e3', 'enfriamiento', '¿Cuánta pasta térmica se recomienda?', ['Una gota del tamaño de un chícharo', 'Todo el tubo', 'Una capa en toda la tarjeta madre', 'Nada'], 'Poner de más no enfría mejor y puede ensuciar.'),
    O('e4', 'enfriamiento', '¿Por qué el disipador tiene muchas aletas?', ['Para tener más superficie y pasar el calor al aire', 'Para que pese menos', 'Para guardar datos', 'Por decoración'], 'Más superficie significa más contacto con el aire.'),
    O('e5', 'enfriamiento', '¿Qué hace el enfriamiento líquido?', ['Lleva el calor con agua hasta un radiador', 'Moja el procesador', 'Congela el chip', 'Reemplaza la pasta térmica'], 'Una bomba mueve el líquido del bloque al radiador.'),
    O('e6', 'enfriamiento', 'Si apagas el ventilador con mucha carga de trabajo, ¿qué pasa?', ['Sube la temperatura y el procesador baja su velocidad', 'Baja la temperatura', 'El procesador va más rápido', 'No pasa nada'], 'Sin aire en movimiento, las aletas ya no sueltan el calor.'),
    T('m6', 'enfriamiento', 'Toca en el modelo 3D la pieza que rellena los huecos entre la tapa y el disipador.', 'pasta', 'Es la pasta térmica.'),
    T('m7', 'enfriamiento', 'Toca en el modelo 3D la pieza con aletas que pasa el calor al aire.', 'disipador', 'Es el disipador.'),
    T('m8', 'enfriamiento', 'Toca en el modelo 3D la pieza que mueve el aire.', 'ventilador', 'Es el ventilador.'),
    T('m9', 'enfriamiento', 'Toca en el modelo 3D la capa delgada que lleva el calor del chip a la tapa.', 'tim1', 'Es el material térmico interno (TIM1).')
  ];

  /* ---------- preguntas generadas con números al azar ---------- */
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const fmt = n => n.toLocaleString('es-MX');
  const GENERADORES = [
    { id: 'g-ghz', tema: 'ciclo', crear() {
      const g = rnd([2.4, 3.0, 3.2, 3.6, 4.2, 4.5, 5.0, 5.5]), ok = Math.round(g * 1000);
      return { texto: 'Un procesador trabaja a ' + g + ' GHz. ¿Cuántos pulsos de reloj da en un segundo?', opciones: [fmt(ok) + ' millones', fmt(Math.round(g * 100)) + ' millones', fmt(Math.round(g * 10)) + ' mil', g + ' millones'], explicacion: 'Giga significa mil millones: ' + g + ' GHz = ' + fmt(ok) + ' millones de pulsos por segundo.' }; } },
    { id: 'g-suma', tema: 'unidades', crear() {
      const a = 2 + Math.floor(Math.random() * 18), b = 2 + Math.floor(Math.random() * 18), op = rnd(['SUMA', 'RESTA']);
      const r = op === 'SUMA' ? a + b : a - b, d = [r + 1, r - 2, op === 'SUMA' ? a - b : a + b].filter(x => x !== r);
      return { texto: 'R1 = ' + a + ' y R2 = ' + b + '. El núcleo ejecuta ' + op + ' R1, R2 → R3. ¿Qué valor guarda R3?', opciones: [String(r)].concat(d.slice(0, 3).map(String)), explicacion: 'La ALU hace ' + a + (op === 'SUMA' ? ' + ' : ' − ') + b + ' = ' + r + ' y el resultado se guarda en R3.' }; } },
    { id: 'g-nucleos', tema: 'unidades', crear() {
      const n = rnd([4, 6, 8, 12, 16]), t = rnd([2, 3, 4]);
      return { texto: 'Un procesador tiene ' + n + ' núcleos y cada uno puede atender 1 tarea a la vez. ¿Cuántas tareas pueden avanzar al mismo tiempo?', opciones: [String(n), String(n * t), String(Math.max(1, n / 2)), '1'], explicacion: 'Cada núcleo trabaja en paralelo: ' + n + ' núcleos = ' + n + ' tareas a la vez.' }; } },
    { id: 'g-temp', tema: 'enfriamiento', crear() {
      const w = rnd([50, 80, 100, 120]), r = rnd([0.3, 0.4, 0.5]), t = Math.round(25 + w * r);
      return { texto: 'Con el modelo del laboratorio (temperatura = 25 °C + potencia × resistencia), si el procesador consume ' + w + ' W y la resistencia térmica es ' + r + ' °C/W, ¿qué temperatura alcanza?', opciones: [t + ' °C', (t + 20) + ' °C', Math.round(w * r) + ' °C', (25 + w) + ' °C'], explicacion: '25 + ' + w + ' × ' + r + ' = ' + t + ' °C.' }; } },
    { id: 'g-cache', tema: 'memoria', crear() {
      const lst = [['los registros', 0], ['la caché L1', 1], ['la caché L2', 2], ['la caché L3', 3], ['la RAM', 4]];
      const pick = lst.slice().sort(() => Math.random() - 0.5).slice(0, 4), best = pick.reduce((a, b) => (b[1] < a[1] ? b : a));
      return { texto: '¿Cuál de estas memorias responde más rápido al núcleo?', opciones: [best[0]].concat(pick.filter(x => x !== best).map(x => x[0])).map(s => s[0].toUpperCase() + s.slice(1)), explicacion: 'El orden de más rápida a más lenta es: registros, L1, L2, L3 y RAM.' }; } },
    { id: 'g-pieza', tema: 'componentes', crear() {
      const P = PXD.data.PIECES, ids = Object.keys(P), k = rnd(ids), otros = ids.filter(x => x !== k).sort(() => Math.random() - 0.5).slice(0, 3);
      return { texto: '¿Qué pieza se describe así? “' + P[k].short + '”', opciones: [P[k].name].concat(otros.map(x => P[x].name)), explicacion: 'Es ' + P[k].name + ': ' + P[k].what };
    } }
  ];

  /* ---------- armar un examen ---------- */
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function generarExamen(previo) {
    const evitar = new Set(previo || []);
    const temas = Object.keys(TEMAS), out = [];
    const disponibles = BANCO.concat(GENERADORES.map(g => ({ id: g.id, tema: g.tema, gen: g })));
    temas.forEach(t => {
      let del = shuffle(disponibles.filter(q => q.tema === t && !evitar.has(q.id)));
      if (del.length < 2) del = del.concat(shuffle(disponibles.filter(q => q.tema === t && evitar.has(q.id))));
      out.push(...del.slice(0, 2));
    });
    // al menos 2 preguntas en el modelo 3D
    let modelo = out.filter(q => q.tipo === 'modelo').length;
    if (modelo < 2) {
      const libres = q => q.tipo === 'modelo' && !out.includes(q);
      const extra = shuffle(BANCO.filter(q => libres(q) && !evitar.has(q.id))).concat(shuffle(BANCO.filter(q => libres(q) && evitar.has(q.id))));
      for (let i = 0; i < out.length && modelo < 2 && extra.length; i++) {
        const cand = extra.findIndex(e => e.tema === out[i].tema);
        if (out[i].tipo !== 'modelo' && cand >= 0) { out[i] = extra.splice(cand, 1)[0]; modelo++; }
      }
    }
    return shuffle(out).map(q => {
      if (q.gen) {
        let g = q.gen.crear(), n = 0;
        while (new Set(g.opciones).size < g.opciones.length && n++ < 8) g = q.gen.crear(); // sin opciones repetidas
        return { id: q.id, tipo: 'opcion', tema: q.tema, texto: g.texto, opciones: [...new Set(g.opciones)], correcta: 0, explicacion: g.explicacion, generada: true };
      }
      return Object.assign({}, q);
    });
  }

  PXD.data = PXD.data || {};
  const NOMBRE_GEN = { 'g-ghz': 'Ciclos por segundo (números al azar)', 'g-suma': 'Operación de la ALU (números al azar)', 'g-nucleos': 'Núcleos e hilos (números al azar)', 'g-temp': 'Cálculo de temperatura (números al azar)', 'g-cache': 'Jerarquía de memoria (al azar)', 'g-pieza': 'Pieza por su descripción (al azar)' };
  function infoPregunta(id) {
    const b = BANCO.find(q => q.id === id); if (b) return { id, tema: b.tema, texto: b.texto };
    const g = GENERADORES.find(x => x.id === id); return g ? { id, tema: g.tema, texto: NOMBRE_GEN[id] || id } : { id, tema: '', texto: id };
  }
  Object.assign(PXD.data, { MODULOS, TEMAS, BANCO, GENERADORES, generarExamen, infoPregunta, QUIZ: BANCO });
})();
