/**
 * Canvas utility helpers for High-DPI scaling and ambient bubble animations.
 */

/**
 * Prepares an HTML5 Canvas for crisp High-DPI (Retina) display.
 * @param {HTMLCanvasElement} canvas
 * @param {number} width CSS width in pixels
 * @param {number} height CSS height in pixels
 * @returns {number} devicePixelRatio applied
 */
export function setupHiDPICanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = `${Math.round(width)}px`
  canvas.style.height = `${Math.round(height)}px`

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  return dpr
}

/**
 * Calculates canvas-space pointer coordinates from Mouse or Touch events.
 * @param {MouseEvent|TouchEvent} event
 * @param {HTMLCanvasElement} canvas
 * @returns {{x: number, y: number}}
 */
export function getCanvasPos(event, canvas) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / (window.devicePixelRatio || 1) / rect.width
  const scaleY = canvas.height / (window.devicePixelRatio || 1) / rect.height

  if (event.touches && event.touches.length > 0) {
    return {
      x: Math.round((event.touches[0].clientX - rect.left) * scaleX),
      y: Math.round((event.touches[0].clientY - rect.top) * scaleY),
    }
  }

  return {
    x: Math.round((event.clientX - rect.left) * scaleX),
    y: Math.round((event.clientY - rect.top) * scaleY),
  }
}

/**
 * Updates positions of ambient bubbles rising through the water.
 * @param {Array} bubbles Current bubbles array
 * @param {number} canvasWidth Water canvas width
 * @param {number} canvasHeight Water canvas height
 * @returns {Array} Updated bubbles array
 */
export function updateBubbles(bubbles, canvasWidth, canvasHeight) {
  const updated = bubbles
    .map(b => ({
      ...b,
      y: b.y - b.speed,
      x: b.x + Math.sin(b.y * 0.05 + b.seed) * 0.35,
      opacity: b.y < canvasHeight * 0.22 ? b.opacity - 0.03 : b.opacity,
    }))
    .filter(b => b.opacity > 0 && b.y > canvasHeight * 0.18)

  // Spawn new bubbles gently from inner aquarium sandbed
  if (Math.random() < 0.03 && updated.length < 18) {
    const minX = canvasWidth * 0.12
    const maxX = canvasWidth * 0.88
    updated.push({
      x: Math.random() * (maxX - minX) + minX,
      y: canvasHeight * 0.72,
      r: Math.random() * 2.5 + 1.5,
      speed: Math.random() * 0.5 + 0.4,
      opacity: Math.random() * 0.4 + 0.35,
      seed: Math.random() * 10,
    })
  }

  return updated
}

/**
 * Renders ambient bubble particles on canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} bubbles
 */
export function drawBubbles(ctx, bubbles) {
  for (const b of bubbles) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, b.opacity)

    // Outer ring
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Inner highlight gleam
    ctx.beginPath()
    ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.28, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.fill()

    ctx.restore()
  }
}
