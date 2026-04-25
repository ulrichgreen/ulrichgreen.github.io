import type { ArticleIndexEntry, BuiltContent } from "../../types/content.ts";

const staleAfterDays = 365;
const imageReferencePattern = /\/images\/[^\s"'`)<>]+/g;

export interface ContentAuditInput {
    builtContent: BuiltContent[];
    articleIndex: ArticleIndexEntry[];
    sourceTextByPath: Map<string, string>;
    now?: Date;
}

export interface ContentAuditReport {
    pageCount: number;
    articleCount: number;
    draftArticles: string[];
    missingDescriptions: string[];
    staleArticles: string[];
    seriesGaps: { series: string; expected: number; found: number }[];
    wordCount: {
        total: number;
        averageArticle: number;
    };
    imageReferences: string[];
}

function numberValue(value: number | string | undefined): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number.parseInt(value, 10) || 0;
    return 0;
}

function daysBetween(left: Date, right: Date): number {
    return Math.floor((left.getTime() - right.getTime()) / 86_400_000);
}

function latestArticleDate(entry: ArticleIndexEntry): Date | undefined {
    const value = entry.revised || entry.published;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function collectSeriesGaps(
    articleIndex: ArticleIndexEntry[],
): ContentAuditReport["seriesGaps"] {
    const ordersBySeries = new Map<string, number[]>();
    for (const entry of articleIndex) {
        if (!entry.series || entry.seriesOrder === undefined) continue;
        ordersBySeries.set(entry.series, [
            ...(ordersBySeries.get(entry.series) ?? []),
            entry.seriesOrder,
        ]);
    }

    const gaps: ContentAuditReport["seriesGaps"] = [];
    for (const [series, orders] of ordersBySeries) {
        const sorted = [...new Set(orders)].sort((left, right) => left - right);
        for (let index = 0; index < sorted.length; index++) {
            const expected = index + 1;
            const found = sorted[index];
            if (found !== expected) {
                gaps.push({ series, expected, found });
                break;
            }
        }
    }
    return gaps;
}

function collectImageReferences(
    sourceTextByPath: Map<string, string>,
): string[] {
    const references = new Set<string>();
    for (const source of sourceTextByPath.values()) {
        for (const reference of source.match(imageReferencePattern) ?? []) {
            references.add(reference);
        }
    }
    return [...references].sort();
}

export function createContentAudit({
    builtContent,
    articleIndex,
    sourceTextByPath,
    now = new Date(),
}: ContentAuditInput): ContentAuditReport {
    const draftArticles = builtContent
        .filter((page) => page.meta.layout === "article" && page.meta.draft)
        .map((page) => page.sourcePath)
        .sort();
    const missingDescriptions = builtContent
        .filter((page) => !page.meta.description)
        .map((page) => page.sourcePath)
        .sort();
    const staleArticles = articleIndex
        .filter((entry) => {
            const latest = latestArticleDate(entry);
            return latest ? daysBetween(now, latest) > staleAfterDays : false;
        })
        .map((entry) => entry.slug)
        .sort();
    const totalWords = builtContent
        .map((page) => numberValue(page.meta.words))
        .reduce((total, words) => total + words, 0);
    const articleWords = articleIndex.map((entry) => numberValue(entry.words));
    const averageArticle =
        articleWords.length === 0
            ? 0
            : Math.round(
                  articleWords.reduce((total, words) => total + words, 0) /
                      articleWords.length,
              );

    return {
        pageCount: builtContent.length,
        articleCount: articleIndex.length,
        draftArticles,
        missingDescriptions,
        staleArticles,
        seriesGaps: collectSeriesGaps(articleIndex),
        wordCount: {
            total: totalWords,
            averageArticle,
        },
        imageReferences: collectImageReferences(sourceTextByPath),
    };
}

function formatList(values: string[]): string {
    return values.length > 0 ? values.join(", ") : "none";
}

export function formatContentAuditReport(report: ContentAuditReport): string {
    const seriesGaps =
        report.seriesGaps.length > 0
            ? report.seriesGaps
                  .map(
                      (gap) =>
                          `${gap.series} expected ${gap.expected} before ${gap.found}`,
                  )
                  .join("; ")
            : "none";

    return [
        "content audit",
        `  pages ${report.pageCount} total, ${report.articleCount} published articles`,
        `  drafts ${formatList(report.draftArticles)}`,
        `  descriptions ${report.missingDescriptions.length} missing`,
        `  stale articles ${formatList(report.staleArticles)}`,
        `  words ${report.wordCount.total} total, ${report.wordCount.averageArticle} average/article`,
        `  series gaps ${seriesGaps}`,
        `  images ${report.imageReferences.length} references`,
        "",
    ].join("\n");
}
