/**
 * clickSound.js — Procedural Web Audio API synthesizer for a tactile iPod-style click/tick sound.
 * Generates an ultra-short (18ms) physical microswitch snap with zero external audio assets.
 */

let audioCtx = null
let clickBuffer = null
let lastClickTime = 0

/**
 * Lazily creates the AudioContext and synthesizes the physical iPod click buffer.
 */
function getOrCreateAudioContext() {
  if (audioCtx) return audioCtx

  const AudioContextClass = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (!AudioContextClass) return null

  try {
    audioCtx = new AudioContextClass()
    const sampleRate = audioCtx.sampleRate || 44100
    const duration = 0.018 // 18ms — short, crisp, tactile
    const frameCount = Math.floor(sampleRate * duration)
    clickBuffer = audioCtx.createBuffer(1, frameCount, sampleRate)
    const data = clickBuffer.getChannelData(0)

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate
      // Steep exponential decay envelope for a snappy microswitch click
      const env = Math.exp(-t * 280)
      // High-frequency mechanical contact transient (~2.4 kHz)
      const snap = Math.sin(2 * Math.PI * 2400 * t) * 0.55
      // Acoustic body resonance (~1.15 kHz)
      const body = Math.sin(2 * Math.PI * 1150 * t) * 0.35
      // Ultra-short initial micro-noise impulse in the first 2.5ms
      const noise = t < 0.0025 ? (Math.random() * 2 - 1) * 0.3 : 0

      data[i] = (snap + body + noise) * env
    }

    return audioCtx
  } catch (err) {
    console.warn('AudioContext initialization note:', err)
    return null
  }
}

/**
 * Plays a single, subtle, crisp iPod-style tactile click sound.
 * Fails safely and gracefully if audio is unavailable or blocked.
 */
export function playClickSound() {
  try {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    // Prevent double-triggering within 35ms (e.g. nested elements or double events)
    if (now - lastClickTime < 35) return
    lastClickTime = now

    const ctx = getOrCreateAudioContext()
    if (!ctx || !clickBuffer) return

    // Unlock suspended AudioContext if needed (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const source = ctx.createBufferSource()
    source.buffer = clickBuffer

    const gainNode = ctx.createGain()
    // Subtle, satisfying, soft physical click volume
    gainNode.gain.setValueAtTime(0.22, ctx.currentTime)

    source.connect(gainNode)
    gainNode.connect(ctx.destination)

    source.start(ctx.currentTime)
  } catch {
    // Audio failures must never crash React or the application
  }
}

/**
 * Attaches a single delegated capture listener for pointerdown on interactive elements.
 * Immediately fires on user press down for zero-latency physical tactile feel.
 */
export function initGlobalClickSound() {
  if (typeof window === 'undefined') return () => {}

  const handlePointerDown = (e) => {
    // Check if target is inside an interactive button/control
    const interactiveTarget = e.target.closest(
      'button, [role="button"], input[type="button"], input[type="submit"], input[type="range"], input[type="color"], label[title="Custom Color"]'
    )

    if (interactiveTarget) {
      // Don't play if disabled
      if (interactiveTarget.disabled || interactiveTarget.getAttribute('aria-disabled') === 'true') {
        return
      }
      playClickSound()
    }
  }

  window.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true })

  return () => {
    window.removeEventListener('pointerdown', handlePointerDown, { capture: true })
  }
}

export default {
  playClickSound,
  initGlobalClickSound,
}
