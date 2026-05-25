/**
 * Detecta el idioma correcto siguiendo esta prioridad:
 * 1. Lo que el usuario eligió manualmente (localStorage)
 * 2. El idioma del navegador (navigator.language)
 * 3. Español como fallback
 *
 * Si el navegador cambió de idioma y el usuario nunca eligió manualmente,
 * se respeta el nuevo idioma del navegador.
 */
const IDIOMAS_SOPORTADOS = ['es', 'en'];

export function detectarIdioma() {
  const guardadoManualmente = localStorage.getItem('idioma_manual');

  // Si el usuario eligió manualmente un idioma → respetarlo siempre
  if (guardadoManualmente && IDIOMAS_SOPORTADOS.includes(guardadoManualmente)) {
    return guardadoManualmente;
  }

  // Si no eligió manualmente → usar el idioma del navegador
  const idiomaNave = navigator.language || navigator.userLanguage || 'es';
  const codigoBase = idiomaNave.split('-')[0].toLowerCase(); // "en-US" → "en"

  return IDIOMAS_SOPORTADOS.includes(codigoBase) ? codigoBase : 'es';
}

export function guardarIdiomaManual(idioma) {
  localStorage.setItem('idioma_manual', idioma);
}

export function limpiarIdiomaManual() {
  localStorage.removeItem('idioma_manual');
}
