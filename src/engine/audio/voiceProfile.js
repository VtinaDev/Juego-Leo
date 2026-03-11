export const VOICE_PRESET = {
  lang: 'es-ES',
  // Más calmada y clara, tono infantil pero menos acelerada
  rate: 0.78,
  pitch: 1.08
}

// Devuelve una voz preferida y consistente para español infantil/alegre
export function pickPreferredVoice(voices = [], lang = VOICE_PRESET.lang, cachedName = '') {
  if (!voices || voices.length === 0) return { voice: null, name: null }

  const norm = (s) => (s || '').toLowerCase()
  const targetLang = norm(lang)
  const baseLang = targetLang.split('-')[0]

  const matchesLang = voices.filter((v) => norm(v.lang).startsWith(baseLang))

  const childHints = ['child', 'kid', 'niñ', 'young', 'peque', 'little', 'girl', 'chica', 'nena', 'infant']
  const softHints = ['soft', 'calm', 'sweet', 'happy', 'alegre', 'diver', 'fun', 'smiling', 'claro']
  const femaleHints = ['female', 'woman', 'mujer', 'lady', 'fem']
  const maleHints = ['male', 'man', 'hombre', 'masc']

  const score = (voice) => {
    const name = norm(voice.name)
    let s = 0
    if (childHints.some((h) => name.includes(h))) s += 8
    if (softHints.some((h) => name.includes(h))) s += 3
    if (femaleHints.some((h) => name.includes(h))) s += 2
    if (maleHints.some((h) => name.includes(h))) s -= 6
    return s
  }

  // Reusar la voz previamente elegida si sigue disponible
  if (cachedName) {
    const same = voices.find((v) => norm(v.name) === norm(cachedName))
    if (same) return { voice: same, name: same.name }
  }

  const pool = matchesLang.length ? matchesLang : voices
  const childPool = pool.filter((v) => childHints.some((h) => norm(v.name).includes(h)))
  const scoringPool = childPool.length ? childPool : pool
  const chosen = [...scoringPool].sort((a, b) => score(b) - score(a))[0] || scoringPool[0]
  return { voice: chosen, name: chosen?.name || null }
}
