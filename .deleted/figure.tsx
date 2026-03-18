import type { ReactNode } from "preact/compat";
import { Picture } from "./picture.tsx";

interface FigureProps {
    src: string;
    alt: string;
    caption?: ReactNode;
    width?: number;
    height?: number;
}

function deriveVariant(src: string, extension: ".webp" | ".avif"): string | undefined {
    if (!/\.(jpe?g|png)$/i.test(src)) {
        return undefined;
    }

    return src.replace(/\.(jpe?g|png)$/i, extension);
}

export function Figure({ src, alt, caption, width, height }: FigureProps) {
    return (
        <figure className="figure semi-bleed">
            <Picture
                src={src}
                srcWebp={deriveVariant(src, ".webp")}
                srcAvif={deriveVariant(src, ".avif")}
                alt={alt}
                width={width}
                height={height}
                loading="lazy"
            />
            {caption && <figcaption className="figure__caption">{caption}</figcaption>}
        </figure>
    );
}
