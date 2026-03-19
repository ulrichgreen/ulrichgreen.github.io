import assert from "node:assert/strict";
import { parseFrontmatter } from "../src/build/content/frontmatter.ts";
import {
    buildContent,
    resolveMetaDescription,
} from "../src/build/content/build-content.ts";
import { renderPage } from "../src/build/render/render-react-page.tsx";
import { listArticleEntries } from "../src/build/content/article-index.ts";
import {
    buildSeriesMap,
    resolveSeriesInfo,
} from "../src/build/content/series-index.ts";

async function main() {
    const articlesDir = new URL("../content/articles", import.meta.url)
        .pathname;
    const articleIndex = listArticleEntries(articlesDir);

    const homePath = new URL("../content/index.mdx", import.meta.url).pathname;
    const home = await buildContent(homePath);
    const homeHtml = renderPage(home, articleIndex);

    assert(homeHtml.includes("<title>Ulrich Green</title>"));
    assert(homeHtml.includes('src="/site.js"'));
    assert(
        !homeHtml.includes('src="/islands.js"'),
        "Home page should not include islands.js (no islands present).",
    );
    assert(homeHtml.includes('id="progress" aria-hidden="true"'));
    assert(homeHtml.includes('class="site-header full-bleed"'));
    assert(
        homeHtml.includes('aria-label="Primary"'),
        "Site nav should be present with aria-label.",
    );
    assert(
        /<section[^>]*aria-labelledby="hero-name"[^>]*class="section header [^"]+"/.test(
            homeHtml,
        ),
        "Home page should render the hero section with local CSS-module classes.",
    );
    assert(homeHtml.includes('id="hero-name"'));
    assert(
        /class="section [^"]+"/.test(homeHtml),
        "Article list root should have section class.",
    );
    assert(
        homeHtml.includes("href=") && homeHtml.includes("On Constraints"),
        "Article list should render article links.",
    );
    assert(
        /class="[^"]*\blabel\b[^"]*"/.test(homeHtml),
        "Article list should use label class for year headings.",
    );
    assert(homeHtml.includes("On Constraints"));
    assert(
        homeHtml.includes(
            "Constraints do not merely limit design and software work.",
        ),
        "Home page should show article summaries.",
    );
    assert(
        homeHtml.includes('aria-label="ulrich.green \u2014 home"'),
        "Site logo should be present.",
    );

    assert(
        homeHtml.includes(
            'rel="canonical" href="https://ulrich.green/index.html"',
        ),
        "Home page should include a canonical URL.",
    );
    assert(
        homeHtml.includes('property="og:title" content="Ulrich Green"'),
        "Home page should include og:title.",
    );
    assert(
        homeHtml.includes('property="og:type" content="website"'),
        "Home page should have og:type website.",
    );
    assert(
        homeHtml.includes(
            'property="og:image" content="https://ulrich.green/og-image.svg"',
        ),
        "Home page should include og:image.",
    );
    assert(
        homeHtml.includes('name="twitter:card" content="summary"'),
        "Home page should include twitter:card.",
    );
    assert(
        homeHtml.includes('rel="icon" href="data:image/svg+xml,'),
        "Home page should include an inline SVG favicon.",
    );
    assert(
        homeHtml.includes('type="speculationrules"'),
        "Home page should include speculation rules.",
    );
    assert(
        homeHtml.includes('name="view-transition" content="same-origin"'),
        "Home page should include the view-transition meta tag.",
    );
    assert(
        homeHtml.includes(
            'name="theme-color" media="(prefers-color-scheme: light)" content="#fffbf4"',
        ),
        "Home page should include the light theme-color meta tag.",
    );
    assert(
        homeHtml.includes(
            'name="theme-color" media="(prefers-color-scheme: dark)" content="#171611"',
        ),
        "Home page should include the dark theme-color meta tag.",
    );
    assert(
        /style="view-transition-name:article-title-[a-z0-9_-]+;?"/.test(
            homeHtml,
        ),
        "Writing index links should have named view transitions.",
    );

    const articlePath = new URL(
        "../content/articles/on-tools.mdx",
        import.meta.url,
    ).pathname;
    const article = await buildContent(articlePath);
    const articleHtml = renderPage(article, articleIndex);

    assert.equal(
        article.meta.description,
        "Tools are not neutral. They carry assumptions about your work, and those assumptions shape the systems you build.",
    );
    assert(
        articleHtml.includes('class="title heading-xl"') &&
            /style="view-transition-name:article-title-on-tools/.test(
                articleHtml,
            ),
        "Article title should have a named view transition.",
    );
    assert(articleHtml.includes('class="page page--article"'));
    assert(
        /class="section header [^"]+"/.test(articleHtml),
        "Article should render the header section.",
    );
    assert(articleHtml.includes('class="header__eyebrow label"'));
    assert(articleHtml.includes('class="header__rule"'));
    assert(articleHtml.includes('class="lede"'));
    assert(articleHtml.includes('class="section article-body"'));
    assert(articleHtml.includes("March 1, 2025"));
    assert(
        articleHtml.includes('src="/islands.js"'),
        "Article page with islands should include islands.js.",
    );
    assert(articleHtml.includes('data-island="DemoWidget"'));
    assert(articleHtml.includes('data-island="TableOfContents"'));
    assert(articleHtml.includes("Count the cost before you add capability."));
    assert(
        articleHtml.includes('aria-label="Tip callout"'),
        "Callout tip should render with accessible label.",
    );
    assert(
        articleHtml.includes(
            "Reach for tooling that leaves the underlying document",
        ),
    );
    assert(
        article.headings.some(
            (heading) => heading.text === "What the Tool Already Believes",
        ),
        "Article should expose extracted headings for the table of contents.",
    );
    assert(
        articleHtml.includes('class="table-of-contents card semi-bleed"'),
        "Article should render the table of contents island shell.",
    );
    assert(
        articleHtml.includes('href="#what-the-tool-already-believes"'),
        "Table of contents should link to extracted heading IDs.",
    );

    assert(
        articleHtml.includes(
            'rel="canonical" href="https://ulrich.green/articles/on-tools.html"',
        ),
        "Article page should include a canonical URL.",
    );
    assert(
        articleHtml.includes('property="og:type" content="article"'),
        "Article page should have og:type article.",
    );

    assert(
        articleHtml.includes('data-hydrate="load"'),
        "Islands should include the data-hydrate attribute.",
    );

    assert(
        article.meta.readingTime &&
            /\d+ min read/.test(article.meta.readingTime),
        "Article should have a computed reading time.",
    );
    assert(
        typeof article.meta.words === "number" && article.meta.words > 0,
        "Article should have a computed word count.",
    );
    assert(
        articleHtml.includes("min read") && articleHtml.includes("words"),
        "Article should render the reading time and word count.",
    );

    assert(
        articleHtml.includes('type="application/ld+json"'),
        "Article page should include JSON-LD structured data.",
    );
    assert(
        articleHtml.includes('"@type":"Article"'),
        "JSON-LD should have Article type.",
    );
    assert(
        articleHtml.includes('"headline":"On Tools"'),
        "JSON-LD should include the article headline.",
    );

    assert(
        articleHtml.includes('type="application/atom+xml"'),
        "Pages should include RSS feed autodiscovery link.",
    );

    assert(
        !homeHtml.includes('type="application/ld+json"'),
        "Non-article pages should not include JSON-LD.",
    );
    assert(
        homeHtml.includes('type="application/atom+xml"'),
        "Home page should include RSS feed autodiscovery link.",
    );

    const colophonPath = new URL("../content/colophon.mdx", import.meta.url)
        .pathname;
    const colophon = await buildContent(colophonPath);
    const colophonHtml = renderPage(colophon, articleIndex);

    assert(
        /id="[a-z-]+"/.test(colophonHtml),
        "Headings should have auto-generated IDs from rehype-slug.",
    );
    assert(
        colophonHtml.includes('aria-hidden="true"'),
        "Headings should have autolink anchors from rehype-autolink-headings.",
    );
    assert(
        /<figure[^>]*class="[^"]*semi-bleed/.test(colophonHtml),
        "Colophon should render the figure component.",
    );
    assert(
        colophonHtml.includes(
            'type="image/avif" srcset="/images/IMG_1514.avif"',
        ),
        "Figure should derive AVIF image variants from raster sources.",
    );
    assert(
        colophonHtml.includes("<figcaption"),
        "Figure should render a caption.",
    );

    const notFoundPath = new URL("../content/404.mdx", import.meta.url)
        .pathname;
    const notFound = await buildContent(notFoundPath);
    const notFoundHtml = renderPage(notFound, articleIndex);

    assert(
        notFoundHtml.includes("<title>Page Not Found</title>"),
        "404 page should render with correct title.",
    );
    assert(
        notFoundHtml.includes('href="/index.html"'),
        "404 page should link back to home.",
    );

    const fallbackDescription = resolveMetaDescription({
        meta: {
            title: "Essay",
            layout: "base",
        },
        body: "<DemoWidget />\n\n# Essay\n\nA paragraph that should become the fallback description.",
    });

    assert.equal(
        fallbackDescription,
        "A paragraph that should become the fallback description.",
    );

    const baseFrontmatter = parseFrontmatter(
        "---\ntitle: Test Page\n---\nBody",
    );
    assert.equal(baseFrontmatter.meta.layout, "base");

    assert.throws(
        () =>
            parseFrontmatter(
                "---\ntitle: Missing date\nlayout: article\n---\nBody",
                "/tmp/missing-published.mdx",
            ),
        /published is required when layout is article/,
    );

    // --- Series rendering tests ---
    const seriesMap = buildSeriesMap(articleIndex);

    assert(
        seriesMap.size > 0,
        "Writing index should contain at least one series.",
    );
    assert(
        seriesMap.has("The Web Trilogy"),
        'Series map should contain "The Web Trilogy".',
    );

    const webTrilogy = seriesMap.get("The Web Trilogy");
    assert.ok(webTrilogy);
    assert.equal(
        webTrilogy.length,
        3,
        "The Web Trilogy should have 3 entries.",
    );
    assert.equal(
        webTrilogy[0].title,
        "On Markup",
        "First entry in series should be On Markup (order 1).",
    );

    const markupPath = new URL(
        "../content/articles/on-markup.mdx",
        import.meta.url,
    ).pathname;
    const markup = await buildContent(markupPath);
    const markupMeta =
        markup.meta.layout === "article" ? markup.meta : undefined;
    const markupSeriesInfo = resolveSeriesInfo(
        markupMeta?.series,
        markupMeta?.seriesOrder,
        seriesMap,
    );
    const markupHtml = renderPage(
        markup,
        articleIndex,
        undefined,
        markupSeriesInfo,
    );

    assert(
        /class="section semi-bleed card [^"]+"/.test(markupHtml),
        "Series article should render the series-nav component.",
    );
    assert(
        markupHtml.includes("The Web Trilogy"),
        "Series nav should display the series title.",
    );
    assert(
        markupHtml.includes('aria-label="The Web Trilogy series navigation"'),
        "Series nav should have an accessible label.",
    );
    assert(
        markupHtml.includes("Part 1 of 3"),
        "Series nav should show progress (Part 1 of 3).",
    );
    assert(
        markupHtml.includes('role="progressbar"'),
        "Series nav should include a progress bar.",
    );
    assert(
        markupHtml.includes('aria-current="page"'),
        "Current series entry should have aria-current=page.",
    );
    assert(
        markupHtml.includes("On CSS Architecture") &&
            /href="[^"]+on-css-architecture/.test(markupHtml),
        "First series article should have a next link.",
    );
    assert(
        !/<a[^>]*href="[^"]*on-markup[^"]*"[^>]*>[\s\S]*?←/.test(markupHtml),
        "First series article should not have a prev link.",
    );
    assert(
        markupHtml.includes("CreativeWorkSeries"),
        "Series article JSON-LD should include CreativeWorkSeries.",
    );

    assert(
        !articleHtml.includes(
            'aria-label="The Web Trilogy series navigation"',
        ) && !articleHtml.includes('role="progressbar"'),
        "Non-series article should not render series-nav.",
    );

    assert(
        homeHtml.includes("Series · The Web Trilogy"),
        "Home page should render series labels in the article list.",
    );

    // --- Revision history tests ---
    const constraintsPath = new URL(
        "../content/articles/on-constraints.mdx",
        import.meta.url,
    ).pathname;
    const constraints = await buildContent(constraintsPath);
    const constraintsMeta =
        constraints.meta.layout === "article" ? constraints.meta : undefined;
    const constraintsSeriesInfo = resolveSeriesInfo(
        constraintsMeta?.series,
        constraintsMeta?.seriesOrder,
        seriesMap,
    );
    const constraintsHtml = renderPage(
        constraints,
        articleIndex,
        undefined,
        constraintsSeriesInfo,
    );

    assert(
        constraintsHtml.includes('class="section ') &&
            constraintsHtml.includes('aria-label="Revision history"'),
        "Article with revisions should render revision history.",
    );
    assert(
        constraintsHtml.includes('aria-label="Revision history"'),
        "Revision history should have an accessible label.",
    );
    assert(
        constraintsHtml.includes("Rewrote the third section"),
        "Revision history should include revision notes.",
    );
    assert(
        !articleHtml.includes('aria-label="Revision history"'),
        "Article without revisions should not render revision history.",
    );

    console.log(
        "React SSR and MDX rendering verified: pages build through the MDX pipeline and explicit islands serialize for hydration.",
    );
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
