import React, { useRef } from 'react'
import FishCanvas from './FishCanvas'

export default function FishTank({ fishes = [], fishList = [], onSelectFish }) {
  const containerRef = useRef(null)
  const activeFish = fishes.length > 0 ? fishes : fishList

  return (
    <div className="relative w-full flex flex-col items-center select-none my-auto">
      {/* ── Single Main Aquarium Glass Tank Chassis ── */}
      <div
        ref={containerRef}
        className="relative w-[92vw] max-w-[1400px] h-[65vh] min-h-[520px] mx-auto rounded-[36px] border-[12px] border-[#8CD3FF] overflow-hidden shadow-2xl bg-[#89CDFD]"
        style={{
          backgroundImage: "url('/aquarium-bg.png')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
        }}
      >
        {/* Exactly ONE Yellow Starfish Badge on Top-Left Edge */}
        <div className="absolute top-2.5 left-2.5 z-30 pointer-events-none select-none">
          <svg
            className="w-8 h-8 text-[#FFD15C] drop-shadow-md transition-transform hover:scale-110"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l2.4 6H20l-4.8 4 1.8 6.5-5-3.8-5 3.8 1.8-6.5L4 8h5.6z" />
          </svg>
        </div>

        {/* Ambient Floating Glass Bubbles */}
        <div className="ambient-bubble w-4 h-4 left-1/4 top-1/3" style={{ animationDelay: '0s' }} />
        <div className="ambient-bubble w-6 h-6 left-1/2 top-1/4" style={{ animationDelay: '1.2s' }} />
        <div className="ambient-bubble w-3 h-3 left-2/3 top-1/2" style={{ animationDelay: '2.5s' }} />
        <div className="ambient-bubble w-5 h-5 left-1/5 top-2/3" style={{ animationDelay: '0.8s' }} />

        {/* Live Canvas Simulation Layer taking up 100% of the single aquarium */}
        <div className="w-full h-full relative z-10">
          <FishCanvas
            containerRef={containerRef}
            fishes={activeFish}
            onSelectFish={onSelectFish}
          />
        </div>
      </div>

      {/* Exactly ONE Pink Pedestal directly attached to bottom edge with center bubble pill */}
      <div className="relative -mt-2 w-[88vw] max-w-[1340px] h-12 md:h-14 bg-[#FFAEC9] border-b-[6px] border-[#FF82A9] rounded-b-[28px] rounded-t-md shadow-md flex items-center justify-center z-20">
        {/* Single Center Bubble Pill */}
        <div
          role="button"
          tabIndex={0}
          className="w-16 h-7 rounded-full bg-[#A8DCFF] border-2 border-[#6EBEFF] flex items-center justify-center gap-1.5 shadow-inner cursor-pointer active:scale-95 transition-transform"
          title="Filter Bubbler"
          aria-label="Filter Bubbler"
        >
          <div className="w-2.5 h-2.5 rounded-full border border-[#459BEE] bg-white/70" />
          <div className="w-3.5 h-3.5 rounded-full border border-[#459BEE] bg-white/70 -mt-1" />
          <div className="w-2 h-2 rounded-full border border-[#459BEE] bg-white/70" />
        </div>
      </div>
    </div>
  )
}
