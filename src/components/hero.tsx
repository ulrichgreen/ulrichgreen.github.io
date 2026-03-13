import type React from "react";
import { Picture } from "./picture.tsx";

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

    return (
        <section
            className={`hero${hasPortrait ? " hero--has-portrait" : ""}`}
            aria-labelledby="hero-name"
        >
            <p className="hero__kicker" aria-hidden="true">
                Product engineer & designer
            </p>

            <div className="hero__body">
                <h1 className="hero__name" id="hero-name">
                    Ulrich{" "}
                    <em>Green</em>
                </h1>

                {hasPortrait && portrait && (
                    <div className="hero__portrait" aria-hidden="true">
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

            <div className="hero__rule" role="presentation" />

            <p className="hero__tagline">{tagline}</p>

            <p className="hero__meta" aria-label="About">
                <span>London</span>
                <span className="hero__meta-dot" aria-hidden="true">·</span>
                <span>ulrich.green</span>
                <span className="hero__meta-dot" aria-hidden="true">·</span>
                <span>
                    <a href="#writing">Writing</a>
                </span>
            </p>
        </section>
    );
}
