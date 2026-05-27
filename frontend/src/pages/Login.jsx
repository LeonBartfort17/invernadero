import { useState } from 'react';

function Login({ t, idioma, onCambiarIdioma }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        credentials: 'include',
      });

      // El backend responde JSON (no redirect) para evitar errores de CORS
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        window.location.href = '/';
      } else {
        setError(data.error || t.loginErrorCredenciales);
      }
    } catch {
      setError(t.loginErrorConexion);
    } finally {
      setCargando(false);
    }
  };

  const loginConGoogle = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  // Estilos reutilizables
  const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: '1px solid #ccc', boxSizing: 'border-box',
    fontSize: '14px', backgroundColor: '#fff', color: '#2c3e50'
  };

  const labelStyle = {
    display: 'block', fontWeight: 'bold',
    marginBottom: '4px', color: '#4a5568'
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', backgroundColor: '#f4f7f6',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '40px', borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px'
      }}>

        {/* ── Selector de idioma ── */}
        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
          <span style={{ marginRight: '8px', fontSize: '13px', color: '#7f8c8d' }}>
            🌐 {t.idioma}:
          </span>
          {['es', 'en'].map((l) => (
            <button key={l} onClick={() => onCambiarIdioma(l)} style={{
              marginLeft: '4px', padding: '3px 10px', borderRadius: '6px',
              cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '12px',
              backgroundColor: idioma === l ? '#2ecc71' : '#e2e8f0',
              color: idioma === l ? 'white' : '#4a5568',
            }}>
              {l === 'es' ? '🇨🇴 ES' : '🇺🇸 EN'}
            </button>
          ))}
        </div>

        {/* ── Logo y título ── */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px' }}>🌿</div>
          <h2 style={{ color: '#2c3e50', margin: '8px 0 4px', fontSize: '22px' }}>
            {t.loginTitulo}
          </h2>
          <p style={{ color: '#7f8c8d', fontSize: '14px', margin: 0 }}>
            {t.loginSubtitulo}
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            backgroundColor: '#fde8e8', color: '#c0392b', padding: '10px',
            borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Formulario ── */}
        <form onSubmit={manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>{t.loginEmail}</label>
            <input
              type="email" value={email} required
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.loginEmailPlaceholder}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>{t.loginPassword}</label>
            <input
              type="password" value={password} required
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.loginPasswordPlaceholder}
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={cargando} style={{
            backgroundColor: '#2ecc71', color: 'white', border: 'none',
            padding: '12px', borderRadius: '8px', fontWeight: 'bold',
            fontSize: '15px', cursor: cargando ? 'not-allowed' : 'pointer',
            opacity: cargando ? 0.7 : 1, marginTop: '4px'
          }}>
            {cargando ? `⏳ ${t.loginCargando}` : `🔐 ${t.loginBoton}`}
          </button>
        </form>

        {/* ── Separador ── */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
          <span style={{ color: '#a0aec0', fontSize: '13px', whiteSpace: 'nowrap' }}>
            {t.loginSeparador}
          </span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
        </div>

        {/* ── Botón Google ── */}
        <button onClick={loginConGoogle} style={{
          width: '100%', padding: '12px', borderRadius: '8px',
          border: '1px solid #ddd', backgroundColor: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '10px', cursor: 'pointer', fontWeight: 'bold',
          fontSize: '14px', color: '#4a5568'
        }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.8-11.3-7L6 34c3.3 6.3 9.9 10 18 10z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.5 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          {t.loginGoogle}
        </button>

        {/* ── Link registro ── */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#7f8c8d' }}>
          {t.loginRegistro}{' '}
          <a href="/registro" style={{ color: '#2ecc71', fontWeight: 'bold', textDecoration: 'none' }}>
            {t.loginRegistroLink}
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
