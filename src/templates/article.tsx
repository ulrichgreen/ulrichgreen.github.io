import {
    ArticleHeader,
    getArticleTitleTransitionName,
} from "../components/article-header/article-header.tsx";
import { PageHeader } from "../components/page-header/page-header.tsx";
import { RevisionHistory } from "../components/revision-history/revision-history.tsx";
import { SeriesNav } from "../components/series-nav/series-nav.tsx";
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
    revisions,
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
            <PageHeader title={title} section={section} />
            <article>
                <ArticleHeader
                    title={title}
                    description={description}
                    section={section}
                    kickerType={
                        seriesInfo
                            ? `Part ${seriesInfo.currentOrder}`
                            : "Article"
                    }
                    published={published}
                    revised={revised}
                    words={words}
                    readingTime={readingTime}
                    note={note}
                    titleTransitionName={getArticleTitleTransitionName(
                        pagePath,
                    )}
                    seriesName={seriesInfo?.name}
                />
                <div className="section article-body">{children}</div>
                {revisions && revisions.length > 0 && (
                    <RevisionHistory revisions={revisions} />
                )}
                {seriesInfo && <SeriesNav seriesInfo={seriesInfo} />}
                <footer className="section article-footer label">
                    <a href="/index.html">← All articles</a>
                </footer>
            </article>
        </BaseLayout>
    );
}
