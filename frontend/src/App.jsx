import { useState, useEffect } from 'react';
import Login from './pages/Login';
import es from './i18n/es';
import en from './i18n/en';
import { detectarIdioma, guardarIdiomaManual } from './i18n/detectarIdioma';

const IDIOMAS = { es, en };

const PERMISOS = {
  ADMIN:    { puedeCrear: true,  puedeEliminar: true  },
  OPERADOR: { puedeCrear: true,  puedeEliminar: true  },
  VIEWER:   { puedeCrear: false, puedeEliminar: false },
};

function App() {
  const [usuario, setUsuario]           = useState(null);
  const [verificando, setVerificando]   = useState(true);

  // Detecta automáticamente el idioma del navegador,
  // pero respeta la elección manual del usuario si la hizo antes
  const [idioma, setIdioma] = useState(detectarIdioma);
  const t = IDIOMAS[idioma];

  const [zonas, setZonas]               = useState([]);
  const [invernaderos, setInvernaderos] = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [nombre, setNombre]             = useState('');
  const [tipoCultivo, setTipoCultivo]   = useState('');
  const [areaTotal, setAreaTotal]       = useState('');
  const [invernaderoId, setInvernaderoId] = useState('');

  const headers = { 'Content-Type': 'application/json', 'Accept-Language': idioma };

  // Cuando el usuario cambia idioma manualmente → guardar como elección explícita
  const cambiarIdioma = (nuevoIdioma) => {
    setIdioma(nuevoIdioma);
    guardarIdiomaManual(nuevoIdioma); // distinto a la detección automática
  };

  // ── Verificar sesión al cargar ────────────────────────────────────────
  useEffect(() => {
    fetch('http://localhost:8080/api/auth/me', {
      credentials: 'include',
      headers: { 'Accept-Language': idioma }
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { setUsuario(data); setVerificando(false); })
      .catch(() => setVerificando(false));
  }, []);

  useEffect(() => {
    if (usuario) { cargarZonas(); cargarInvernaderos(); }
  }, [usuario, idioma]);

  const cargarZonas = () => {
    fetch('http://localhost:8080/api/zonas', { credentials: 'include', headers })
      .then((r) => r.json())
      .then((d) => { setZonas(Array.isArray(d) ? d : []); setCargando(false); })
      .catch(() => setCargando(false));
  };

  const cargarInvernaderos = () => {
    fetch('http://localhost:8080/api/invernaderos', { credentials: 'include', headers })
      .then((r) => r.json())
      .then((d) => setInvernaderos(Array.isArray(d) ? d : []))
      .catch(console.error);
  };

  const cerrarSesion = () => {
    fetch('http://localhost:8080/api/auth/logout', { method: 'POST', credentials: 'include' })
      .then(() => setUsuario(null));
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!nombre || !tipoCultivo || !areaTotal || !invernaderoId) {
      alert(t.camposIncompletos); return;
    }
    fetch(`http://localhost:8080/api/zonas/${invernaderoId}`, {
      method: 'POST', credentials: 'include', headers,
      body: JSON.stringify({ nombre, tipo_cultivo: tipoCultivo, area_total: parseFloat(areaTotal) }),
    })
      .then((r) => r.text()).then((msg) => {
        alert(msg);
        setNombre(''); setTipoCultivo(''); setAreaTotal(''); setInvernaderoId('');
        cargarZonas();
      }).catch(console.error);
  };

  const eliminarZona = (id, nombreZona) => {
    if (!confirm(t.confirmarEliminar(nombreZona))) return;
    fetch(`http://localhost:8080/api/zonas/${id}`, { method: 'DELETE', credentials: 'include', headers })
      .then((r) => r.text()).then((msg) => { alert(msg); cargarZonas(); });
  };

  // ── Pantalla de carga ─────────────────────────────────────────────────
  if (verificando) return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f7f6'
    }}>
      <p style={{ color: '#7f8c8d', fontSize: '16px' }}>🔄 {t.verificandoSesion}</p>
    </div>
  );

  // ── Pantalla de login ─────────────────────────────────────────────────
  if (!usuario) return (
    <Login t={t} idioma={idioma} onCambiarIdioma={cambiarIdioma} />
  );

  const permisos = PERMISOS[usuario.rol] || PERMISOS.VIEWER;
  const inputStyle = { width: '95%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' };
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '4px' };
  const colorRol = { ADMIN: '#e74c3c', OPERADOR: '#f39c12', VIEWER: '#3498db' };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>

      {/* ── Barra superior ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>

        {/* Selector de idioma */}
        <div>
          <span style={{ marginRight: '8px', fontWeight: 'bold', color: '#555', fontSize: '13px' }}>
            🌐 {t.idioma}:
          </span>
          {['es', 'en'].map((l) => (
            <button key={l} onClick={() => cambiarIdioma(l)} style={{
              marginRight: '6px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer',
              backgroundColor: idioma === l ? '#2ecc71' : '#e2e8f0',
              color: idioma === l ? 'white' : '#4a5568',
              border: 'none', fontWeight: 'bold', fontSize: '12px'
            }}>
              {l === 'es' ? '🇨🇴 ES' : '🇺🇸 EN'}
            </button>
          ))}
        </div>

        {/* Usuario + rol + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#4a5568' }}>
            👤 <strong>{usuario.nombre}</strong>
          </span>
          <span style={{
            padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
            backgroundColor: colorRol[usuario.rol] || '#95a5a6', color: 'white'
          }}>
            {usuario.rol}
          </span>
          <button onClick={cerrarSesion} style={{
            padding: '6px 14px', borderRadius: '6px', backgroundColor: '#e74c3c',
            color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
          }}>
            🚪 {t.cerrarSesion}
          </button>
        </div>
      </div>

      {/* ── Header ── */}
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#2c3e50', margin: 0 }}>🌿 {t.titulo}</h1>
        <p style={{ color: '#7f8c8d' }}>{t.subtitulo}</p>
      </header>

      {/* ── Formulario (solo ADMIN y OPERADOR) ── */}
      {permisos.puedeCrear && (
        <div style={{
          backgroundColor: '#fff', padding: '20px', borderRadius: '12px',
          maxWidth: '500px', margin: '0 auto 40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>➕ {t.registrarZona}</h3>
          <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>{t.invernadero}:</label>
              <select value={invernaderoId} onChange={(e) => setInvernaderoId(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">{t.seleccionaInvernadero}</option>
                {invernaderos.map((inv) => (
                  <option key={inv.id} value={inv.id}>{inv.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.nombre}:</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                placeholder={t.nombrePlaceholder} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.tipoCultivo}:</label>
              <input type="text" value={tipoCultivo} onChange={(e) => setTipoCultivo(e.target.value)}
                placeholder={t.tipoPlaceholder} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.area}:</label>
              <input type="number" value={areaTotal} onChange={(e) => setAreaTotal(e.target.value)}
                placeholder={t.areaPlaceholder} style={inputStyle} />
            </div>
            <button type="submit" style={{
              backgroundColor: '#2ecc71', color: 'white', border: 'none',
              padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
            }}>
              {t.guardar}
            </button>
          </form>
        </div>
      )}

      <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '40px 0' }} />

      {/* ── Lista de zonas ── */}
      {cargando ? (
        <div style={{ textAlign: 'center', fontSize: '18px', color: '#34495e' }}>
          🔄 {t.cargando}
        </div>
      ) : zonas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>{t.sinZonas}</p>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px', maxWidth: '1200px', margin: '0 auto'
        }}>
          {zonas.map((zona) => (
            <div key={zona.id} style={{
              border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px',
              backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ margin: '0 0 15px', color: '#2c3e50', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                📍 {zona.nombre}
              </h3>
              <div style={{ lineHeight: '1.8', color: '#4a5568', fontSize: '15px' }}>
                <p style={{ margin: '6px 0' }}><strong>{t.tipoCultivoLabel}:</strong> {zona.tipo_cultivo || t.noAsignado}</p>
                <p style={{ margin: '6px 0' }}><strong>{t.areaTotalLabel}:</strong> {zona.area_total ? `${zona.area_total} m²` : t.na}</p>
                <p style={{ margin: '6px 0' }}><strong>{t.invernaderoLabel}:</strong> {zona.invernadero?.nombre || t.na}</p>
              </div>
              {permisos.puedeEliminar && (
                <button onClick={() => eliminarZona(zona.id, zona.nombre)} style={{
                  marginTop: '15px', backgroundColor: '#e74c3c', color: 'white',
                  border: 'none', padding: '8px 14px', borderRadius: '6px',
                  fontWeight: 'bold', cursor: 'pointer', width: '100%'
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

export default App;
