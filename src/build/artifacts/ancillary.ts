import { buildFeed } from "./feed.ts";
import { buildHeaders } from "./headers.ts";
import { buildOgImage } from "./og-image.ts";
import { buildRobots } from "./robots.ts";
import { buildSitemap } from "./sitemap.ts";
import { contentDirectory } from "../shared/paths.ts";
import type { BuiltContent, ArticleIndexEntry } from "../../types/content.ts";

export interface AncillaryBuildSummary {
    feedEntries: number;
}

export async function buildAncillary(
    articleIndex: ArticleIndexEntry[],
    compiledArticles: BuiltContent[],
): Promise<AncillaryBuildSummary> {
    buildSitemap(contentDirectory, articleIndex);
    buildRobots();
    buildHeaders();
    buildOgImage();
    const feedEntries = await buildFeed(articleIndex, compiledArticles);
    return { feedEntries };
}
