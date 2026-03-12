import {
    ArticleHeader,
    getArticleTitleTransitionName,
} from "../components/article-header.tsx";
import BaseLayout from "./base.tsx";
import type { ArticleLayoutProps } from "../types/content.ts";

export default function ArticleLayout({
    title,
    description,
    section,
    pagePath,
    published,
    revised,
    words,
    readingTime,
    note,
    children,
}: ArticleLayoutProps) {
    return (
        <BaseLayout
            title={title}
            description={description}
            section={section}
            pagePath={pagePath}
            published={published}
            revised={revised}
            mainClassName="page page--article"
        >
            <article>
                <ArticleHeader
                    title={title}
                    description={description}
                    section={section}
                    kickerType="Essay"
                    published={published}
                    revised={revised}
                    words={words}
                    readingTime={readingTime}
                    note={note}
                    titleTransitionName={getArticleTitleTransitionName(pagePath)}
                />
                <div className="article-body">{children}</div>
                <footer className="article-footer">
                    <a href="/index.html">← All writing</a>
                </footer>
            </article>
        </BaseLayout>
    );
}
