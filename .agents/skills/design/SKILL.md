# DESIGN.md: Design System and Rules for AI Coding Agents

> Read this file completely before writing any UI code. It applies to every website, landing page, dashboard, and component you build in this project.
> If the person's brief conflicts with this file, **the brief wins**. If the brief is silent, this file decides.

---

## 0. Mission

Build interfaces that look **designed by a person with a point of view**, not generated from the statistical average of the internet. The benchmark is the craft level of Apple, Stripe, Linear, Vercel, Arc, Teenage Engineering, and good editorial studios.

Professional design comes from five things, in this order:

1. **A concept**: a specific idea about what this product is and how it should feel.
2. **A system**: tokens for type, space, color, radius, and motion, used without exceptions.
3. **Real content**: real copy, real product visuals, real numbers.
4. **Restraint**: one memorable move, everything else quiet.
5. **Detail**: alignment, states, borders, focus rings, and edge cases.

If you skip 1, the result is generic. If you skip 2, it is messy. If you skip 3, it is hollow. If you skip 4, it is noisy. If you skip 5, it is amateur.

---

## 1. Operating Process (mandatory)

Never jump straight to components. Work in this order.

### Phase 1: Understand the subject
Write down, in 5 lines or fewer:
- **What it is**: one concrete sentence about the product or subject.
- **Who it is for**: a specific audience, not "everyone".
- **Primary job of the page**: one action (sign up, buy, read, explore, contact).
- **Tone**: three adjectives (e.g. *precise, calm, technical*).
- **Reference points**: two or three real sites or objects that capture the feel.

If the brief doesn't give you this, propose it yourself and state your assumptions in one line before building.

### Phase 2: Design plan (before any code)
Produce a compact plan:
- **Concept**: one sentence naming the aesthetic direction (see Section 3).
- **Color**: 4 to 6 named hex values with roles.
- **Type**: the typefaces and their roles.
- **Layout**: a one-sentence layout concept plus an ASCII wireframe per key section. State alignment (left, centered, justified) and why.
- **The one memorable move**: the single element where boldness is spent.
- **Principles**: 3 rules that make this design unlike others.

### Phase 3: Review the plan against the brief
Ask: *if I gave the same prompt to another AI agent, would it land on this plan?* If yes, then the plan is a default, not a choice. Change the weakest parts and note what you changed and why. Only then write code.

### Phase 4: Build
Tokens first, then layout primitives, then sections, then states, then motion, then polish.

### Phase 5: Critique loop (mandatory when tools allow)
1. Run the page and take screenshots at **1440px, 1024px, 768px, and 390px** (Playwright or Puppeteer).
2. Review each screenshot against the checklist in Section 20.
3. Fix the top 3 problems.
4. Repeat at least twice. Log what you changed in a short `DESIGN_NOTES.md` so future passes don't repeat experiments.

If you cannot take screenshots, state that and do a careful manual review of spacing, hierarchy, and responsive behavior in the code.

---

## 2. Recognize and Avoid the "AI Look"

These are the most common tells of generated pages. They are legitimate for some briefs but are **defaults, not choices**. Do not use them unless the brief asks for them or you can name the specific reason they fit this subject.

### Banned by default

**Fonts**
- Inter, Roboto, Arial, Open Sans, Poppins, and `system-ui` as the display or headline typeface.
- Space Grotesk and DM Sans as automatic "modern" picks.

**Color**
- Purple-to-blue or pink-to-orange gradients as the brand.
- Warm cream background (about `#F4F1EA`) with a serif display and terracotta accent (about `#D97757`).
- Near-black background with a single acid-green or vermilion accent.
- Tinted near-black (`#0B0B0B`, `#111`) used by reflex instead of a considered dark.
- Gradient washes as decoration behind sections.

**Layout**
- Centered hero with a pill badge, a big headline, one subline, and two buttons (primary and ghost).
- Three identical rounded cards in a row under the hero.
- Content chopped into uniform cards with one border radius and the same soft grey shadow on everything.
- Everything centered, everything the same width, every section the same height.
- A big number with a small label and a gradient accent as the default "stats" treatment.
- A logo strip of "Trusted by" grey logos with no real customers behind it.

**Typography and chrome**
- A tracked-out ALL-CAPS eyebrow label above every heading.
- Accenting one word in a headline with italic, bold, or a different color.
- Numbered markers (01 / 02 / 03) when the content is not a real sequence.
- Meta strings joined with middle dots ("A · B · C").
- Labels in the form `WORD: fragment` or with a spaced em dash.
- A monospace face for every small data label.
- A "→" appended to every link and button.

