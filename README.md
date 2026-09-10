# 🏑 Hockey Torneos

Aplicación web progresiva (PWA) de estilo iOS para la gestión integral y seguimiento en vivo de torneos de hockey sobre césped (Formato Todos contra Todos / Round Robin con Playoffs, semifinales y final).

![Hockey Torneos](https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Características Principales

1. **Gestión Multitorneo Completa:**
   - Creación y edición de múltiples torneos con persistencia en `localStorage`.
   - Modos de puntos oficiales de hockey (Puntos por victoria directa, victoria en shoot-outs, empate, etc.).
   - Soporte para diferentes categorías (Primera Damas, Caballeros, Mamis, Sub-16, etc.).

2. **Fixture y Playoffs Automatizados:**
   - Generación automática del fixture Round Robin (con soporte para partidos ida o ida y vuelta).
   - Generación y emparejamiento automático de Playoffs (Semifinales y Gran Final según la tabla de posiciones).

3. **Carga Rápida Post-Partido:**
   - Registro instantáneo de resultados y shoot-outs.
   - Goleadores por jugador/a.
   - Registro de tarjetas de hockey: 🟢 Verde (2 min), 🟡 Amarilla (5/10 min), 🔴 Roja (Expulsión).
   - Adjuntar fotos del partido (festejos, planillas, tableros) desde la cámara del teléfono o galería.

4. **Integración Directa con WhatsApp:**
   - Compartir resultados por jornada, tablas de posiciones o fichas de 1 partido individual.
   - **Editor en vivo de WhatsApp:** personaliza el texto antes de enviar o utiliza atajos de emojis y negritas.
   - En iPhone / Android se abre WhatsApp con la foto adjunta y el texto formateado como pie de foto.

5. **Diseño PWA Mobile-First (Estilo iOS):**
   - Interfaz táctil adaptada para iPhone y iPad con navegación inferior tipo pestaña.
   - Funciona sin conexión a internet (offline-ready).

6. **Exportación e Importación:**
   - Copia de seguridad en formato JSON.
   - Exportación de versión autónoma (HTML único / GitHub Pages).

---

## 🛠️ Instalación y Desarrollo Local

### Requisitos previos
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- npm

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TU-USUARIO/hockey-torneos.git
   cd hockey-torneos
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```
   Los archivos estáticos generados se guardarán en la carpeta `dist/`.

---

## 🌐 Despliegue en GitHub Pages

Para publicar la app de forma gratuita en GitHub Pages:

1. En tu repositorio de GitHub, ve a **Settings** > **Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions** o despliega desde la rama `gh-pages` con el contenido compilado de la carpeta `dist`.
3. ¡Listo! Tu torneo estará accesible para todos los jugadores y delegados del club.

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia [MIT](LICENSE).
