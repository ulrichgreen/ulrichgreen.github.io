import type React from "react";

const LOGO_EXPAND_CHARS = [
    "l",
    "r",
    "i",
    "c",
    "h",
    ".",
    "g",
    "r",
    "e",
    "e",
    "n",
];

export function PageHeader() {
    return (
        <header className="site-header">
            <nav className="site-nav" aria-label="Primary">
                <div className="site-nav__group site-nav__group--left">
                    <a href="/index.html">Home</a>
                    <a href="/#writing">Articles</a>
                </div>
                <a
                    href="/index.html"
                    className="site-logo"
                    aria-label="ulrich.green — home"
                >
                    <span aria-hidden="true" className="site-logo__brace">
                        {"{"}
                    </span>
                    <span className="site-logo__name">
                        <span className="site-logo__core">u</span>
                        {LOGO_EXPAND_CHARS.map((char, i) => (
                            <span
                                key={`${char}-${i}`}
                                className="site-logo__char"
                                aria-hidden="true"
                                style={
                                    {
                                        "--logo-i": i + 1,
                                    } as React.CSSProperties
                                }
                            >
                                {char}
                            </span>
                        ))}
                    </span>
                    <span aria-hidden="true" className="site-logo__brace">
                        {"}"}
                    </span>
                </a>
                <div className="site-nav__group site-nav__group--right">
                    <a href="/cv.html">CV</a>
                    <a href="/colophon.html">Colophon</a>
                </div>
            </nav>
        </header>
    );
}
