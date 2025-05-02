import Link from 'next/link';

export default function Home()
{
    return (
        <div className="container mt-5 text-center">
            <h1 className="mb-5">Portfolio R3 - Alexandre Dosne</h1>
            <p>Liste des projets :</p>
            <Link href="/prj0" className="btn btn-primary" role="button">Generateur intéractif</Link>
            <p className="mt-5"><em>*Vous pouvez utiliser le bouton en haut à gauche de l&apos;écran pour revenir à l&apos;accueil.</em></p>
        </div>
    );
}
