# Tailwind CSS Migration Plan

## Current State

- **Site type**: Static HTML academic portfolio (single page + Google verification page)
- **Styling**: Custom CSS (~500 lines across 3 files) with CSS custom properties, normalize.css baked in, and a custom grid system (`.col`, `.s12`, `.m4`, `.m8`)
- **Dependencies**: Font Awesome 5.15.3 (local webfonts), Source Sans Pro (local @font-face + Google Fonts import)
- **Build tools**: None (files served directly via GitHub Pages)
- **JavaScript**: 18 lines of vanilla JS for collapsible abstracts
- **Layout**: Two-column responsive layout (sidebar profile card + main content) using float-based grid

## Key Decision: Build Tool Introduction

Tailwind requires a build step (it generates CSS from utility classes). Since this is a GitHub Pages site with zero build tooling today, there are two viable approaches:

### Option A: Tailwind CLI (Recommended)

- Add `package.json` with Tailwind as a dev dependency
- Use the Tailwind CLI to compile `input.css` -> `css/output.css`
- Add a GitHub Actions workflow to build on push, or commit the compiled CSS
- **Pros**: Minimal tooling, no bundler needed
- **Cons**: Requires running `npx tailwindcss` during development

### Option B: Tailwind CDN (Play CDN)

- Add `<script src="https://cdn.tailwindcss.com">` to `index.html`
- No build step needed
- **Pros**: Zero setup, immediate
- **Cons**: Not recommended for production (larger payload, slower page load, no purging). The Tailwind team explicitly warns against this for production sites.

**Recommendation**: Option A. The site is simple enough that the Tailwind CLI is all that's needed. A GitHub Actions workflow can handle the build automatically.

---

## Migration Steps

### Phase 1: Set Up Tailwind Infrastructure

1. **Initialize npm project**
   ```bash
   npm init -y
   ```

2. **Install Tailwind CSS**
   ```bash
   npm install -D tailwindcss
   npx tailwindcss init
   ```

3. **Configure `tailwind.config.js`**
   - Set `content: ["./index.html"]`
   - Extend the theme with the site's existing design tokens:
     ```js
     theme: {
       extend: {
         colors: {
           background: '#fdfdfd',
           cover: '#fff3e1',
           highlight: '#326496',
         },
         fontFamily: {
           sans: ['"Source Sans Pro"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
         },
       },
     }
     ```

4. **Create `css/input.css`** with Tailwind directives
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
   Include the existing `@font-face` declarations from `font.css` here.

5. **Add build script to `package.json`**
   ```json
   "scripts": {
     "build:css": "npx tailwindcss -i ./css/input.css -o ./css/main.css --minify",
     "dev": "npx tailwindcss -i ./css/input.css -o ./css/main.css --watch"
   }
   ```

6. **Add `.gitignore`** entry for `node_modules/`

7. **Set up GitHub Actions** (optional but recommended)
   - Workflow that runs `npm run build:css` on push and deploys to GitHub Pages
   - Alternatively, commit the compiled CSS so no CI is needed (simpler, matches current workflow)

### Phase 2: Map Existing CSS to Tailwind Classes

This is the core of the migration. Each custom CSS rule maps to Tailwind utility classes applied directly in `index.html`.

#### 2a. Layout (Grid System)

| Current CSS | Tailwind Replacement |
|---|---|
| `.col` (float-based grid) | Flexbox or CSS Grid: parent gets `flex flex-col md:flex-row` |
| `.col.s12` (full width mobile) | `w-full` |
| `.col.m4` (1/3 width at 560px) | `md:w-1/3` |
| `.col.m8` (2/3 width at 560px) | `md:w-2/3` |

The overall page layout becomes:
```html
<body class="flex flex-col md:flex-row">
  <div class="w-full md:w-1/3"><!-- sidebar --></div>
  <div class="w-full md:w-2/3"><!-- main content --></div>
</body>
```

#### 2b. Cover / Sidebar Panel

| Current CSS | Tailwind Replacement |
|---|---|
| `.cover` (fixed bg, centered text, peach bg) | `bg-cover text-center md:h-screen md:sticky md:top-0 p-8` |
| `.sidepanel-content` (table-cell layout) | `flex flex-col items-center md:items-end` |
| `.avatar` (border-radius, responsive width) | `rounded w-[212px] md:w-[300px]` |
| `.author_name` | `text-highlight text-[1.75em] font-medium mt-1` |
| `.author_job` | `text-[1.2em] font-medium my-1` |
| `.author_bio` | `text-[1.2em] mb-2` |
| `.social-links` | `list-none mt-2 mb-4` |

#### 2c. Main Panel

| Current CSS | Tailwind Replacement |
|---|---|
| `.mainpanel` | `bg-background p-5 md:p-8 md:h-screen md:overflow-y-auto` |
| `.intro` | `text-[120%] mt-3` |

#### 2d. Paper Components

