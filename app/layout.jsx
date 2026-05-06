import '../src/index.css';
import AppShell from '../src/components/AppShell';
import JsonLd from '../src/components/SEO/JsonLd.jsx';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildRobots,
  createOrganizationSchema,
  createWebsiteSchema,
} from '../src/lib/seo.js';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  robots: buildRobots(false),
  icons: {
    icon: [
      {
        url: '/assets/images/favicon.webp',
        type: 'image/webp',
      },
    ],
    shortcut: ['/assets/images/favicon.webp'],
    apple: ['/assets/images/favicon.webp'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi-VN">
      <body>
        <JsonLd data={[createOrganizationSchema(), createWebsiteSchema()]} idPrefix="global-seo" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
