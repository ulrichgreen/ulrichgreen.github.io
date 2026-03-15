import { siteConfig } from "../site.config.ts";

export const SITE_URL = siteConfig.site.url;
export const BROWSER_TARGETS = siteConfig.build.browserTargets;
export const ESBUILD_TARGET = [...siteConfig.build.esbuildTarget];
