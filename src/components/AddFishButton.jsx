import { Plus } from 'lucide-react'

export default function AddFishButton({ onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={disabled ? 'Fish limit reached' : 'Create and add your fish'}
      aria-disabled={disabled}
      className={`group flex items-center gap-2.5 px-6 py-3.5 rounded-full text-white font-pixel text-xs sm:text-[13px] font-bold tracking-wide transition-all duration-150 ${
        disabled
          ? 'opacity-55 grayscale cursor-not-allowed'
          : 'active:scale-95 hover:brightness-105'
      }`}
      style={{
        background: disabled
          ? 'linear-gradient(135deg, #B5C4CF 0%, #8FA7BE 100%)'
          : 'linear-gradient(135deg, #FF769F 0%, #FF4E86 100%)',
        boxShadow: disabled
          ? '0 4px 12px rgba(143, 167, 190, 0.25)'
          : '0 8px 24px rgba(255, 78, 134, 0.42), 0 2px 6px rgba(0, 0, 0, 0.08)',
        border: '2px solid rgba(255, 255, 255, 0.45)',
      }}
    >
      <Plus
        size={18}
        strokeWidth={3}
        className={`transition-transform duration-200 ${disabled ? '' : 'group-hover:rotate-90'}`}
      />
      <span>Add Fish</span>
    </button>
  )
}
