import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LogMate (로그메이트) | 오늘 당신의 실패를 공유하세요',
  description:
    '실패를 털어놓을 가장 다정한 친구, LogMate. 오늘 하루 겪었던 실패를 털어놓고, 비슷한 실패를 경험한 친구들의 위로와 공감을 나눠보세요.',
  keywords: ['LogMate', '로그메이트', '실패공유', '위로', '익명커뮤니티', '이불킥', '공감', '오늘의실패'],
  openGraph: {
    title: 'LogMate (로그메이트) | 오늘 당신의 실패를 공유하세요',
    description: '실패를 털어놓을 가장 다정한 친구, LogMate. 당신만 그런 것이 아닙니다.',
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
