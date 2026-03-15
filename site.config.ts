const kibibyte = 1024;

const browserTargets = {
    chrome: 120,
    firefox: 121,
    safari: 17,
} as const;

export const siteConfig = {
    site: {
        url: "https://ulrich.green",
    },
    build: {
        browserTargets,
        esbuildTarget: [
            `chrome${browserTargets.chrome}`,
            `firefox${browserTargets.firefox}`,
            `safari${browserTargets.safari}`,
        ],
    },
    performance: {
        budgets: [
            {
                label: "HTML",
                extensions: [".html"],
                warnAtBytes: 112 * kibibyte,
                maximumBytes: 128 * kibibyte,
            },
            {
                label: "CSS",
                extensions: [".css"],
                warnAtBytes: 28 * kibibyte,
                maximumBytes: 32 * kibibyte,
            },
            {
                label: "JS",
                extensions: [".js"],
                warnAtBytes: 36 * kibibyte,
                maximumBytes: 40 * kibibyte,
            },
            {
                label: "Fonts",
                extensions: [".woff2", ".woff", ".ttf", ".otf"],
                warnAtBytes: 288 * kibibyte,
                maximumBytes: 320 * kibibyte,
            },
        ],
    },
} as const;
