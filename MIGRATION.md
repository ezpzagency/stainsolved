# Migration Documentation

## UI Framework Migration

This document outlines the migration from Anime.js to Shadcn UI components and explains key changes made to the application.

### Anime.js Removal

Anime.js was completely removed from the codebase and replaced with more maintainable alternatives:

- **Replaced With**: Framer Motion and Tailwind CSS animations
- **Previous Usage**: Anime.js was used for entrance animations, hover effects, and page transitions
- **Benefits of Migration**:
  - Reduced bundle size
  - Component-scoped animations that are easier to maintain
  - Better integration with React's component lifecycle
  - Improved accessibility with reduced motion support

> Note: While Anime.js is still listed in package.json, it's no longer used in the codebase. The package can be safely removed in a future update.

### Shadcn UI Implementation

The application now uses Shadcn UI for all major UI components:

- **Component Library**: Based on Radix UI primitives with Tailwind styling
- **Implementation Strategy**: Components are copied into the codebase rather than installed as a package
- **Benefits**:
  - Consistent design language across the application
  - Improved accessibility with ARIA support
  - Easy theming through Tailwind configuration
  - High-quality, reusable components

### Key Components Replaced/Added

| Component | Before | After |
|-----------|--------|-------|
| Accordion | Custom implementation using Anime.js | Shadcn Accordion component |
| Alerts | Custom styled divs | Shadcn Alert component with variants |
| Badges | Custom styled spans | Shadcn Badge component |
| Cards | CSS-only implementation | Shadcn Card component with header/content structure |
| Navigation | Custom implementation | Improved accessibility with Shadcn components |

### Animation Strategy Changes

#### Before:
- Global animation utility using Anime.js
- Direct DOM manipulation for animations
- Timing-based animations that could conflict

#### After:
- React-centric animations using Framer Motion
- Component-scoped animations
- Declarative animation approach
- Support for reduced motion preferences

```tsx
// Before (Anime.js approach)
useEffect(() => {
  anime({
    targets: '.element',
    opacity: [0, 1],
    translateY: [20, 0],
    delay: anime.stagger(100)
  });
}, []);

// After (Framer Motion approach)
<motion.div 
  variants={container}
  initial="hidden"
  animate="show"
>
  {items.map((item, i) => (
    <motion.div key={i} variants={item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Style & Interaction Decisions

1. **Consistent Motion Patterns**
   - Entrance animations use y-axis transforms for content blocks
   - Micro-interactions use scale transforms for emphasis
   - Hover states include subtle transforms and color changes

2. **Accessibility Improvements**
   - All components respect `prefers-reduced-motion` media query
   - Interactive elements have proper focus states
   - Improved keyboard navigation throughout

3. **Performance Optimizations**
   - Hardware-accelerated animations using `will-change` and `transform`
   - Reduced animation complexity for better performance
   - Deferred animations using Intersection Observer API

4. **Visual Consistency**
   - Standardized color transitions (200-300ms)
   - Consistent easing functions using Tailwind's defaults
   - Motion hierarchy that prioritizes important content

### CSS/Tailwind Usage Guidelines

- Use Tailwind's built-in transition classes (`transition-all`, `duration-200`, etc.)
- Leverage Tailwind's state variants (`hover:`, `focus:`, `group-hover:`)
- For complex animations, use Framer Motion with Tailwind for styling
- Use `cn()` utility for conditional class application

```tsx
// Example of combining Framer Motion with Tailwind
<motion.div 
  className={cn(
    "rounded-lg p-4 shadow-sm",
    isActive && "bg-primary/10"
  )}
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
  {children}
</motion.div>
```

### Future Enhancement Opportunities

1. Remove unused Anime.js packages from dependencies
2. Create a shared animation preset library for consistent motion
3. Implement route transitions using Framer Motion
4. Explore server components for improved performance