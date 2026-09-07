import { useState, useEffect } from 'react'
import { Eye, EyeOff, X, Mail, Lock } from 'lucide-react'

export default function AuthModal({
  onClose,
  onSignIn,
  onSignUp,
}) {
  const [tab, setTab] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (tab === 'signup' && password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      if (tab === 'signin') {
        await onSignIn(email, password)
        onClose()
      } else {
        const res = await onSignUp(email, password)
        // If Supabase has email confirmation disabled, an active session is returned immediately
        const activeSession = res?.session || res?.data?.session
        if (activeSession) {
          onClose()
        } else {
          setRegisteredEmail(email)
          setSignupSuccess(true)
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B4E60]/40 backdrop-blur-sm select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-pop relative w-full max-w-sm bg-[#FFFDF9] rounded-[32px] border-4 border-[#8CD3FF] shadow-[0_20px_50px_rgba(140,211,255,0.3)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#DDE8F2] bg-white flex items-center justify-center text-[#7B95AA] hover:bg-[#F8FBFE] transition-colors z-10"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        <div className="p-7">
          {signupSuccess ? (
            <div className="flex flex-col items-center text-center py-2">
              {/* Mail heart icon badge */}
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FFE4EC] to-[#FFF0F5] border-2 border-white flex items-center justify-center shadow-md text-3xl mb-4">
                💌
              </div>

              <h2 className="font-pixel text-[15px] font-bold text-[#3B698A] mb-2">
                You&apos;re almost there! 💌
              </h2>

              <p className="text-xs text-[#7B95AA] mb-2 leading-relaxed">
                We&apos;ve sent a confirmation email to:
              </p>

              <div className="w-full px-3.5 py-2 rounded-xl bg-[#EBF6FE] border border-[#8CD3FF]/60 text-[#2C6288] font-bold text-xs truncate mb-3 select-all text-center">
                {registeredEmail}
              </div>

              <p className="text-xs text-[#7B95AA] mb-6 leading-relaxed">
                Please check your inbox and confirm your email address before signing in.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSignupSuccess(false)
                  setTab('signin')
                  setErrorMessage('')
                }}
                className="w-full py-3 rounded-full font-pixel text-[11px] font-bold text-white transition-all shadow-[0_4px_16px_rgba(135,119,216,0.35)] active:translate-y-0.5 hover:brightness-105"
                style={{
                  background: 'linear-gradient(135deg, #9D8FE8 0%, #8777D8 100%)',
                }}
              >
                Back to Sign In ✨
              </button>
            </div>
          ) : (
            <>
              {/* Brand Header */}
              <div className="flex flex-col items-center gap-1.5 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8CD3FF] to-[#68BCEE] border-2 border-white flex items-center justify-center shadow-md text-2xl">
                  🐟
                </div>
                <h2 className="font-pixel text-[15px] font-bold text-[#3B698A]">
                  fishy.io
                </h2>
                <p className="text-xs text-[#7B95AA]">
                  Join the shared community aquarium
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex border-b border-[#E8F3FA] mb-5">
                {['signin', 'signup'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setTab(mode); setErrorMessage('') }}
                    className={`flex-1 pb-2.5 font-pixel text-[10px] font-bold transition-all relative ${
                      tab === mode
                        ? 'text-[#8777D8]'
                        : 'text-[#8FA7BE] hover:text-[#557692]'
                    }`}
                  >
                    {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                    {tab === mode && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8777D8] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="flex flex-col gap-1">
                  <label className="font-pixel text-[9px] text-[#557692] font-bold px-1 flex items-center gap-1.5">
                    <Mail size={12} className="text-[#8777D8]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="px-4 py-2.5 rounded-xl border border-[#DDE8F2] bg-white text-sm text-[#3B4E60] font-bold focus:outline-none focus:border-[#8CD3FF] focus:ring-2 focus:ring-[#8CD3FF]/20"
                  />
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1">
                  <label className="font-pixel text-[9px] text-[#557692] font-bold px-1 flex items-center gap-1.5">
                    <Lock size={12} className="text-[#8777D8]" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#DDE8F2] bg-white text-sm text-[#3B4E60] font-bold focus:outline-none focus:border-[#8CD3FF] focus:ring-2 focus:ring-[#8CD3FF]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA7BE] hover:text-[#557692]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Sign up only) */}
                {tab === 'signup' && (
                  <div className="flex flex-col gap-1">
                    <label className="font-pixel text-[9px] text-[#557692] font-bold px-1 flex items-center gap-1.5">
                      <Lock size={12} className="text-[#8777D8]" />
                      <span>Confirm Password</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="px-4 py-2.5 rounded-xl border border-[#DDE8F2] bg-white text-sm text-[#3B4E60] font-bold focus:outline-none focus:border-[#8CD3FF] focus:ring-2 focus:ring-[#8CD3FF]/20"
                    />
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-[#FFF0F5] border border-[#FFCCD8] text-xs font-bold text-[#FF4E86]">
                    {errorMessage}
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full font-pixel text-[11px] font-bold text-white transition-all shadow-[0_4px_16px_rgba(135,119,216,0.35)] active:translate-y-0.5 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #9D8FE8 0%, #8777D8 100%)',
                  }}
                >
                  {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
