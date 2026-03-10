import { build } from "esbuild";

const targets = [
    {
        entryPoint: new URL("../client/site.ts", import.meta.url).pathname,
        outfile: new URL("../../dist/site.js", import.meta.url).pathname,
    },
    {
        entryPoint: new URL("../client/islands.ts", import.meta.url).pathname,
        outfile: new URL("../../dist/islands.js", import.meta.url).pathname,
    },
];

async function main() {
    await Promise.all(
        targets.map(({ entryPoint, outfile }) =>
            build({
                entryPoints: [entryPoint],
                outfile,
                bundle: true,
                format: "iife",
                platform: "browser",
                target: ["chrome120", "firefox121", "safari17"],
                logLevel: "silent",
            }),
        ),
    );

    process.stdout.write("client.ts: wrote dist/site.js and dist/islands.js\n");
}

main().catch((error) => {
    process.stderr.write(`${String(error)}\n`);
    process.exit(1);
});
