import { buildFeed } from "./feed.ts";
import { buildHeaders } from "./headers.ts";
import { buildOgImage } from "./og-image.ts";
import { buildRobots } from "./robots.ts";
import { buildSitemap } from "./sitemap.ts";
import { contentDirectory } from "../shared/paths.ts";
import type { BuiltContent, ArticleIndexEntry } from "../../types/content.ts";

export async function buildAncillary(
    articleIndex: ArticleIndexEntry[],
    compiledArticles: BuiltContent[],
): Promise<void> {
    buildSitemap(contentDirectory, articleIndex);
    buildRobots();
    buildHeaders();
    buildOgImage();
    await buildFeed(articleIndex, compiledArticles);
}
