# Site Planning

This site should feel authored, not assembled. The craft should be visible in the reading, the
HTML, the performance, the metadata, the printout, and the restraint. The site should not look
"premium" because it uses fashionable tools. It should look exact because every visible decision
was chosen and every invisible layer was also chosen.

The goal is not to add features until the site looks substantial. The goal is to make the site so
considered that even the omissions read as confidence. Every new idea here has to earn its bytes,
its maintenance cost, and its place in the reader's memory.

---

## Governing Principles

- **Build-time over runtime** — precompute everything that can be precomputed.
- **HTML first** — the page should already be excellent before CSS and JS arrive.
- **Performance is aesthetic** — speed is not a technical metric bolted onto design; speed is part
  of the design.
- **Typography over graphics** — the site should win through measure, rhythm, type, spacing, and
  hierarchy before it reaches for images.
- **Honest metadata** — descriptions, dates, word counts, summaries, and structured data should say
  what is true, not what performs well in a dashboard.
- **One layer deep** — if a feature needs a framework, vendor platform, or tracking stack to exist,
  it is probably the wrong feature.
- **Print matters** — anything important enough to exist on the site should survive paper.
- **The source is the asset** — markdown, templates, CSS, and scripts are the real product; the
  built site is the rendered form.

---

## What to Avoid

| Avoid | Why |
|---|---|
| **Framework theater** | The site should showcase judgment, not dependency collection. |
| **Growth-hack SEO** | Search should come from good structure, good writing, and useful pages. |
| **Third-party widgets** | They slow the site, add visual noise, and rent the experience back from vendors. |
| **Analytics creep** | Tracking readers would cheapen the trust the writing depends on. |
| **Decorative motion** | Motion should clarify state or deepen reading, never audition for attention. |
| **Portfolio cliché** | Screenshots, badges, and vague claims communicate less than one exact paragraph. |
| **Skill laundry lists** | Proof should sit next to claims. "I did this" beats "I know this." |
| **Infinite scope** | The site should grow by sharpening, not by sprawling. |

---

## Reach — How People Find the Site

### AI, Metadata, and Machine Readability

- Generate honest **JSON-LD** for `Person`, `WebSite`, `BlogPosting`, and the CV page.
- Add canonical URLs to every page.
- Generate a `sitemap.xml` from front matter, including `lastmod` from the `revised` field.
- Generate a full-text **RSS feed** and optionally a **JSON Feed**.
- Add `<link rel="alternate">` feed discovery tags in the `<head>`.
- Use semantic HTML that AI tools can quote cleanly: `<article>`, `<header>`, `<main>`, `<time>`,
  `<figure>`, `<figcaption>`, `<nav>`, `<footer>`.
- Add stable heading anchors so articles can be cited down to the section.
- Consider an `llms.txt` file only if it points to real pages and real summaries, not a separate
  layer of marketing copy.
- Decide explicitly whether to allow or disallow AI crawlers in `robots.txt`; make it a choice,
  not an accident.
- Expose author identity clearly with `rel="author"` and `rel="me"` links where appropriate.

### Search and Indexability

- Write explicit meta descriptions per page instead of generating hype from excerpts.
- Make titles descriptive enough to stand alone in search results.
- Keep URLs clean, stable, and readable.
- Add year-based writing archives so crawlers and humans can traverse the work chronologically.
- Make the homepage index legible and scannable enough that it doubles as the search surface.
- Ensure published and revised dates are both machine-readable and visible.
- Keep one `<h1>` per page and a disciplined heading hierarchy below it.
- Build a broken-link check so the site does not decay in public.
- Add a plain `robots.txt` and a tiny humans-oriented colophon page that search engines can also
  parse.

### Social, Sharing, and Distribution

- Add Open Graph and Twitter Card metadata with restrained, text-first previews.
- Generate simple **SVG social cards** rather than exporting noisy raster images.
- Publish manually to places that reward substance: Mastodon, LinkedIn, GitHub profile, Hacker
  News, Lobsters, relevant forums, and small design/developer communities.
