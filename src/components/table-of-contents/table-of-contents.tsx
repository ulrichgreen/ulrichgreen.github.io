import { useRenderContext } from "../../context/render-context.tsx";

export function TableOfContents() {
    const { headings } = useRenderContext();
    if (headings.length === 0) {
        return null;
    }

    return (
        <aside className="table-of-contents card semi-bleed">
            <h2 className="table-of-contents__heading label">On this page</h2>
            <nav
                className="table-of-contents__nav"
                aria-label="Table of contents"
            >
                <ol className="table-of-contents__list">
                    {headings.map((heading) => (
                        <li
                            key={heading.id}
                            className={`table-of-contents__item table-of-contents__item--level-${heading.level}`}
                        >
                            <a
                                className="table-of-contents__link body-sm"
                                href={`#${heading.id}`}
                            >
                                {heading.text}
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>
        </aside>
    );
}
