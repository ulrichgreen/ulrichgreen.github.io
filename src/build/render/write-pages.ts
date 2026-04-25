import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { AssetManifest } from "../assets/asset-manifest.ts";
import { resolveOutputPath } from "../content/discover.ts";
import {
    renderPageWithMetadata,
    type IslandUsage,
} from "./render-react-page.tsx";
import type { BuiltContent, ArticleIndexEntry } from "../../types/content.ts";
import { isArticleMeta } from "../../types/content.ts";
import {
    buildSeriesMap,
    resolveSeriesInfo,
} from "../content/series-index.ts";

export interface WrittenPageSummary {
    pageCount: number;
    islandPages: number;
    islands: IslandUsage;
}

function addIslandUsage(target: IslandUsage, source: IslandUsage): void {
    for (const [name, count] of Object.entries(source)) {
        target[name as keyof IslandUsage] =
            (target[name as keyof IslandUsage] ?? 0) + count;
    }
}

export function writePages(
    compiled: BuiltContent[],
    articleIndex: ArticleIndexEntry[],
    assetManifest: AssetManifest,
): WrittenPageSummary {
    const seriesMap = buildSeriesMap(articleIndex);
    const islands: IslandUsage = {};
    let islandPages = 0;

    for (const page of compiled) {
        const outputPath = resolveOutputPath(page.sourcePath);
        const seriesInfo = isArticleMeta(page.meta)
            ? resolveSeriesInfo(
                  page.meta.series,
                  page.meta.seriesOrder,
                  seriesMap,
              )
            : undefined;

        mkdirSync(dirname(outputPath), { recursive: true });
        const rendered = renderPageWithMetadata(
            page,
            articleIndex,
            assetManifest,
            seriesInfo,
        );
        if (Object.keys(rendered.islands).length > 0) {
            islandPages += 1;
            addIslandUsage(islands, rendered.islands);
        }
        writeFileSync(outputPath, rendered.html);
    }

    return { pageCount: compiled.length, islandPages, islands };
}
