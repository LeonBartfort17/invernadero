import { useState, useEffect } from 'react';
import Login from './pages/Login';
import TaigaPage from './pages/TaigaPage';
import UsuariosPage from './pages/UsuariosPage';
import Sidebar from './components/Sidebar';
import es from './i18n/es';
import en from './i18n/en';
import { detectarIdioma, guardarIdiomaManual } from './i18n/detectarIdioma';

const IDIOMAS = { es, en };

const PERMISOS = {
  ADMIN:    { puedeCrear: true,  puedeEliminar: true,  verUsuarios: true  },
  OPERADOR: { puedeCrear: true,  puedeEliminar: true,  verUsuarios: false },
  VIEWER:   { puedeCrear: false, puedeEliminar: false, verUsuarios: false },
};

function Dashboard({ usuario, t, idioma }) {
  const [zonas, setZonas]               = useState([]);
  const [invernaderos, setInvernaderos] = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [nombre, setNombre]             = useState('');
  const [tipoCultivo, setTipoCultivo]   = useState('');
  const [areaTotal, setAreaTotal]       = useState('');
  const [invernaderoId, setInvernaderoId] = useState('');

  const permisos = PERMISOS[usuario.rol] || PERMISOS.VIEWER;
  const headers  = { 'Content-Type': 'application/json', 'Accept-Language': idioma };

  const cargarZonas = () => {
    fetch('http://localhost:8080/api/zonas', { credentials: 'include', headers })
      .then(r => r.json())
      .then(d => { setZonas(Array.isArray(d) ? d : []); setCargando(false); })
      .catch(() => setCargando(false));
  };

  const cargarInvernaderos = () => {
    fetch('http://localhost:8080/api/invernaderos', { credentials: 'include', headers })
      .then(r => r.json())
      .then(d => setInvernaderos(Array.isArray(d) ? d : []))
      .catch(console.error);
  };

  useEffect(() => { cargarZonas(); cargarInvernaderos(); }, [idioma]);

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!nombre || !tipoCultivo || !areaTotal || !invernaderoId) {
      alert(t.camposIncompletos); return;
    }
    fetch(`http://localhost:8080/api/zonas/${invernaderoId}`, {
      method: 'POST', credentials: 'include', headers,
      body: JSON.stringify({ nombre, tipo_cultivo: tipoCultivo, area_total: parseFloat(areaTotal) }),
    })
      .then(r => r.text()).then(msg => {
        alert(msg);
        setNombre(''); setTipoCultivo(''); setAreaTotal(''); setInvernaderoId('');
        cargarZonas();
      }).catch(console.error);
  };

  const eliminarZona = (id, nombreZona) => {
    if (!confirm(t.confirmarEliminar(nombreZona))) return;
    fetch(`http://localhost:8080/api/zonas/${id}`, { method: 'DELETE', credentials: 'include', headers })
      .then(r => r.text()).then(msg => { alert(msg); cargarZonas(); });
  };

  const inputStyle = { width: '95%', padding: '9px', borderRadius: '8px', border: '1.5px solid #d4e8d4', fontSize: '14px', outline: 'none' };
  const labelStyle = { display: 'block', fontWeight: '700', marginBottom: '5px', color: '#1a2e1a', fontSize: '13px' };

  return (
    <div style={{ padding: '32px', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ color: '#1a2e1a', margin: '0 0 6px', fontSize: '28px', fontWeight: '800' }}>
          🌿 {t.titulo}
        </h1>
        <p style={{ color: '#6b9a6b', margin: 0, fontSize: '14px' }}>{t.subtitulo}</p>
      </div>

      {/* Formulario */}
      {permisos.puedeCrear && (
        <div style={{
          backgroundColor: '#fff', padding: '24px', borderRadius: '16px',
          maxWidth: '520px', margin: '0 auto 40px',
          boxShadow: '0 4px 20px rgba(26,46,26,0.1)',
          border: '1.5px solid #e0f0e0',
        }}>
          <h3 style={{ marginTop: 0, color: '#1a2e1a', fontWeight: '800' }}>➕ {t.registrarZona}</h3>
          <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>{t.invernadero}:</label>
              <select value={invernaderoId} onChange={e => setInvernaderoId(e.target.value)}
                style={{ ...inputStyle, width: '100%', backgroundColor: '#fff' }}>
                <option value="">{t.seleccionaInvernadero}</option>
                {invernaderos.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.nombre}:</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder={t.nombrePlaceholder} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.tipoCultivo}:</label>
              <input type="text" value={tipoCultivo} onChange={e => setTipoCultivo(e.target.value)}
                placeholder={t.tipoPlaceholder} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.area}:</label>
              <input type="number" value={areaTotal} onChange={e => setAreaTotal(e.target.value)}
                placeholder={t.areaPlaceholder} style={inputStyle} />
            </div>
            <button type="submit" style={{
              backgroundColor: '#1a2e1a', color: '#4ade80', border: 'none',
              padding: '12px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '14px',
            }}>
              {t.guardar}
            </button>
          </form>
        </div>
      )}

      <hr style={{ border: '0', borderTop: '1px solid #e0f0e0', margin: '0 0 32px' }} />

      {/* Lista de zonas */}
      {cargando ? (
        <div style={{ textAlign: 'center', fontSize: '18px', color: '#6b9a6b' }}>🔄 {t.cargando}</div>
      ) : zonas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9ab89a' }}>{t.sinZonas}</p>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '18px', maxWidth: '1100px', margin: '0 auto',
        }}>
          {zonas.map(zona => (
            <div key={zona.id} style={{
              border: '1.5px solid #e0f0e0', borderRadius: '14px', padding: '22px',
              backgroundColor: '#fff', boxShadow: '0 3px 12px rgba(26,46,26,0.07)',
              borderLeft: '4px solid #4ade80',
            }}>
              <h3 style={{ margin: '0 0 14px', color: '#1a2e1a', fontWeight: '800', paddingBottom: '10px', borderBottom: '1px solid #f0f7f0' }}>
                📍 {zona.nombre}
              </h3>
              <div style={{ lineHeight: '1.9', color: '#4a6a4a', fontSize: '14px' }}>
                <p style={{ margin: '4px 0' }}><strong style={{ color: '#1a2e1a' }}>{t.tipoCultivoLabel}:</strong> {zona.tipo_cultivo || t.noAsignado}</p>
                <p style={{ margin: '4px 0' }}><strong style={{ color: '#1a2e1a' }}>{t.areaTotalLabel}:</strong> {zona.area_total ? `${zona.area_total} m²` : t.na}</p>
                <p style={{ margin: '4px 0' }}><strong style={{ color: '#1a2e1a' }}>{t.invernaderoLabel}:</strong> {zona.invernadero?.nombre || t.na}</p>
              </div>
              {permisos.puedeEliminar && (
                <button onClick={() => eliminarZona(zona.id, zona.nombre)} style={{
                  marginTop: '14px', backgroundColor: '#fee2e2', color: '#dc2626',
                  border: 'none', padding: '9px 14px', borderRadius: '8px',
                  fontWeight: '800', cursor: 'pointer', width: '100%', fontSize: '13px',
                }}>
                  🗑️ {t.eliminarZona}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [usuario, setUsuario]         = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [idioma, setIdioma]           = useState(detectarIdioma);
  const [seccion, setSeccion]         = useState('dashboard');
  const t = IDIOMAS[idioma];

  const cambiarIdioma = (l) => { setIdioma(l); guardarIdiomaManual(l); };

  useEffect(() => {
    fetch('http://localhost:8080/api/auth/me', {
      credentials: 'include', headers: { 'Accept-Language': idioma }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { setUsuario(data); setVerificando(false); })
      .catch(() => setVerificando(false));
  }, []);

  const cerrarSesion = () => {
    fetch('http://localhost:8080/api/auth/logout', { method: 'POST', credentials: 'include' })
      .then(() => setUsuario(null));
  };

  if (verificando) return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f9f4',
    }}>
      <p style={{ color: '#6b9a6b', fontSize: '16px' }}>🔄 {t.verificandoSesion}</p>
    </div>
  );

  if (!usuario) return <Login t={t} idioma={idioma} onCambiarIdioma={cambiarIdioma} />;

  const permisos = PERMISOS[usuario.rol] || PERMISOS.VIEWER;
  const SIDEBAR_W = 220; // approximate expanded width

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f9f4', fontFamily: "'Segoe UI', sans-serif" }}>

      <Sidebar
        seccion={seccion}
        onCambiarSeccion={setSeccion}
        idioma={idioma}
        t={t}
        usuario={usuario}
        onCerrarSesion={cerrarSesion}
        onCambiarIdioma={cambiarIdioma}
      />

      {/* Main content — offset by sidebar */}
      <main style={{
        marginLeft: '220px',
        flex: 1,
        minHeight: '100vh',
        transition: 'margin-left 0.25s ease',
        overflowX: 'hidden',
      }}>
        {seccion === 'dashboard' && (
          <Dashboard usuario={usuario} t={t} idioma={idioma} />
        )}
        {seccion === 'taiga' && (
          <TaigaPage idioma={idioma} />
        )}
        {seccion === 'usuarios' && (
          permisos.verUsuarios
            ? <UsuariosPage idioma={idioma} usuario={usuario} />
            : (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                <h2 style={{ color: '#1a2e1a' }}>
                  {idioma === 'es' ? 'Acceso restringido' : 'Access restricted'}
                </h2>
                <p style={{ color: '#6b9a6b' }}>
                  {idioma === 'es'
                    ? 'Solo los administradores pueden ver la lista de usuarios.'
                    : 'Only administrators can view the users list.'}
                </p>
              </div>
            )
        )}
      </main>
    </div>
  );
}

export default App;
