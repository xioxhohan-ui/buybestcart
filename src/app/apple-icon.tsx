import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: '40px',
          border: '6px solid #10B981',
          position: 'relative',
        }}
      >
        <span
          style={{
            fontSize: '96px',
            fontWeight: 900,
            color: '#10B981',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.05em',
          }}
        >
          B
        </span>
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#F59E0B',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.8)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
