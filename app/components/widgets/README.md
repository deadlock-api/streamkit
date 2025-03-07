# Widget Architecture

This document explains the architecture of our widget components.

## Folder Structure

The widget components are organized as follows:

```
widgets/
├── box/                # Box widget components
│   ├── index.tsx      # Main BoxWidget component
│   ├── BoxHeader/     # Header section component
│   │   ├── index.tsx  # Component implementation
│   │   └── BoxHeader.types.ts # Type definitions
│   ├── BoxStats/      # Stats display component
│   │   ├── index.tsx
│   │   └── BoxStats.types.ts
│   ├── BoxBranding/   # Branding section component
│   │   ├── index.tsx
│   │   └── BoxBranding.types.ts
├── MatchHistory/      # Match history components
│   ├── index.tsx      # Main MatchHistory component
│   ├── MatchHistory.types.ts # Type definitions
│   ├── useMatchHistory.ts # Custom hook for data fetching
│   ├── MatchItem/     # Single match component
│   │   ├── index.tsx
│   │   └── MatchItem.types.ts
├── StatDisplay/       # Stat display components
│   ├── index.tsx      # Main StatDisplay component
│   ├── StatDisplay.types.ts # Type definitions
│   ├── StatImage/     # Image stat component
│   │   ├── index.tsx
│   │   └── StatImage.types.ts
│   ├── StatText/      # Text stat component
│   │   ├── index.tsx
│   │   └── StatText.types.ts
├── MatchHistory.tsx   # Re-export file for backward compatibility
└── StatDisplay.tsx    # Re-export file for backward compatibility
```

## TypeScript Organization

We follow these TypeScript best practices:

1. **Separate Type Files**: Each component has its own `.types.ts` file that contains all interfaces and types related to that component.

2. **Component Folders**: Complex components have their own folder with:
   - `index.tsx`: Main component implementation
   - `ComponentName.types.ts`: Type definitions

3. **Descriptive Interfaces**: All interfaces have descriptive names that explain their purpose, with JSDoc comments.

4. **Re-export Pattern**: We maintain backward compatibility using re-export files.

## Import Pattern

When importing components, we use the directory path which automatically resolves to the index.tsx file:

```tsx
// Good - automatically resolves to box/index.tsx
import { BoxWidget } from "~/components/widgets/box";

// Good - import from component folder
import { BoxHeader } from "~/components/widgets/box/BoxHeader";

// Avoid - unnecessarily verbose
import { BoxWidget } from "~/components/widgets/box/index";
```

## Hook Architecture

We've extracted common functionality into reusable hooks:

- `useStats`: Handles data fetching and transformation
- `useWidgetTheme`: Manages theme-related styling and classes
- `useMatchHistory`: Handles match history data fetching and state

## Rendering Flow

1. Components are broken down into smaller, focused pieces
2. Data fetching logic is extracted into custom hooks
3. UI rendering is separated from data management
4. Each component focuses on a single responsibility

## Utility Functions

- `statsUtils.ts`: Contains functions for working with stats data
  - `createStatDisplays`: Creates stat objects for display
  - `calculateMatchesToShow`: Calculates match history count

## Future Improvements

- Continue refactoring with the same pattern
- Add more comprehensive unit tests
- Improve error handling and loading states
- Enhance accessibility features 