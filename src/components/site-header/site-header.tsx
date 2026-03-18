import type { CSSProperties } from "preact/compat";
import styles from "./site-header.module.css";

const LOGO_EXPAND_CHARS = [
    "l",
    "r",
    "i",
    "c",
    "h",
    ".",
    "g",
    "r",
    "e",
    "e",
    "n",
];

export function SiteHeader() {
    return (
        <header className="site-header full-bleed">
            <nav className={`${styles.nav} label`} aria-label="Primary">
                <div className={styles.navGroup}>
                    <a href="/index.html">Home</a>
                    <a href="/#articles">Articles</a>
                </div>
                <a
                    href="/index.html"
                    className={`${styles.logo} body-sm mono`}
                    aria-label="ulrich.green — home"
                >
                    <span aria-hidden="true" className={styles.logoBrace}>
                        {"{"}
                    </span>
                    <span className={styles.logoName}>
                        <span className={styles.logoCore}>u</span>
                        {LOGO_EXPAND_CHARS.map((char, i) => (
                            <span
                                key={`${char}-${i}`}
                                className={styles.logoChar}
                                aria-hidden="true"
                                style={
                                    {
                                        "--logo-i": i + 1,
                                    } as CSSProperties
                                }
                            >
                                {char}
                            </span>
                        ))}
                    </span>
                    <span aria-hidden="true" className={styles.logoBrace}>
                        {"}"}
                    </span>
                </a>
                <div className={`${styles.navGroup} ${styles.navGroupRight}`}>
                    <a href="/cv.html">CV</a>
                    <a href="/colophon.html">Colophon</a>
                </div>
            </nav>
        </header>
    );
}
