---
timestamp: 2026-08-25T16-49-25Z
slug: frontend-src-components-header-tsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No active route indicator (`navLinkActive` never applied); current page is indistinguishable |
| 2 | Match System / Real World | 4 | Clear Portuguese labels (*Eventos*, *Meus Ingressos*, *Portaria*, *Meu Perfil*) |
| 3 | User Control and Freedom | 3 | Easy navigation access, but city picker and profile menus feel disconnected |
| 4 | Consistency and Standards | 2 | Navigation links use monospace (`JetBrains Mono`) instead of standard UI typography; inline CSS in JSX |
| 5 | Error Prevention | 4 | Safe links and straightforward auth state separation |
| 6 | Recognition Rather Than Recall | 3 | Logo and main actions visible, but logo icon is an empty span |
| 7 | Flexibility and Efficiency | 2 | Total absence of a mobile responsive drawer/hamburger menu (breaks on screens < 900px) |
| 8 | Aesthetic and Minimalist Design | 3 | Translucent glass header looks good, but right side is crowded with too many separate controls |
| 9 | Error Recovery | 3 | Login and logout transitions are direct and clear |
| 10 | Help and Documentation | n/a | Global app shell / navigation header (n/a per mode rules) |
| **Total** | | **22/36** | **Acceptable (61%)** |

#### Design Specificity Verdict

**LLM Assessment:**
The top navbar (`Header.tsx`) establishes a clean glassmorphic banner (`backdrop-filter: blur(12px)`) with role-based access links. However, it suffers from three structural flaws: (1) **Monospace font as a costume for links** rather than crisp architectural sans-serif, (2) **Lack of active route highlighting** (users don't know which tab is active), and (3) **Complete lack of mobile responsiveness** (on phones and tablets, the navbar overflows horizontally with 8+ inline buttons crammed together).

**Deterministic Scan:**
Automated scan (`detect.mjs`) returned **0 anti-pattern findings** on `frontend/src/components/Header.tsx`.

#### Overall Impression
A sleek dark glass navbar on wide desktop screens, but crowded and fragile on mobile/tablet devices. Streamlining the user menu into a cohesive profile dropdown and adding active link indicators + mobile drawer will elevate the navigation to a world-class standard.

#### What's Working
1. **Glassmorphism Backdrop:** `backdrop-filter: blur(12px)` maintains readability over scrolling posters and vibrant banners.
2. **Role-Based Dynamic Links:** Clean rendering of role-specific destinations (`CLIENT`, `ORGANIZER`, `SUPER_ADMIN`, `PORTARIA`).
3. **Integrated Quick Tools:** Instant access to City Selector and Global Search Modal.

#### Priority Issues

- **[P1] Missing Mobile Navigation Menu (Responsive Overflow)**
  - *Why it matters:* On smartphones (< 768px), navigation links, search, city picker, theme toggle, and user profile collide and overflow horizontally off-screen.
  - *Fix:* Implement a sleek mobile hamburger trigger with a slide-out glass drawer containing links, city switcher, and user options.
  - *Suggested command:* `/impeccable adapt` or `/impeccable layout`

- **[P2] Active Route Indicator & Monospace Typography Misuse**
  - *Why it matters:* Nav links use `JetBrains Mono` (`0.75rem`), making links feel like terminal code rather than a premium ticketing brand, and there is no visual indicator showing which page the user is currently on.
  - *Fix:* Switch nav typography to `Plus Jakarta Sans` / `Space Grotesk` (0.9rem, 600 weight) with an active neon sapphire pill indicator (`usePathname()`).
  - *Suggested command:* `/impeccable typeset` or `/impeccable polish`

- **[P3] Crowded Action Bar on Right Side**
  - *Why it matters:* Search, City, Theme Toggle, Avatar, User Greeting, and Logout button are all loose individual items lined up in a row.
  - *Fix:* Unify user avatar + name + logout into a sleek cohesive User Profile Dropdown Menu, creating breathing room for Search and City.
  - *Suggested command:* `/impeccable distill` or `/impeccable delight`

#### Persona Red Flags

- **Casey (Mobile User):** Cannot tap navigation links on a smartphone because the header items overflow horizontally and touch targets are too tight.
- **Jordan (First-Timer):** Cannot tell which page is currently active because links have no active pill/underline highlight.
- **Alex (Power User):** Expects a streamlined profile dropdown with quick keyboard access rather than disjointed avatar links and loose logout buttons.

#### Minor Observations
- The `<span className={styles.logoIcon}></span>` tag in `Header.tsx` is completely empty. It should contain an SVG ticket/flame icon or be removed.
- User profile image uses raw `<img>` instead of Next.js `<Image>` with fallback initials avatar.
