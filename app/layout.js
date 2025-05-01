import "./globals.css";

export const metadata = {
  title: "Portfolio R3F - Alexandre Dosne",
  description: "Projet de démonstration d'un projet utilisant React et ThreeJs.",
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
