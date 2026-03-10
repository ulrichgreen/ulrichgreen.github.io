# Manifesto

I build this personal site the way I'd build furniture — by hand, with good materials, no filler. The writing is the point. Everything else exists to make the reading experience feel inevitable.

This is a craft project. The kind of site where `view source` is part of the work. Where the HTML is authored, not spat out. Where the typography, the spacing, the weight of every element is a decision, not a default.

## What It Optimizes For

**The reading experience above all else.** The page renders meaning before the browser runs a single line of JavaScript. If the network drops every script and stylesheet, the words still land.

**A build one person can hold in their head.** Every layer earns its place by being explainable in plain language. If I can't sketch the whole pipeline on the back of an envelope, something needs to go.

**Authored HTML.** The output should be clean enough that viewing source feels like reading a second version of the site. Markup is a craft material, not an intermediate format.

**A small surface area, fiercely maintained.** Every dependency, every abstraction, every file carries weight. The default answer to "should I add this?" is no.

## What It Refuses

No full-page hydration — React renders at build time and only explicit islands get client-side life.

No arbitrary MDX imports — content components are approved through `src/content-components.tsx` and that boundary is load-bearing.

No analytics, tracking pixels, or third-party widgets. Not even "lightweight" ones.

No client-side routing. A page is a URL. A link is a navigation.

No cargo-culted complexity. Nothing gets added because "real sites have this."

No planning docs that drift from reality. These files describe the system as it is, not as it might be someday.

## What The Code Must Keep True

The pipeline is: content → frontmatter → MDX → React SSR → HTML. That sequence stays legible or it gets simplified, never complicated.

TypeScript guards the seams — the content model, the rendering path, the template contracts. It's a safety net for the build, not an architecture astronaut's playground.

The progressive enhancement layer owns document-level behavior. Islands own their own DOM. The two never cross.

CSS is handwritten, layered, and designed on purpose. No framework. No utility classes. The design system is the CSS.

Tests verify the rendering and accessibility paths that matter most. If implementation drifts, the build fails. That's the point.

## What Success Looks Like

Someone visits and the writing is unmistakably the center.

The site loads fast and works fully without JavaScript.

A developer reads the source and understands the entire project — where content lives, how the build works, what the browser receives — in one sitting.

The whole thing still feels like one person's considered, opinionated work. Not a template. Not a framework starter kit. A site that could only be this site.
