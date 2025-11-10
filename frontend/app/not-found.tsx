'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-champagne-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          Sorry! The page you're looking for doesn't exist.
        </p>
        
          href="/dashboard"
          className="inline-block bg-champagne-600 hover:bg-champagne-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}