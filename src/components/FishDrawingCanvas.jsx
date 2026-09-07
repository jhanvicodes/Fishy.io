import { useRef, useEffect, useCallback } from 'react'
import { drawFishOutline } from '../utils/fishDrawing'

const CANVAS_WIDTH = 320
const CANVAS_HEIGHT = 200

export default function FishDrawingCanvas({
  size = 3,
  color = '#89C4E1',
  strokes = [],
  tool = 'brush',
  brushColor = '#E74C3C',
  brushSize = 4,
  onCommitStroke,
  onEraseAt,
}) {
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const currentStrokeRef = useRef([])

  // Calculate body dimensions for coordinate normalization
  const getBodyDimensions = useCallback(() => {
    const scale = Math.round(11 + (size || 3) * 4.5)
    return {
      BW: Math.round(scale * 1.65),
      BH: Math.round(scale * 1.05),
      cx: Math.round(CANVAS_WIDTH / 2),
      cy: Math.round(CANVAS_HEIGHT / 2),
    }
  }, [size])

  // Normalizes canvas pixels to fish body [0, 1] space
  const toNormalizedPoint = useCallback((x, y) => {
    const { BW, BH, cx, cy } = getBodyDimensions()
    return {
      x: Math.max(0, Math.min(1, (x - cx + BW) / (BW * 2))),
      y: Math.max(0, Math.min(1, (y - cy + BH) / (BH * 2))),
    }
  }, [getBodyDimensions])

  // Render loop for canvas (outline + existing strokes + active live stroke)
  const render = useCallback((activeStroke = null) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // 1. Draw template fish outline
    drawFishOutline(ctx, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, size, color)

    // 2. Draw all strokes (committed + active live stroke)
    const allStrokes = [...strokes, ...(activeStroke ? [activeStroke] : [])]
    const { BW, BH, cx, cy } = getBodyDimensions()

    ctx.save()
    // Clip drawing strictly to fish body bounds
    ctx.beginPath()
    ctx.ellipse(cx, cy, BW - 0.5, BH - 0.5, 0, 0, Math.PI * 2)
    ctx.clip()

    for (const stroke of allStrokes) {
      if (!stroke.points || stroke.points.length === 0) continue
      const strokeWidth = Math.max(2, stroke.width || 4)
      ctx.save()
      ctx.strokeStyle = stroke.color
      ctx.fillStyle = stroke.color
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (stroke.points.length === 1) {
        const p = stroke.points[0]
        const px = Math.round(p.x * BW * 2 - BW + cx)
        const py = Math.round(p.y * BH * 2 - BH + cy)
        ctx.beginPath()
        ctx.arc(px, py, strokeWidth / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        const p0 = stroke.points[0]
        ctx.moveTo(Math.round(p0.x * BW * 2 - BW + cx), Math.round(p0.y * BH * 2 - BH + cy))
        for (let i = 1; i < stroke.points.length; i++) {
          const pt = stroke.points[i]
          ctx.lineTo(Math.round(pt.x * BW * 2 - BW + cx), Math.round(pt.y * BH * 2 - BH + cy))
        }
        ctx.stroke()
      }
      ctx.restore()
    }

    ctx.restore()
  }, [strokes, size, color, getBodyDimensions])

  useEffect(() => {
    render()
  }, [render])

  // Get pointer coordinates relative to the 320x200 canvas
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = CANVAS_WIDTH / rect.width
    const scaleY = CANVAS_HEIGHT / rect.height

    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = (e) => {
    e.preventDefault()
    const pos = getCanvasCoordinates(e)
    isDrawingRef.current = true

    if (tool === 'eraser') {
      if (onEraseAt) onEraseAt(toNormalizedPoint(pos.x, pos.y), brushSize)
      return
    }

    currentStrokeRef.current = [toNormalizedPoint(pos.x, pos.y)]
    render({
      points: currentStrokeRef.current,
      color: brushColor,
      width: brushSize,
    })
  }

  const handlePointerMove = (e) => {
    e.preventDefault()
    if (!isDrawingRef.current) return
    const pos = getCanvasCoordinates(e)

    if (tool === 'eraser') {
      if (onEraseAt) onEraseAt(toNormalizedPoint(pos.x, pos.y), brushSize)
      return
    }

    currentStrokeRef.current.push(toNormalizedPoint(pos.x, pos.y))
    render({
      points: currentStrokeRef.current,
      color: brushColor,
      width: brushSize,
    })
  }

  const handlePointerUp = (e) => {
    e.preventDefault()
    if (!isDrawingRef.current) return
    isDrawingRef.current = false

    if (tool === 'brush' && currentStrokeRef.current.length > 0) {
      if (onCommitStroke) {
        onCommitStroke({
          points: [...currentStrokeRef.current],
          color: brushColor,
          width: brushSize,
        })
      }
      currentStrokeRef.current = []
    }
  }

  return (
    <div className="relative flex justify-center items-center select-none">
      <div
        className="rounded-2xl overflow-hidden border-2 border-[#8CD3FF] shadow-[0_4px_16px_rgba(140,211,255,0.3)] bg-gradient-to-b from-[#B8E2F8] to-[#8AC8E8]"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="drawing-canvas block w-full h-full"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>
    </div>
  )
}
