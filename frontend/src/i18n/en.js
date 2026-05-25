const en = {
  // ── Header ───────────────────────────────────────────────────────────
  titulo: "Monitoring Panel - Greenhouse",
  subtitulo: "Fullstack Ecosystem with React, Spring Boot and PostgreSQL",

  // ── Zone form ────────────────────────────────────────────────────────
  registrarZona: "Register New Zone",
  invernadero: "Greenhouse",
  seleccionaInvernadero: "-- Select a greenhouse --",
  nombre: "Name",
  nombrePlaceholder: "E.g. South Hydroponics Zone",
  tipoCultivo: "Crop Type",
  tipoPlaceholder: "E.g. Tomatoes, Lettuce",
  area: "Area (m²)",
  areaPlaceholder: "E.g. 120",
  guardar: "Save Zone to System",

  // ── Panel messages ───────────────────────────────────────────────────
  camposIncompletos: "Please complete all fields including the greenhouse",
  cargando: "Connecting to Spring Boot server...",
  sinZonas: "No zones registered yet.",
  eliminarZona: "Delete Zone",
  confirmarEliminar: (nombre) => `Are you sure you want to delete zone "${nombre}"?`,

  // ── Cards ────────────────────────────────────────────────────────────
  tipoCultivoLabel: "Crop type",
  areaTotalLabel: "Total area",
  invernaderoLabel: "Greenhouse",
  noAsignado: "Not assigned",
  na: "N/A",

  // ── Language selector ────────────────────────────────────────────────
  idioma: "Language",

  // ── Login ────────────────────────────────────────────────────────────
  loginTitulo: "Greenhouse",
  loginSubtitulo: "Monitoring Panel",
  loginEmail: "Email",
  loginEmailPlaceholder: "you@email.com",
  loginPassword: "Password",
  loginPasswordPlaceholder: "••••••••",
  loginBoton: "Sign In",
  loginCargando: "Signing in...",
  loginGoogle: "Sign in with Google",
  loginSeparador: "or continue with",
  loginRegistro: "Don't have an account?",
  loginRegistroLink: "Sign up",
  loginErrorCredenciales: "Invalid email or password",
  loginErrorConexion: "Error connecting to the server",
  loginErrorGoogle: "Error signing in with Google",

  // ── Top bar ──────────────────────────────────────────────────────────
  cerrarSesion: "Sign Out",
  verificandoSesion: "Verifying session...",
};

export default en;
