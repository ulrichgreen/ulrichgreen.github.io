import type { ReactNode } from "preact/compat";

interface CodeProps {
    children?: ReactNode;
    language?: string;
    title?: string;
}

function formatCodeLanguage(value?: string): string {
    const normalized = (value || "text").trim().toLowerCase();

    const knownLabels: Record<string, string> = {
        css: "CSS",
        html: "HTML",
        javascript: "JavaScript",
        js: "JavaScript",
        json: "JSON",
        jsx: "JSX",
        md: "Markdown",
        mdx: "MDX",
        shell: "Shell",
        text: "Text",
        ts: "TypeScript",
        tsx: "TSX",
        typescript: "TypeScript",
        xml: "XML",
        yaml: "YAML",
        yml: "YAML",
    };

    if (knownLabels[normalized]) return knownLabels[normalized];

    return normalized
        .split(/[-_]/g)
        .filter(Boolean)
        .map((segment) => segment.slice(0, 1).toUpperCase() + segment.slice(1))
        .join(" ");
}

export function Code({ children, language, title }: CodeProps) {
    return (
        <figure
            className="code-block"
            data-language={language}
            data-rehype-pretty-code-figure=""
        >
            <div className="code-block__toolbar">
                {title && <span className="code-block__title">{title}</span>}
                <span className="code-block__language">
                    {formatCodeLanguage(language)}
                </span>
            </div>
            <pre>
                <code>{children}</code>
            </pre>
        </figure>
    );
}
