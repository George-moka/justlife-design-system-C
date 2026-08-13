# Proposal previews that live only on Chromatic

The Slack prototyper publishes a Chromatic build for **every round** so the PM can look at it, but a
round only reached git when the PM pressed **save**. Rounds that were never saved therefore exist as a
published build and nothing else — reachable only by someone who kept the link.

`prototyper-bot` now pushes the PM's branch every round, so this can't happen again. What follows is the
set of previews from before that, kept because the work behind them is real and not in any branch.

| Screen | What it adds | Link |
| --- | --- | --- |
| Booking Details | A **View test results** row and the content behind it — Zia's, still being worked on. Not in any branch: `git log --all -S "View test results"` finds nothing. | https://6a4f941f1c2dd655ffb192cb-glysxisozp.chromatic.com/iframe.html?id=proposals-booking-details--default&viewMode=story |

Saved proposals need none of this — they're in `ds-proposal/*` branches, their PRs, and the
`proposals-gallery` branch (permalink: `proposals-gallery--6a4f941f1c2dd655ffb192cb.chromatic.com`).
