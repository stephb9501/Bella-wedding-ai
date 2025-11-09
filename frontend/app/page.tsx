'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div style={{ background: 'linear-gradient(135deg, #f5d5e3, #e8b4d3, #d896c4, #c47ab5)', opacity: 0.8 }} className="absolute inset-0" />
      </div>
      <div className="fixed inset-0 bg-white/72 z-[1]" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full mx-auto px-6 text-center">
        <h1 className="font-serif text-5xl font-bold text-[#a4556f] mb-4">Bella Wedding AI</h1>
        <p className="text-lg text-[#666] mb-2">Your AI-Powered Wedding Planning Assistant</p>
        <p className="text-md text-[#999] mb-12">Plan your perfect day with intelligence, elegance, and ease</p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth"
            className="bg-[#a4556f] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#8b4558] transition"
          >
            Get Started
          </Link>
          <button className="border-2 border-[#a4556f] text-[#a4556f] px-8 py-3 rounded-lg font-bold hover:bg-[#a4556f]/10 transition">
            Learn More
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white/50 rounded-lg backdrop-blur">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-serif text-lg font-bold text-[#a4556f] mb-2">AI Planning</h3>
            <p className="text-sm text-[#666]">Smart suggestions powered by AI</p>
          </div>
          <div className="p-6 bg-white/50 rounded-lg backdrop-blur">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-serif text-lg font-bold text-[#a4556f] mb-2">Budget Tracking</h3>
            <p className="text-sm text-[#666]">Stay on budget with real-time tracking</p>
          </div>
          <div className="p-6 bg-white/50 rounded-lg backdrop-blur">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-serif text-lg font-bold text-[#a4556f] mb-2">Guest Management</h3>
            <p className="text-sm text-[#666]">Effortless RSVP and guest coordination</p>
          </div>
        </div>

        {/* Coming Soon Text */}
        <div className="mt-16 text-sm text-[#999]">
          <p>🎉 Your AI-powered wedding planning journey starts here</p>
        </div>
      </div>
    </div>
  );
}