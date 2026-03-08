import './globals.css';
import Nav from '../components/Nav';

export const metadata = {
  title: 'Unicorn Labs',
  description: 'BACSA Hacks - Closed Challenge Forensics Support System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav />
        <main style={{ paddingTop: '60px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}