- Keep a short, authored summary for each piece that can be reused as social copy.
- Add a share-by-link approach rather than embed share widgets.
- Consider a mailing list only if it stays plain and text-first; no popup capture, no funnel copy.
- Link the site from every public technical surface that already exists: GitHub profile, package
  homepages, talk bios, conference profiles, podcast bios, and email signature.
- Join small directories only if they fit the site's ethos: indie web rings, low-bandwidth clubs,
  curated personal-site indexes.

### Linkability and Citation

- Make every article easy to cite with anchorable sections, stable slugs, and visible dates.
- Add hand-curated related links between essays instead of algorithmic "recommended" content.
- Build reciprocal backlinks between related essays at build time.
- Create durable pages worth citing: the colophon, technical essays, case studies, CV, and
  annotated code articles.
- Keep quotes, diagrams, and code examples clean enough that someone else can reference them
  without apology.

### Reach Anti-Ideas

- Do not embed social timelines, comment widgets, or AI chatboxes.
- Do not stuff metadata with keywords the page does not earn.
- Do not use synthetic summaries that sound smarter than the article itself.
- Do not turn distribution into a daily content treadmill.

---

## Performance

### Budgets and Enforcement

- Keep the current overall budget mindset and make it page-specific: homepage, essay page, CV page,
  and code-heavy essay page each get their own ceiling.
- Add a build step that checks the size of HTML, CSS, JS, and fonts after compression.
- Track performance regressions as part of the repository, not as a periodic aspiration.
- Keep a budget for total page weight and also for "non-content bytes."
- Treat zero layout shift as a design requirement, not just a Lighthouse checkbox.

### Network and Delivery

- Set strong caching rules for versioned assets and shorter-lived caching for HTML.
- Consider hashed filenames for CSS, JS, font, and feed artifacts when the build exists to support
  them.
- Verify gzip or Brotli is enabled at the server.
- Keep the number of requests low enough that the waterfall is readable at a glance.
- Prefer direct hosting over platform indirection; the delivery story should stay legible.
- Preserve deploy simplicity: static files, sync, done.

### HTML, CSS, and JS

- Keep the template small enough that the prose still dominates the byte count.
- Audit CSS custom properties so only useful system variables remain.
- Keep one stylesheet if possible; if print remains separate, make that separation intentional.
- Keep JS below the threshold where it still feels handwritten and inspectable.
- Let JS progressively enhance instead of carry primary meaning.
- Make every interaction removable without breaking the page.
- Avoid client-side search, client-side rendering, hydration, and anything that turns reading into
  an application.

### Typography and Font Loading

- Push font subsetting harder until every glyph, feature, and axis is justified.
- Keep the variable font if it is carrying real design work; remove any axis range that is not used.
- Tune fallback fonts so the swap feels controlled rather than accidental.
- Ensure code font loading is equally disciplined.
- Consider whether print really needs the web font or whether system serif on paper is the more
  honest solution.

### Images, Media, and Visual Weight

- Default to no images on text pages.
- If diagrams are needed, generate SVG at build time.
- If a portrait is needed, make it tiny, exact, and optional.
- Avoid screenshots unless the screenshot itself is the subject of analysis.
- Treat favicons, social images, and diagrams as part of the performance budget.

### Measurement

- Measure Lighthouse, Core Web Vitals, and compressed asset sizes regularly.
- Record warm-load and cold-load performance because the experience should be excellent in both
  cases.
- Check reduced-motion and print variants as part of performance validation.
- Measure the homepage index separately from deep articles and the CV.

### Performance Anti-Ideas

- No analytics scripts, tag managers, chat widgets, cookie banners, or A/B tools.
- No service worker unless there is a real offline problem to solve.
- No image optimization pipeline for images that should not exist.
- No performance theater that makes the site harder to understand.

---

## Writings

### Editorial Shape

- Make the writing the center of gravity of the site.
- Prefer essays, craft notes, case studies, annotated source, and postmortems over trend commentary.
- Write fewer, better pieces rather than short reactive posts.
- Let revision be part of publishing: old essays should be allowed to improve.
- Keep voice first-person, exact, and unsentimental.

### Formats Worth Building

