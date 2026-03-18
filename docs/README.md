# Docs

This folder holds the project's planning and reference documents. Each file has a specific purpose — keep them focused and avoid duplicating information across files.

## File Map

| File               | Purpose                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `README.md`        | This file. Maps the docs folder and sets ground rules.                                                                   |
| `manifesto.md`     | What the site is trying to be. Principles and values.                                                                    |
| `architecture.md`  | How the build pipeline, repo layout, and content model work.                                                             |
| `tooling.md`       | Current tool choices and why they fit.                                                                                   |
| `writing-guide.md` | Authoring reference for MDX frontmatter, approved content components, images, series metadata, revisions, and footnotes. |
| `roadmap.md`       | Planned work, in rough priority order.                                                                                   |
| `future-ideas.md`  | Ideas worth remembering but not worth building yet.                                                                      |

## Ground Rules

**Docs describe what exists or what's next.** Architecture and tooling docs reflect the implemented system. If the implementation changes, update the docs. If the docs describe something aspirational, it belongs in the roadmap or future-ideas.

**Keep documents short.** A document that requires scrolling through twenty sections has probably outgrown a single file. Split it or trim it.

**One home for each idea.** An item lives in `roadmap.md` when it's planned, `future-ideas.md` when it's deferred, or the specific design doc when it's being fleshed out. Don't let the same idea drift across multiple files.

**The roadmap is for planned work only.** No philosophy, no "not the goal" lists. Roadmap items should be concrete enough that someone could start working on them.

## What This Site Is Not

Turning this into an app. It's a document.

Adding features faster than the writing can absorb them.

Building infrastructure for ideas that still fit better as a line in the roadmap.

A CMS. The authoring model is a text editor and `git push`.

Client-side search. The site is small. Use Ctrl+F.

A comment system. Email exists.

A CSS framework. The design system is the CSS.

Server-side rendering at request time. The site is static because static is better for this.
