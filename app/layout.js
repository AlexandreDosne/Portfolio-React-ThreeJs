import './globals.css';
import 'bootstrap/dist/css/bootstrap.css';

export const metadata = {
  title: "Portfolio R3 - Alexandre Dosne",
  description: "Projets de démonstration utilisant React.js et Three.js.",
};

export default function RootLayout({ children })
{
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