**Visuals and motion**
- Emoji used as icons.
- Stock illustrations of people at laptops, abstract blobs, 3D "glass" shapes.
- Glassmorphism and backdrop blur by default.
- Fade-and-slide-up entrance on every section and a hover lift on every card.
- Floating gradient orbs, grain overlays, and noise added "for texture" without reason.

**Copy**
- Lorem ipsum, "Revolutionize your workflow", "Supercharge", "Unlock the power of", "Seamless", "Next-gen", "All-in-one platform", "Built for the future".

### How to use this list
Before finalizing, scan your output against it. For every item you find, either remove it or write a one-line reason in `DESIGN_NOTES.md` explaining why it is a deliberate choice for this subject.

---

## 3. Choose an Aesthetic Direction

Pick **one** direction and commit. Name it in the plan. Mixing three directions produces mush.

| Direction | Feels like | Typical moves | Good for |
|---|---|---|---|
| **Product-cinematic** (Apple) | Confident, spacious, premium | One message per viewport, huge type, full-bleed product imagery or video, scroll-driven reveals, alternating light/dark chapters | Hardware, consumer products, launches |
| **Technical-precise** (Stripe, Linear, Vercel) | Exact, dense, trustworthy | Real product UI as the visual, code snippets, hairline borders, strict grid, small precise type, one signature gradient or mesh | Developer tools, fintech, B2B SaaS |
| **Editorial** | Opinionated, literate | Strong serif or grotesque pairing, asymmetric columns, pull quotes, captions, generous margins, photography with crop discipline | Media, studios, publishing, portfolios |
| **Swiss / grid-modernist** | Rational, clear | Rigid grid, flush-left ragged-right, limited palette, large numerals used only when meaningful, strong alignment | Institutions, architecture, data-heavy sites |
| **Brutalist / raw** | Blunt, anti-polish | System-level type used deliberately, hard borders, visible grid, harsh contrast, intentional "ugliness" | Art, experimental, counterculture |
| **Warm-organic** | Human, tactile | Rounded forms, earthy palette that is *not* the cream-terracotta default, real photography, hand-drawn elements with purpose | Food, wellness, craft, community |
| **Playful-graphic** | Energetic, bold | Saturated flat color, chunky type, custom illustration, sticker-like shapes, bouncy but controlled motion | Kids, games, consumer apps |
| **Luxury-quiet** | Restrained, expensive | Very large whitespace, light weights, narrow palette, fine serif, slow motion, photography as the star | Fashion, hospitality, high-end services |

Derive the direction from the **subject's world**: its materials, vocabulary, tools, and culture. A page for a ceramic studio should not look like a page for a cloud-security product.

---

## 4. Design Tokens

All visual values come from tokens. **No magic numbers in components.** Define tokens once as CSS custom properties (or the Tailwind theme) and reference them everywhere.

### 4.1 Color

Define **roles**, not just hues. Keep the palette small: neutrals plus one accent (a second accent only if the concept needs it).

```css
:root {
  /* Surfaces */
  --color-bg:            /* page background */;
  --color-bg-subtle:     /* alternate section background */;
  --color-surface:       /* cards, panels */;
  --color-surface-raised:/* popovers, menus */;
  --color-inverse-bg:    /* dark/inverted sections */;

  /* Text */
  --color-text:          /* primary text */;
  --color-text-muted:    /* secondary text */;
  --color-text-faint:    /* tertiary, disabled */;
  --color-text-inverse:  /* text on inverse-bg */;

  /* Lines */
  --color-border:        /* default hairline */;
  --color-border-strong: /* emphasized dividers, inputs */;

  /* Brand and feedback */
  --color-accent:        /* the one accent */;
  --color-accent-hover:
  --color-accent-contrast:/* text on accent */;
  --color-success:
  --color-warning:
  --color-danger:
  --color-focus:         /* focus ring color */;
}
```

**Rules**
- Pick 4 to 6 core named hex values for the concept (for example `Ink`, `Paper`, `Slate`, `Signal`). Derive the rest from these.
- **One accent.** It is used for the primary action, key highlights, and links. If everything is accented, nothing is.
- Use a **neutral ramp with a slight hue bias** that matches the concept (cool for technical, warm for organic). Do not default to pure grey.
- Avoid pure `#000` on pure `#fff` for large text areas unless the concept is deliberately stark. Slightly soften one side.
- Ratio target: about **90% neutrals, 8% accent, 2% feedback colors**.
- Contrast: body text at least **4.5:1**, large text and UI components at least **3:1**. Verify, don't assume.
- Define **both light and dark** themes via `prefers-color-scheme` and `[data-theme]` when the product needs it. Do not simply invert; re-pick surface elevation and accent lightness.
- Gradients are a **signature**, not a background habit. If used, make it custom (specific hues, angle, noise-free), use it in one place, and tie it to the brand idea.

