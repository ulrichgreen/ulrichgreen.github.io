import { ArticleHeader } from "../components/article-header.tsx";
import BaseLayout from "./base.tsx";
import type { ArticleLayoutProps } from "../types/content.ts";

export default function ArticleLayout({
    title,
    description,
    section,
    published,
    revised,
    words,
    note,
    children,
}: ArticleLayoutProps) {
    return (
        <BaseLayout title={title} description={description} section={section}>
            <article>
                <ArticleHeader
                    title={title}
                    published={published}
                    revised={revised}
                    words={words}
                    note={note}
                />
                <div className="article-body">{children}</div>
                <footer className="article-footer">
                    <a href="/index.html">← All writing</a>
                </footer>
            </article>
        </BaseLayout>
    );
}
