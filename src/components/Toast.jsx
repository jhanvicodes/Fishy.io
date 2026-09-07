import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const enterTimeout = setTimeout(() => setVisible(true), 15)
    const exitTimeout = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 250)
    }, 2800)

    return () => {
      clearTimeout(enterTimeout)
      clearTimeout(exitTimeout)
    }
  }, [onClose])

  const typeStyles = type === 'error'
    ? 'bg-[#FFF0F5] border-[#FFCCD8] text-[#FF4E86]'
    : 'bg-[#F2F9FF] border-[#8CD3FF] text-[#3B698A]'

  const hasLeadingEmoji = /^[^\w\s]/u.test(message)

  return (
    <div
      className={`transition-all duration-200 transform ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'
      }`}
    >
      <div
        className={`px-4 py-2.5 rounded-2xl border-2 font-pixel text-[10px] font-bold shadow-[0_6px_20px_rgba(140,211,255,0.35)] flex items-center gap-2 ${typeStyles}`}
      >
        {!hasLeadingEmoji && <span>{type === 'error' ? '⚠️' : '🫧'}</span>}
        <span className="whitespace-pre-line leading-relaxed">{message}</span>
      </div>
    </div>
  )
}

export function ToastContainer({ toasts = [], removeToast }) {
  return (
    <aside
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none select-none max-w-sm w-full px-4"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </aside>
  )
}
