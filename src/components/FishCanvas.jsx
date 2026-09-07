import { useRef, useEffect, useState, useCallback } from 'react'
import { drawFish } from '../utils/fishDrawing'
import { createFishAnimState, updateFishAnimState, getAquariumBounds } from '../utils/fishPhysics'
import { setupHiDPICanvas, updateBubbles, drawBubbles } from '../utils/canvasUtils'

/**
 * Animated cute pixel name badge overlay for hovered fish.
 */
function FishNameBadge({ name, x, y }) {
  return (
    <div
      className="absolute pointer-events-none z-30 transition-transform duration-100"
      style={{
        left: Math.round(x),
        top: Math.round(y - 38),
        transform: 'translateX(-50%)',
      }}
    >
      <div className="px-2.5 py-1 rounded-lg border border-[#8CD3FF] bg-white/95 text-[#3B698A] font-pixel text-[9px] font-bold shadow-[0_2px_8px_rgba(140,211,255,0.4)] whitespace-nowrap flex items-center gap-1.5">
        <span className="text-[10px]">✨</span>
        <span>{name}</span>
      </div>
    </div>
  )
}

export default function FishCanvas({ fishes = [], containerRef, onSelectFish }) {
  const canvasRef = useRef(null)
  const animStatesRef = useRef({})
  const bubblesRef = useRef([])
  const rafRef = useRef(null)
  const sizeRef = useRef({ w: 0, h: 0 })
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const fishesRef = useRef(fishes)
  const [hoveredFish, setHoveredFish] = useState(null)

  // Keep fishesRef in sync with props
  useEffect(() => {
    fishesRef.current = fishes
  }, [fishes])

  // Sync animation states when the fish roster changes
  useEffect(() => {
    const { w, h } = sizeRef.current
    if (!w || !h) return
    const states = animStatesRef.current
    const activeIds = new Set(fishes.map(f => f.id))

    // Remove deleted fish states
    for (const id of Object.keys(states)) {
      if (!activeIds.has(id)) {
        delete states[id]
      }
    }

    // Initialize new fish states
    for (const fish of fishes) {
      if (!states[fish.id]) {
        states[fish.id] = createFishAnimState(fish, w, h)
      }
    }
  }, [fishes])

  // Handle ResizeObserver and HiDPI canvas configuration
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef?.current || canvas?.parentElement
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const w = Math.round(rect.width)
    const h = Math.round(rect.height)

    sizeRef.current = { w, h }
    setupHiDPICanvas(canvas, w, h)

    // Ensure all current fishes have an initialized animation state and are clamped to boundaries
    for (const fish of fishesRef.current) {
      if (!animStatesRef.current[fish.id]) {
        animStatesRef.current[fish.id] = createFishAnimState(fish, w, h)
      } else {
        const state = animStatesRef.current[fish.id]
        const { minX, maxX, minY, maxY } = getAquariumBounds(w, h, fish.size || 3)
        state.x = Math.min(maxX, Math.max(minX, state.x))
        state.y = Math.min(maxY, Math.max(minY, state.y))
      }
    }
  }, [containerRef])

  useEffect(() => {
    handleResize()
    const ro = new ResizeObserver(handleResize)
    const container = containerRef?.current || canvasRef.current?.parentElement
    if (container) ro.observe(container)
    window.addEventListener('resize', handleResize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize, containerRef])

  // Primary requestAnimationFrame loop
  useEffect(() => {
    let frameCount = 0

    const renderLoop = () => {
      rafRef.current = requestAnimationFrame(renderLoop)

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const { w, h } = sizeRef.current
      if (!w || !h) return

      // Clear viewport
      ctx.clearRect(0, 0, w, h)

      // 1. Ambient rising bubbles
      bubblesRef.current = updateBubbles(bubblesRef.current, w, h)
      drawBubbles(ctx, bubblesRef.current)

      // 2. Swimming fish
      const currentRoster = fishesRef.current
      const states = animStatesRef.current
      let detectedHover = null

      for (const fish of currentRoster) {
        let state = states[fish.id]
        if (!state) {
          state = createFishAnimState(fish, w, h)
          states[fish.id] = state
        }

        // Update physics
        updateFishAnimState(state, fish, w, h, 1)

        // Render fish with tail wiggle
        const fishSize = fish.size || 3
        const fishColor = fish.color || '#89C4E1'
        const isFacingRight = state.facing !== undefined ? state.facing > 0 : (state.facingRight ?? true)
        drawFish(
          ctx,
          state.x,
          state.y,
          fishSize,
          fishColor,
          isFacingRight,
          fish.drawing,
          state.opacity,
          state.swimPhase ?? state.tailAngle ?? 0
        )

        // Hover detection check
        const hitRadius = (7 + fishSize * 3.6) * 1.7
        const dx = mouseRef.current.x - state.x
        const dy = mouseRef.current.y - state.y
        if (dx * dx + dy * dy < hitRadius * hitRadius) {
          detectedHover = {
            name: fish.name || 'Unnamed Fish',
            x: state.x,
            y: state.y,
          }
        }
      }

      // Throttle hover state updates to React (every 4 frames)
      frameCount++
      if (frameCount % 4 === 0) {
        setHoveredFish(detectedHover)
      }
    }

    renderLoop()

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const onMouseMove = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = sizeRef.current.w / rect.width
    const scaleY = sizeRef.current.h / rect.height
    mouseRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const onMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 }
    setHoveredFish(null)
  }, [])

  const onCanvasClick = useCallback((e) => {
    if (!onSelectFish) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = sizeRef.current.w / rect.width
    const scaleY = sizeRef.current.h / rect.height
    const clickX = (e.clientX - rect.left) * scaleX
    const clickY = (e.clientY - rect.top) * scaleY

    for (const fish of fishesRef.current) {
      const state = animStatesRef.current[fish.id]
      if (!state) continue
      const fishSize = fish.size || 3
      const hitRadius = (7 + fishSize * 3.6) * 1.8
      const dx = clickX - state.x
      const dy = clickY - state.y
      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        onSelectFish(fish)
        break
      }
    }
  }, [onSelectFish])

  return (
    <div className="relative w-full h-full select-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-default"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onCanvasClick}
        role="img"
        aria-label="Interactive community fish tank"
      />
      {hoveredFish && (
        <FishNameBadge
          name={hoveredFish.name}
          x={hoveredFish.x}
          y={hoveredFish.y}
        />
      )}
    </div>
  )
}
