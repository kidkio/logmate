import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '오늘 당신의 실패를 공유하세요 | 오늘의 실패',
  description:
    '오늘 하루 겪었던 실패를 털어놓고, 비슷한 실패를 경험한 사람들의 수와 따뜻한 공감을 나눌 수 있는 익명 위로 서비스입니다.',
  keywords: ['실패공유', '위로', '익명커뮤니티', '이불킥', '공감', '오늘의실패'],
  openGraph: {
    title: '오늘 당신의 실패를 공유하세요 | 오늘의 실패',
    description: '비슷한 실패를 겪은 사람들이 여기에 있습니다. 당신만 그런 것이 아닙니다.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
