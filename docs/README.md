# Docs

This folder holds the project's planning and reference documents. Each file has a specific purpose — keep them focused and avoid duplicating information across files.

## File Map

| File                   | Purpose                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `README.md`            | This file. Maps the docs folder and sets ground rules.                                                                   |
| `manifesto.md`         | What the site is trying to be. Principles and values.                                                                    |
| `architecture.md`      | How the build pipeline, repo layout, and content model work.                                                             |
| `component-pattern.md` | Recipe for structuring standalone components around colocated TSX and CSS modules.                                       |
| `tooling.md`           | Current tool choices and why they fit.                                                                                   |
| `simplicity-audit.md`  | Findings from a broad audit of opportunities to simplify architecture, styling, content, tooling, and UX.                |
| `restraint-implementation-approaches.md` | Expanded implementation outlines for selected restraint-oriented simplification approaches. |
| `writing-guide.md`     | Authoring reference for MDX frontmatter, approved content components, images, series metadata, revisions, footnotes, and content audits. |
| `roadmap.md`           | Planned work, in rough priority order.                                                                                   |
| `future-ideas.md`      | Ideas worth remembering but not worth building yet.                                                                      |
| `inspiration.md`       | A wide field of vision-aligned ideas to pick from and refine, one step earlier than `future-ideas.md`.                   |

## Ground Rules

**Docs describe what exists or what's next.** Architecture and tooling docs reflect the implemented system. If the implementation changes, update the docs. If the docs describe something aspirational, it belongs in the roadmap or future-ideas.

**Keep documents short.** A document that requires scrolling through twenty sections has probably outgrown a single file. Split it or trim it.

**One home for each idea.** An item lives in `roadmap.md` when it's planned, `future-ideas.md` when it's deferred, or the specific design doc when it's being fleshed out. Don't let the same idea drift across multiple files.

**The roadmap is for planned work only.** No philosophy, no "not the goal" lists. Roadmap items should be concrete enough that someone could start working on them.
