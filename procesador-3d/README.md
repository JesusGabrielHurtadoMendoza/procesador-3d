# Procesador 3D

Plataforma web para aprender **Arquitectura de Computadoras** con un procesador 3D que se puede desarmar, armar y ver funcionar. Incluye una evaluación que cambia en cada intento y un panel para el docente.

**Integrantes:** Jesús Gabriel Hurtado Mendoza · Alan Zabdiel Gómez Martín
**Institución:** Tecnológico de Estudios Superiores de Jilotepec · Ingeniería en Sistemas Computacionales
**Asignatura:** Gestión de Proyectos de Software (SCG-1009) · Proyecto integrador 2026–2027

**Página publicada:** https://jesusgabrielhurtadomendoza.github.io/procesador-3d/
**Manual de usuario:** [docs/Manual_de_Usuario_Procesador3D.pdf](docs/Manual_de_Usuario_Procesador3D.pdf). En la pantalla de Inicio también hay un código QR para descargarlo.

## Qué hace

| Sección | Qué puede hacer el alumno |
| --- | --- |
| Inicio | Elegir el módulo, leer cómo se usa y descargar el manual (QR) |
| Desarmar | Separar las 9 capas en cascada, tocar cada pieza y ver su ficha. Tiene recorrido guiado automático |
| Armar | Arrastrar las piezas al socket en orden, con cronómetro, récord, pistas y confeti al terminar |
| Laboratorio | Cambiar carga, pasta térmica, enfriamiento y ventilador, y ver la temperatura y el aire caliente |
| Cómo funciona | Ver el ciclo de instrucción (buscar, decodificar, ejecutar, guardar) con datos animados en el chip |
| Evaluación | Examen de 10 preguntas **distinto en cada intento**, 2 por tema, algunas se contestan tocando el modelo 3D |
| Fabricación | De la arena al procesador en 10 pasos |
| Comparar | Celular, laptop, escritorio, y un procesador de 1993 contra uno de hoy |
| Sockets | LGA contra PGA |
| Docente | Resultados con PIN: promedio, aprobados, aciertos por tema, preguntas más difíciles y CSV |

### El examen nunca es el mismo

- El banco tiene **45 preguntas fijas** (9 se contestan en el modelo 3D) y **6 generadores** que crean preguntas con números nuevos cada vez (GHz, sumas de la ALU, núcleos, temperatura, caché y piezas).
- Cada intento toma 2 preguntas por tema (5 temas), con al menos 2 que se contestan tocando el modelo 3D.
- No repite las preguntas del intento anterior y el orden de las opciones también se revuelve.
- Archivo: `js/data-evaluacion.js` (función `generarExamen`).

## Cómo probarlo en tu computadora

Abre la carpeta en Visual Studio Code y usa la extensión **Live Server**, o en una terminal:

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

También se puede abrir `index.html` con doble clic. En ese caso no funcionan el modo sin internet ni el QR automático. La primera vez necesita internet para cargar Three.js y las fuentes.

## Publicar en GitHub Pages

1. Sube todo el contenido de esta carpeta a la raíz del repositorio `procesador-3d` (rama `main`).
2. En **Settings → Pages → Source** elige **GitHub Actions**.
3. El flujo `.github/workflows/pages.yml` publica la página en cada `push`.

Si el repositorio tiene otro nombre o usuario, la dirección cambia. El QR de la pantalla de Inicio se genera solo con la dirección real. Solo hay que regenerar `assets/qr-manual.png` (imagen de respaldo) y la dirección que aparece en `index.html` (`og:url` y `og:image`).

## Listo para producción

- **Pantalla de carga**, y un mensaje claro si el navegador no puede mostrar 3D o no tiene JavaScript.
- **Funciona sin internet** después de la primera visita (`sw.js`), y **se puede instalar** como aplicación (`manifest.webmanifest`).
- **Vista previa al compartir** el enlace en WhatsApp o redes (`assets/og-image.png`), y página `404.html` propia.
- Sombras más ligeras en celular, y las animaciones se reducen si el sistema tiene activado "reducir movimiento".

## Estructura

```
index.html               Página principal
404.html                 Página de error
manifest.webmanifest     Datos para instalar la aplicación
sw.js                    Funcionamiento sin internet
css/styles.css           Estilos y animaciones
js/config.js             Versión, PIN docente y módulos activos
js/data.js               Piezas, pasos del ciclo y laboratorio
js/data-evaluacion.js    Banco de preguntas, generadores y examen aleatorio
js/db.js                 Datos locales con rutas tipo API REST
js/audio.js              Sonidos sintetizados
js/parts.js              Modelos 3D de las piezas
js/fx.js                 Pantalla de carga, confeti y animaciones del panel
js/app.js                Escena 3D, Desarmar, Armar, Laboratorio y Cómo funciona
js/mode-*.js             Inicio, Evaluación, Docente, Fabricación, Comparar y Sockets
js/vendor/qrcode.js      Generador de QR (MIT, Kazuhiko Arase)
assets/                  Íconos, QR e imagen para compartir
docs/                    Manual de usuario en PDF
```

## Configuración

En `js/config.js`:
- `docentePIN`: el PIN del panel docente. Cámbialo antes de usarlo en clase; el inicial es `1234`.
- `features`: pon `0` para ocultar una sección.

## Tecnología

HTML, CSS y JavaScript con [Three.js](https://threejs.org/) 0.147 (WebGL). No hay que instalar ni compilar nada. Los resultados se guardan en el navegador (localStorage) con rutas tipo API REST: `GET /api/modulos/1/examen`, `POST /api/resultados`, `GET /api/resultados`.
