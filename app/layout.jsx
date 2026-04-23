/* eslint-disable react-refresh/only-export-components */
import '../src/index.css';
import AppShell from '../src/components/AppShell';

export const metadata = {
  metadataBase: new URL('https://nextgency.vn'),
  title: 'SRX Việt Nam',
  description: 'SRX Việt Nam - Giải pháp digital marketing toàn diện',
  icons: {
    icon: [
      {
        url: '/assets/images/favicon.webp',
        type: 'image/webp',
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
