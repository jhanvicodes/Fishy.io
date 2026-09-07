import { Paintbrush, Eraser, Undo2, Trash2 } from 'lucide-react'

export default function BrushControls({
  tool,
  setTool,
  brushSize,
  setBrushSize,
  onUndo,
  onClear,
  canUndo = false,
}) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ── Size Selector ──────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <span className="font-pixel text-[10px] text-[#557692] font-bold">Brush Size</span>
        <div className="flex items-center gap-2">
          {[2, 4, 7, 10].map(sz => (
            <button
              key={sz}
              type="button"
              onClick={() => setBrushSize(sz)}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                brushSize === sz
                  ? 'border-[#8CD3FF] bg-[#E8F5FF] text-[#3B698A] font-bold shadow-sm'
                  : 'border-[#DDE8F2] bg-white text-[#7B95AA] hover:bg-[#F8FBFE]'
              }`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: Math.max(3, sz * 1.3), height: Math.max(3, sz * 1.3) }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Tool Mode Buttons ──────────────────── */}
      <div className="flex items-center gap-2">
        {/* Brush Mode */}
        <button
          type="button"
          onClick={() => setTool('brush')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border font-pixel text-[9px] font-bold transition-all ${
            tool === 'brush'
              ? 'border-[#8CD3FF] bg-[#E8F5FF] text-[#3B698A] shadow-sm'
              : 'border-[#DDE8F2] bg-white text-[#7B95AA] hover:bg-[#F8FBFE]'
          }`}
        >
          <Paintbrush size={13} />
          <span>Brush</span>
        </button>

        {/* Eraser Mode */}
        <button
          type="button"
          onClick={() => setTool('eraser')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border font-pixel text-[9px] font-bold transition-all ${
            tool === 'eraser'
              ? 'border-[#FFAEC9] bg-[#FFF0F5] text-[#D84E7B] shadow-sm'
              : 'border-[#DDE8F2] bg-white text-[#7B95AA] hover:bg-[#F8FBFE]'
          }`}
        >
          <Eraser size={13} />
          <span>Eraser</span>
        </button>

        {/* Undo Action */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-xl border border-[#DDE8F2] bg-white text-[#7B95AA] hover:bg-[#F8FBFE] disabled:opacity-40 transition-all"
          title="Undo Last Stroke"
          aria-label="Undo Last Stroke"
        >
          <Undo2 size={15} />
        </button>

        {/* Clear Canvas Action */}
        <button
          type="button"
          onClick={onClear}
          className="p-2 rounded-xl border border-[#FFCCD8] bg-[#FFF8F9] text-[#E05075] hover:bg-[#FFEBF0] transition-all"
          title="Clear All Strokes"
          aria-label="Clear All Strokes"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
