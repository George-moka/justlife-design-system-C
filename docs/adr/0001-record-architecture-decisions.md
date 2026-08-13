# 1. Record architecture decisions

- Status: accepted
- Date: 2026-06-17

## Context

We need a durable, lightweight record of significant decisions as the design
system evolves over years and across many teams.

## Decision

We use Architecture Decision Records (ADRs), one Markdown file per decision in
`docs/adr/`, numbered sequentially. Each records context, the decision, and its
consequences.

## Consequences

- Decisions are discoverable and reviewable in PRs.
- New contributors can understand *why* the system is shaped the way it is.
