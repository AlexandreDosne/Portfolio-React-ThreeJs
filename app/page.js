import styles from "./page.module.css";
import ThreeScene from "./renderer"

export default function Home()
{
    return (
        <div className={styles.page}>
            <ThreeScene />
        </div>
    );
}
