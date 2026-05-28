import { useState, useRef } from 'react';

// ── Historias de Usuario (datos reales del proyecto) ──────────────────────────
const HISTORIAS = [
  {
    id: 'HU-01',
    titulo: 'Registro e Inicio de Sesión',
    descripcion: 'Como usuario, quiero registrarme con email/contraseña e iniciar sesión para acceder al panel de monitoreo.',
    criterios: [
      'El formulario valida email y contraseña obligatorios.',
      'La contraseña se almacena con BCrypt (hash seguro).',
      'Login exitoso redirige al panel principal.',
      'Credenciales inválidas muestran mensaje de error.',
    ],
    estado: 'DONE',
    prioridad: 'Alta',
  },
  {
    id: 'HU-02',
    titulo: 'Autenticación con Google (OAuth2)',
    descripcion: 'Como usuario, quiero iniciar sesión con mi cuenta de Google para no recordar otra contraseña.',
    criterios: [
      'Botón "Iniciar con Google" visible en la pantalla de login.',
      'Redirección al flujo OAuth2 de Google.',
      'Si el email no existe en BD, se crea un usuario con rol VIEWER.',
      'Sesión activa tras autorización exitosa.',
    ],
    estado: 'DONE',
    prioridad: 'Alta',
  },
  {
    id: 'HU-03',
    titulo: 'Gestión de Zonas del Invernadero',
    descripcion: 'Como operador, quiero crear y eliminar zonas para organizar el espacio del invernadero.',
    criterios: [
      'Formulario con nombre, tipo de cultivo, área y selección de invernadero.',
      'Validación de campos vacíos antes de enviar.',
      'La zona creada aparece inmediatamente en el panel.',
      'Solo ADMIN y OPERADOR pueden crear/eliminar zonas.',
    ],
    estado: 'DONE',
    prioridad: 'Alta',
  },
  {
    id: 'HU-04',
    titulo: 'Control de Roles y Permisos',
    descripcion: 'Como administrador, quiero que solo ciertos roles puedan realizar acciones críticas.',
    criterios: [
      'Roles definidos: ADMIN, OPERADOR, VIEWER.',
      'VIEWER no ve botones de crear/eliminar.',
      'El rol se muestra visualmente en la barra de usuario.',
      'El backend valida permisos en cada endpoint protegido.',
    ],
    estado: 'DONE',
    prioridad: 'Alta',
  },
  {
    id: 'HU-05',
    titulo: 'Internacionalización ES/EN',
    descripcion: 'Como usuario, quiero cambiar el idioma entre español e inglés.',
    criterios: [
      'Selector de idioma visible en login y panel principal.',
      'Todos los textos de la UI responden al idioma seleccionado.',
      'La elección se persiste entre recargas.',
      'El backend recibe Accept-Language y responde traducido.',
    ],
    estado: 'DONE',
    prioridad: 'Media',
  },
  {
    id: 'HU-06',
    titulo: 'Documentación API con Swagger',
    descripcion: 'Como desarrollador, quiero explorar la API REST con Swagger UI.',
    criterios: [
      'Swagger UI disponible en /swagger-ui.html.',
      'Todos los endpoints documentados con @Operation.',
      'Modelos con JavaDoc correctamente anotados.',
      'Headers y cabeceras documentados.',
    ],
    estado: 'DONE',
    prioridad: 'Media',
  },
  {
    id: 'HU-07',
    titulo: 'Pruebas E2E con Selenium',
    descripcion: 'Como QA, quiero pruebas automáticas que verifiquen el flujo completo del sistema.',
    criterios: [
      'Test 1: El formulario de zonas es visible tras hacer login.',
      'Test 2: Campos vacíos muestran alerta de validación.',
      'Test 3: Crear una zona actualiza el panel correctamente.',
      'Test 4: Eliminar una zona la remueve del panel.',
    ],
    estado: 'DONE',
    prioridad: 'Alta',
  },
  {
    id: 'HU-08',
    titulo: 'Gestión de Usuarios (Admin)',
    descripcion: 'Como administrador, quiero ver la lista de usuarios registrados en el sistema.',
    criterios: [
      'Sección "Usuarios" visible solo para ADMIN.',
      'Lista con nombre, email, rol y fecha de registro.',
      'Datos obtenidos del endpoint GET /api/usuarios.',
      'Indicador de carga durante la consulta.',
    ],
    estado: 'DONE',
    prioridad: 'Media',
  },
  {
    id: 'HU-09',
    titulo: 'Conectividad Taiga y Criterios de Aceptación',
    descripcion: 'Como equipo, queremos validar las historias de usuario con Taiga y AppiREST.',
    criterios: [
      'Vista dedicada con todas las historias de usuario del proyecto.',
      'Cada historia tiene ID, descripción y criterios de aceptación.',
      'Posibilidad de descargar un PDF con el reporte de pruebas.',
      'Estado de cada historia visible (DONE, IN PROGRESS, TODO).',
    ],
    estado: 'DONE',
    prioridad: 'Alta',
  },
];

