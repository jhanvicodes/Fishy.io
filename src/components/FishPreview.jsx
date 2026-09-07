import { useRef, useEffect } from 'react'
import { drawFishPreview } from '../utils/fishDrawing'

export default function FishPreview({
  size = 3,
  color = '#89C4E1',
  drawing = null,
  width = 180,
  height = 114,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // HiDPI support for crisp preview
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    const animate = (time) => {
      drawFishPreview(ctx, width, height, size, color, drawing, time)
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [size, color, drawing, width, height])

  return (
    <div
      className="rounded-xl overflow-hidden border border-[#8CD3FF] shadow-[inset_0_2px_8px_rgba(80,160,220,0.25)] bg-gradient-to-b from-[#B8E2F8] to-[#8AC8E8] flex items-center justify-center select-none"
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{ width, height }}
      />
    </div>
  )
}
