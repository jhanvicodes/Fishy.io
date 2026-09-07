import { useState, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import FishPreview from './FishPreview'
import DrawPortal from './DrawPortal'

const COLOR_PRESETS = [
  '#89c4e1', // sky blue
  '#f4a7b9', // salmon pink
  '#c5b4e8', // lavender
  '#98d4b8', // mint
  '#f5a462', // tangerine
  '#f5d67a', // lemon
  '#f9c4a0', // peach
  '#f47c6a', // coral red
]

export default function FishCustomizer({ onClose, onAddFish, loading }) {
  const [name,    setName]    = useState('')
  const [color,   setColor]   = useState('#89c4e1')
  const [size,    setSize]    = useState(3)
  const [speed,   setSpeed]   = useState(3)
  const [drawing, setDrawing] = useState({ strokes: [] })
  const [nameErr, setNameErr] = useState('')
  const [showDraw, setShowDraw] = useState(false)

  // ESC closes
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const handleSubmit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameErr('NAME REQUIRED!')
      return
    }
    if (trimmed.length > 20) {
      setNameErr('MAX 20 CHARS')
      return
    }
    setNameErr('')
    await onAddFish({ name: trimmed, color, size, speed, drawing })
  }

  if (showDraw) {
    return (
      <DrawPortal
        size={size}
        color={color}
        drawing={drawing}
        onSave={(d) => { setDrawing(d); setShowDraw(false) }}
        onBack={() => setShowDraw(false)}
      />
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(43,45,66,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="pixel-panel pixel-modal-pop relative bg-[#ffffff] w-full"
        style={{
          maxWidth: 410,
          maxHeight: '94vh',
          overflowY: 'auto',
          border: '3px solid #2b2d42',
          boxShadow: '6px 6px 0px #2b2d42',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b-2 border-[#2b2d42] bg-[#f8fbff]">
          <h2 className="font-pixel text-[11px] text-[#2b2d42] tracking-wide">
            CREATE A FISH
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border-2 border-[#2b2d42] bg-[#ffffff] hover:bg-[#f9a8c9] shadow-[2px_2px_0px_#2b2d42] active:translate-x-[1px] active:translate-y-[1px]"
            aria-label="Close"
          >
            <X size={14} className="text-[#2b2d42]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Fish Preview Frame */}
          <div className="flex justify-center relative py-2">
            {/* Pixel bubble decorations */}
            <div className="absolute left-6 top-4 pointer-events-none select-none">
              <div className="w-4 h-4 border-2 border-[#89c4e1] bg-white/40 mb-1" />
              <div className="w-2.5 h-2.5 border-2 border-[#89c4e1] bg-white/40 ml-3" />
            </div>

            {/* Pixel star decorations */}
            <div className="absolute right-6 top-3 pointer-events-none select-none text-right font-pixel text-[#f5a462]">
              <span className="text-xs">✦</span>
              <div className="text-[14px]">⭐</div>
            </div>

            {/* Preview container */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="border-2 border-[#2b2d42] shadow-[4px_4px_0px_#2b2d42] overflow-hidden"
                style={{
                  width: 180,
                  height: 114,
                  background: 'linear-gradient(180deg, #b0dcf5 0%, #86c8e8 100%)',
                }}
              >
                <FishPreview size={size} color={color} drawing={drawing} width={180} height={114} />
              </div>
              <p className="text-[9px] font-pixel text-[#5a7082] uppercase tracking-wider">
                {name.trim() || 'UNNAMED'}
              </p>
            </div>
          </div>

          {/* Fish Name Input */}
          <div>
            <label className="block mb-1.5 text-[8px] font-pixel text-[#2b2d42]">
              FISH NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setNameErr('') }}
              maxLength={20}
              placeholder="MOCHI..."
              className="pixel-input w-full px-3 py-2 text-[9px] focus:outline-none"
            />
            {nameErr && (
              <p className="text-[8px] font-pixel mt-1 text-[#f47c7c]">{nameErr}</p>
            )}
          </div>

          {/* Color Palette */}
          <div>
            <p className="mb-2 text-[8px] font-pixel text-[#2b2d42]">COLOR</p>
            <div className="flex flex-wrap gap-2 items-center">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  className="w-7 h-7 border-2 border-[#2b2d42] transition-transform"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? '3px 3px 0px #2b2d42' : '1px 1px 0px #2b2d42',
                    transform: color === c ? 'translate(-2px, -2px)' : 'none',
                  }}
                />
              ))}
              <label
                className="w-7 h-7 border-2 border-[#2b2d42] flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#2b2d42] bg-[#f0f4f8]"
                title="Custom color"
              >
                <span className="text-[10px]">🎨</span>
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Size Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-[8px] font-pixel text-[#2b2d42]">SIZE</p>
              <span className="text-[8px] font-pixel text-[#5a7082]">{size} / 5</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-pixel text-[#5a7082] w-12 text-right">SMALL</span>
              <input
                type="range"
                min={1}
                max={5}
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                className="pixel-slider pixel-slider-blue flex-1"
                aria-label="Fish size"
              />
              <span className="text-[8px] font-pixel text-[#5a7082] w-12">LARGE</span>
            </div>
          </div>

          {/* Speed Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-[8px] font-pixel text-[#2b2d42]">SPEED</p>
              <span className="text-[8px] font-pixel text-[#5a7082]">{speed} / 5</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-pixel text-[#5a7082] w-12 text-right">SLOW</span>
              <input
                type="range"
                min={1}
                max={5}
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="pixel-slider pixel-slider-pink flex-1"
                aria-label="Fish speed"
              />
              <span className="text-[8px] font-pixel text-[#5a7082] w-12">FAST</span>
            </div>
          </div>

          {/* Draw On Fish trigger button */}
          <button
            onClick={() => setShowDraw(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 border-2 border-[#2b2d42] bg-[#f8fbff] shadow-[2px_2px_0px_#2b2d42] hover:bg-[#ffffff] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span className="flex items-center gap-2 text-[8px] font-pixel text-[#2b2d42]">
              <span>✏️</span> DRAW ON YOUR FISH
            </span>
            <ChevronDown size={14} className="text-[#2b2d42]" />
          </button>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="btn-pixel-secondary flex-1 py-3 text-[9px]"
            >
              CANCEL
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-pixel-primary flex-1 py-3 text-[9px] disabled:opacity-50"
            >
              {loading ? 'SAVING...' : '+ ADD FISH'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}