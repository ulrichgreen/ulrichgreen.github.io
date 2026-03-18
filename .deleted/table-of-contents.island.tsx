import { useState } from "preact/hooks";
import type { ContentHeading } from "../types/content.ts";

export interface TableOfContentsClientProps {
    headings: ContentHeading[];
}

export function TableOfContentsClient({ headings }: TableOfContentsClientProps) {
    const [expanded, setExpanded] = useState(false);

    if (headings.length === 0) {
        return null;
    }

    return (
        <aside className="table-of-contents card semi-bleed">
            <button
                className="table-of-contents__toggle label"
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpanded((value) => !value)}
            >
                <span>On this page</span>
                <span aria-hidden="true">{expanded ? "−" : "+"}</span>
            </button>
            <nav
                className="table-of-contents__nav"
                aria-label="Table of contents"
                hidden={!expanded}
            >
                <ol className="table-of-contents__list">
                    {headings.map((heading) => (
                        <li
                            key={heading.id}
                            className={`table-of-contents__item table-of-contents__item--level-${heading.level}`}
                        >
                            <a className="table-of-contents__link" href={`#${heading.id}`}>
                                {heading.text}
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>
        </aside>
    );
}
