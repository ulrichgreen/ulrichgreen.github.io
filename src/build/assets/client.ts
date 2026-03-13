import { build } from "esbuild";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ESBUILD_TARGET } from "../../config.ts";
import { distDirectory } from "../shared/paths.ts";

const targets = [
    {
        entryPoint: new URL("../../client/site.ts", import.meta.url).pathname,
        outfile: join(distDirectory, "site.js"),
    },
    {
        entryPoint: new URL("../../client/islands.ts", import.meta.url)
            .pathname,
        outfile: join(distDirectory, "islands.js"),
    },
];

export async function buildClient(): Promise<void> {
    await Promise.all(
        targets.map(({ entryPoint, outfile }) =>
            build({
                entryPoints: [entryPoint],
                outfile,
                bundle: true,
                format: "iife",
                platform: "browser",
                target: ESBUILD_TARGET,
                logLevel: "silent",
            }),
        ),
    );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    buildClient().catch((error) => {
        process.stderr.write(`${String(error)}\n`);
        process.exit(1);
    });
}
