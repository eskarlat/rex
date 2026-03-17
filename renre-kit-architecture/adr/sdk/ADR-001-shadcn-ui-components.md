# ADR-001: Use shadcn/ui (Radix + Tailwind) as Shared Component Library

## Status
Accepted

## Context
The system needs consistent UI across the dashboard and all extension panels. Extension developers need a component library to build panels without worrying about styling or accessibility. Using different UI libraries across the ecosystem would lead to visual inconsistency and fragmentation.

## Decision
Use shadcn/ui as the shared component library:
1. SDK package exports curated shadcn/ui components (Button, Input, Select, Dialog, etc.)
2. Extensions import components from the SDK package: `import { Button } from '@renre/sdk/ui'`
3. Components are styled with Tailwind CSS using design tokens (CSS custom properties)
4. Dashboard passes design tokens (colors, spacing, typography) via CSS variables
5. All components automatically inherit the current theme
6. SDK components are tree-shakeable; unused components don't bloat bundles

## Alternatives Considered

- **Material UI**: Feature-rich but heavier, strong opinions about design that may not fit RenreKit aesthetics
- **Custom components from scratch**: More control but expensive to build, maintain, and ensure accessibility
- **Ant Design**: Large bundle size, different design philosophy, not ideal for embedded extension components
- **Chakra UI**: Good alternative but relies on React-specific patterns that may complicate theming across extensions

## Consequences

### Positive
- **Consistent theming**: All extensions match dashboard visually
- **Lightweight**: shadcn/ui is tree-shakeable; only used components included in bundles
- **Owned source code**: shadcn/ui provides source directly; not locked into dependency updates
- **Accessibility built-in**: Radix primitives provide WCAG compliance
- **Developer familiarity**: Tailwind and Radix are widely known
- **Composable**: Easy to build custom components on top of primitives

### Negative
- **Tailwind requirement**: Extensions must use Tailwind CSS; pure CSS alternatives difficult
- **Design tokens setup**: Requires careful design token definition and distribution
- **Learning curve**: Extensions need to understand Tailwind and Radix model
- **Limited theming flexibility**: Custom component variants must use Tailwind's class system
- **Build complexity**: Extensions need proper build setup for Tailwind compilation
