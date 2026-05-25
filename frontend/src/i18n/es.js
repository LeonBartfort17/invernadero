const es = {
  // ── Header ───────────────────────────────────────────────────────────
  titulo: "Panel de Monitoreo - Invernadero",
  subtitulo: "Ecosistema Fullstack con React, Spring Boot y PostgreSQL",

  // ── Formulario de zona ───────────────────────────────────────────────
  registrarZona: "Registrar Nueva Zona",
  invernadero: "Invernadero",
  seleccionaInvernadero: "-- Selecciona un invernadero --",
  nombre: "Nombre",
  nombrePlaceholder: "Ej. Zona Sur Hidroponía",
  tipoCultivo: "Tipo de Cultivo",
  tipoPlaceholder: "Ej. Tomates, Lechugas",
  area: "Área (m²)",
  areaPlaceholder: "Ej. 120",
  guardar: "Guardar Zona en el Sistema",

  // ── Mensajes del panel ───────────────────────────────────────────────
  camposIncompletos: "Por favor, completa todos los campos incluyendo el invernadero",
  cargando: "Conectando con el servidor Spring Boot...",
  sinZonas: "No hay zonas registradas aún.",
  eliminarZona: "Eliminar Zona",
  confirmarEliminar: (nombre) => `¿Seguro que deseas eliminar la zona "${nombre}"?`,

  // ── Tarjetas ─────────────────────────────────────────────────────────
  tipoCultivoLabel: "Tipo de cultivo",
  areaTotalLabel: "Área total",
  invernaderoLabel: "Invernadero",
  noAsignado: "No asignado",
  na: "N/A",

  // ── Selector de idioma ───────────────────────────────────────────────
  idioma: "Idioma",

  // ── Login ────────────────────────────────────────────────────────────
  loginTitulo: "Invernadero",
  loginSubtitulo: "Panel de Monitoreo",
  loginEmail: "Correo electrónico",
  loginEmailPlaceholder: "tu@correo.com",
  loginPassword: "Contraseña",
  loginPasswordPlaceholder: "••••••••",
  loginBoton: "Iniciar Sesión",
  loginCargando: "Ingresando...",
  loginGoogle: "Iniciar con Google",
  loginSeparador: "o continúa con",
  loginRegistro: "¿No tienes cuenta?",
  loginRegistroLink: "Regístrate",
  loginErrorCredenciales: "Correo o contraseña incorrectos",
  loginErrorConexion: "Error al conectar con el servidor",
  loginErrorGoogle: "Error al iniciar sesión con Google",

  // ── Barra superior ───────────────────────────────────────────────────
  cerrarSesion: "Salir",
  verificandoSesion: "Verificando sesión...",
};

export default es;
