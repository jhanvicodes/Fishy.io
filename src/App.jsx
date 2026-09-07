import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useFish } from './hooks/useFish'
import { useFishRealtime } from './hooks/useFishRealtime'
import Navbar from './components/Navbar'
import FishTank from './components/FishTank'
import AddFishButton from './components/AddFishButton'
import DrawPortal from './components/DrawPortal'
import MyTankDrawer from './components/MyTankDrawer'
import AuthModal from './components/AuthModal'
import { ToastContainer } from './components/Toast'
import { initGlobalClickSound } from './utils/clickSound'
import { MAX_TOTAL_FISH, MAX_FISH_PER_USER } from './constants/limits'

// Decorative floating ambient bubbles scattered around cream background
const DECORATIVE_BUBBLES = [
  { top: '14%', left: '4%', size: 18, delay: '0s' },
  { top: '22%', left: '7%', size: 12, delay: '1s' },
  { top: '48%', left: '3%', size: 20, delay: '2s' },
  { top: '65%', left: '5%', size: 14, delay: '0.5s' },
  { top: '16%', right: '5%', size: 16, delay: '1.5s' },
  { top: '32%', right: '3%', size: 10, delay: '2.5s' },
  { top: '55%', right: '4%', size: 22, delay: '0.8s' },
  { top: '72%', right: '6%', size: 12, delay: '1.8s' },
]

