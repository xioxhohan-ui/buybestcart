import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '8px',
          border: '1.5px solid #10B981',
          position: 'relative',
        }}
      >
        <span
          style={{
            fontSize: '18px',
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
            top: '4px',
            right: '4px',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: '#F59E0B',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
