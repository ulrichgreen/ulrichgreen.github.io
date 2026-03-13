import { buildFeed } from "./feed.ts";
import { buildHeaders } from "./headers.ts";
import { buildOgImage } from "./og-image.ts";
import { buildRobots } from "./robots.ts";
import { buildSitemap } from "./sitemap.ts";
import { contentDirectory } from "../shared/paths.ts";
import type { BuiltContent, WritingIndexEntry } from "../../types/content.ts";

export async function buildAncillary(
    writingIndex: WritingIndexEntry[],
    compiledWriting: BuiltContent[],
): Promise<void> {
    buildSitemap(contentDirectory, writingIndex);
    buildRobots();
    buildHeaders();
    buildOgImage();
    await buildFeed(writingIndex, compiledWriting);
}
