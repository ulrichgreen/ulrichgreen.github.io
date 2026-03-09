import { Fragment, h } from '../scripts/jsx-runtime.mjs';

export default function BaseLayout({
  title,
  description,
  section = '',
  children,
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description || ''} />
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <header class="running-header">
          <span>ULRICH</span> / <span>{section}</span> / <span>{title}</span>
        </header>
        <main class="page">{children}</main>
        <script src="/site.js" defer></script>
      </body>
    </html>
  );
}
