import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const distDirectory = fileURLToPath(
    new URL("../../../dist", import.meta.url),
);
export const contentDirectory = fileURLToPath(
    new URL("../../../content", import.meta.url),
);
export const writingDirectory = join(contentDirectory, "writing");
