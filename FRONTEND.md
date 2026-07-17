# Stories Frontend — Interview Study Guide

**Purpose:** A **read-to-answer** guide for interviews about **`stories-frontend`**: how the Next.js app is structured, how auth and data fetching work, and how it connects to the Spring backend (`stories-app`). Use the **Table of contents** to jump before a call.

---

## Table of contents

1. [Elevator pitch](#1-elevator-pitch)  
2. [Stack and why each library](#2-stack-and-why-each-library)  
3. [App Router pages and layouts](#3-app-router-pages-and-layouts)  
4. [Server vs client components (where it matters here)](#4-server-vs-client-components-where-it-matters-here)  
5. [How the browser reaches the API (proxy vs direct)](#5-how-the-browser-reaches-the-api-proxy-vs-direct)  
6. [Authentication: storage, bootstrap, guards, 401](#6-authentication-storage-bootstrap-guards-401)  
7. [State: Zustand stores explained](#7-state-zustand-stores-explained)  
8. [Data fetching: services + React Query](#8-data-fetching-services--react-query)  
9. [Feature deep dives: feed, story, editor, dashboard, admin](#9-feature-deep-dives-feed-story-editor-dashboard-admin)  
10. [Aesop / short stories and hybrid `[id]` routing](#10-aesop--short-stories-and-hybrid-id-routing)  
11. [Text-to-speech (listen) flow](#11-text-to-speech-listen-flow)  
12. [Styling and design system](#12-styling-and-design-system)  
13. [Errors, toasts, forms](#13-errors-toasts-forms)  
14. [Honest limitations and improvements](#14-honest-limitations-and-improvements)  
15. [Interview Q&A bank](#15-interview-qa-bank)  
16. [File map](#16-file-map)  

---

## 1. Elevator pitch

**30-second:**  
“It’s a **Next.js App Router** app in **React 19** with **TypeScript**. The UI is **Tailwind**-based with an editorial design. Auth uses **JWT** in **`localStorage`** plus a **persisted user** in **Zustand**; on load we **bootstrap** the session by calling **`/auth/me`**. Data goes through a shared **Axios** client—by default **`/api`** on the same origin is **rewritten** to the Spring backend so we skip CORS in dev. Lists use **TanStack Query** infinite queries for pagination. Protected routes like **dashboard**, **editor**, and **admin** use **client guards** that wait for bootstrap, then redirect if unauthenticated.”

**2-minute:**  
Add: “**Story pages** support both **numeric IDs** (our Spring stories) and **24-char hex ids** (Aesop fables from a **Next.js route handler** that proxies an external API). The **editor** uses **react-hook-form** and **zod**, a custom **rich markdown** surface, draft autosave via **`PATCH .../draft`**, and publish flow. **Likes and bookmarks** call REST endpoints; bookmarks also keep a **client-side id set** for instant UI and sync from server on bootstrap. **Admin** is gated by **`user.role === 'ADMIN'`** in the UI—the real enforcement is on the backend.”

---

## 2. Stack and why each library

| Library | Role | Interview one-liner |
|---------|------|---------------------|
| **Next.js 16** | App Router, layouts, route handlers | “File-based routing, nested layouts, can run server code in `route.ts`.” |
| **React 19** | UI | “Concurrent features; I use client components where hooks/state are needed.” |
| **TypeScript** | Types | “Safer refactors; DTO-shaped types in `types/index.ts`.” |
| **Tailwind 4** | Utility CSS | “Fast iteration; design tokens in `globals.css`.” |
| **react-hook-form** | Forms | “Uncontrolled-by-default perf; less rerenders on keystrokes.” |
| **zod** | Schemas | “Single source of truth for client validation with RHF resolver.” |
| **TanStack Query** | Server cache | “Stale times, retries, infinite queries for feeds.” |
| **Axios** | HTTP | “Interceptors for JWT + global 401 handling.” |
| **Zustand** | Global client state | “Small API; persist middleware for user/bookmarks.” |
| **Sonner** | Toasts | “Non-blocking feedback.” |
| **marked / react-markdown / Turndown** | Markdown | “Render story content; editor converts DOM/markdown.” |
| **lucide-react** | Icons | |
| **lottie-react** | Hero animation | |

---

## 3. App Router pages and layouts

### Root layout (`app/layout.tsx`)

- Loads **Google fonts**, sets **`lang`**, wraps everything in **`AppProviders`**.  
- Renders **Navbar** (sticky), **children**, **Footer**.  
- **Metadata:** title and description for SEO defaults.

### Main routes

| Path | What the user sees | Protection |
|------|-------------------|------------|
| `/` | `EditorialHome` + compact **`HomeFeed`** | Public |
| `/stories` | Full feed (`StoriesBrowseView` / `HomeFeed`) | Public |
| `/short-stories` | Aesop list | Public |
| `/story/[id]` | Spring story **or** Aesop fable **or** not found | Public |
| `/login`, `/register` | Auth screens | Public |
| `/dashboard` | Editorial studio | **`AuthGuard`** in `dashboard/layout.tsx` |
| `/editor` | Full-screen writer | **`AuthGuard`** + `EditorViewportShell` in `editor/layout.tsx` |
| `/admin` | Admin dashboard | **`AdminGuard`** in `admin/layout.tsx` |

### Route handlers

- **`GET /api/aesop/stories`** (`app/api/aesop/stories/route.ts`) — server **fetch** to upstream **`${BASE}/stories`**, **`revalidate: 3600`**. **Env:** `SHORT_STORIES_API_URL` or `NEXT_PUBLIC_SHORT_STORIES_API_URL` = **base URL without `/stories`**.

### Layout shells

- **`EditorViewportShell`**: editor uses **viewport height** and avoids double navbar issues (spacer in layout).  
- **`AdminViewportShell`**: admin-specific chrome.  
- **Auth fullscreen shell** on login/register pages for centered layouts.

---

## 4. Server vs client components (where it matters here)

- **`"use client"`** appears on interactive modules: providers, guards, feed, story page, editor, dashboard, admin UI.  
- **Root `layout.tsx`** is a **server** component (no directive); it **imports** client **`AppProviders`**.  
- **Rule of thumb:** If you need **`useState`**, **`useEffect`**, browser APIs, Zustand, or React Query → **client component**.  
- **Route Handler** (`route.ts`) is always **server** — good place to hide API keys from the bundle (Aesop base URL is server-side; browser only calls **`/api/aesop/stories`**).

**Interview angle:** “I don’t overuse server components for the main app shell because most pages are interactive; I still use the server for the **Aesop proxy** and caching.”

---

## 5. How the browser reaches the API (proxy vs direct)

**`resolveApiBaseURL()` in `src/services/api.ts`:**

1. **`NEXT_PUBLIC_API_URL`** set → Axios uses that **absolute** URL (e.g. `http://localhost:8080`). **CORS** must allow the frontend origin on Spring.  
2. Else **in browser** → base URL is **`/api`**.  
3. **On server** (no window) → **`STORIES_API_INTERNAL_URL`** or default `http://127.0.0.1:8080`.

**`next.config.ts` rewrites:**

```text
source:    /api/:path*
dest:      ${STORIES_API_PROXY_TARGET}/:path*
default:   http://127.0.0.1:8080
```

So **`/api/auth/login`** becomes **`http://127.0.0.1:8080/auth/login`** — the **`api`** segment is **not** forwarded; the backend paths stay **`/auth/*`, `/stories/*`**, etc.

**Why this matters in interviews:** “Same-origin requests to **`/api`** avoid browser CORS preflight complexity in development; in production you might terminate TLS on the same domain or use a **BFF**.”

**Axios instance:** JSON headers, **30s timeout**, **request** interceptor adds **`Authorization: Bearer`** if token exists.

---

## 6. Authentication: storage, bootstrap, guards, 401

### Two storage locations

| Key | What | Why |
|-----|------|-----|
| **`localStorage['stories_jwt']`** | Raw JWT string | Sent on every API request. |
| **`localStorage['stories-auth-user']`** (via Zustand persist) | **`user`** object only | UI (name, role, id); **token intentionally not duplicated** in persist config (`partialize`). |

**`setAuth(user, token)`** updates both memory and `localStorage` for token + persisted user.

### Bootstrap sequence (`useAuthBootstrap`)

Runs under **`AppProviders`** and sets **`AuthReadyProvider.ready`**.

1. If **no JWT** but **persisted user** → clear user (stale profile after logout/tab weirdness).  
2. If **JWT exists** → **`fetchMe()`** (validate token + refresh profile).  
3. Success → optionally **`listBookmarkedStories()`** → **`bookmarkStore.syncFromServer`**.  
4. Failure → **`clearAuth`**, clear bookmark ids.  
5. Subscribes to **`stories:auth:logout`** (custom event) to clear state when interceptor fires.

**Why `ready` exists:** Zustand **rehydration** from `localStorage` is async relative to first paint. **`AuthGuard`** waits for **`ready === true`** before deciding redirect — avoids flashing protected content or wrong redirects.

### `fetchMe`

- **`GET /auth/me`**; on **404** retries **`GET /users/me`** (defensive compatibility).  
- Backend normally returns **200** for valid token on both if implemented.

### Login vs register

- **Login:** `setAuth` → **`window.location.assign(next)`** with `?next=` return path (default `/`). Full navigation **clears React state** issues and reloads with fresh server/client boundary if needed.  
- **Register:** stricter **zod** rules than backend (letter + number); redirect **`/dashboard`**.

### 401 interceptor

- On **401** outside **`/login`** and **`/register`**: clear token, dispatch **`stories:auth:logout`**, redirect **`/login?next=currentPath`**.  
- Ensures expired JWT doesn’t leave the UI thinking you’re logged in.

### `AuthGuard` / `AdminGuard`

- **`AuthGuard`:** if after `ready` there’s no token or no user → **`router.replace('/login?next=...')`**; else render children.  
- **`AdminGuard`:** requires auth first; if **`user.role !== 'ADMIN'`** → **`/dashboard`**. **Not security** — backend **`403`** protects real admin APIs.

### Logout (`Navbar`)

- **`clearAuth()`** + **`window.location.href = '/'`**.

---

## 7. State: Zustand stores explained

### `authStore`

- **`user`**, **`setAuth`**, **`clearAuth`**, **`setUser`**.  
- **`setUser`** used after **`fetchMe`** to sync profile without re-setting token.

### `bookmarkStore`

- **`ids: string[]`**, **`has`**, **`toggle`**, **`syncFromServer`**.  
- **Optimistic UX:** on bookmark click, call API then **`toggle`**; on failure, **`toggle`** back + toast.  
- **Hydration:** after login, server list overwrites local **`ids`**.

### `legalModalStore`

- Opens privacy/terms modals (register + global **`LegalDocumentModals`** in providers).

---

## 8. Data fetching: services + React Query

### Service modules (Axios)

- **`auth.service.ts`** — login, register, fetchMe.  
- **`stories.service.ts`** — published/trending lists, CRUD, publish, draft, like/unlike, my stories (with **`/users/me/stories`** fallback on 404), **`normalizePaginated`**.  
- **`bookmarks.service.ts`** — bookmark/unbookmark, list server bookmarks.  
- **`comments.service.ts`** — add/delete.  
- **`admin.service.ts`** — admin lists/deletes; flexible delete tries admin then user delete.  
- **`tts.service.ts`** — narrate POST.  
- **`aesop-stories.service.ts`** — **`fetch`** to **`/api/aesop/stories`** (not Axios) — **no JWT** to Spring for fables.

### React Query (`QueryProvider`)

Defaults: **`staleTime` 60s**, **`gcTime` 5m**, **retry 1**, **refetch on window focus**.

**`HomeFeed` + `useInfiniteQuery`:**

- Query key **`['stories','feed', sort]`** — separates **latest** vs **likes** cache.  
- **`queryFn`**: page param → **`listPublishedStories`** or **`listTrendingStories`**.  
- **`getNextPageParam`**: uses **`totalPages`** or derives from **`total`** / **`pageSize`**.  
- **`keepPreviousData`** as **`placeholderData`** when toggling sort — avoids full skeleton flash.

**Interview line:** “Infinite scroll **flattens `data.pages`** into rows; a **sentinel div** + **`IntersectionObserver`** calls **`fetchNextPage`** when the user nears the bottom (non-compact mode).”

---

## 9. Feature deep dives: feed, story, editor, dashboard, admin

### Feed (`HomeFeed`, `StoriesBrowseView`)

- **Compact** mode: fewer items, no infinite scroll emphasis.  
- Cards: excerpt, read time estimate, like/bookmark actions.  
- **Skeleton** loading states.

### Story page (`app/story/[id]/page.tsx`)

- **Resolution order:** if id matches **Mongo ObjectId regex** → Aesop path first; else try **`getStory(id)`**; on failure try Aesop.  
- **PublishedStoryView:** markdown body, hero image, like/share/bookmark, **comments** form (RHF + zod, max **2000** chars client vs **5000** server), **listen** button (auth-gated for playback).  
- **Related stories:** Spring list for numeric ids; Aesop list for fables.

### Editor (`EditorPageClient.tsx`)

- **`?id=`** loads existing story; requires auth + backend visibility for **drafts**.  
- **Dirty detection:** compares title/content/bgimg to last saved snapshot.  
- **`beforeunload`** if dirty; **captures clicks** on internal links to show **save modal**.  
- **Save draft:** `createStory` if no id → **`router.replace` with id**; else **`saveDraftFlexible`**.  
- **Publish:** create if needed → **`updateStory`** as DRAFT then **`publishStory`**; fallback **`updateStory`** with **PUBLISHED**; hard nav to **`/story/id`**.  
- **Tags** in UI are **not persisted** to API (explicit limitation).  
- **Cover:** Picsum-based picker → **`bgimg`**.

### Dashboard

- Parallel fetch: **`listMyStories`**, **`listBookmarkedStories`**.  
- Tabs include **Liked** placeholder explaining **no backend endpoint** for “my liked stories” list.  
- Stats computed from **my published** stories.  
- Delete story → confirm modal → **`deleteStory`**.

### Admin (`AdminDashboard.tsx`)

- Loads users, stats, story rows, comment rows.  
- Deletes with **`window.confirm`**; toggles **email notifications** — **localStorage only**, not wired to backend.  
- **`looksSpam`** only affects **styling**.

---

## 10. Aesop / short stories and hybrid `[id]` routing

- **`isAesopMongoId`:** `/^[a-f\d]{24}$/i`.  
- **`fetchAesopStories`:** client calls **same-origin** `/api/aesop/stories`.  
- **`fetchAesopStoryById`:** fetches **all** stories client-side and **finds by id** — OK for small public dataset but **O(n)**; acceptable for demo, not for huge catalogs (you’d add **`/stories/:id`** upstream or server filter).

**Edge case:** A Spring numeric id that **looks like** 24 hex is **extremely unlikely** with bigint IDs; if it happened, **`isAesopMongoId` would route to Aesop first** — mention as hypothetical.

---

## 11. Text-to-speech (listen) flow

**`useStoryNarration`:**

- Requires **`user`** to **request** audio and open modal (product choice).  
- **`POST /stories/:id/narrate`** with options (`hl`, `voice`, `rate`, `codec`).  
- Response **`audioBase64`** → **`data:audio/mpeg;base64,...`** → **`new Audio(url)`**.  
- Tracks **play/pause**, **time update**, **seek** via range input.  
- Cleanup: pause on unmount.

**Interview:** “Audio never touches a separate CDN in this flow—it’s **inline data URL** from backend-processed base64.”

---

## 12. Styling and design system

- **`globals.css`**: CSS variables (surfaces, primary, radii, shadows) — **editorial** look.  
- **`cn()`** (`lib/cn.ts`): **`clsx` + `tailwind-merge`** for conditional classes without conflicts.  
- **`lib/design.ts`**: shared constants if present.  
- **Fonts:** headline vs body utility classes (`font-headline`, `font-login-body`, etc.).

---

## 13. Errors, toasts, forms

- **`getApiErrorMessage`**: normalizes Spring **`ErrorResponse`** (`message`, `details[]`, `error`).  
- **Sonner** for success/error toasts globally via **`AppProviders`**.  
- **Forms:** zod schema + `zodResolver`; display field errors under inputs.

---

## 14. Honest limitations and improvements

1. **JWT in localStorage** — **XSS** risk; **httpOnly cookies** + CSRF strategy for higher threat models.  
2. **401 `handling401` flag** — doesn’t meaningfully debounce parallel 401s (minor).  
3. **`fetchAesopStoryById`** loads full list — replace with **paginated or id-specific** API when scale grows.  
4. **Admin / role** — never trust UI; backend already enforces.  
5. **Type drift:** add **`username`** to **`User`** type if UI needs it.  
6. **Tests:** component + E2E tests for auth and editor flows.  
7. **i18n / a11y** — expand aria and keyboard paths over time.

---

## 15. Interview Q&A bank

**Q: How does auth work in your frontend?**  
A: “On login/register I store a JWT in **`localStorage`** and the user profile in **Zustand** (persisted). Axios attaches **`Authorization: Bearer`**. On app load, **`useAuthBootstrap`** calls **`/auth/me`**; if that fails I clear token and user. A **response interceptor** on 401 redirects to login with **`next`**. Protected layouts use **`AuthGuard`** that waits until bootstrap **`ready`** before redirecting.”

**Q: Why both Zustand and React Query?**  
A: “**React Query** caches **server** data with staleness and pagination. **Zustand** holds **client session identity** and **bookmark ids** for optimistic UI and persistence across refreshes.”

**Q: Why Next.js rewrite to `/api`?**  
A: “The browser calls **same origin** `/api/...`; Next rewrites to the Java server so I don’t need **CORS** configuration during local dev when the UI is on port 3000 and API on 8080.”

**Q: How do infinite queries work?**  
A: “**`useInfiniteQuery`** with a **`pageParam`**. Each page fetch returns **`PaginatedStories`**. **`getNextPageParam`** stops when **`page >= totalPages`**. The UI flattens **`data.pages` into rows**.”

**Q: How would you handle token refresh?**  
A: “Not implemented here; I’d add **refresh token** in **httpOnly cookie** or secure storage, **silent refresh** before expiry, and retry failed requests once after refresh.”

**Q: What’s the hybrid story page?**  
A: “One dynamic route **`/story/[id]`** serves **our Spring-backed stories** and **external Aesop fables** based on id shape and fallback fetch strategy. Fables go through a **Next route handler** to avoid exposing upstream details and to add caching.”

**Q: Why `window.location` after login?**  
A: “Full navigation ensures a clean state and reloads any server/client boundaries; **`router.push`** would also work but hard assignment is simple and avoids stale provider edge cases in this app.”

**Q: How do you handle validation?**  
A: “**Zod** at the client for immediate feedback; the **server** validates again with Bean Validation — never trust client-only validation.”

**Q: What is `AuthReadyProvider`?**  
A: “A tiny context boolean from bootstrap completion so guards don’t redirect before **persist rehydration** and **`fetchMe`** finish—prevents flicker and wrong routes.”

---

## 16. File map

| Concern | Path |
|--------|------|
| Axios, token, 401 | `src/services/api.ts` |
| Auth calls | `src/services/auth.service.ts` |
| Bootstrap | `src/hooks/useAuthBootstrap.ts` |
| Guards | `src/components/auth/AuthGuard.tsx`, `AdminGuard.tsx` |
| Auth ready context | `src/components/providers/auth-ready-context.tsx` |
| Providers | `src/components/providers/app-providers.tsx`, `query-provider.tsx` |
| Stores | `src/store/authStore.ts`, `bookmarkStore.ts`, `legalModalStore.ts` |
| Feed | `src/features/feed/HomeFeed.tsx`, `StoriesBrowseView.tsx` |
| Story page | `src/app/story/[id]/page.tsx`, `features/story/*` |
| Editor | `src/app/editor/EditorPageClient.tsx`, `components/editor/*` |
| Dashboard / Admin | `src/app/dashboard/page.tsx`, `src/features/admin/AdminDashboard.tsx` |
| Aesop | `src/app/api/aesop/stories/route.ts`, `src/services/aesop-stories.service.ts` |
| Rewrites | `next.config.ts` |
| Types | `src/types/index.ts` |

---

*Update this doc when routes, env vars, or auth flow change.*
