import styles from "./manifesto.module.css";

/**
 * Homepage manifesto block. Renders the site's central statement
 * as three typographic movements: opening declaration, body paragraph,
 * and closing resolution.
 */
export function Manifesto() {
    return (
        <section className={`section ${styles.root}`} aria-label="About">
            <p className={`${styles.opener} heading-display`}>
                It's just text files.
            </p>

            <p className={`${styles.body} body-lg`}>
                The web never stopped being simple. Under every website: text
                files. Usually too many. My name is Ulrich Green. I build text
                files for a living. It's a surprisingly short list of materials.
                Worth choosing the characters carefully.
            </p>

            <p className={`${styles.closer} heading-display`}>
                Just some <em>very well considered</em> text files.
            </p>
        </section>
    );
}
