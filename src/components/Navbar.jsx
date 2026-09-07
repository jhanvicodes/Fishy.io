import { ChevronDown } from 'lucide-react'
import { MAX_TOTAL_FISH, MAX_FISH_PER_USER } from '../constants/limits'

export default function Navbar({
  session,
  userFishCount = 0,
  totalFishCount = 0,
  onSignIn,
  onMyTank,
  onSignOut,
}) {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
      {/* ── Brand Logo ─────────────────────────── */}
      <div className="flex items-center gap-2.5 cursor-pointer">
        <div
          className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #8CD3FF 0%, #68BCEE 100%)',
          }}
        >
          <span className="text-lg leading-none select-none">🐟</span>
        </div>
        <h1 className="font-pixel text-[15px] font-bold text-[#3B698A] tracking-tight">
          fishy.io
        </h1>
      </div>

      {/* ── Right Controls ─────────────────────── */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Subtle Fish Count Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#8CD3FF]/60 bg-white/90 font-pixel text-[10px] font-bold shadow-sm select-none">
          {session ? (
            <>
              <span className={userFishCount >= MAX_FISH_PER_USER ? 'text-[#FF4E86]' : 'text-[#3B698A]'}>
                My Fish: {userFishCount} / {MAX_FISH_PER_USER}
              </span>
              <span className="text-[#8CD3FF]/50">•</span>
              <span className={totalFishCount >= MAX_TOTAL_FISH ? 'text-[#FF4E86]' : 'text-[#7B95AA]'}>
                Tank: {totalFishCount} / {MAX_TOTAL_FISH}
              </span>
            </>
          ) : (
            <span className={totalFishCount >= MAX_TOTAL_FISH ? 'text-[#FF4E86]' : 'text-[#7B95AA]'}>
              Tank: {totalFishCount} / {MAX_TOTAL_FISH}
            </span>
          )}
        </div>
        {session ? (
          <>
            {/* My Tank Pill */}
            <button
              onClick={onMyTank}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#8CD3FF] bg-[#E8F5FF] hover:bg-[#D8EEFF] text-[#3B698A] transition-all shadow-[0_2px_8px_rgba(140,211,255,0.35)] active:translate-y-0.5"
              aria-label="Open My Tank Drawer"
            >
              <span className="text-sm">🐠</span>
              <span className="font-pixel text-[10px] font-bold">My Tank</span>
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 p-1.5 rounded-full border border-[#FFD0DE] bg-[#FFF0F5] hover:bg-[#FFE4EE] transition-all shadow-sm active:translate-y-0.5"
              title="Click to sign out"
              aria-label="User Profile and Sign Out"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FFAEC9] to-[#FFD0DE] border border-white flex items-center justify-center text-xs shadow-inner">
                🐡
              </div>
              <ChevronDown size={13} className="text-[#8B707B] pr-1" />
            </button>
          </>
        ) : (
          <button
            onClick={onSignIn}
            className="font-pixel text-[10px] font-bold px-5 py-2.5 rounded-full text-white bg-gradient-to-r from-[#9D8FE8] to-[#8777D8] hover:from-[#A89AF0] hover:to-[#9282E0] border border-[#7563C7] shadow-[0_3px_10px_rgba(135,119,216,0.35)] transition-all active:translate-y-0.5"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  )
}