export default function App() {
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5)
    setToasts(prev => [...prev, { id, message, type }])
  }, [])
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Initialize satisfying iPod-style physical click sound on all interactive buttons
  useEffect(() => {
    return initGlobalClickSound()
  }, [])

  // Hook state orchestration
  const { session, user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { fishes, setFishes, loadingFish, addFish, deleteFish } = useFish(addToast)
  useFishRealtime(setFishes, addToast)

  // Derived fish counts from persisted data (Single Source of Truth)
  const currentUserId = user?.id || session?.user?.id
  const userFishCount = currentUserId ? fishes.filter(f => f.user_id === currentUserId).length : 0
  const totalFishCount = fishes.length

  const isUserLimitReached = currentUserId ? userFishCount >= MAX_FISH_PER_USER : false
  const isGlobalLimitReached = totalFishCount >= MAX_TOTAL_FISH
  const isAddFishDisabled = isUserLimitReached || isGlobalLimitReached

  // Modal dialog states
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDrawPortal, setShowDrawPortal] = useState(false)
  const [showMyTankDrawer, setShowMyTankDrawer] = useState(false)
  const [savingFish, setSavingFish] = useState(false)

  // Add fish handler
  const handleOpenCreator = () => {
    if (!session && !user) {
      setShowAuthModal(true)
      return
    }

    // Priority of error messages: User personal limit first, then global limit
    if (userFishCount >= MAX_FISH_PER_USER) {
      addToast(
        `🐠 You've reached your limit!\nYou can have a maximum of ${MAX_FISH_PER_USER} fish.`,
        'error'
      )
      return
    }

    if (totalFishCount >= MAX_TOTAL_FISH) {
      addToast(
        `🌊 The tank is full!\nThere are already ${MAX_TOTAL_FISH} fish in the tank.`,
        'error'
      )
      return
    }

    setShowDrawPortal(true)
  }

  const handleSaveFish = async (fishData) => {
    // Re-verify both conditions before inserting
    if (userFishCount >= MAX_FISH_PER_USER) {
      addToast(
        `🐠 You've reached your limit!\nYou can have a maximum of ${MAX_FISH_PER_USER} fish.`,
        'error'
      )
      return
    }

    if (totalFishCount >= MAX_TOTAL_FISH) {
      addToast(
        `🌊 The tank is full!\nThere are already ${MAX_TOTAL_FISH} fish in the tank.`,
        'error'
      )
      return
    }

    setSavingFish(true)
    try {
      await addFish(fishData, currentUserId || 'guest')
      setShowDrawPortal(false)
      addToast(`${fishData.name} joined the aquarium! 🐟`, 'success')
    } catch (err) {
      if (err.code === 'USER_LIMIT' || err.message?.includes('USER_FISH_LIMIT_REACHED')) {
        addToast(
          `🐠 You've reached your limit!\nYou can have a maximum of ${MAX_FISH_PER_USER} fish.`,
          'error'
        )
      } else if (err.code === 'GLOBAL_LIMIT' || err.message?.includes('GLOBAL_FISH_LIMIT_REACHED')) {
        addToast(
          `🌊 The tank is full!\nThere are already ${MAX_TOTAL_FISH} fish in the tank.`,
          'error'
        )
      } else {
        addToast(`Error saving fish: ${err.message}`, 'error')
      }
    } finally {
      setSavingFish(false)
    }
  }

  const handleDeleteFish = async (fish) => {
    const fishId = typeof fish === 'object' ? fish.id : fish
    const fishName = typeof fish === 'object' ? fish.name : 'Fish'
    try {
      await deleteFish(fishId)
      addToast(`${fishName} swam peacefully away 🌊`, 'success')
    } catch (err) {
      addToast(`Could not delete fish: ${err.message}`, 'error')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8EE]">
        <div className="flex flex-col items-center gap-3 select-none">
          <div className="text-5xl animate-bounce">🐟</div>
          <p className="font-pixel text-[11px] font-bold text-[#8CD3FF]">
            Loading aquarium...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-[#FFF8EE] text-[#4A88BA] font-pixel select-none overflow-x-hidden">
      {/* ── Background Ambient Floating Bubbles ── */}
      {DECORATIVE_BUBBLES.map((b, idx) => (
        <div
          key={idx}
          className="absolute rounded-full border border-[#8CD3FF]/50 bg-[#E8F5FF]/30 pointer-events-none select-none animate-float-bubble"
          style={{
            top: b.top,
            left: b.left,
            right: b.right,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
          }}
        />
      ))}

      {/* ── Top Navigation Bar ─────────────────── */}
      <Navbar
        session={session}
        user={user}
        userFishCount={userFishCount}
        totalFishCount={totalFishCount}
        onSignIn={() => setShowAuthModal(true)}
        onOpenAuth={() => (session ? signOut() : setShowAuthModal(true))}
        onMyTank={() => setShowMyTankDrawer(true)}
        onOpenMyTank={() => setShowMyTankDrawer(true)}
        onSignOut={signOut}
      />

      {/* ── Center Aquarium Stage (Enlarged Hero) ─ */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-2 sm:px-6 my-auto z-10 min-h-0">
        <FishTank fishes={fishes} />
        {loadingFish && (
          <p className="mt-1.5 font-pixel text-[9px] text-[#8CD3FF] animate-pulse">
            Connecting to community tank...
          </p>
        )}
      </main>

      {/* ── Bottom Controls Row ────────────────── */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-8 pb-5 pt-1 flex items-end justify-between pointer-events-none z-20">
        {/* Bottom Left Seaweed Tagline */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="text-[#3DBA9A] flex gap-1 items-end filter drop-shadow-[0_1px_2px_rgba(0,120,80,0.15)]">
            <svg viewBox="0 0 16 32" className="w-4 h-8 fill-current">
              <path d="M4 32c0-8 6-12 4-20S2 4 4 0c2 6-4 10-2 18s8 8 2 14z" />
            </svg>
            <svg viewBox="0 0 16 28" className="w-3.5 h-7 fill-current opacity-90">
              <path d="M4 28c0-7 6-10 4-18S2 4 4 0c2 5-4 9-2 16s8 7 2 12z" />
            </svg>
          </div>
          <div className="font-pixel text-[9px] sm:text-[10px] text-[#557692] font-bold leading-tight">
            Your little<br />
            underwater world 💖
          </div>
        </div>

        {/* Bottom Right Floating Action Button */}
        <div className="pointer-events-auto flex flex-col items-end gap-1.5">
          <div className="font-pixel text-[9px] font-bold bg-white/90 border border-[#8CD3FF]/40 px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 select-none">
            {session ? (
              <span className={isUserLimitReached ? 'text-[#FF4E86]' : 'text-[#3B698A]'}>
                My Fish: {userFishCount} / {MAX_FISH_PER_USER}
              </span>
            ) : (
              <span className={isGlobalLimitReached ? 'text-[#FF4E86]' : 'text-[#7B95AA]'}>
                Tank: {totalFishCount} / {MAX_TOTAL_FISH}
              </span>
            )}
          </div>
          <AddFishButton
            onClick={handleOpenCreator}
            disabled={isAddFishDisabled}
          />
        </div>
      </footer>

      {/* ── Modals & Drawers ───────────────────── */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSignIn={signIn}
          onSignUp={signUp}
        />
      )}

      {showDrawPortal && (
        <DrawPortal
          onClose={() => setShowDrawPortal(false)}
          onSave={handleSaveFish}
          onSaveFish={handleSaveFish}
          loading={savingFish}
        />
      )}

      {showMyTankDrawer && (
        <MyTankDrawer
          session={session}
          user={user}
          fishes={fishes}
          onClose={() => setShowMyTankDrawer(false)}
          onAddFish={() => {
            if (userFishCount >= MAX_FISH_PER_USER) {
              addToast(
                `🐠 You've reached your limit!\nYou can have a maximum of ${MAX_FISH_PER_USER} fish.`,
                'error'
              )
              return
            }
            if (totalFishCount >= MAX_TOTAL_FISH) {
              addToast(
                `🌊 The tank is full!\nThere are already ${MAX_TOTAL_FISH} fish in the tank.`,
                'error'
              )
              return
            }
            setShowMyTankDrawer(false)
            setShowDrawPortal(true)
          }}
          onDeleteFish={handleDeleteFish}
        />
      )}

      {/* ── Global Toast Notifications ─────────── */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