const PRUEBAS = [
  { id: 'T-01', historia: 'HU-07', nombre: 'Formulario visible tras login', resultado: 'PASS', detalle: 'El formulario de registro de zona carga correctamente.' },
  { id: 'T-02', historia: 'HU-07', nombre: 'Validación campos vacíos', resultado: 'PASS', detalle: 'Alerta "completa todos los campos" se dispara correctamente.' },
  { id: 'T-03', historia: 'HU-07', nombre: 'Crear nueva zona', resultado: 'PASS', detalle: 'Zona creada aparece en el panel inmediatamente.' },
  { id: 'T-04', historia: 'HU-07', nombre: 'Eliminar zona existente', resultado: 'PASS', detalle: 'Zona eliminada desaparece del panel tras confirmar.' },
  { id: 'T-05', historia: 'HU-01', nombre: 'Login con email/password válido', resultado: 'PASS', detalle: 'Redirección al panel tras credenciales correctas.' },
  { id: 'T-06', historia: 'HU-01', nombre: 'Login con credenciales inválidas', resultado: 'PASS', detalle: 'Mensaje de error mostrado correctamente.' },
  { id: 'T-07', historia: 'HU-04', nombre: 'VIEWER sin botones de acción', resultado: 'PASS', detalle: 'Rol VIEWER no ve formulario ni botón eliminar.' },
  { id: 'T-08', historia: 'HU-05', nombre: 'Cambio de idioma ES→EN', resultado: 'PASS', detalle: 'Todos los textos cambian al cambiar idioma.' },
];

const ESTADO_COLORES = { DONE: '#22c55e', 'IN PROGRESS': '#f59e0b', TODO: '#94a3b8' };
const PRIORIDAD_COLORES = { Alta: '#ef4444', Media: '#f59e0b', Baja: '#3b82f6' };

