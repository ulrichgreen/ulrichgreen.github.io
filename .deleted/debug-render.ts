import { buildContent } from "../src/build/content/build-content.ts";
import { renderPage } from "../src/build/render/render-react-page.tsx";
import { listArticleEntries } from "../src/build/content/article-index.ts";
import { buildSeriesMap, resolveSeriesInfo } from "../src/build/content/series-index.ts";
import { fileURLToPath } from "node:url";

(async () => {
const dir = fileURLToPath(new URL("../content/articles", import.meta.url));
const idx = listArticleEntries(dir);
const seriesMap = buildSeriesMap(idx);

const markupPath = fileURLToPath(new URL("../content/articles/on-markup.mdx", import.meta.url));
const markup = await buildContent(markupPath);
const markupMeta = markup.meta.layout === "article" ? markup.meta : undefined;
const markupSeriesInfo = resolveSeriesInfo(markupMeta?.series, markupMeta?.seriesOrder, seriesMap);
const markupHtml = renderPage(markup, idx, undefined, markupSeriesInfo);

const leftArrowIdx = markupHtml.indexOf("← ");
console.log("has ← :", markupHtml.includes("← "));
if (leftArrowIdx !== -1) {
    console.log("← context:", markupHtml.substring(leftArrowIdx - 50, leftArrowIdx + 80));
}
console.log("current seriesOrder:", markupMeta?.seriesOrder);
console.log("series name:", markupMeta?.series);
console.log("seriesInfo:", markupSeriesInfo);
})();