### 4.2 Typography

**Typefaces**
- Use **one family or two**. If two, make them clearly different in role (display vs. text), not similar sans-serifs.
- Choose deliberately. Look for options with character: variable fonts with width/optical-size axes, a distinctive grotesque, a sharp serif, a humanist sans. Pick from a source you can actually load (Google Fonts, Fontsource, or self-hosted). Always specify a real fallback stack.
- Match the face to the subject: geometric and cool for engineering, high-contrast serif for editorial, soft rounded for consumer, condensed for sport or industrial.
- Load with `font-display: swap`, subset to needed glyphs, and preload the display font.

**Scale** (modular, fluid): use `clamp()` so type scales between mobile and desktop.

```css
:root {
  --text-xs:   clamp(0.75rem, 0.73rem + 0.1vw, 0.8125rem);  /* 12–13 */
  --text-sm:   clamp(0.875rem, 0.85rem + 0.12vw, 0.9375rem);/* 14–15 */
  --text-base: clamp(1rem, 0.96rem + 0.2vw, 1.125rem);      /* 16–18 */
  --text-lg:   clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem); /* 18–22 */
  --text-xl:   clamp(1.5rem, 1.3rem + 1vw, 2rem);           /* 24–32 */
  --text-2xl:  clamp(2rem, 1.6rem + 2vw, 3.25rem);          /* 32–52 */
  --text-3xl:  clamp(2.75rem, 2rem + 4vw, 5.5rem);          /* 44–88 */
  --text-hero: clamp(3.5rem, 2rem + 8vw, 9rem);             /* 56–144 */
}
```

**Rules**
- Hierarchy comes from **size and weight contrast**, not just color. Use at most 3 to 4 sizes per section.
- Large headlines: **negative letter-spacing** (about `-0.02em` to `-0.05em` as size grows), line-height `0.95 to 1.1`, `text-wrap: balance`.
- Body: line-height `1.5 to 1.65` (serif slightly more than sans), `text-wrap: pretty`.
- **Line length**: 45 to 75 characters (`max-width: 65ch` default; never above 80).
- Small text (labels, captions) has **slightly positive** tracking and never goes below 12px.
- Use **sentence case** for UI and headings by default. ALL CAPS only for a real reason (and then sparingly, with tracking).
- Use `font-variant-numeric: tabular-nums` in tables, prices, and metrics; `font-feature-settings` for ligatures and stylistic sets when the face offers them.
- Use real typographic characters: curly quotes, en/em dashes (without padding spaces), proper ellipsis, non-breaking spaces before units.
- Treat the headline as **design**, not just a content container. Scale, weight, width, and cropping are tools. Do not rely on decoration around weak type.
- Alignment: left-align reading text. Center only short, single-idea blocks (and not by default).

### 4.3 Spacing

