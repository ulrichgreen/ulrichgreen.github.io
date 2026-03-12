import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const feedPath = fileURLToPath(new URL("../dist/feed.xml", import.meta.url));

function main() {
    if (!existsSync(feedPath)) {
        console.error(
            `verify-feed.ts: feed.xml not found at ${feedPath}. Run "pnpm build" first.`,
        );
        process.exit(1);
    }

    const xml = readFileSync(feedPath, "utf8");

    assert(
        xml.startsWith('<?xml version="1.0" encoding="utf-8"?>'),
        "Feed should start with an XML declaration.",
    );

    assert(
        xml.includes('<feed xmlns="http://www.w3.org/2005/Atom">'),
        "Feed should contain an Atom <feed> element with namespace.",
    );

    assert(
        xml.includes("<title>Ulrich Green</title>"),
        "Feed should include a <title> element.",
    );

    assert(
        /<id>https?:\/\/[^<]+<\/id>/.test(xml),
        "Feed should include an <id> element.",
    );

    assert(
        /<updated>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z<\/updated>/.test(xml),
        "Feed should include an <updated> element with ISO timestamp.",
    );

    const entries = xml.match(/<entry>/g);
    assert(entries && entries.length > 0, "Feed should include at least one <entry>.");

    assert(
        xml.includes("</feed>"),
        "Feed should close the <feed> element.",
    );

    const entryBlock = xml.slice(
        xml.indexOf("<entry>"),
        xml.indexOf("</entry>") + "</entry>".length,
    );

    assert(
        /<title>[^<]+<\/title>/.test(entryBlock),
        "Each entry should include a <title>.",
    );
    assert(
        /<link href="[^"]*"/.test(entryBlock),
        "Each entry should include a <link>.",
    );
    assert(
        /<id>[^<]+<\/id>/.test(entryBlock),
        "Each entry should include an <id>.",
    );
    assert(
        /<published>[^<]+<\/published>/.test(entryBlock),
        "Each entry should include a <published>.",
    );
    assert(
        /<updated>[^<]+<\/updated>/.test(entryBlock),
        "Each entry should include an <updated>.",
    );

    console.log(
        "Atom feed verified: feed.xml is well-formed with required Atom elements.",
    );
    process.exit(0);
}

main();
