function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default function base(data, content) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(data.title)}</title>
  <meta name="description" content="${esc(data.description)}">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header class="running-header">
    <span>ULRICH</span> / <span>${esc(data.section)}</span> / <span>${esc(data.title)}</span>
  </header>
  <main class="page">
    ${content}
  </main>
  <script src="/site.js" defer></script>
</body>
</html>`;
}
