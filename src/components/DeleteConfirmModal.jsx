export default function DeleteConfirmModal({ fish, onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(43,45,66,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        className="pixel-panel pixel-modal-pop relative w-full p-6 text-center bg-[#ffffff]"
        style={{
          maxWidth: 320,
          border: '3px solid #2b2d42',
          boxShadow: '6px 6px 0px #2b2d42',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-3xl mb-3">🐟</div>
        <h3 className="font-pixel text-[10px] text-[#2b2d42] mb-2 uppercase">
          RELEASE {fish?.name}?
        </h3>
        <p className="font-pixel text-[7px] text-[#5a7082] mb-6 leading-relaxed">
          THIS FISH WILL LEAVE YOUR TANK PERMANENTLY.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-pixel-secondary flex-1 py-2.5 text-[8px]"
          >
            KEEP
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 text-[8px] font-pixel border-2 border-[#2b2d42] bg-[#f47c7c] text-[#ffffff] shadow-[3px_3px_0px_#2b2d42] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#2b2d42]"
          >
            {loading ? '...' : 'RELEASE'}
          </button>
        </div>
      </div>
    </div>
  )
}