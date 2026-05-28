import { useState, useEffect } from 'react';

const ROL_COLORES = {
  ADMIN:    { bg: '#fee2e2', color: '#dc2626' },
  OPERADOR: { bg: '#fef3c7', color: '#d97706' },
  VIEWER:   { bg: '#dbeafe', color: '#2563eb' },
};

export default function UsuariosPage({ idioma, usuario: usuarioActual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    setCargando(true);
    fetch('http://localhost:8080/api/usuarios', {
      credentials: 'include',
      headers: { 'Accept-Language': idioma },
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        setUsuarios(Array.isArray(data) ? data : []);
        setCargando(false);
      })
      .catch(err => {
        setError(idioma === 'es'
          ? 'Error al cargar usuarios. Verifica los permisos.'
          : 'Error loading users. Check permissions.');
        setCargando(false);
      });
  }, [idioma]);

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    try {
      return new Date(fecha).toLocaleDateString(idioma === 'es' ? 'es-CO' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch { return '—'; }
  };

  const conteo = { ADMIN: 0, OPERADOR: 0, VIEWER: 0 };
  usuarios.forEach(u => { if (conteo[u.rol] !== undefined) conteo[u.rol]++; });

  return (
    <div style={{ padding: '32px', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, color: '#1a2e1a', fontSize: '24px', fontWeight: '800' }}>
          👥 {idioma === 'es' ? 'Usuarios del Sistema' : 'System Users'}
        </h1>
        <p style={{ margin: '6px 0 0', color: '#6b9a6b', fontSize: '14px' }}>
          {idioma === 'es'
            ? 'Lista de usuarios registrados en el invernadero'
            : 'List of registered users in the greenhouse system'}
        </p>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: idioma === 'es' ? 'Total' : 'Total', value: usuarios.length, icon: '👥', bg: '#f0f7f0', color: '#1a2e1a' },
          { label: 'Admin', value: conteo.ADMIN, icon: '🔴', bg: '#fee2e2', color: '#dc2626' },
          { label: 'Operador', value: conteo.OPERADOR, icon: '🟡', bg: '#fef3c7', color: '#d97706' },
          { label: 'Viewer', value: conteo.VIEWER, icon: '🔵', bg: '#dbeafe', color: '#2563eb' },
        ].map(card => (
          <div key={card.label} style={{
            backgroundColor: card.bg, borderRadius: '12px',
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '24px' }}>{card.icon}</span>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: card.color, lineHeight: 1 }}>
                {cargando ? '…' : card.value}
              </div>
              <div style={{ fontSize: '12px', color: card.color, fontWeight: '600', opacity: 0.8 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '360px' }}>
        <span style={{
          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '16px', pointerEvents: 'none',
        }}>🔍</span>
        <input
          type="text"
          placeholder={idioma === 'es' ? 'Buscar por nombre, email o rol...' : 'Search by name, email or role...'}
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px 10px 38px',
            borderRadius: '10px', border: '1.5px solid #d4e8d4',
            fontSize: '14px', outline: 'none', boxSizing: 'border-box',
            backgroundColor: '#fff', color: '#1a2e1a',
          }}
        />
      </div>

      {/* Estado */}
      {cargando && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b9a6b', fontSize: '16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔄</div>
          {idioma === 'es' ? 'Cargando usuarios...' : 'Loading users...'}
        </div>
      )}

      {error && !cargando && (
        <div style={{
          backgroundColor: '#fee2e2', color: '#dc2626', padding: '16px 20px',
          borderRadius: '10px', fontWeight: '600', fontSize: '14px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tabla */}
      {!cargando && !error && (
        <>
          <div style={{ overflowX: 'auto', borderRadius: '14px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
              <thead>
                <tr style={{ backgroundColor: '#1a2e1a' }}>
                  {['#',
                    idioma === 'es' ? 'Nombre' : 'Name',
                    'Email',
                    'Rol',
                    idioma === 'es' ? 'Registrado' : 'Registered',
                    idioma === 'es' ? 'Tú' : 'You',
                  ].map(col => (
                    <th key={col} style={{
                      padding: '13px 16px', color: '#4ade80', fontWeight: '700',
                      fontSize: '12px', textAlign: 'left', letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#6b9a6b', fontSize: '14px' }}>
                      {idioma === 'es' ? 'No se encontraron usuarios.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u, i) => {
                    const esTu = u.email === usuarioActual?.email;
                    const rolStyle = ROL_COLORES[u.rol] || { bg: '#f1f5f9', color: '#64748b' };
                    return (
                      <tr
                        key={u.id || i}
                        style={{
                          backgroundColor: esTu ? '#f0fdf4' : i % 2 === 0 ? '#fff' : '#f9fdf9',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => !esTu && (e.currentTarget.style.backgroundColor = '#f0f7f0')}
                        onMouseLeave={e => !esTu && (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#fff' : '#f9fdf9')}
                      >
                        <td style={{ padding: '13px 16px', color: '#9ab89a', fontSize: '12px', fontWeight: '600' }}>
                          {i + 1}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              backgroundColor: '#e8f5e8', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              fontSize: '14px', flexShrink: 0,
                            }}>
                              {u.nombre?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span style={{ fontWeight: '700', color: '#1a2e1a', fontSize: '14px' }}>
                              {u.nombre}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px', color: '#4a6a4a', fontSize: '13px' }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{
                            backgroundColor: rolStyle.bg, color: rolStyle.color,
                            padding: '3px 12px', borderRadius: '20px',
                            fontWeight: '800', fontSize: '11px',
                          }}>
                            {u.rol}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px', color: '#6b9a6b', fontSize: '12px' }}>
                          {formatFecha(u.createdAt)}
                        </td>
                        <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                          {esTu && (
                            <span style={{
                              backgroundColor: '#dcfce7', color: '#16a34a',
                              padding: '2px 10px', borderRadius: '20px',
                              fontWeight: '800', fontSize: '11px',
                            }}>
                              ← {idioma === 'es' ? 'Tú' : 'You'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '10px', color: '#9ab89a', fontSize: '12px', textAlign: 'right' }}>
            {usuariosFiltrados.length} {idioma === 'es' ? 'de' : 'of'} {usuarios.length} {idioma === 'es' ? 'usuarios' : 'users'}
          </div>
        </>
      )}
    </div>
  );
}