- **Essays** — a single argument, fully developed.
- **Craft notes** — one observation, one technique, one constraint.
- **Case studies** — what was built, why, what changed, what was rejected.
- **Annotated code** — one file or one subsystem, line-by-line or decision-by-decision.
- **Design notes** — type, layout, spacing, CSS architecture, motion, print.
- **Performance notes** — budgets, regressions, wins, measurement, server details.
- **Colophon fragments** — short explanations of tiny choices that reveal larger values.
- **Revision notes** — what changed in an article and why.
- **Annual letters** — what changed in the work, the thinking, and the site itself.

### Writing System Ideas

- Store published, revised, words, summary, tags, and related links in front matter.
- Surface revision history in the article chrome or margin.
- Generate yearly archives automatically.
- Keep the index sparse, chronological, and typographically strong.
- Add a single, humane summary sentence for each article on the index.
- Consider thematic collections only when enough essays naturally form a body of work.
- Add a feed that contains full text, not teaser fragments.
- Use stable URLs forever.

### What the Writing Should Prove

- That the author can explain web work clearly.
- That the author notices details other people miss.
- That taste is backed by implementation, not just opinion.
- That code, design, performance, and writing are one continuous practice.
- That the site improves over time because its owner revises, not because a platform shipped an
  update.

### Useful Writing Topics

- Building static sites from primitives.
- Typography as interface design.
- Performance budgets as design constraints.
- Code examples as editorial objects.
- Margin notes, footnotes, and second-voice content.
- Print CSS as a product feature.
- Why most personal sites feel generic.
- Rebuilding small systems without frameworks.
- HTML structure as an authoring discipline.
- Designing for AI citation without writing for robots.
- The relationship between taste and operational simplicity.
- The economics of keeping a site small.

### Writings Anti-Ideas

- No "top ten tools" posts with affiliate energy.
- No weekly link dumps unless they are transformed into real commentary.
- No tutorial content unless it carries a distinctive point of view.
- No outsourced tone, ghostwritten summaries, or AI-padded prose.

---

## Delightfulness

### Reading Pleasure

- Refine link underlines, hover timing, focus states, and anchor behavior until they feel
  inevitable.
- Let section changes update the running header with grace.
- Make footnotes and margin content feel placed, not popped in.
- Use motion to reveal structure, not decoration.
- Make repeat visits feel recognized through gentle state, not surveillance.

### Small Moments That Could Matter

- A beautifully handled `404` page with useful routes back into the work.
- A print view that feels like a deliberate edition, not a fallback.
- Hover states that reward curiosity without demanding it.
- Copy language that is dry, exact, and occasionally warm.
- Tiny disclosures such as revision notes, file names, word counts, or build times in margins or
  metadata.
- Keyboard shortcuts only if they are discoverable and genuinely helpful.
- A baseline-grid debug mode that demonstrates the system without becoming a gimmick.
- Gentle transitions for code copy, heading links, footnote reveal, and page arrival.

### Delight Through Restraint

- Make silence part of the design: no audio, no autoplay, no nags.
- Keep delight in the category of "noticed care," not "feature."
- Preserve stillness for readers using reduced motion.
- Let delight arise from exact spacing, exact timing, and exact copy.

### Delightfulness Anti-Ideas

- No parallax, no confetti, no animated mascots, no loading theater.
- No popups, achievement systems, or gamified reading.
- No "surprises" that interrupt concentration.

---

## Design

### Typography

- Make the type system the main visual identity of the site.
- Use variable font axes only where they are doing visible work.
- Refine optical size, weight, ligatures, italics, small caps, and figure styles intentionally.
- Give body text, code, footnotes, pull quotes, and metadata distinct but related voices.
- Keep the measure comfortable and consistent.
- Tune heading hierarchy so emphasis comes from proportion and density, not volume.

### Layout and Rhythm

- Preserve the central reading column and the margin as a second voice.
- Use the right margin for footnotes, code metadata, related links, and small factual disclosures.
- Consider a left-side structure for dates, section markers, or chapter cues if the layout supports
  it.
- Keep the homepage sparse enough that the titles do the work.
- Make section breaks feel typographic, not ornamental.
- Keep spacing on a disciplined system that can be explained in one breath.
- Ensure the fold is composed intentionally on essay pages.

