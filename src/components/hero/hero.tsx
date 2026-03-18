import styles from "./hero.module.css";
import { Picture } from "../picture.tsx";

interface HeroPortrait {
    /** Path to fallback image (JPEG / SVG). */
    src: string;
    srcWebp?: string;
    srcAvif?: string;
    alt?: string;
    width?: number;
    height?: number;
}

interface HeroProps {
    tagline?: string;
    portrait?: HeroPortrait;
}

/**
 * Home-page hero. Renders an editorial cover block:
 *   kicker → name → (optional portrait) → rule → tagline → meta bar
 *
 * To include a portrait from index.mdx:
 *   <Hero portraitSrc="/images/portrait.avif"
 *         portraitFallback="/images/portrait.jpg" />
 *
 * Portrait should be a 4:5 portrait-ratio image.
 * Optimal pipeline: source.jpg → portrait.webp + portrait.avif via sharp.
 */
export function Hero({
    tagline = "Product engineer and designer. I write about the intersection of constraints, craft, and clarity.",
    portrait,
}: HeroProps) {
    const hasPortrait = Boolean(portrait?.src);
    const sectionClasses = ["section", "header", styles.hero];

    if (hasPortrait) {
        sectionClasses.push(styles.hasPortrait);
    }

    return (
        <section
            className={sectionClasses.join(" ")}
            aria-labelledby="hero-name"
        >
            <p
                className={`${styles.kicker} header__eyebrow label`}
                aria-hidden="true"
            >
                Product engineer & designer
            </p>

            <div className={styles.body}>
                <h1
                    className={`${styles.name} title heading-display`}
                    id="hero-name"
                >
                    Ulrich <em>Green</em>
                </h1>

                {hasPortrait && portrait && (
                    <div className={styles.portrait} aria-hidden="true">
                        <Picture
                            src={portrait.src}
                            srcWebp={portrait.srcWebp}
                            srcAvif={portrait.srcAvif}
                            alt={portrait.alt ?? ""}
                            width={portrait.width ?? 320}
                            height={portrait.height ?? 400}
                            loading="eager"
                            fetchPriority="high"
                        />
                    </div>
                )}
            </div>

            <div
                className={`${styles.rule} header__rule`}
                role="presentation"
            />

            <p className={`${styles.tagline} lede`}>
                <span className="body-lg">{tagline}</span>
            </p>

            <p
                className={`${styles.meta} header__meta label`}
                aria-label="About"
            >
                <span>London</span>
                <span className={styles.metaDot} aria-hidden="true">
                    ·
                </span>
                <span>ulrich.green</span>
                <span className={styles.metaDot} aria-hidden="true">
                    ·
                </span>
                <span>
                    <a href="#articles">Articles</a>
                </span>
            </p>
        </section>
    );
}
