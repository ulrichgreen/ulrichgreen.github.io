---
title: On Tools
published: 2025-03-01
words: 900
section: writing
---

# On Tools

A tool shapes the work it produces. This is obvious in physical craft — a broad chisel makes different marks than a narrow one — but it is easy to forget in software, where the tools are invisible and the shapes they impress are not.

The framework you choose encodes assumptions about what problems are worth solving easily and which ones you're on your own for. The database you choose encodes assumptions about the shape of your data. The language you choose encodes assumptions about what kinds of errors are worth catching at compile time. You are not choosing neutral infrastructure. You are choosing a set of prior opinions about your domain, and you are agreeing to live inside them.

This is not an argument against using tools. Tools are good. The right tool makes a hard thing easy, and time spent fighting the wrong tool is time not spent on the actual problem. The argument is for deliberateness: choosing tools because you understand what they assume and agree with most of it, rather than because they are popular or familiar or because someone in a conference talk made them look easy.

The test I use is whether I could replace the tool if I needed to. Not whether I would — the cost is usually not worth it — but whether I understand the system well enough that I could. If the answer is no, I probably don't understand my own system well enough. The tool has become load-bearing in a way I haven't accounted for.

Reach for the boring tool first. Not because novelty is bad, but because boring tools have sharp edges that have been found and documented. The surprises are smaller. And when you do reach for something new, reach for it because the boring tool has a specific, nameable limitation that the new one solves — not because the new one is interesting.
