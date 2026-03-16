import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { AssetManifest } from "../assets/asset-manifest.ts";
import { resolveOutputPath } from "../content/discover.ts";
import { renderPage } from "./render-react-page.tsx";
import type { BuiltContent, ArticleIndexEntry } from "../../types/content.ts";
import { isArticleMeta } from "../../types/content.ts";
import {
    buildSeriesMap,
    resolveSeriesInfo,
} from "../content/series-index.ts";

export function writePages(
    compiled: BuiltContent[],
    articleIndex: ArticleIndexEntry[],
    assetManifest: AssetManifest,
): void {
    const seriesMap = buildSeriesMap(articleIndex);

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
        writeFileSync(
            outputPath,
            renderPage(page, articleIndex, assetManifest, seriesInfo),
        );
    }
}
