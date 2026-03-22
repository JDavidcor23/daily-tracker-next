---
name: styles-enforcer
description: Enforces Tailwind CSS as the only styling method; prohibits inline styles and Styled Components
activation: always-on
glob: "**/*.{tsx,jsx}"
---

**Never** use `style={{}}` on JSX elements. **Never** use Styled Components or any CSS-in-JS library.
Use **Tailwind CSS utility classes** for all styling.

## Bad

```tsx
<div style={{ padding: '10px', margin: '5px', color: '#333' }}>
  <input style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
</div>
```

## Good

```tsx
<div className="p-3 m-1 text-gray-700">
  <input className="w-5 h-5 cursor-pointer" />
</div>
```

## When Tailwind is not enough

Use a plain `.css` file or CSS Module — not Styled Components.

```tsx
import styles from './Component.module.css'
<input className={styles.checkboxInput} />
```

Do not mix Tailwind with CSS Modules in the same component. Pick one and stay consistent.

## Allowed exceptions

```tsx
// Dynamically calculated values not expressible with Tailwind
<div style={{ transform: `translateX(${offset}px)`, opacity: visible ? 1 : 0 }} />

// Third-party libraries that require inline style
<ThirdPartyComponent style={{ position: 'absolute' }} />
```
