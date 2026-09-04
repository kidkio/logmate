import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#020617',
};

export const metadata: Metadata = {
  title: 'LogMate (로그메이트) | 오늘 당신의 실패를 공유하세요',
  description:
    '실패를 털어놓을 가장 다정한 친구, LogMate. 오늘 하루 겪었던 실패를 털어놓고, 비슷한 실패를 경험한 친구들의 위로와 공감을 나눠보세요.',
  keywords: ['LogMate', '로그메이트', '실패공유', '위로', '익명커뮤니티', '이불킥', '공감', '오늘의실패'],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LogMate',
  },
  openGraph: {
    title: 'LogMate (로그메이트) | 오늘 당신의 실패를 공유하세요',
    description: '실패를 털어놓을 가장 다정한 친구, LogMate. 당신만 그런 것이 아닙니다.',
    type: 'website',
    images: [{ url: '/icons/icon-512x512.png', width: 512, height: 512, alt: 'LogMate App Logo' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark h-full">
      <head>
        {/* Google AdSense 사이트 소유권 메타 태그 */}
        <meta name="google-adsense-account" content="ca-pub-8699396744426469" />
      </head>
      <body className="min-h-full bg-black text-slate-100 selection:bg-indigo-500 selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
