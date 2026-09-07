/**
 * fishDrawing.js — High-quality procedural pixel/vector fish renderer.
 * Renders body parts, animated tail waggle, cute face, and custom user drawings
 * clipped to the fish body with seamless scale & flip support.
 */

// Image cache for raster dataUrl drawings to prevent re-decoding every frame
const imageCache = new Map()

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export function hexToRgb(hex) {
  const h = (hex || '#89C4E1').replace('#', '')
  return {
    r: parseInt(h.slice(0, 2) || '89', 16),
    g: parseInt(h.slice(2, 4) || 'C4', 16),
    b: parseInt(h.slice(4, 6) || 'E1', 16),
  }
}

export function rgbStr(r, g, b, a = 1) {
  return `rgba(${clamp(Math.round(r), 0, 255)}, ${clamp(Math.round(g), 0, 255)}, ${clamp(Math.round(b), 0, 255)}, ${a})`
}

/**
 * Safely parses drawing data whether stored as JSON string, object, or data URL.
 * @param {string|Object} drawing
 * @returns {{strokes: Array, dataUrl?: string}}
 */
export function parseDrawing(drawing) {
  if (!drawing) return { strokes: [] }
  if (typeof drawing === 'string') {
    if (drawing.startsWith('data:image/')) {
      return { strokes: [], dataUrl: drawing }
    }
    try {
      const parsed = JSON.parse(drawing)
      return parsed && typeof parsed === 'object' ? parsed : { strokes: [] }
    } catch {
      return { strokes: [] }
    }
  }
  return drawing
}

/**
 * Primary fish rendering routine.
 * @param {CanvasRenderingContext2D} ctx Canvas 2D context
 * @param {number} cx Center X position
 * @param {number} cy Center Y position
 * @param {number} size Fish size tier (1 to 5)
 * @param {string} color Base fish hex color
 * @param {boolean} facingRight Direction flag
 * @param {Object|string} drawing User drawing payload
 * @param {number} opacity Opacity multiplier
 * @param {number} wigglePhase Tail wiggle oscillation angle (optional)
 */
