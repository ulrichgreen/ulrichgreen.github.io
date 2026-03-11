import type { ReactNode } from "react";

interface CodeProps {
    children: ReactNode;
    language?: string;
    title?: string;
}

export function Code({ children, language, title }: CodeProps) {
    return (
        <figure className="code-block" data-language={language}>
            {title && (
                <figcaption className="code-block__title">{title}</figcaption>
            )}
            <pre>
                <code>{children}</code>
            </pre>
        </figure>
    );
}
