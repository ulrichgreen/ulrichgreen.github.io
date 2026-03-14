import {
    ArticleHeader,
    getArticleTitleTransitionName,
} from "../components/article-header.tsx";
import { SeriesNav } from "../components/series-nav.tsx";
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
    seriesInfo,
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
            seriesName={seriesInfo?.name}
        >
            <article>
                <ArticleHeader
                    title={title}
                    description={description}
                    section={section}
                    kickerType={seriesInfo ? `Part ${seriesInfo.currentOrder}` : "Essay"}
                    published={published}
                    revised={revised}
                    words={words}
                    readingTime={readingTime}
                    note={note}
                    titleTransitionName={getArticleTitleTransitionName(pagePath)}
                    seriesName={seriesInfo?.name}
                />
                <div className="article-body">{children}</div>
                {seriesInfo && <SeriesNav seriesInfo={seriesInfo} />}
                <footer className="article-footer label">
                    <a href="/index.html">← All writing</a>
                </footer>
            </article>
        </BaseLayout>
    );
}