| Current CSS | Tailwind Replacement |
|---|---|
| `article.paper` | `mb-4` |
| `.paper-journal` | `list-none p-0 ml-1` |
| `.paper-coauthors` | `font-normal text-[90%]` |
| `.paper-details .tagline` | `italic text-gray-500 ml-1 -my-0.5` |
| `.paper-date` | `float-right` |
| `.paper-abstract` | `px-4 bg-background max-h-0 overflow-hidden transition-all duration-400 text-[11pt] leading-[18px]` |

#### 2e. Buttons

| Current CSS | Tailwind Replacement |
|---|---|
| `.button` | `bg-background border border-background text-highlight px-1.5 py-0.5 text-[15px] inline-block cursor-pointer hover:bg-highlight hover:text-background` |
| `.collapsible` | `bg-background text-highlight cursor-pointer p-1 border-none text-left text-[15px]` |

#### 2f. Typography & Base Styles

Tailwind's Preflight (modern normalize) will replace the embedded normalize.css. The existing base typography styles (line-height, font-family, font-smoothing) move into the `@layer base` section of `input.css`:

```css
@layer base {
  html {
    @apply leading-normal font-sans text-black/87 antialiased;
    text-rendering: optimizeLegibility;
    font-size: 16px;
  }
  a { @apply no-underline; }
  a:hover, a:focus { @apply text-[#75cea5]; }
  h1, h2, h3, h4 { @apply font-semibold leading-snug; }
  h2 { @apply text-highlight; }
}
```

### Phase 3: Responsive Breakpoints

Current breakpoints and their Tailwind equivalents:

| Current | Width | Tailwind |
|---|---|---|
| `@media (min-width: 560px)` | 560px | Custom breakpoint `sm: '560px'` or use default `sm` (640px) |
| `@media (min-width: 820px)` | 820px | Custom breakpoint `md: '820px'` or use default `md` (768px) |

**Decision needed**: Use Tailwind's default breakpoints (640px / 768px) which are close, or define custom breakpoints to preserve the exact current behavior. Recommendation: use Tailwind defaults (640px / 768px) since the differences are minor for this layout and it keeps config simpler.

If exact breakpoints matter, configure in `tailwind.config.js`:
```js
screens: {
  sm: '560px',
  md: '820px',
}
```

### Phase 4: Handle Font Awesome

Font Awesome is independent of Tailwind. Keep `css/all.css` and the `webfonts/` directory as-is. No migration needed for icons.

Alternatively, consider switching to a lighter icon solution (e.g., Heroicons or inline SVGs for the ~4 icons actually used), but this is optional.

### Phase 5: Clean Up

1. **Remove old CSS files**: Delete `css/main.css` (replaced by Tailwind output), `css/font.css` (merged into `input.css`)
2. **Update `index.html`** `<link>` tags to reference the new compiled CSS
3. **Keep `css/all.css`** (Font Awesome) or migrate icons
4. **Remove CSS custom properties** from `:root` (now in `tailwind.config.js`)
5. **Remove the Google Fonts `@import`** from `main.css` (fonts loaded via local `@font-face`)
6. **Add `node_modules/` to `.gitignore`**
7. **Verify** the site looks identical at all breakpoints

### Phase 6: Custom Components via `@apply` (Optional)

For repeated patterns like paper articles, you can define component classes in `input.css`:

```css
@layer components {
  .paper-abstract {
    @apply px-4 bg-background max-h-0 overflow-hidden transition-all duration-400 text-sm leading-tight;
  }
}
```

This is optional -- applying utilities directly in HTML is the standard Tailwind approach.

---

## File Changes Summary

| File | Action |
|---|---|
| `package.json` | **Create** - npm project with tailwindcss dev dependency |
| `tailwind.config.js` | **Create** - content paths, custom theme (colors, fonts, breakpoints) |
| `css/input.css` | **Create** - Tailwind directives + @font-face declarations + base layer |
| `css/main.css` | **Replace** - becomes Tailwind CLI output (compiled CSS) |
| `css/font.css` | **Delete** - merged into `input.css` |
| `css/all.css` | **Keep** - Font Awesome unchanged |
| `index.html` | **Edit** - replace all class names with Tailwind utilities |
| `.gitignore` | **Create** - exclude `node_modules/` |
| `.github/workflows/deploy.yml` | **Create** (optional) - CI build for GitHub Pages |

## Risk Assessment

- **Low risk**: The site is a single HTML page with simple layout. Visual regression can be caught by side-by-side comparison.
- **Reversible**: Git history preserves the original. The migration can be done in a branch and reviewed before merging.
- **Font Awesome compatibility**: No conflicts -- FA CSS is independent.
- **GitHub Pages**: If committing compiled CSS (no CI), deployment works exactly as before. If using CI, a GitHub Actions workflow is needed.

## Estimated Scope

- ~435 lines of custom CSS to replace with Tailwind utilities
- 1 HTML file to update (~290 lines, ~50 elements with classes to change)
- 1 JS file (18 lines) -- unchanged, works independently of CSS class names used for styling
