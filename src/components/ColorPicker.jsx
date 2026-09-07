export const PRESET_COLORS = [
  '#89C4E1', // Sky Pastel Blue
  '#FFAEC9', // Cotton Candy Pink
  '#C5B4E8', // Soft Lavender
  '#98D4B8', // Mint Teal
  '#F5D67A', // Sunny Lemon
  '#F5A462', // Tangerine
  '#FF769F', // Coral Raspberry
  '#FFFFFF', // Pure White
  '#243447', // Dark Ink Navy
]

export default function ColorPicker({
  selectedColor,
  onSelectColor,
  label = 'Color Palette',
  colors = PRESET_COLORS,
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <span className="font-pixel text-[10px] text-[#557692] font-bold px-1">
          {label}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {colors.map(color => {
          const isSelected = selectedColor.toLowerCase() === color.toLowerCase()
          return (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor(color)}
              aria-label={`Select color ${color}`}
              className="w-7 h-7 rounded-full border-2 transition-all duration-150 relative"
              style={{
                backgroundColor: color,
                borderColor: isSelected ? '#3B698A' : color === '#FFFFFF' ? '#DDE8F2' : 'transparent',
                transform: isSelected ? 'scale(1.18)' : 'scale(1)',
                boxShadow: isSelected ? '0 0 0 2px rgba(59, 105, 138, 0.35)' : 'none',
              }}
            >
              {isSelected && (
                <span
                  className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                  style={{ color: color === '#FFFFFF' || color === '#F5D67A' ? '#243447' : '#FFFFFF' }}
                >
                  ✓
                </span>
              )}
            </button>
          )
        })}

        {/* Custom Color Input Wheel */}
        <label
          className="w-7 h-7 rounded-full border-2 border-dashed border-[#8CD3FF] bg-[#E8F5FF] flex items-center justify-center cursor-pointer hover:bg-[#D8EEFF] transition-all"
          title="Custom Color"
        >
          <span className="text-[12px] leading-none">🎨</span>
          <input
            type="color"
            value={selectedColor}
            onChange={e => onSelectColor(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  )
}
