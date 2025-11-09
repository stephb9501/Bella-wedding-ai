'use client';

export default function HomePage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bella Wedding AI - Coming Soon</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Great+Vibes&display=swap" rel="stylesheet" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Playfair Display', serif;
            position: relative;
            margin: 0;
            color: #4a4a4a;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          /* Fading Background Photos */
          .photo-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
          }

          .photo-item {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            animation: photoFade 15s ease-in-out infinite;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }

          .photo-item:nth-child(1) {
            animation-delay: 0s;
            background-image: linear-gradient(135deg, rgba(255, 247, 250, 0.4), rgba(249, 241, 247, 0.4)), url('/images/IMG_3942.JPG');
          }

          .photo-item:nth-child(2) {
            animation-delay: 5s;
            background-image: linear-gradient(135deg, rgba(255, 247, 250, 0.4), rgba(249, 241, 247, 0.4)), url('/images/IMG_3941.JPG');
          }

          .photo-item:nth-child(3) {
            animation-delay: 10s;
            background-image: linear-gradient(135deg, rgba(255, 247, 250, 0.4), rgba(249, 241, 247, 0.4)), url('/images/IMG_3943%20(1).JPG');
          }

          @keyframes photoFade {
            0%, 100% { opacity: 0; }
            8%, 92% { opacity: 0.25; }
            50% { opacity: 0.25; }
          }

          /* White Overlay */
          .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.72);
            z-index: 1;
          }

          /* Main Container */
          .container {
            text-align: center;
            z-index: 10;
            position: relative;
            padding: 20px;
            max-width: 600px;
          }

          /* Title */
          .logo {
            font-family: 'Great Vibes', cursive;
            font-size: clamp(2.5rem, 5vw, 3.5rem);
            color: #a64c74;
            margin-bottom: 0.5em;
            font-weight: 400;
            letter-spacing: 2px;
          }

          /* Tagline */
          .tagline {
            font-weight: 700;
            color: #444;
            font-size: clamp(1rem, 2vw, 1.3rem);
            margin-bottom: 0.8em;
            letter-spacing: 0.5px;
          }

          /* Subtext */
          .subtext {
            color: #666;
            margin-bottom: 2em;
            font-size: 1rem;
            letter-spacing: 0.3px;
          }

          /* CTA Button */
          .cta-button {
            background-color: #b84b7a;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 700;
            font-family: 'Playfair Display', serif;
            font-size: 1rem;
            transition: all 0.3s ease;
            margin-top: 20px;
            text-decoration: none;
            display: inline-block;
          }

          .cta-button:hover {
            background-color: #a64c74;
            box-shadow: 0 6px 20px rgba(184, 75, 122, 0.3);
            transform: translateY(-2px);
          }

          /* Footer */
          footer {
            margin-top: 2.5em;
            color: #777;
            font-size: 0.9rem;
            letter-spacing: 0.3px;
          }

          @media (max-width: 600px) {
            .logo {
              font-size: 2rem;
            }

            .tagline {
              font-size: 1rem;
            }

            .container {
              padding: 20px;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="photo-bg">
          <div className="photo-item"></div>
          <div className="photo-item"></div>
          <div className="photo-item"></div>
        </div>

        <div className="overlay"></div>

        <div className="container">
          <h1 className="logo">Bella Wedding AI</h1>
          <p className="tagline">Your AI-powered wedding planner is coming soon!</p>
          <p className="subtext">Designed for brides, planners, and vendors – all in one elegant platform.</p>
          
          <a href="/auth" className="cta-button">Get Started</a>

          <footer>© 2025 Bella Wedding AI • All Rights Reserved</footer>
        </div>
      </body>
    </html>
  );
}
