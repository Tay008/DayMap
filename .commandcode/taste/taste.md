# Taste

## Workflow

- Prefers the agent to derive requirements from the project's own documentation/spec rather than asking the user which step or direction to take; when a task is stated, read the docs and proceed. Confidence: 0.6
- Wants large jobs delivered one stage at a time: do a single stage, summarize the change in ~2-3 lines, then stop and wait for the user to say "next". Confidence: 0.85
- Expects read-only investigation stages first (list the relevant files/functions and answer questions) and explicit approval before any change to data-layer code is made. Confidence: 0.8

## Code Style

- Requires scoped, project-prefixed CSS class names (e.g. a `dm-` prefix on every class) and no global CSS: never add or edit global stylesheets or `body{}` rules, because unprefixed names collide with existing app classes and restyle the whole app. Confidence: 0.85
