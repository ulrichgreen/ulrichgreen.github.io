import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { AssetManifest } from "../assets/asset-manifest.ts";
import { resolveOutputPath } from "../content/discover.ts";
import { renderPage } from "./render-react-page.tsx";
import type { BuiltContent, WritingIndexEntry } from "../../types/content.ts";
import {
    buildSeriesMap,
    resolveSeriesInfo,
} from "../content/series-index.ts";

export function writePages(
    compiled: BuiltContent[],
    writingIndex: WritingIndexEntry[],
    assetManifest: AssetManifest,
): void {
    const seriesMap = buildSeriesMap(writingIndex);

    for (const page of compiled) {
        const outputPath = resolveOutputPath(page.sourcePath);
        const seriesInfo = resolveSeriesInfo(
            page.meta.series,
            page.meta.seriesOrder,
            seriesMap,
        );

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(
            outputPath,
            renderPage(page, writingIndex, assetManifest, seriesInfo),
        );
    }
}
