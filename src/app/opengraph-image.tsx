import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Best Buy Cart — The Independent Guide to Better Buying';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(145deg, #181615 0%, #0F0E0D 100%)',
          padding: '60px 80px',
          fontFamily: 'serif',
          color: '#FAF9F5',
          border: '12px solid #242220',
          position: 'relative',
        }}
      >
        {/* Subtle Decorative Background Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45, 106, 79, 0.25) 0%, rgba(0,0,0,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            left: '-120px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, rgba(0,0,0,0) 70%)',
          }}
        />

        {/* Top Masthead Category Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '10px 24px',
            borderRadius: '30px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#2D6A4F',
            }}
          />
          <span
            style={{
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#D6D3D1',
              fontFamily: 'sans-serif',
            }}
          >
            THE INDEPENDENT GUIDE TO BETTER BUYING
          </span>
        </div>

        {/* Center Main Luxury Brand Logo */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            margin: '20px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              fontSize: '92px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              textShadow: '0 4px 20px rgba(0,0,0,0.6)',
            }}
          >
            <span>Best Buy Cart</span>
            <span
              style={{
                color: '#52B788',
                fontSize: '96px',
                marginLeft: '4px',
              }}
            >
              .
            </span>
          </div>

          <div
            style={{
              fontSize: '26px',
              color: '#A8A29E',
              marginTop: '16px',
              maxWidth: '850px',
              lineHeight: 1.4,
              fontFamily: 'sans-serif',
              fontWeight: 400,
            }}
          >
            Curated Flagship Tech • Verified Laboratory Benchmarks • 100% Unbiased Editorial
          </div>
        </div>

        {/* Bottom Feature Badges & Domain */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '24px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '32px',
              fontSize: '15px',
              color: '#78716C',
              fontWeight: 600,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', color: '#D6D3D1' }}>
              ✓ No Sponsored Ranks
            </span>
            <span style={{ display: 'flex', alignItems: 'center', color: '#D6D3D1' }}>
              ✓ 11 Global Marketplaces
            </span>
            <span style={{ display: 'flex', alignItems: 'center', color: '#D6D3D1' }}>
              ✓ Live Amazon Price Engine
            </span>
          </div>

          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#52B788',
              letterSpacing: '0.05em',
            }}
          >
            buybestcart.shop
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
