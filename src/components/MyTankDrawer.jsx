import { useEffect, useRef } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { drawFish } from '../utils/fishDrawing'
import { MAX_FISH_PER_USER, MAX_TOTAL_FISH } from '../constants/limits'

function MiniFishCanvas({ fish }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 72, 54)
    drawFish(
      ctx,
      36,
      27,
      Math.max(1, (fish.size || 3) - 1),
      fish.color || '#89C4E1',
      true,
      fish.drawing,
      1,
      0.5
    )
  }, [fish])

  return (
    <canvas
      ref={canvasRef}
      width={72}
      height={54}
      className="rounded-xl border border-[#8CD3FF] bg-gradient-to-b from-[#B8E2F8] to-[#8AC8E8] flex-shrink-0 shadow-inner"
    />
  )
}

function StatDots({ value = 3, max = 5, color = '#8CD3FF' }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-all"
          style={{
            backgroundColor: i < value ? color : '#E4EDF4',
          }}
        />
      ))}
    </div>
  )
}

export default function MyTankDrawer({
  session,
  fishes = [],
  onClose,
  onAddFish,
  onDeleteFish,
}) {
  const userId = session?.user?.id
  const myFish = fishes.filter(f => f.user_id === userId)
  const isLimitReached = myFish.length >= MAX_FISH_PER_USER || fishes.length >= MAX_TOTAL_FISH

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Darkened Backdrop */}
      <div
        className="fixed inset-0 bg-[#3B4E60]/30 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside className="relative z-10 w-full max-w-sm bg-[#FFFDF9] border-l-4 border-[#8CD3FF] shadow-2xl flex flex-col h-full animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8F3FA] bg-[#F2F9FF]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐠</span>
            <h2 className="font-pixel text-[13px] font-bold text-[#3B698A]">
              My Tank ({myFish.length} / {MAX_FISH_PER_USER})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#DDE8F2] bg-white flex items-center justify-center text-[#7B95AA] hover:bg-[#F8FBFE] transition-colors"
            aria-label="Close My Tank"
          >
            <X size={15} />
          </button>
        </div>

        {/* Fish List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {myFish.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
              <span className="text-4xl">🫧</span>
              <p className="font-pixel text-[11px] font-bold text-[#557692]">
                Your personal tank is empty!
              </p>
              <p className="text-xs text-[#7B95AA] max-w-[200px]">
                Create and customize your very first fish to release it into the community aquarium.
              </p>
            </div>
          ) : (
            myFish.map(fish => (
              <div
                key={fish.id}
                className="flex items-center gap-3.5 p-3 rounded-2xl border border-[#E8F3FA] bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <MiniFishCanvas fish={fish} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-[#3B698A]">
                    {fish.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-pixel text-[8px] font-bold text-[#8FA7BE] w-8">Size</span>
                    <StatDots value={fish.size} max={5} color="#8CD3FF" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-pixel text-[8px] font-bold text-[#8FA7BE] w-8">Speed</span>
                    <StatDots value={fish.speed} max={5} color="#FFAEC9" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteFish(fish)}
                  className="p-2 rounded-xl border border-[#FFCCD8] text-[#FF4E86] hover:bg-[#FFF0F5] transition-colors"
                  title={`Delete ${fish.name}`}
                  aria-label={`Delete ${fish.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#E8F3FA] bg-[#FBFDFF]">
          <button
            type="button"
            onClick={onAddFish}
            aria-disabled={isLimitReached}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-pixel text-[11px] font-bold text-white transition-all ${
              isLimitReached
                ? 'opacity-55 grayscale cursor-not-allowed'
                : 'shadow-[0_4px_16px_rgba(255,78,134,0.35)] active:translate-y-0.5 hover:brightness-105'
            }`}
            style={{
              background: isLimitReached
                ? 'linear-gradient(135deg, #B5C4CF 0%, #8FA7BE 100%)'
                : 'linear-gradient(135deg, #FF769F 0%, #FF4E86 100%)',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Create New Fish</span>
          </button>
        </div>
      </aside>
    </div>
  )
}
