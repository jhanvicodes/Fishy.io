import { useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { drawFish } from '../utils/fishDrawing'

function MiniPreview({ fish }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 60, 40)
    drawFish(ctx, 30, 20, Math.max(1, fish.size - 1), fish.color, true, fish.drawing, 1)
  }, [fish])

  return (
    <canvas
      ref={canvasRef}
      width={60}
      height={40}
      className="rounded-xl"
      style={{ background: 'linear-gradient(180deg,#b8e0f7,#a8d8ea)' }}
    />
  )
}

function DotRating({ value, max = 5, color }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: i < value ? color : '#e5e7eb' }}
        />
      ))}
    </div>
  )
}

export default function FishCard({ fish, onDelete }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 hover:border-[#c5dce8] hover:shadow-sm transition-all group">
      <MiniPreview fish={fish} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-700 truncate">{fish.name}</p>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: fish.color }} />
            <span className="text-[10px] text-gray-400">color</span>
          </div>
          <div className="flex items-center gap-1">
            <DotRating value={fish.size} color="#a8d8ea" />
          </div>
          <div className="flex items-center gap-1">
            <DotRating value={fish.speed} color="#f9a8c9" />
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(fish)}
        className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label={`Delete ${fish.name}`}
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