- Base unit **4px**; use an **8px-leaning scale**: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192`.
- Tokens: `--space-1` to `--space-12`, plus fluid section spacing with `clamp()`.
- Section vertical padding: **96 to 192px on desktop**, **64 to 96px on mobile**. Vary it by section importance.
- Inside components, the spacing inside is **smaller than the spacing around** (proximity principle). A card's padding should be less than the gap between cards when they should read as separate; more when they should read as a group.
- Use `gap` for sibling spacing; avoid margin collapse surprises.

### 4.4 Layout and Grid

- Container: `max-width` around **1200 to 1440px** with fluid gutters (`clamp(16px, 4vw, 48px)`). Allow specific elements to **break out** to full-bleed on purpose.
- **12-column grid** on desktop, 8 on tablet, 4 on mobile. Use CSS Grid with named areas for complex sections.
- Prefer **asymmetry**: 5/7, 4/8, or offset columns over perfectly mirrored 6/6 splits.
- Keep a **strict alignment axis**: elements share left edges. Misalignment should look intentional or not exist.
- Use `min()`, `clamp()`, `minmax()`, container queries, and `aspect-ratio` rather than fixed pixel dimensions.

### 4.5 Radius, Borders, Elevation

- Define a **small radius scale** (for example `2, 6, 12, 999px`) and assign by **hierarchy**. Do not use one radius for everything. Nested elements use `inner = outer - padding`.
- A concept chooses its character: sharp (0 to 2px) for technical or editorial, medium (8 to 14px) for friendly software, pill for playful. Pick one and be consistent.
- **Borders carry structure.** Use 1px hairlines with low-contrast color to divide content instead of boxing everything in cards. Many sections need no container at all.
- **Elevation**: use at most 3 levels (`flat`, `raised`, `overlay`). Prefer layered shadows (a tight contact shadow plus a soft ambient one) tuned to the background color, not a single generic `rgba(0,0,0,.1)`.
- Avoid putting shadow, border, gradient, and blur on the same element.

### 4.6 Motion Tokens

```css
:root {
  --ease-out:    cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* use rarely */
  --dur-fast: 150ms;   /* hover, press */
  --dur-base: 250ms;   /* menus, toggles */
  --dur-slow: 500ms;   /* reveals, page transitions */
}
```

Details are in Section 12.

---

## 5. Page Architecture and Rhythm

A page is a **sequence of chapters**, not a stack of identical blocks.

- **One idea per section.** If you can't state a section's job in one sentence, split or cut it.
- **Vary the rhythm**: alternate dense and airy, light and dark, text-led and visual-led, narrow and full-bleed.
- **One focal point per viewport.** Decide what the eye lands on first, second, third.
- Typical chapter order (adapt, don't copy): **Hook → Proof → How it works → Depth → Social proof → Pricing/Action → Footer.** Drop anything the subject doesn't need.
- Every section answers a visitor's question: *What is this? Why should I care? Can I trust it? How does it work? What does it cost? What do I do next?*
- Keep the **primary call to action** consistent in wording and style across the page. Repeat it, don't reinvent it.
- The footer is part of the design: real navigation, real legal links, one last action.

---

## 6. The Hero

The hero is the first impression. Open with **the most characteristic thing in the subject's world**.

Choose the form on purpose:
- A **headline** (type as the design),
- A **product shot or video** (Apple),
- A **live demo or real UI** (Stripe, Linear),
- An **interactive moment** (a configurator, a playable element),
- An **image** with a strong crop and a short caption.

**Rules**
- Max one headline, one supporting sentence, one primary action (a secondary only if truly needed).
- The headline states what it is or what it does, specifically. No slogans that could apply to any product.
- The visual must be **specific to the product**. If you can swap the product name and the hero still works, it is too generic.
- Fit the first viewport on common screens (aim for the primary action visible above the fold on a 1440x800 and a 390x844 screen).
- Do not stack: pill badge + gradient headline + subline + two buttons + logo row + floating cards. Pick what matters.

---

## 7. Components

Every component needs: **default, hover, focus-visible, active, disabled, loading, error** states where relevant, plus a mobile behavior.

### 7.1 Buttons
- 2 levels by default: **primary** (accent, solid) and **secondary** (outline or subtle). Add tertiary (text link) only as needed.
- Minimum hit area **44x44px**. Comfortable padding (about `12px 20px` for base).
- Label: verb-first and specific ("Start free trial", "Download the spec", "Save changes"). Not "Submit", "Click here", or "Learn more" when something clearer exists.
- Pressed state: subtle scale (`0.98`) or darken. Disabled: reduced contrast plus `cursor: not-allowed`, not just opacity.
- Loading: inline spinner or progress, label retained, width stable.
- Do not append "→" to every button.

### 7.2 Links
- Distinguishable without color alone (underline, weight, or position). Underline offset and thickness are tokens (`text-underline-offset: 0.2em`).
- External links indicated when it matters.

### 7.3 Navigation
- Simple: logo, 3 to 6 items, one action. Sticky only if useful; if sticky, keep it slim and give it a defined background on scroll.
- Mobile: a real menu (full-screen or sheet) with large targets, focus trap, and `Esc` to close. Not a tiny hamburger with unstyled links.
- Mark the current page (`aria-current="page"`).

### 7.4 Cards
- Use cards **only when content is truly a discrete, scannable item**. Otherwise use open layouts with dividers.
- Vary size to express hierarchy (a featured item larger than the rest). No wall of equal cards.
- Whole-card click targets must be a real link/button with focus styles.

### 7.5 Forms
- Visible labels (not placeholder-only), helper text, inline validation on blur, clear error text that says what to fix and how.
- Input height 44 to 52px, strong visible focus ring, correct `type`, `autocomplete`, and `inputmode`.
- Group related fields; one column by default; mark optional rather than required when most are required.
- Success state confirms what happened ("Message sent. We reply within one business day.").

### 7.6 Tables and Data
- Right-align numbers, tabular figures, sticky header for long tables, zebra or hairline rows (not both), responsive behavior (scroll container or restructure to stacked rows).
- Provide sort and filter affordances only when they work.

### 7.7 Modals, Menus, Tooltips, Toasts
- Focus management: trap, restore, `Esc`, click-outside. Use semantic elements (`<dialog>`) or a proven headless library.
- Toast wording matches the action ("Published" after "Publish").
- Tooltips never hold essential information.

### 7.8 Icons
- One icon set, one stroke weight, one size grid (Lucide, Phosphor, Heroicons, or custom). Never emoji.
- Icons support text; they do not replace it. Decorative icons get `aria-hidden="true"`; meaningful ones get labels.

### 7.9 Badges and Tags
- Use for real status or category. Not as decoration above every heading.

---

## 8. Imagery, Illustration, and Product Visuals

- **The product is the hero.** Build real UI mockups in HTML/CSS/SVG that use your tokens, with believable data. Avoid screenshots of nothing and avoid stock photos of generic teams.
- **Photography**: consistent lighting, crop, color grade, and aspect ratios. Specify `width`/`height`, `loading="lazy"` (not on the hero), `srcset`/`sizes`, AVIF/WebP, meaningful `alt`.
- **Illustration**: only if you can maintain one consistent style, line weight, and palette tied to tokens. Otherwise use diagrams, typography, or UI.
- **Diagrams and data visualization**: build in SVG or a chart library, styled with tokens. Label directly rather than relying on a legend when possible. Avoid 3D, gratuitous gradients, and rainbow palettes.
- **Placeholders**: if real assets are missing, use deliberate placeholders (labeled frames with the right aspect ratio and a note of what asset goes there), never random stock URLs.
- **Backgrounds**: patterns, grids, noise, and gradients only when they express the concept and don't hurt text contrast.

---

## 9. Content and Copywriting

Words are design material. They exist to help people understand and act.

- **Write from the user's perspective** in plain language. Name things by what the user does ("Manage notifications"), not by system internals ("Webhook config").
- **Be specific.** Numbers, nouns, outcomes. "Cut invoice reconciliation from 3 days to 40 minutes" beats "Streamline your finances".
- **Short headlines** (about 3 to 10 words). One job per element.
- **Active voice** and verb-first CTAs. Same action, same name across the flow.
- **Sentence case**, no filler, no exclamation marks by default, no jargon the audience wouldn't use.
- **Error messages** say what happened and how to fix it. No apologies, no vagueness, no blame.
- **Empty states** invite an action ("No projects yet. Create your first project.").
- **Microcopy** (labels, helper text, confirmations) is written, not left as defaults.
- Do not invent fake testimonials, logos, statistics, awards, or customer names. If real data is missing, mark it clearly as placeholder content in `DESIGN_NOTES.md` and in a code comment.
- Match **voice to brand**: define 3 voice traits and one "we say / we don't say" example in the plan.

---

## 10. Responsive Design

- **Mobile-first** CSS. Breakpoints are content-driven; typical anchors: `480, 768, 1024, 1280, 1536`.
- Test at **390, 768, 1024, 1440, and 1920**. No horizontal page scroll at any width.
- Reflow, don't just shrink: reorder, restack, and swap components (e.g., table to list, mega-nav to sheet).
- Fluid type and spacing through `clamp()`. Use container queries for components that live in different contexts.
- Touch targets 44px+, adequate spacing between targets, no hover-only functionality.
- Respect safe areas on mobile (`env(safe-area-inset-*)`) and use `dvh` instead of `vh` for full-height sections.
- Images and video scale with the container and never cause layout shift.

---

## 11. Accessibility (quality floor, not optional)

- Semantic HTML first: `header`, `nav`, `main`, `section`, `article`, `footer`, correct heading order (one `h1`).
- **Keyboard**: every interactive element reachable and operable; logical tab order; skip link to main content.
- **Focus-visible** on everything interactive: a clear ring (2px+, offset, 3:1 contrast against adjacent colors). Never `outline: none` without a replacement.
- **Contrast** per Section 4.1. Don't convey meaning with color alone.
- **Motion**: honor `prefers-reduced-motion` (remove parallax, auto-play, large transforms; keep simple fades or instant state changes).
- **Alt text** that describes purpose; empty `alt=""` for decorative images.
- ARIA only when native semantics are insufficient; verify roles, names, and states.
- Forms: associated labels, `aria-describedby` for hints and errors, error summary on submit.
- Zoom to 200% and text-only resize without breaking layout.
- Video: captions, no autoplay with sound, pause control for anything that moves for more than 5 seconds.

---

## 12. Motion and Interaction

**Philosophy:** motion explains change or directs attention. It is never wallpaper.

**Do**
- Choreograph **one signature moment** (a page-load sequence, a hero reveal, or a scroll-driven story) and keep the rest calm.
- Animate in response to user actions: open, expand, drag, confirm, navigate. Show what changed and where it went.
- Use scroll-driven techniques where they carry meaning (Apple-style pinned product stories, progress indicators, comparisons that morph). Prefer CSS scroll-driven animations or `IntersectionObserver`; use GSAP or Framer Motion when choreography requires it.
- Animate `transform` and `opacity` only. Avoid animating layout properties (`width`, `top`, `margin`).
- Durations: **150ms** micro, **250ms** component, **500ms** reveal, **800ms+** only for hero or storytelling. Exits are faster than entrances.
- Stagger sparingly (30 to 80ms steps, no more than about 6 items).

**Don't**
- Fade-and-slide-up every section on scroll.
- Lift every card on hover.
- Add parallax, floating shapes, or looping animations that serve no purpose.
- Block interaction while animation plays.

**Always:** provide a `prefers-reduced-motion` alternative and keep the page usable with JavaScript animation libraries failing to load.

---

## 13. Dark Mode and Theming

- Build themes from the **role tokens** in Section 4.1; components never reference raw hex.
- Dark surfaces: use stepped elevation (lighter = higher), desaturate accent slightly, reduce pure-white text to about 90 to 95%.
- Avoid pure black backgrounds with neon accents by default.
- Test images, shadows, borders, and charts in both modes. Provide a manual toggle that persists the preference (with graceful fallback to the system setting).
- Alternating dark and light **sections** within a page is a valid rhythm tool (Apple), independent of a site-wide theme.

---

## 14. Performance (design is also speed)

- Targets: **LCP under 2.5s, CLS under 0.1, INP under 200ms**.
- Optimize images (AVIF/WebP, correct sizes, lazy loading below the fold), compress and poster video, avoid autoplaying heavy media on mobile.
- Limit fonts to 2 families and 3 to 4 weights, or use variable fonts. Preload the display font.
- Inline critical CSS where practical; avoid layout shifts with reserved dimensions.
- Keep JavaScript small; prefer CSS for effects. Lazy-load heavy libraries (3D, charts).
- Avoid heavy `backdrop-filter`, huge blur radii, and large animated gradients on low-power devices.

---

## 15. SEO and Meta Basics

- Unique `<title>` and meta description per page; one `h1` that matches the page's purpose.
- Open Graph and Twitter card images designed with the same system as the site.
- Semantic structure, descriptive link text, structured data where relevant, `lang` attribute, favicon set, and canonical URLs.

---

## 16. Code Standards

- **Tokens in one place** (`tokens.css` or the Tailwind config). Components reference tokens only.
- Structure CSS to avoid specificity wars: use a clear naming convention (BEM, CSS Modules, or utility-first), keep selectors flat, use `@layer` (`reset, tokens, base, components, utilities`). Be careful that section-level and element-level classes (like `.section` and `.cta`) don't cancel each other's padding or margin.
- Prefer modern CSS: custom properties, grid, `clamp()`, container queries, `:has()`, logical properties (`margin-inline`), `color-mix()`, `text-wrap`.
- Components are small, composable, and accept variants through props, not copy-pasted.
- No inline styles except for dynamic values. No `!important` outside utilities.
- If using Tailwind: extend the theme with your tokens, forbid arbitrary values (`[13px]`) except in rare, commented cases, and don't leave default blue/indigo accents in place.
- If using React: semantic elements, accessible primitives (Radix, React Aria), no layout-breaking hydration flashes.
- Keep a single `index` of sections so the page composition is readable.

---

## 17. Brand Expression

Make the design belong to this subject only.

- **Signature element**: one repeatable motif (a shape, a grid treatment, a type behavior, a color transition, a cursor, a border style) that appears with discipline.
- **Voice**: copy, microcopy, and error messages share a personality.
- **Details**: custom 404 page, selection color (`::selection`), scrollbar styling (subtle), favicon, loading states, empty states, print stylesheet where relevant.
- **Consistency over novelty**: once a pattern exists (for example, how sections are introduced), reuse it exactly.

---

## 18. Restraint and Editing

- **Spend boldness in one place.** One element is the memorable thing; everything around it is quiet and disciplined.
- Before finishing, **remove one accessory**: delete the decoration, border, effect, or element that is doing the least work.
- If two elements compete for attention, demote one.
- If a section feels empty, add *content or clarity*, not decoration.
- If something is unnecessary, whitespace is the answer.

---

## 19. Reference Extraction (when the person provides examples)

When given a URL, screenshot, or "make it like X":

1. Extract: **type scale and families, spacing rhythm, grid, color roles, border/radius/shadow treatment, motion behaviors, section patterns, copy tone.**
2. Write the extraction as a table in `DESIGN_NOTES.md`.
3. Identify the **principle** behind each choice (why it works) and apply the principle to the new subject. **Do not clone** the reference, its assets, or its brand marks.
4. Note where you intentionally diverge.

---

## 20. Pre-Delivery Checklist

Run this on every build. Fix before presenting.

**Concept and hierarchy**
- [ ] A named aesthetic direction and a stated "one memorable move" exist.
- [ ] Each section has a single clear job and focal point.
- [ ] The hero is specific to this product; swapping the name would break it.
- [ ] The page has rhythm (variation in density, background, scale).

**System**
- [ ] All colors, type sizes, spacing, radii, shadows, and durations come from tokens.
- [ ] No more than 2 type families and 1 accent color.
- [ ] Radius and elevation vary by hierarchy, not one value for everything.
- [ ] No items from the Section 2 banned list remain (or each has a documented reason).

**Content**
- [ ] No lorem ipsum, clichéd marketing phrases, or fake logos/testimonials.
- [ ] Headlines are short and specific; CTAs are verb-first and consistent.
- [ ] Errors, empty states, and confirmations are written.

**Craft**
- [ ] Alignment is exact; edges line up across sections.
- [ ] Hover, focus-visible, active, disabled, loading, and error states exist.
- [ ] Text lines are 45 to 75 characters; headings use balanced wrapping.
- [ ] Icons are from one set; no emoji.

**Quality floor**
- [ ] Screenshots reviewed at 390, 768, 1024, and 1440px; no horizontal scroll.
- [ ] Keyboard navigation works; focus ring is visible everywhere.
- [ ] Contrast checks pass; `prefers-reduced-motion` is honored.
- [ ] Images sized, optimized, and have alt text; no layout shift.
- [ ] Performance targets are plausible (fonts, images, JS size).

**Final test**
- [ ] *Could this page be mistaken for a generic template?* If yes, change something specific to the subject.
- [ ] *Would I be comfortable putting this next to Apple's or Stripe's work?* If not, identify the weakest area and improve it.

---

## 21. Deliverables Per Task

For each page or feature, output:

1. **Design plan** (Phase 2) in 15 to 30 lines, including ASCII wireframes.
2. **Code**: tokens, components, page.
3. **`DESIGN_NOTES.md`**: assumptions, deviations from this file with reasons, placeholder content list, what changed in each critique pass.
4. **Screenshots** from the critique loop, if tooling allows.
5. A **short summary** (2 to 4 sentences): what was built, the aesthetic direction, the one memorable move, and anything left as placeholder.

---

## Appendix A: Starter Token File

```css
@layer reset, tokens, base, components, utilities;

