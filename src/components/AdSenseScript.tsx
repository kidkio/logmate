'use client';

import Script from 'next/script';

interface AdSenseScriptProps {
  clientId?: string;
}

export function AdSenseScript({ clientId }: AdSenseScriptProps) {
  const adsenseClientId = clientId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-8699396744426469';

  return (
    <Script
      id="google-adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
