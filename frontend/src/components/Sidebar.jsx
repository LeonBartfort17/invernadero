import { useState } from 'react';

const navItems = [
  { id: 'dashboard', icon: '🌿', labelEs: 'Panel Principal', labelEn: 'Dashboard' },
  { id: 'taiga',     icon: '📋', labelEs: 'Historias Taiga', labelEn: 'Taiga Stories' },
  { id: 'usuarios',  icon: '👥', labelEs: 'Usuarios',        labelEn: 'Users' },
];

export default function Sidebar({ seccion, onCambiarSeccion, idioma, t, usuario, onCerrarSesion, onCambiarIdioma }) {
  const [collapsed, setCollapsed] = useState(false);
  const colorRol = { ADMIN: '#e74c3c', OPERADOR: '#f39c12', VIEWER: '#3498db' };

  return (
    <aside style={{
      width: collapsed ? '64px' : '220px',
      minHeight: '100vh',
      backgroundColor: '#1a2e1a',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s ease',
      boxShadow: '4px 0 16px rgba(0,0,0,0.25)',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      overflow: 'hidden',
    }}>

      {/* Logo + toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: '18px 14px',
        borderBottom: '1px solid #2d4a2d',
      }}>
        {!collapsed && (
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#4ade80', letterSpacing: '-0.5px' }}>
              🌱 Invernadero
            </div>
            <div style={{ fontSize: '10px', color: '#6b9a6b', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px' }}>
              Monitoreo
            </div>
          </div>
        )}
        {collapsed && <span style={{ fontSize: '22px' }}>🌱</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b9a6b', fontSize: '18px', padding: '4px',
            lineHeight: 1,
          }}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{
          padding: '14px',
          borderBottom: '1px solid #2d4a2d',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: '#2d4a2d',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', flexShrink: 0,
          }}>👤</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#e2f5e2', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {usuario?.nombre}
            </div>
            <span style={{
              backgroundColor: colorRol[usuario?.rol] || '#95a5a6',
              color: 'white', fontSize: '10px', fontWeight: '700',
              padding: '1px 7px', borderRadius: '10px',
            }}>
              {usuario?.rol}
            </span>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {navItems.map((item) => {
          const active = seccion === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onCambiarSeccion(item.id)}
              title={collapsed ? (idioma === 'es' ? item.labelEs : item.labelEn) : ''}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '12px 0' : '11px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '4px',
                backgroundColor: active ? '#2d5a2d' : 'transparent',
                color: active ? '#4ade80' : '#9ab89a',
                fontWeight: active ? '700' : '500',
                fontSize: '14px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#243824'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {idioma === 'es' ? item.labelEs : item.labelEn}
              </span>}
            </button>
          );
        })}
      </nav>

      {/* Footer: idioma + logout */}
      <div style={{
        padding: '12px 10px',
        borderTop: '1px solid #2d4a2d',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {['es', 'en'].map(l => (
              <button key={l} onClick={() => onCambiarIdioma(l)} style={{
                flex: 1, padding: '5px 4px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', fontWeight: '700', fontSize: '11px',
                backgroundColor: idioma === l ? '#4ade80' : '#2d4a2d',
                color: idioma === l ? '#1a2e1a' : '#9ab89a',
              }}>
                {l === 'es' ? '🇨🇴 ES' : '🇺🇸 EN'}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={onCerrarSesion}
          title={collapsed ? (t?.cerrarSesion || 'Salir') : ''}
          style={{
            width: '100%', padding: '9px', borderRadius: '8px',
            border: 'none', cursor: 'pointer',
            backgroundColor: '#3d1f1f', color: '#f87171',
            fontWeight: '700', fontSize: '13px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          🚪 {!collapsed && (t?.cerrarSesion || 'Salir')}
        </button>
      </div>
    </aside>
  );
}
