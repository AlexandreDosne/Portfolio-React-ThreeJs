import './globals.css';
import 'bootstrap/dist/css/bootstrap.css';
import Link from 'next/link';

export const metadata = {
  title: "Portfolio R3 - Alexandre Dosne",
  description: "Projets de démonstration utilisant React.js et Three.js.",
};

export default function RootLayout({ children })
{
  return (
    <html lang="fr">
      <body>
        <Link href="/" className="btn btn-outline-secondary position-fixed mx-2 mt-2" role="button">↲</Link>
        {children}
      </body>
    </html>
  );
}
