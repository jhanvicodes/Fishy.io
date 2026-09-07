import { useState, useEffect } from 'react'
import { X, Sparkles, SlidersHorizontal, Paintbrush } from 'lucide-react'
import FishDrawingCanvas from './FishDrawingCanvas'
import BrushControls from './BrushControls'
import ColorPicker, { PRESET_COLORS } from './ColorPicker'
import FishPreview from './FishPreview'

export default function DrawPortal({
  onSave,
  onClose,
  initialData = null,
  loading = false,
}) {
  const [tab, setTab] = useState('customize') // 'customize' | 'draw'
  const [name, setName] = useState(initialData?.name || '')
  const [color, setColor] = useState(initialData?.color || '#89C4E1')
  const [size, setSize] = useState(initialData?.size || 3)
  const [speed, setSpeed] = useState(initialData?.speed || 3)

  // Drawing state
  const [strokes, setStrokes] = useState(initialData?.drawing?.strokes || [])
  const [strokeHistory, setStrokeHistory] = useState([initialData?.drawing?.strokes || []])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [tool, setTool] = useState('brush')
  const [brushColor, setBrushColor] = useState('#E74C3C')
  const [brushSize, setBrushSize] = useState(4)
  const [nameError, setNameError] = useState('')

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleCommitStroke = (newStroke) => {
    const nextStrokes = [...strokes, newStroke]
    setStrokes(nextStrokes)
    setStrokeHistory(prev => [...prev.slice(0, historyIndex + 1), nextStrokes])
    setHistoryIndex(prev => prev + 1)
  }

  const handleEraseAt = (normPoint, radiusPx) => {
    const normRadius = radiusPx / 100
    const filtered = strokes.filter(stroke =>
      !stroke.points.some(p => {
        const dx = p.x - normPoint.x
        const dy = p.y - normPoint.y
        return dx * dx + dy * dy < normRadius * normRadius
      })
    )
    if (filtered.length !== strokes.length) {
      setStrokes(filtered)
      setStrokeHistory(prev => [...prev.slice(0, historyIndex + 1), filtered])
      setHistoryIndex(prev => prev + 1)
    }
  }

  const handleUndo = () => {
    if (historyIndex <= 0) return
    const nextIdx = historyIndex - 1
    setHistoryIndex(nextIdx)
    setStrokes(strokeHistory[nextIdx])
  }

  const handleClear = () => {
    setStrokes([])
    setStrokeHistory(prev => [...prev.slice(0, historyIndex + 1), []])
    setHistoryIndex(prev => prev + 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Give your fish a cute name!')
      return
    }
    if (trimmed.length > 25) {
      setNameError('Name must be 25 characters or fewer')
      return
    }
    setNameError('')

    onSave({
      name: trimmed,
      color,
      size,
      speed,
      drawing: { strokes },
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B4E60]/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-pop relative w-full max-w-md bg-[#FFFDF9] rounded-[32px] border-4 border-[#8CD3FF] shadow-[0_20px_50px_rgba(140,211,255,0.3)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ──────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#E8F3FA] bg-gradient-to-b from-[#F2F9FF] to-[#FFFDF9]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#FF82A9]" />
            <h2 className="font-pixel text-[13px] font-bold text-[#3B698A]">
              Create Your Fish
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#DDE8F2] bg-white flex items-center justify-center text-[#7B95AA] hover:bg-[#F8FBFE] transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Tab Selector (Customize vs Draw) ─── */}
        <div className="flex px-6 pt-3 gap-2 border-b border-[#E8F3FA]">
          <button
            type="button"
            onClick={() => setTab('customize')}
            className={`flex-1 py-2 rounded-t-xl font-pixel text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              tab === 'customize'
                ? 'border-[#8CD3FF] text-[#3B698A] bg-[#E8F5FF]/60'
                : 'border-transparent text-[#7B95AA] hover:bg-[#F8FBFE]'
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>Customize</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('draw')}
            className={`flex-1 py-2 rounded-t-xl font-pixel text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              tab === 'draw'
                ? 'border-[#FFAEC9] text-[#D84E7B] bg-[#FFF0F5]/60'
                : 'border-transparent text-[#7B95AA] hover:bg-[#F8FBFE]'
            }`}
          >
            <Paintbrush size={13} />
            <span>Draw {strokes.length > 0 && `(${strokes.length})`}</span>
          </button>
        </div>

        {/* ── Body Content ───────────────────────── */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {tab === 'customize' ? (
            <>
              {/* Live Preview Box */}
              <div className="flex flex-col items-center gap-2">
                <FishPreview
                  size={size}
                  color={color}
                  drawing={{ strokes }}
                  width={200}
                  height={120}
                />
                <span className="font-pixel text-[11px] text-[#557692] font-bold">
                  {name.trim() || 'Unnamed Fish'}
                </span>
              </div>

              {/* Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-pixel text-[10px] text-[#557692] font-bold px-1">
                  Fish Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError('') }}
                  placeholder="e.g. Mochi, Bubbles, Nemo"
                  maxLength={25}
                  className="px-4 py-2.5 rounded-xl border border-[#DDE8F2] bg-white text-sm text-[#3B4E60] font-bold focus:outline-none focus:border-[#8CD3FF] focus:ring-2 focus:ring-[#8CD3FF]/20"
                />
                {nameError && (
                  <span className="text-xs text-[#FF4E86] font-bold px-1">{nameError}</span>
                )}
              </div>

              {/* Base Color Picker */}
              <ColorPicker
                label="Fish Body Color"
                selectedColor={color}
                onSelectColor={setColor}
                colors={PRESET_COLORS}
              />

              {/* Size Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center px-1 font-pixel text-[10px] font-bold">
                  <span className="text-[#557692]">Fish Size</span>
                  <span className="text-[#8CD3FF]">{size} / 5</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#8FA7BE]">Small</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="flex-1 accent-[#8CD3FF] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#8FA7BE]">Large</span>
                </div>
              </div>

              {/* Speed Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center px-1 font-pixel text-[10px] font-bold">
                  <span className="text-[#557692]">Swim Speed</span>
                  <span className="text-[#FFAEC9]">{speed} / 5</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#8FA7BE]">Slow</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="flex-1 accent-[#FFAEC9] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#8FA7BE]">Fast</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Interactive Drawing Canvas */}
              <FishDrawingCanvas
                size={size}
                color={color}
                strokes={strokes}
                tool={tool}
                brushColor={brushColor}
                brushSize={brushSize}
                onCommitStroke={handleCommitStroke}
                onEraseAt={handleEraseAt}
              />

              {/* Brush Color Picker */}
              <ColorPicker
                label="Brush Color"
                selectedColor={brushColor}
                onSelectColor={(c) => { setBrushColor(c); setTool('brush') }}
              />

              {/* Brush and Action Controls */}
              <BrushControls
                tool={tool}
                setTool={setTool}
                brushSize={brushSize}
                setBrushSize={setBrushSize}
                onUndo={handleUndo}
                onClear={handleClear}
                canUndo={strokes.length > 0}
              />
            </>
          )}
        </div>

        {/* ── Modal Footer Actions ──────────────── */}
        <div className="px-6 py-4 border-t border-[#E8F3FA] bg-[#FBFDFF] flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-[#DDE8F2] bg-white font-pixel text-[10px] font-bold text-[#7B95AA] hover:bg-[#F8FBFE] active:translate-y-0.5 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-full font-pixel text-[10px] font-bold text-white transition-all shadow-[0_4px_16px_rgba(255,78,134,0.35)] active:translate-y-0.5 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #FF769F 0%, #FF4E86 100%)',
            }}
          >
            {loading ? 'Adding Fish...' : '+ Add to Tank'}
          </button>
        </div>
      </div>
    </div>
  )
}
