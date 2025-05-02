import styles from "../page.module.css";
import ThreeScene from "./renderer"

export default function Page()
{
    return (
        <div className={styles.fullHeight}>
            <ThreeScene />
        </div>
    );
}
