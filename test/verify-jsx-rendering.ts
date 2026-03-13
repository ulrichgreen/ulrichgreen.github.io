import assert from "node:assert/strict";
import { parseFrontmatter } from "../src/build/content/frontmatter.ts";
import {
    buildContent,
    resolveMetaDescription,
} from "../src/build/content/build-content.ts";
import { renderPage } from "../src/build/render/render-react-page.tsx";
import { listWritingEntries } from "../src/build/content/writing-index.ts";

async function main() {
    const writingDir = new URL("../content/writing", import.meta.url).pathname;
    const writingIndex = listWritingEntries(writingDir);

    const homePath = new URL("../content/index.mdx", import.meta.url).pathname;
    const home = await buildContent(homePath);
    const homeHtml = renderPage(home, writingIndex);

    assert(homeHtml.includes("<title>Ulrich Green</title>"));
    assert(homeHtml.includes('src="/site.js"'));
    assert(
        !homeHtml.includes('src="/islands.js"'),
        "Home page should not include islands.js (no islands present).",
    );
    assert(homeHtml.includes('id="progress" aria-hidden="true"'));
    assert(homeHtml.includes('<ul class="writing-list">'));
    assert(homeHtml.includes("On Constraints"));
    assert(homeHtml.includes('class="page-header__section">home</span>'));

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
        /style="view-transition-name:article-title-[a-z0-9_-]+"/.test(homeHtml),
        "Writing index links should have named view transitions.",
    );

    const articlePath = new URL(
        "../content/writing/on-tools.mdx",
        import.meta.url,
    ).pathname;
    const article = await buildContent(articlePath);
    const articleHtml = renderPage(article, writingIndex);

    assert.equal(
        article.meta.description,
        "Tools are not neutral. They carry assumptions about your work, and those assumptions shape the systems you build.",
    );
    assert(
        articleHtml.includes(
            '<h1 style="view-transition-name:article-title-on-tools"',
        ),
        "Article title should have a named view transition.",
    );
    assert(articleHtml.includes('class="page page--article"'));
    assert(articleHtml.includes('class="article-header__kicker"'));
    assert(articleHtml.includes('class="article-header__rule"'));
    assert(articleHtml.includes('class="article-header__abstract"'));
    assert(articleHtml.includes("March 1, 2025"));
    assert(
        articleHtml.includes('src="/islands.js"'),
        "Article page with islands should include islands.js.",
    );
    assert(articleHtml.includes('data-island="DemoWidget"'));
    assert(articleHtml.includes("Count the cost before you add capability."));

    assert(
        articleHtml.includes(
            'rel="canonical" href="https://ulrich.green/writing/on-tools.html"',
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
    const colophonHtml = renderPage(colophon, writingIndex);

    assert(
        /id="[a-z-]+"/.test(colophonHtml),
        "Headings should have auto-generated IDs from rehype-slug.",
    );
    assert(
        colophonHtml.includes('aria-hidden="true"'),
        "Headings should have autolink anchors from rehype-autolink-headings.",
    );

    const notFoundPath = new URL("../content/404.mdx", import.meta.url)
        .pathname;
    const notFound = await buildContent(notFoundPath);
    const notFoundHtml = renderPage(notFound, writingIndex);

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
            layout: "article",
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

    console.log(
        "React SSR and MDX rendering verified: pages build through the MDX pipeline and explicit islands serialize for hydration.",
    );
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
