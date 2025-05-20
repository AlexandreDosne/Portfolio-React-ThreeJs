import styles from "../page.module.css";
import ThreeScene from "./renderer"
import Link from 'next/link';

export default function Page()
{
    return (
        <div className={styles.fullHeight}>
            <Link href="/" className="btn btn-outline-primary position-fixed mx-2 mt-2" role="button">Accueil</Link>
            <Link href="#" id="bLerpToPanel" className="btn btn-outline-primary position-fixed mx-2 mt-5" role="button">Panneau de contrôle</Link>
            <ThreeScene />
        </div>
    );
}
