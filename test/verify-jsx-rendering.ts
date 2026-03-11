import assert from "node:assert/strict";
import { parseFrontmatter } from "../src/build/frontmatter.ts";
import {
    buildContent,
    resolveMetaDescription,
} from "../src/build/build-content.ts";
import { renderPage } from "../src/build/render-react-page.tsx";
import { listWritingEntries } from "../src/build/writing-index.ts";

async function main() {
    const writingDir = new URL("../content/writing", import.meta.url).pathname;
    const writingIndex = listWritingEntries(writingDir);

    const homePath = new URL("../content/index.mdx", import.meta.url).pathname;
    const home = await buildContent(homePath);
    const homeHtml = renderPage(home, writingIndex);

    assert(homeHtml.includes("<title>Ulrich Green</title>"));
    assert(homeHtml.includes('src="/site.js"'));
    assert(homeHtml.includes('src="/islands.js"'));
    assert(homeHtml.includes('<ul class="writing-list">'));
    assert(homeHtml.includes("On Constraints"));
    assert(homeHtml.includes('class="page-header__section">home</span>'));

    assert(
        homeHtml.includes('rel="canonical" href="https://ulrich.green/index.html"'),
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
            'name="theme-color" media="(prefers-color-scheme: light)" content="#f8f7f5"',
        ),
        "Home page should include the light theme-color meta tag.",
    );
    assert(
        homeHtml.includes(
            'name="theme-color" media="(prefers-color-scheme: dark)" content="#1a1917"',
        ),
        "Home page should include the dark theme-color meta tag.",
    );
    assert(
        /style="view-transition-name:article-title-[a-z0-9_-]+"/.test(
            homeHtml,
        ),
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
    assert(articleHtml.includes("March 1, 2025"));
    assert(articleHtml.includes('data-island="DemoWidget"'));
    assert(articleHtml.includes("Count the cost before you add capability."));

    assert(
        articleHtml.includes('rel="canonical" href="https://ulrich.green/writing/on-tools.html"'),
        "Article page should include a canonical URL.",
    );
    assert(
        articleHtml.includes('property="og:type" content="article"'),
        "Article page should have og:type article.",
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
