/**
 * Renders a floating name badge above a fish.
 * Positioned using absolute CSS, not canvas.
 */
export default function FishNameBadge({ name, x, y, containerRect }) {
  if (!name || !containerRect) return null

  // Convert canvas coords to container-relative
  const left = x
  const top = y - 34  // above fish

  return (
    <div
      className="absolute pointer-events-none z-20 flex justify-center"
      style={{
        left,
        top,
        transform: 'translateX(-50%)',
        animation: 'fadeInScale 0.15s ease-out both',
      }}
    >
      <div
        className="px-3 py-1.5 rounded-2xl text-xs font-semibold text-[#4a7a92] whitespace-nowrap"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(200,230,245,0.9)',
          boxShadow: '0 2px 12px rgba(100,160,200,0.2)',
          fontSize: '11px',
        }}
      >
        {name}
      </div>
    </div>
  )
}