@layer tokens {
  :root {
    /* Replace every value below with choices made for THIS project. */

    /* Color roles */
    --color-bg: #fafaf7;
    --color-bg-subtle: #f1f1ec;
    --color-surface: #ffffff;
    --color-inverse-bg: #14181f;
    --color-text: #15181d;
    --color-text-muted: #5b616b;
    --color-text-inverse: #f3f4f6;
    --color-border: #e1e2dc;
    --color-border-strong: #c9cbc3;
    --color-accent: #1f4eff;
    --color-accent-hover: #173ccc;
    --color-accent-contrast: #ffffff;
    --color-focus: #1f4eff;

    /* Type */
    --font-display: "YOUR DISPLAY FONT", Georgia, serif;
    --font-body: "YOUR BODY FONT", system-ui, sans-serif;
    --font-mono: "YOUR MONO FONT", ui-monospace, monospace;

    --text-sm: clamp(0.875rem, 0.85rem + 0.12vw, 0.9375rem);
    --text-base: clamp(1rem, 0.96rem + 0.2vw, 1.125rem);
    --text-xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
    --text-2xl: clamp(2rem, 1.6rem + 2vw, 3.25rem);
    --text-3xl: clamp(2.75rem, 2rem + 4vw, 5.5rem);
    --text-hero: clamp(3.5rem, 2rem + 8vw, 9rem);

    --leading-tight: 1.02;
    --leading-snug: 1.2;
    --leading-body: 1.6;
    --tracking-display: -0.035em;
    --tracking-small: 0.01em;
    --measure: 65ch;

    /* Space */
    --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
    --space-5: 24px;  --space-6: 32px;  --space-7: 48px;  --space-8: 64px;
    --space-9: 96px;  --space-10: 128px; --space-11: 192px;
    --section-y: clamp(64px, 10vw, 160px);
    --gutter: clamp(16px, 4vw, 48px);
    --container: 1280px;

    /* Shape and depth */
    --radius-sm: 4px;
    --radius-md: 10px;
    --radius-lg: 20px;
    --radius-pill: 999px;
    --shadow-raised: 0 1px 2px rgb(20 24 31 / .06), 0 8px 24px -8px rgb(20 24 31 / .12);
    --shadow-overlay: 0 2px 4px rgb(20 24 31 / .08), 0 24px 56px -16px rgb(20 24 31 / .22);

    /* Motion */
    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
    --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
    --dur-fast: 150ms;
    --dur-base: 250ms;
    --dur-slow: 500ms;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --color-bg: #0f1218;
      --color-bg-subtle: #151922;
      --color-surface: #1a1f2a;
      --color-text: #eceef2;
      --color-text-muted: #9aa1ad;
      --color-border: #272d3a;
      --color-border-strong: #384050;
      --color-accent: #6b8bff;
      --color-accent-hover: #86a0ff;
      --color-accent-contrast: #0b0f1a;
    }
  }
}

