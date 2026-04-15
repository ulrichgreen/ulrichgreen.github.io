import type { ReactNode } from "preact/compat";
import { formatCodeLanguage } from "../../format-code-language.ts";

interface CodeProps {
    children?: ReactNode;
    language?: string;
    title?: string;
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
