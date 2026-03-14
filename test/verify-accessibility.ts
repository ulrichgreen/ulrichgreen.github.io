import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildContent } from "../src/build/content/build-content.ts";
import { renderPage } from "../src/build/render/render-react-page.tsx";
import { listWritingEntries } from "../src/build/content/writing-index.ts";

function extractBlock(source: string, pattern: RegExp, label: string) {
    const match = source.match(pattern);
    assert(match?.[1], `Could not find ${label} block.`);
    return match[1];
}

function extractColor(block: string, name: string) {
    const match = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6});`));
    assert(match?.[1], `Could not find color token --${name}.`);
    return match[1];
}

function relativeLuminance(hex: string) {
    const channels = hex
        .slice(1)
        .match(/.{2}/g)
        ?.map((channel) => Number.parseInt(channel, 16) / 255);

    assert(channels?.length === 3, `Invalid color value: ${hex}`);

    const [red, green, blue] = channels.map((channel) => {
        return channel <= 0.03928
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
    const [lighter, darker] = [
        relativeLuminance(foreground),
        relativeLuminance(background),
    ].sort((left, right) => right - left);

    return (lighter + 0.05) / (darker + 0.05);
}

async function main() {
    const tokensPath = new URL("../src/styles/tokens.css", import.meta.url)
        .pathname;
    const tokens = readFileSync(tokensPath, "utf8");
    const rootBlock = extractBlock(
        tokens,
        /:root\s*\{([\s\S]*?)\n\s*\}/,
        "root",
    );
    const darkBlock = extractBlock(
        tokens,
        /@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{([\s\S]*?)\n\s*\}\s*\}/,
        "dark mode root",
    );

    const rootBg = extractColor(rootBlock, "color-surface-base");
    const rootText = extractColor(rootBlock, "color-text-primary");
    const rootMuted = extractColor(rootBlock, "color-text-secondary");
    const rootAccent = extractColor(rootBlock, "color-accent");
    const darkBg = extractColor(darkBlock, "color-surface-base");
    const darkText = extractColor(darkBlock, "color-text-primary");
    const darkMuted = extractColor(darkBlock, "color-text-secondary");
    const darkAccent = extractColor(darkBlock, "color-accent");

    assert(
        contrastRatio(rootText, rootBg) >= 4.5,
        "Primary light-mode text should meet WCAG AA contrast.",
    );
    assert(
        contrastRatio(rootMuted, rootBg) >= 4.5,
        "Muted light-mode text should meet WCAG AA contrast.",
    );
    assert(
        contrastRatio(rootAccent, rootBg) >= 4.5,
        "Accent light-mode text should meet WCAG AA contrast.",
    );
    assert(
        contrastRatio(darkText, darkBg) >= 4.5,
        "Primary dark-mode text should meet WCAG AA contrast.",
    );
    assert(
        contrastRatio(darkMuted, darkBg) >= 4.5,
        "Muted dark-mode text should meet WCAG AA contrast.",
    );
    assert(
        contrastRatio(darkAccent, darkBg) >= 4.5,
        "Accent dark-mode text should meet WCAG AA contrast.",
    );

    const componentsPath = new URL(
        "../src/styles/components.css",
        import.meta.url,
    ).pathname;
    const componentsCss = readFileSync(componentsPath, "utf8");
    const siteHeaderPath = new URL(
        "../src/styles/site-header.css",
        import.meta.url,
    ).pathname;
    const siteHeaderCss = readFileSync(siteHeaderPath, "utf8");
    const layoutPath = new URL("../src/styles/layout.css", import.meta.url)
        .pathname;
    const layoutCss = readFileSync(layoutPath, "utf8");
    const mobileBlock = extractBlock(
        siteHeaderCss,
        /@media \(max-width: 820px\)\s*\{([\s\S]*)\}\s*\}\s*$/,
        "mobile site-header",
    );

    const mobileNavMatch = mobileBlock.match(
        /\.site-nav\s*\{([\s\S]*?)\n\s*\}/,
    );
    assert(mobileNavMatch?.[1], "Could not find small-screen nav styles.");
    assert(
        !/display:\s*none;/.test(mobileNavMatch[1]),
        "Primary navigation should stay visible on small screens.",
    );

    const articleTitleMatch = componentsCss.match(
        /\.article-header h1\s*\{([\s\S]*?)\n\s*\}/,
    );
    assert(articleTitleMatch?.[1], "Could not find article title styles.");
    assert(
        /max-width:\s*20ch;/.test(articleTitleMatch[1]),
        "Article titles should allow a wider measure.",
    );

    const pageTitleMatch = componentsCss.match(
        /\.page > h1:first-child\s*\{([\s\S]*?)\n\s*\}/,
    );
    assert(pageTitleMatch?.[1], "Could not find page title styles.");
    assert(
        /max-width:\s*18ch;/.test(pageTitleMatch[1]),
        "Page titles should allow a wider measure.",
    );

    const articleBodyMatch = componentsCss.match(
        /\.page--article \.article-body\s*\{([\s\S]*?)\n\s*\}/,
    );
    assert(articleBodyMatch?.[1], "Could not find article body styles.");
    assert(
        /grid-template-columns:\s*minmax\(0,\s*1fr\);/.test(
            articleBodyMatch[1],
        ),
        "The article body grid should constrain children to the available column width.",
    );

    const pageLayoutMatch = layoutCss.match(/\.page\s*\{([\s\S]*?)\n\s*\}/);
    assert(pageLayoutMatch?.[1], "Could not find page layout styles.");
    assert(
        /grid-template-columns:\s*minmax\(0,\s*var\(--layout-content-width\)\);/.test(
            pageLayoutMatch[1],
        ),
        "The default page layout should start from a single mobile column.",
    );
    assert(
        /padding-inline:\s*var\(--layout-gutter\);/.test(pageLayoutMatch[1]),
        "The default page layout should use gutter padding on narrow screens.",
    );

    const desktopLayoutBlock = extractBlock(
        layoutCss,
        /@media \(min-width: 821px\)\s*\{([\s\S]*)\}\s*$/,
        "desktop layout",
    );
    assert(
        /grid-template-columns:\s*minmax\(var\(--layout-gutter\),\s*1fr\)\s*minmax\(0,\s*var\(--layout-content-width\)\)\s*minmax\(var\(--layout-gutter\),\s*1fr\);/.test(
            desktopLayoutBlock,
        ),
        "Wider screens should restore the three-column page grid.",
    );

    const codePath = new URL("../src/styles/code.css", import.meta.url)
        .pathname;
    const codeCss = readFileSync(codePath, "utf8");
    const codeFigureMatch = codeCss.match(
        /\[data-rehype-pretty-code-figure\]\s*\{([\s\S]*?)\n\s*\}/,
    );
    assert(
        codeFigureMatch?.[1],
        "Could not find highlighted code figure styles.",
    );
    assert(
        /--code-bleed:\s*var\(--layout-gutter\);/.test(codeFigureMatch[1]),
        "Highlighted code blocks should reach the viewport edge on narrow screens.",
    );
    assert(
        /margin-inline:\s*calc\(var\(--code-bleed\)\s*\*\s*-1\);/.test(
            codeFigureMatch[1],
        ),
        "Highlighted code blocks should extend past the text column.",
    );
    assert(
        /inline-size:\s*calc\(100%\s*\+\s*\(var\(--code-bleed\)\s*\*\s*2\)\);/.test(
            codeFigureMatch[1],
        ),
        "Highlighted code blocks should size themselves to the available bleed width.",
    );

    const codePreMatch = codeCss.match(
        /\[data-rehype-pretty-code-figure\] pre\s*\{([\s\S]*?)\n\s*\}/,
    );
    assert(codePreMatch?.[1], "Could not find highlighted code block styles.");
    assert(
        /padding-inline:\s*var\(--code-bleed\);/.test(codePreMatch[1]),
        "Highlighted code content should stay aligned with the text column.",
    );
    assert(
        /inline-size:\s*100%;/.test(codePreMatch[1]),
        "Highlighted code blocks should keep their scroll area inside the figure width.",
    );

    const desktopCodeBlock = extractBlock(
        codeCss,
        /@media \(min-width: 821px\)\s*\{([\s\S]*)\}\s*$/,
        "desktop code",
    );
    assert(
        /--code-bleed:\s*min\(var\(--space-4\),\s*var\(--layout-gutter\)\);/.test(
            desktopCodeBlock,
        ),
        "Wider screens should restore the measured code bleed.",
    );

    const basePath = new URL("../src/styles/base.css", import.meta.url)
        .pathname;
    const baseCss = readFileSync(basePath, "utf8");

    assert(
        baseCss.includes(".skip-link"),
        "A visible-on-focus skip link style should exist.",
    );

    const writingDir = new URL("../content/writing", import.meta.url).pathname;
    const writingIndex = listWritingEntries(writingDir);
    const homePath = new URL("../content/index.mdx", import.meta.url).pathname;
    const home = await buildContent(homePath);
    const homeHtml = renderPage(home, writingIndex);
    const skipLinkTag = homeHtml
        .match(/<a\b[^>]*>/g)
        ?.find((tag) => tag.includes('class="skip-link"'));
    const mainTag = homeHtml
        .match(/<main\b[^>]*>/g)
        ?.find((tag) => tag.includes('id="main-content"'));

    assert(
        skipLinkTag,
        "The page should render a skip link to the main landmark.",
    );
    assert(
        skipLinkTag.includes('href="#main-content"'),
        "The skip link should point at the main landmark ID.",
    );
    assert(mainTag, "The main landmark should expose the skip-link target.");

    console.log(
        "Accessibility verified: text colors meet WCAG AA contrast, skip link exists, and small-screen navigation stays available.",
    );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
