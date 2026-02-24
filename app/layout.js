import './globals.css'

export const metadata = {
  title: 'Go-Fish – Find din fiskepartner',
  description: 'Find fisketure, samkørsel og fiskerpartnere i Danmark. Match med andre lystfiskere og book din næste tur.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Go-Fish',
  },
  openGraph: {
    title: 'Go-Fish – Find din fiskepartner',
    description: 'Find fisketure og samkørsel i Danmark',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1d4ed8',
}

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