### Navigation

- Let the homepage index be the map.
- Keep navigation visible, textual, and structural.
- Use the running header as contextual orientation.
- Add previous/next links only if they help narrative traversal.
- Avoid search until the volume of writing actually demands it.
- If a table of contents exists, let it be generated from real headings and stay quiet.

### Code as Design Material

- Treat code blocks as typeset objects, not developer furniture.
- Keep code examples consistent in spacing, framing, metadata, and copy behavior.
- Let code and prose share a grid relationship.
- Make diagrams and snippets feel native to the page rather than embedded from elsewhere.

### Color, Mode, and Material

- Keep the palette narrow and typographic.
- Make dark mode a re-composition, not an inversion.
- Ensure print is part of the visual system.
- Make borders, rules, link colors, syntax colors, and focus rings feel related.
- If one accent color exists, make it earn its existence everywhere it appears.

### Design Anti-Ideas

- No dashboard chrome.
- No card-grid portfolio clichés unless the content truly needs cards.
- No decorative hero section that says less than the first paragraph could say.
- No icon set unless icons are doing real explanatory work.

---

## CV

### Structure

- Make the CV a first-class page on the site, not a disconnected PDF export.
- Let the CV read quickly on screen and print beautifully on paper.
- Present work as evidence-backed narrative rather than a list of duties.
- Keep dates, roles, technologies, and outcomes legible at a glance.
- Make the first screen answer three questions immediately: who, what kind of work, what level.

### How the CV Should Differ from a Normal Resume

- Replace vague summaries with one exact opening paragraph.
- Replace skill lists with project-backed proof.
- Replace bullet spam with short, dense paragraphs.
- Replace "responsible for" language with verbs, constraints, and results.
- Replace generic portfolio links with the exact case studies or repos that support the claim.

### Proof and Credibility

- Link to real repositories, public code, talks, writing, and case studies.
- Add selective metrics where they clarify scope, not where they merely impress.
- Consider a machine-readable layer for CV metadata.
- Include print-only conveniences such as URL footers or a QR code to the live page.
- Keep a downloadable PDF only if it is generated from the same source and meets the same design
  standard.

### CV Page Ideas

- A one-sentence version for fast readers and a fuller narrative version below it.
- A timeline or era-based grouping if it clarifies growth.
- A "selected work" strip that points to essays, repos, and case studies.
- A "technical depth" section that names systems, not buzzwords.
- A brief note on collaboration, mentoring, or system stewardship if it is true and evidenced.
- An explicit contact path that feels professional and calm.
- Print CSS tuned as a real deliverable.

### CV Anti-Ideas

- No skill bars, tag clouds, pie charts, or self-ratings.
- No decorative logo wall.
- No duplicated information across screen and PDF versions.
- No filler soft-skill language that every other resume already says.

---

## Possible Supporting Pages

- **Colophon** — why the site is built this way.
- **Now** — what is being worked on this season.
- **Uses** — hardware, software, and tools, only if written with the same rigor as the rest.
- **Case Studies** — deeper proof than the CV can carry.
- **Talks** — slides, transcripts, recordings, and abstracts.
- **Notes** — smaller observations that do not need to be essays.
- **Metrics** — if exposed, they should be engineering facts, not vanity counters.

---

## Order of Operations

### First Wave

- Establish metadata, canonical URLs, feed generation, and sitemap generation.
- Finalize the basic essay template, homepage index, and CV page structure.
- Lock performance budgets and verify them in the build.
- Decide the typography system and print baseline.

### Second Wave

- Publish foundational essays and the colophon.
- Add related links, archives, and revision display.
- Refine code block treatment and margin content.
- Add social card generation and distribution workflow.

### Third Wave

- Add deeper case studies.
- Add small delightful refinements once the structure is already excellent.
- Add only the supporting pages that remain justified after the main body of work exists.

---

## The Standard

The site should make a strong developer feel slightly embarrassed about how much unnecessary weight
most sites carry. It should make a design-literate reader feel that the restraint was intentional.
It should make a recruiter trust the author quickly. It should make another writer want to cite it.
It should make another builder want to view source.