export default function TaigaPage({ idioma }) {
  const [filtro, setFiltro] = useState('TODOS');
  const [generando, setGenerando] = useState(false);
  const reportRef = useRef(null);

  const historiasFiltradas = filtro === 'TODOS'
    ? HISTORIAS
    : HISTORIAS.filter(h => h.estado === filtro);

  const generarPDF = async () => {
    setGenerando(true);
    try {
      const { default: jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
      const W = 210;
      let y = 0;

      // ── Portada ──
      doc.setFillColor(26, 46, 26);
      doc.rect(0, 0, W, 60, 'F');
      doc.setTextColor(74, 222, 128);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('🌱 Reporte de Pruebas - Invernadero', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(200, 230, 200);
      doc.setFont('helvetica', 'normal');
      doc.text(`Sistema de Monitoreo — Generado: ${fecha}`, 14, 32);
      doc.text('Tecnologías: React + Spring Boot + PostgreSQL + Selenium', 14, 40);
      doc.text('Proyecto académico — USCO', 14, 48);

      y = 70;

      // ── Sección Historias ──
      doc.setTextColor(26, 46, 26);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('HISTORIAS DE USUARIO', 14, y);
      y += 6;
      doc.setDrawColor(74, 222, 128);
      doc.setLineWidth(0.5);
      doc.line(14, y, W - 14, y);
      y += 8;

      for (const h of HISTORIAS) {
        if (y > 250) { doc.addPage(); y = 20; }

        // Card bg
        doc.setFillColor(245, 250, 245);
        doc.roundedRect(14, y - 4, W - 28, 10 + h.criterios.length * 6, 2, 2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(26, 46, 26);
        doc.text(`[${h.id}] ${h.titulo}`, 18, y + 3);

        // Estado badge
        const [sr, sg, sb] = h.estado === 'DONE' ? [34, 197, 94] : [245, 158, 11];
        doc.setFillColor(sr, sg, sb);
        doc.roundedRect(W - 42, y - 2, 26, 7, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(h.estado, W - 41, y + 3);

        y += 8;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(80, 100, 80);
        const desc = doc.splitTextToSize(h.descripcion, W - 32);
        doc.text(desc, 18, y);
        y += desc.length * 4.5 + 2;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60, 80, 60);
        for (const c of h.criterios) {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(`  ✓ ${c}`, 18, y);
          y += 5.5;
        }
        y += 6;
      }

      // ── Sección Pruebas ──
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(26, 46, 26);
      doc.text('RESULTADOS DE PRUEBAS SELENIUM', 14, y);
      y += 6;
      doc.setDrawColor(74, 222, 128);
      doc.line(14, y, W - 14, y);
      y += 10;

      // Table header
      doc.setFillColor(26, 46, 26);
      doc.rect(14, y - 5, W - 28, 9, 'F');
      doc.setTextColor(74, 222, 128);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('ID', 17, y);
      doc.text('Historia', 32, y);
      doc.text('Prueba', 55, y);
      doc.text('Resultado', 145, y);
      y += 6;

      for (const p of PRUEBAS) {
        if (y > 275) { doc.addPage(); y = 20; }
        const bg = p.resultado === 'PASS' ? [240, 253, 244] : [254, 242, 242];
        doc.setFillColor(...bg);
        doc.rect(14, y - 4, W - 28, 8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(26, 46, 26);
        doc.text(p.id, 17, y);
        doc.setFont('helvetica', 'normal');
        doc.text(p.historia, 32, y);
        const nombre = doc.splitTextToSize(p.nombre, 82);
        doc.text(nombre, 55, y);

        const rc = p.resultado === 'PASS' ? [34, 197, 94] : [239, 68, 68];
        doc.setTextColor(...rc);
        doc.setFont('helvetica', 'bold');
        doc.text(p.resultado === 'PASS' ? '✓ PASS' : '✗ FAIL', 145, y);
        y += nombre.length * 5 + 3;
      }

      // ── Resumen ──
      y += 6;
      if (y > 250) { doc.addPage(); y = 20; }
      const pass = PRUEBAS.filter(p => p.resultado === 'PASS').length;
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(14, y - 4, W - 28, 20, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(26, 46, 26);
      doc.text(`Resumen: ${pass}/${PRUEBAS.length} pruebas aprobadas`, 18, y + 4);
      const pct = Math.round((pass / PRUEBAS.length) * 100);
      doc.setFontSize(9);
      doc.setTextColor(74, 222, 128);
      doc.text(`Tasa de éxito: ${pct}%`, 18, y + 12);

      doc.save('reporte-pruebas-invernadero.pdf');
    } catch (err) {
      console.error(err);
      alert('Error al generar PDF. Intenta de nuevo.');
    }
    setGenerando(false);
  };

  return (
    <div style={{ padding: '32px', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, color: '#1a2e1a', fontSize: '24px', fontWeight: '800' }}>
          📋 {idioma === 'es' ? 'Historias de Usuario — Taiga' : 'User Stories — Taiga'}
        </h1>
        <p style={{ margin: '6px 0 0', color: '#6b9a6b', fontSize: '14px' }}>
          {idioma === 'es'
            ? 'Criterios de aceptación y validación del proyecto'
            : 'Acceptance criteria and project validation'}
        </p>
      </div>

      {/* Stats + Descargar PDF */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '14px',
        marginBottom: '28px', alignItems: 'center',
      }}>
        {['TODOS', 'DONE', 'IN PROGRESS', 'TODO'].map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: '7px 16px', borderRadius: '20px', border: 'none',
            cursor: 'pointer', fontWeight: '700', fontSize: '12px',
            backgroundColor: filtro === f ? '#1a2e1a' : '#f0f7f0',
            color: filtro === f ? '#4ade80' : '#4a7a4a',
            transition: 'all 0.15s',
          }}>
            {f === 'TODOS' ? (idioma === 'es' ? 'Todas' : 'All') : f}
            {f === 'TODOS' ? ` (${HISTORIAS.length})` : ` (${HISTORIAS.filter(h => h.estado === f).length})`}
          </button>
        ))}

        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={generarPDF}
            disabled={generando}
            style={{
              padding: '10px 22px', borderRadius: '10px', border: 'none',
              cursor: generando ? 'not-allowed' : 'pointer',
              backgroundColor: generando ? '#94a3b8' : '#1a2e1a',
              color: '#4ade80', fontWeight: '800', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(26,46,26,0.3)',
              transition: 'all 0.15s',
            }}
          >
            {generando ? '⏳' : '📄'}
            {generando
              ? (idioma === 'es' ? 'Generando...' : 'Generating...')
              : (idioma === 'es' ? 'Descargar PDF de Pruebas' : 'Download Test Report PDF')}
          </button>
        </div>
      </div>

      {/* Cards de historias */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {historiasFiltradas.map(h => (
          <div key={h.id} style={{
            backgroundColor: '#fff',
            borderRadius: '14px',
            padding: '20px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            borderLeft: `4px solid ${ESTADO_COLORES[h.estado] || '#94a3b8'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  backgroundColor: '#f0f7f0', color: '#1a2e1a',
                  fontWeight: '800', fontSize: '12px', padding: '3px 10px',
                  borderRadius: '6px', letterSpacing: '0.5px',
                }}>
                  {h.id}
                </span>
                <h3 style={{ margin: 0, color: '#1a2e1a', fontSize: '16px', fontWeight: '700' }}>
                  {h.titulo}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <span style={{
                  backgroundColor: PRIORIDAD_COLORES[h.prioridad] + '22',
                  color: PRIORIDAD_COLORES[h.prioridad],
                  fontSize: '11px', fontWeight: '700',
                  padding: '3px 10px', borderRadius: '20px',
                }}>
                  {h.prioridad === 'Alta' ? (idioma === 'es' ? '🔴 Alta' : '🔴 High')
                    : h.prioridad === 'Media' ? (idioma === 'es' ? '🟡 Media' : '🟡 Medium')
                    : (idioma === 'es' ? '🟢 Baja' : '🟢 Low')}
                </span>
                <span style={{
                  backgroundColor: ESTADO_COLORES[h.estado] + '22',
                  color: ESTADO_COLORES[h.estado],
                  fontSize: '11px', fontWeight: '700',
                  padding: '3px 10px', borderRadius: '20px',
                }}>
                  {h.estado === 'DONE' ? '✅ DONE' : h.estado === 'IN PROGRESS' ? '🔄 IN PROGRESS' : '📌 TODO'}
                </span>
              </div>
            </div>

            <p style={{ margin: '0 0 14px', color: '#4a6a4a', fontSize: '14px', lineHeight: '1.6' }}>
              {h.descripcion}
            </p>

            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a2e1a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {idioma === 'es' ? 'Criterios de Aceptación' : 'Acceptance Criteria'}
              </div>
              <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none', display: 'grid', gap: '6px' }}>
                {h.criterios.map((c, i) => (
                  <li key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                    fontSize: '13px', color: '#4a6a4a',
                  }}>
                    <span style={{ color: '#22c55e', fontSize: '14px', flexShrink: 0 }}>✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de pruebas Selenium */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#1a2e1a', fontWeight: '800', marginBottom: '16px' }}>
          🧪 {idioma === 'es' ? 'Resultados de Pruebas Selenium' : 'Selenium Test Results'}
        </h2>
        <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: '#1a2e1a' }}>
                {['ID', 'Historia', idioma === 'es' ? 'Nombre del Test' : 'Test Name', 'Resultado', idioma === 'es' ? 'Detalle' : 'Detail'].map(col => (
                  <th key={col} style={{
                    padding: '12px 16px', color: '#4ade80', fontWeight: '700',
                    fontSize: '12px', textAlign: 'left', letterSpacing: '0.5px',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRUEBAS.map((p, i) => (
                <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fdf9' }}>
                  <td style={{ padding: '11px 16px', fontWeight: '700', color: '#1a2e1a', fontSize: '13px' }}>{p.id}</td>
                  <td style={{ padding: '11px 16px', color: '#4a6a4a', fontSize: '13px' }}>
                    <span style={{
                      backgroundColor: '#f0f7f0', padding: '2px 8px',
                      borderRadius: '6px', fontWeight: '600', fontSize: '12px',
                    }}>{p.historia}</span>
                  </td>
                  <td style={{ padding: '11px 16px', color: '#2c4a2c', fontSize: '13px' }}>{p.nombre}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{
                      padding: '3px 12px', borderRadius: '20px',
                      fontWeight: '800', fontSize: '12px',
                      backgroundColor: p.resultado === 'PASS' ? '#dcfce7' : '#fee2e2',
                      color: p.resultado === 'PASS' ? '#16a34a' : '#dc2626',
                    }}>
                      {p.resultado === 'PASS' ? '✓ PASS' : '✗ FAIL'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', color: '#6b9a6b', fontSize: '12px' }}>{p.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{
          marginTop: '12px', padding: '12px 16px',
          backgroundColor: '#f0fdf4', borderRadius: '10px',
          display: 'flex', gap: '24px', fontSize: '13px',
        }}>
          <span style={{ color: '#16a34a', fontWeight: '700' }}>
            ✓ {PRUEBAS.filter(p => p.resultado === 'PASS').length} PASS
          </span>
          <span style={{ color: '#dc2626', fontWeight: '700' }}>
            ✗ {PRUEBAS.filter(p => p.resultado !== 'PASS').length} FAIL
          </span>
          <span style={{ color: '#1a2e1a', fontWeight: '700' }}>
            📊 {idioma === 'es' ? 'Tasa de éxito' : 'Success rate'}: {Math.round((PRUEBAS.filter(p => p.resultado === 'PASS').length / PRUEBAS.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