@layer base {
  html { color-scheme: light dark; scroll-padding-top: 5rem; }
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font: var(--text-base) / var(--leading-body) var(--font-body);
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3 { font-family: var(--font-display); line-height: var(--leading-tight); letter-spacing: var(--tracking-display); text-wrap: balance; }
  p { max-width: var(--measure); text-wrap: pretty; }
  :focus-visible { outline: 2px solid var(--color-focus); outline-offset: 3px; border-radius: 2px; }
  ::selection { background: var(--color-accent); color: var(--color-accent-contrast); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

---

## Appendix B: Design Plan Template

```markdown
# Design Plan: [Project]

**Subject:** [one concrete sentence]
**Audience:** [specific]
**Primary job:** [one action]
**Tone (3 adjectives):** 
**References:** 

## Concept
[One sentence naming the direction and why it fits this subject]

## Color (named hex)
- Name: #hex, role
- ...

## Type
- Display: [font], role
- Body: [font], role
- Scale: [sizes]

## Layout
[One-sentence concept. Alignment: left/center/justified, and why.]

```
[ASCII wireframe, hero]
[ASCII wireframe, key section]
```

## The one memorable move
[...]

## Principles
1. 
2. 
3. 

## Plan review
- Default I caught: 
- What I changed and why: 
```

---

## Appendix C: Pattern Reference

**Apple-style (product-cinematic)**
- One message per viewport; headline 80 to 144px, tight tracking, short declarative copy.
- Product imagery or video is the content; the interface recedes.
- Pinned scroll sections that morph the product as the user scrolls.
- Alternating dark and light chapters create rhythm; color is restrained and the product supplies the color.
- Generous whitespace; sparse navigation; a single obvious call to action.

**Stripe-style (technical-precise)**
- The product UI, code samples, and real data are the illustrations.
- A strict grid with hairline borders; dense but perfectly organized information.
- One signature gradient or mesh used in a single place as brand identity.
- Layered subtle shadows; micro-interactions on controls; animated code and UI demos.
- Tight type scale, custom typeface, small precise labels, confident but plain copy.

**Linear / Vercel-style (tool-craft)**
- Dark-first surfaces with careful elevation steps and one accent.
- Keyboard-first cues and visible shortcuts as design elements.
- Fast, crisp, short-duration motion; no decorative animation.
- Changelog, docs, and product detail treated as first-class design surfaces.

**Editorial**
- Strong type pairing, asymmetric columns, captions, pull quotes, deliberate cropping.
- Generous margins and a clear reading rhythm; images get as much thought as text.

Apply the *principles* behind these patterns. Do not copy their layouts, assets, or brand identities.