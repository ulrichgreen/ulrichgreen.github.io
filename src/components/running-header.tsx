export function RunningHeader({
    section = "",
    title = "",
}: {
    section?: string;
    title?: string;
}) {
    return (
        <header className="running-header">
            <div className="running-header__title">
                <span>ULRICH</span> /{" "}
                <span className="running-header__section">
                    {section || "home"}
                </span>{" "}
                / <span>{title}</span>
            </div>
            <nav className="running-header__nav" aria-label="Primary">
                <a href="/index.html">Home</a>
                <a href="/cv.html">CV</a>
                <a href="/colophon.html">Colophon</a>
            </nav>
        </header>
    );
}