export function drawFish(ctx, cx, cy, size = 3, color = '#89C4E1', facingRight = true, drawing = null, opacity = 1, wigglePhase = 0) {
  const scale = Math.round(7 + (size || 3) * 3.6)
  const { r, g, b } = hexToRgb(color)

  const outline = '#243447'
  const finColor = rgbStr(r - 28, g - 28, b - 28)
  const bodyColor = rgbStr(r, g, b)
  const topHighlight = rgbStr(r + 48, g + 48, b + 48)
  const bottomShade = rgbStr(r - 38, g - 38, b - 38)
  const bellyShade = rgbStr(r + 65, g + 65, b + 50, 0.45)

  const BW = Math.round(scale * 1.65) // Body half-width
  const BH = Math.round(scale * 1.05) // Body half-height
  const OL = Math.max(1.5, Math.round(scale * 0.095))

  ctx.save()
  ctx.globalAlpha = opacity ?? 1
  ctx.translate(Math.round(cx), Math.round(cy))
  if (!facingRight) ctx.scale(-1, 1)

  // Tail waggle angle calculation
  const tailAngle = Math.sin(wigglePhase) * 0.22

  // ─── 1. TAIL FIN (WITH WIGGLE) ────────────────
  ctx.save()
  ctx.translate(Math.round(-BW * 0.8), 0)
  ctx.rotate(tailAngle)
  ctx.fillStyle = finColor
  ctx.strokeStyle = outline
  ctx.lineWidth = OL
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(Math.round(-scale * 0.9), Math.round(-BH * 0.75))
  ctx.lineTo(Math.round(-scale * 0.48), 0)
  ctx.lineTo(Math.round(-scale * 0.9), Math.round(BH * 0.75))
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  // ─── 2. DORSAL FIN ───────────────────────────
  ctx.save()
  ctx.fillStyle = finColor
  ctx.strokeStyle = outline
  ctx.lineWidth = OL
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(Math.round(-BW * 0.25), Math.round(-BH * 0.86))
  ctx.quadraticCurveTo(Math.round(BW * 0.05), Math.round(-BH * 1.68), Math.round(BW * 0.38), Math.round(-BH * 0.86))
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  // ─── 3. BODY & SHADING ───────────────────────
  ctx.save()
  ctx.fillStyle = bodyColor
  ctx.strokeStyle = outline
  ctx.lineWidth = OL
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.ellipse(0, 0, BW, BH, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Highlight along top dorsal spine
  ctx.fillStyle = topHighlight
  ctx.beginPath()
  ctx.ellipse(Math.round(-BW * 0.1), Math.round(-BH * 0.45), Math.round(BW * 0.55), Math.round(BH * 0.25), -0.15, 0, Math.PI * 2)
  ctx.fill()

  // Dark shading along belly underside
  ctx.fillStyle = bottomShade
  ctx.beginPath()
  ctx.ellipse(Math.round(-BW * 0.1), Math.round(BH * 0.5), Math.round(BW * 0.65), Math.round(BH * 0.22), 0.1, 0, Math.PI * 2)
  ctx.fill()

  // Gentle soft belly highlight
  ctx.fillStyle = bellyShade
  ctx.beginPath()
  ctx.ellipse(Math.round(BW * 0.15), Math.round(BH * 0.25), Math.round(BW * 0.45), Math.round(BH * 0.3), 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // ─── 4. PECTORAL FIN ─────────────────────────
  ctx.save()
  ctx.fillStyle = finColor
  ctx.strokeStyle = outline
  ctx.lineWidth = Math.max(1, OL - 0.5)
  ctx.beginPath()
  ctx.ellipse(Math.round(BW * 0.2), Math.round(BH * 0.22), Math.round(BW * 0.28), Math.round(BH * 0.19), 0.35 + tailAngle * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  // ─── 5. EYE WITH PUPIL AND GLINT ─────────────
  {
    const ex = Math.round(BW * 0.54)
    const ey = Math.round(-BH * 0.2)
    const er = Math.max(3, Math.round(scale * 0.26))

    ctx.save()
    ctx.fillStyle = '#FFFFFF'
    ctx.strokeStyle = outline
    ctx.lineWidth = Math.max(1, OL * 0.9)
    ctx.beginPath()
    ctx.arc(ex, ey, er, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#1B2A38'
    ctx.beginPath()
    ctx.arc(ex + Math.round(er * 0.2), ey + Math.round(er * 0.1), Math.round(er * 0.55), 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(ex + Math.round(er * 0.38), ey - Math.round(er * 0.25), Math.max(1, Math.round(er * 0.25)), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // ─── 6. MOUTH ────────────────────────────────
  {
    ctx.save()
    ctx.strokeStyle = outline
    ctx.lineWidth = Math.max(1, OL * 0.85)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(Math.round(BW * 0.82), Math.round(BH * 0.14), Math.max(1.5, scale * 0.1), 0, Math.PI)
    ctx.stroke()
    ctx.restore()
  }

  // ─── 7. CUSTOM USER DRAWINGS (VECTOR & RASTER) ─
  const parsed = parseDrawing(drawing)

  // Render vector strokes clipped to fish body
  if (parsed.strokes && parsed.strokes.length > 0) {
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(0, 0, BW - 0.5, BH - 0.5, 0, 0, Math.PI * 2)
    ctx.clip()

    for (const stroke of parsed.strokes) {
      if (!stroke.points || stroke.points.length === 0) continue
      const strokeWidth = Math.max(2, Math.round((stroke.width || 4) * (scale / 14)))
      const strokeColor = stroke.color || '#E74C3C'

      ctx.save()
      ctx.strokeStyle = strokeColor
      ctx.fillStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (stroke.points.length === 1) {
        const p = stroke.points[0]
        const px = Math.round(p.x * BW * 2 - BW)
        const py = Math.round(p.y * BH * 2 - BH)
        ctx.beginPath()
        ctx.arc(px, py, strokeWidth / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        const p0 = stroke.points[0]
        ctx.moveTo(Math.round(p0.x * BW * 2 - BW), Math.round(p0.y * BH * 2 - BH))
        for (let i = 1; i < stroke.points.length; i++) {
          const pt = stroke.points[i]
          ctx.lineTo(Math.round(pt.x * BW * 2 - BW), Math.round(pt.y * BH * 2 - BH))
        }
        ctx.stroke()
      }
      ctx.restore()
    }
    ctx.restore()
  } else if (parsed.dataUrl) {
    // Raster fallback rendering
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(0, 0, BW - 0.5, BH - 0.5, 0, 0, Math.PI * 2)
    ctx.clip()

    let img = imageCache.get(parsed.dataUrl)
    if (!img) {
      img = new Image()
      img.src = parsed.dataUrl
      img.onload = () => imageCache.set(parsed.dataUrl, img)
    }
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -BW, -BH, BW * 2, BH * 2)
    }
    ctx.restore()
  }

  ctx.restore()
}

/**
 * Preview renderer for modal windows with gentle animated idle wiggle.
 */
export function drawFishPreview(ctx, canvasW, canvasH, size = 3, color = '#89C4E1', drawing = null, time = 0) {
  ctx.clearRect(0, 0, canvasW, canvasH)
  const cx = Math.round(canvasW / 2)
  const cy = Math.round(canvasH / 2 + Math.sin(time / 650) * 3.5)
  const wiggle = Math.sin(time / 200) * 0.25
  const previewSize = Math.min(5, Math.max(1, size))

  drawFish(ctx, cx, cy, previewSize + 1.2, color, true, drawing, 1, wiggle)
}

/**
 * Fish template outline renderer used on the drawing canvas.
 */
export function drawFishOutline(ctx, cx, cy, size = 3, color = '#89C4E1') {
  const scale = Math.round(11 + (size || 3) * 4.5)
  const { r, g, b } = hexToRgb(color)
  const pale = rgbStr(r + 65, g + 65, b + 55, 0.45)
  const outline = '#243447'

  const BW = Math.round(scale * 1.65)
  const BH = Math.round(scale * 1.05)
  const OL = Math.max(1.5, Math.round(scale * 0.1))

  const roundX = Math.round(cx)
  const roundY = Math.round(cy)

  ctx.save()
  ctx.translate(roundX, roundY)

  // Tail outline
  ctx.fillStyle = pale
  ctx.strokeStyle = outline
  ctx.lineWidth = OL
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(Math.round(-BW * 0.8), 0)
  ctx.lineTo(Math.round(-BW - scale * 0.82), Math.round(-BH * 0.72))
  ctx.lineTo(Math.round(-BW - scale * 0.45), 0)
  ctx.lineTo(Math.round(-BW - scale * 0.82), Math.round(BH * 0.72))
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Dorsal fin outline
  ctx.beginPath()
  ctx.moveTo(Math.round(-BW * 0.25), Math.round(-BH * 0.88))
  ctx.quadraticCurveTo(Math.round(BW * 0.05), Math.round(-BH * 1.65), Math.round(BW * 0.38), Math.round(-BH * 0.88))
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Body outline & pale fill
  ctx.beginPath()
  ctx.ellipse(0, 0, BW, BH, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Eye position reference
  const ex = Math.round(BW * 0.54)
  const ey = Math.round(-BH * 0.2)
  const er = Math.max(3, Math.round(scale * 0.26))
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(ex, ey, er, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.restore()
}
