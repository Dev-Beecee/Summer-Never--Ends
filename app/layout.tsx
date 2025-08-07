import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/footer/Footer';
import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import DynamicBackgroundWrapper from '@/components/DynamicBackgroundWrapper';
import { ClientProviders } from '@/components/ClientProviders';
import localFont from 'next/font/local';

const speede = localFont({
  src: [
    { path: './fonts/speedee-app-light.woff2', weight: '300', style: 'normal' },
    { path: './fonts/speedee-app.woff2', weight: '400', style: 'normal' },
    { path: './fonts/speedee-app-bold.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
});


export async function generateMetadata() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from('reglage_site').select('*').limit(1).single();
  return {
    title: 'Summer Never Ends - Du 07 août au 15 septembre - McDonald\'s Martinique 2025',
    description: 'Scanne ton ticket, cumule des points et tente de gagner de nombreux cadeaux avec McDonald\'s Martinique',
    icons: {
      icon: '/favicon.ico',
    },
    openGraph: {
      images: ['https://summervibes.jeu-mcdo.fr/partage.jpg'],
      title: 'Summer Never Ends - Du 07 août au 15 septembre - McDonald\'s Martinique 2025',
      description: 'Scanne ton ticket, cumule des points et tente de gagner de nombreux cadeaux avec McDonald\'s Martinique',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Summer Never Ends - Du 07 août au 15 septembre - McDonald\'s Martinique 2025',
      description: 'Scanne ton ticket, cumule des points et tente de gagner de nombreux cadeaux avec McDonald\'s Martinique',
      images: ['https://summervibes.jeu-mcdo.fr/partage.jpg'],
    }
  };  
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-C32FGVKY2D"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-C32FGVKY2D');
        ` }} />
      </head>
      <body className={speede.className}>
        <ClientProviders>
          <DynamicBackgroundWrapper>
            <Suspense fallback={null}>
              {children}
              <Footer />
            </Suspense>
            <Toaster />
          </DynamicBackgroundWrapper>
        </ClientProviders>
      </body>
    </html>
  );
}
