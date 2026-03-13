import type React from "react";

/**
 * Optimized picture component following best practices:
 * - Modern format cascade: AVIF → WebP → fallback (JPEG/PNG/SVG)
 * - Explicit width/height prevents CLS (layout shift)
 * - eager + fetchPriority="high" for above-the-fold LCP images
 * - decoding="async" keeps decode off the main thread
 *
 * Usage:
 *   <Picture
 *     src="/images/portrait.jpg"
 *     srcWebp="/images/portrait.webp"
 *     srcAvif="/images/portrait.avif"
 *     alt="Ulrich Green"
 *     width={320} height={400}
 *     loading="eager"
 *     fetchPriority="high"
 *   />
 *
 * Generating optimised variants (requires sharp):
 *   sharp portrait.jpg -o portrait.webp
 *   sharp portrait.jpg -o portrait.avif
 * Or use: squoosh-cli, libvips, ImageMagick, or any build pipeline.
 */

interface PictureProps {
    /** Fallback image URL (JPEG / PNG / SVG). Always required. */
    src: string;
    /** WebP variant — smaller than JPEG, broad browser support. */
    srcWebp?: string;
    /** AVIF variant — smallest format, latest browser support. */
    srcAvif?: string;
    alt: string;
    /** Intrinsic width in pixels — prevents CLS. */
    width: number;
    /** Intrinsic height in pixels — prevents CLS. */
    height: number;
    /**
     * "eager" for above-the-fold / LCP images (default).
     * "lazy" for below-the-fold images (deferred decoding).
     */
    loading?: "eager" | "lazy";
    /**
     * "high" for the page's primary image (LCP candidate).
     * Signals to the browser to prioritise this fetch.
     */
    fetchPriority?: "high" | "low" | "auto";
    className?: string;
}

export function Picture({
    src,
    srcWebp,
    srcAvif,
    alt,
    width,
    height,
    loading = "eager",
    fetchPriority,
    className,
}: PictureProps) {
    return (
        <picture className={className}>
            {srcAvif && <source type="image/avif" srcSet={srcAvif} />}
            {srcWebp && <source type="image/webp" srcSet={srcWebp} />}
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
                decoding="async"
                fetchPriority={fetchPriority}
            />
        </picture>
    );
}
