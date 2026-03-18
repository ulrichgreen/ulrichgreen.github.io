import styles from "./page-header.module.css";

interface PageHeaderProps {
    title?: string;
    section?: string;
}

export function PageHeader({ title, section }: PageHeaderProps) {
    return (
        <div className={styles.pageHeader}>
            {section && (
                <span className={`${styles.section} label`}>{section}</span>
            )}
            <span className={`${styles.title} body-sm`}>{title}</span>
            <nav className={`${styles.nav} body-sm`} aria-label="Article">
                <a href="/index.html">← All articles</a>
            </nav>
        </div>
    );
}
