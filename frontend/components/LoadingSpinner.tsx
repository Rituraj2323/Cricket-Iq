'use client';

export default function LoadingSpinner({ message = 'Analyzing players...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, #22c55e 100%)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 3px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 3px))',
          }}
        />
        {/* Cricket ball icon */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl animate-float">
          🏏
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-400">{message}</p>
        <div className="flex gap-1 justify-center mt-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-green-500"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
