import { ImageResponse } from 'next/og';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_URL,
} from '../../../src/lib/seo.js';

export const runtime = 'edge';

function getSiteHostLabel() {
  try {
    return new URL(SITE_URL).host.replace(/^www\./i, '');
  } catch {
    return 'srxvietnam.vn';
  }
}

export async function GET() {
  const hostLabel = getSiteHostLabel();

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at top left, rgba(160, 174, 255, 0.34), transparent 42%), linear-gradient(135deg, #f8fbff 0%, #eef3ff 38%, #fdefff 100%)',
          color: '#15110d',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '26px',
            borderRadius: '38px',
            border: '1px solid rgba(125, 145, 235, 0.18)',
            background: 'rgba(255, 255, 255, 0.6)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 28,
                letterSpacing: '0.34em',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#7d91eb',
              }}
            >
              SRX
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.82)',
                color: '#4b5563',
                border: '1px solid rgba(125,145,235,0.16)',
                padding: '12px 18px',
                fontSize: 24,
              }}
            >
              {hostLabel}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 72,
              maxWidth: 860,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 72,
                lineHeight: 1.05,
                fontWeight: 700,
                letterSpacing: '-0.04em',
              }}
            >
              {SITE_NAME}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 26,
                fontSize: 30,
                lineHeight: 1.45,
                color: '#3f3b36',
                maxWidth: 900,
              }}
            >
              {DEFAULT_DESCRIPTION}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 'auto',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #7d91eb 0%, #efb6df 100%)',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  color: '#5f5449',
                }}
              >
                Cong nghe sinh hoc tien tien cho lan da Viet Nam
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 22,
                color: '#6b7280',
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '999px',
                  background: '#7d91eb',
                }}
              />
              <div style={{ display: 'flex' }}>{SITE_URL}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: DEFAULT_OG_IMAGE_WIDTH,
      height: DEFAULT_OG_IMAGE_HEIGHT,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    },
  );
}
