import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
// import { ThemeProvider } from '@/components/providers/theme-provider';
import { cookies } from 'next/headers';
import { cn } from '@/lib/utils';
import { ActiveThemeProvider } from '@/components/active-theme';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Better Auth Starter',
  description:
    'Simple starter pack for Better Auth, with Shadcn, Drizzle, and Neon',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isScaled = activeThemeValue?.endsWith('-scaled');

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // className={`${outfit.className} antialiased`}
        className={cn(
          'bg-background overscroll-none font-sans antialiased',
          activeThemeValue ? `theme-${activeThemeValue}` : '',
          isScaled ? 'theme-scaled' : '',
          `${outfit.className} antialiased`
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <Toaster richColors />
          <ActiveThemeProvider initialTheme={activeThemeValue}>
            {children}
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
