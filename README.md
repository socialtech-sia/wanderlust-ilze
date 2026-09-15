# wanderlust

# LOVABLE PROMPT: wanderlust.lv

> **Project**: Multilingual tourism website for a certified guide (excursions, hiking, private transfers) in the Gauja region, Latvia.
> **Client**: Ilze Gulbe, sertificēta gide (SIA "Creatus Real Estate")
> **Contractor**: social.tech SIA
> **Grant**: Enter Gauja project Nr. 1.2.3.6/2/24/A/008
> **Design philosophy**: warm, natural, editorial. Not corporate. Think travel magazine × forest atmosphere.
> **Target user**: international tourist (EN/ES) planning a trip to Sigulda/Cēsis/Līgatne region + local Latvians (LV) seeking guided experiences.

---

## 0. CRITICAL ARCHITECTURE NOTE — Migration-safe

This project will later migrate from Lovable/managed-Supabase to self-hosted Supabase on Hetzner. **DO NOT introduce any Lovable-specific dependencies.** Follow strictly:

- **Environment config**: all Supabase URLs/keys in `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Never hardcode.
- **SQL migrations**: keep every schema change as a SQL file in `supabase/migrations/`. This is our source of truth for later `psql < migration.sql` on Hetzner.
- **Storage**: use standard Supabase JS SDK (`supabase.storage.from(...)`). Never rely on Lovable's CDN URL structure. Store `storage_path` (relative), compute public URL at query-time via `getPublicUrl()`.
- **Edge Functions**: write in Deno TypeScript, standard Supabase Edge Functions format (portable to self-hosted).
- **Auth**: single admin user (Ilze), standard email+password Supabase Auth. NO magic links, NO OAuth — those depend on Lovable's SMTP config.
- **Frontend**: standard React 18 + Vite + TypeScript + Tailwind. No Lovable-only components.

---

## 1. TECH STACK

**Frontend**
- React 18 + TypeScript + Vite
- React Router v6 (with language-prefixed routes)
- Tailwind CSS + shadcn/ui
- react-i18next for i18n
- react-hook-form + zod for forms
- @tanstack/react-query for server state
- lucide-react for icons

**Backend (Supabase)**
- PostgreSQL 15
- Auth (email+password, single admin user)
- Storage (public bucket for media)
- Real-time subscriptions (for admin booking notifications)
- Edge Functions (Deno TS) for: booking notifications, AI chatbot, contact form

**Third-party**
- Resend (transactional email) — API key in Edge Function env
- Anthropic Claude API (AI chatbot) — API key provided by client, stored in Edge Function env

---

## 2. DESIGN SYSTEM

**Brand feel**: editorial travel magazine × natural Latvia. Not techy, not corporate.

**Colors (Tailwind extended palette)**
```
Primary (Gauja moss/forest)
  moss-50:  #F4F7F0
  moss-100: #E5ECDD
  moss-500: #6B8E4E   ← accent
  moss-700: #4A6B37
  moss-900: #2C4020

Secondary (river/sky)
  river-50:  #EDF4F7
  river-500: #4A8BA8
  river-700: #305D71

Neutral (paper/ink)
  paper:     #FAF7F2   ← default page bg
  paper-alt: #F0EBE0
  ink-800:   #2B2620   ← body text
  ink-500:   #5C5347   ← muted text
  ink-300:   #A69C8B   ← borders/dividers

Enter Gauja category colors
  action:  #D97757   (terracotta)
  nature:  #6B8E4E   (moss)
  history: #A67C52   (bronze)
  culture: #7B6BA8   (dusk purple)
```

**Typography**
- Headings: `Fraunces` (serif, editorial) — Google Font
- Body: `Inter` (sans, readable) — Google Font
- Accent/labels: `Fraunces` italic

**Spacing/layout**
- Generous whitespace, editorial feel
- Container max-width: 1280px, but hero images can be full-width
- Border radius: 4px (subtle), 24px (large cards/hero corners)
- Photography-heavy: at least 60% of any page should be images

**Component vibe references**
- Airbnb (booking flow simplicity)
- Aesop (editorial spacing, serif headings)
- National Geographic (nature imagery, category badges)

---

## 3. DATABASE SCHEMA

All tables in `public` schema. Every content table has `_lv`, `_en`, `_es` columns for translated fields (NOT separate translation tables — simpler for CMS and migration).

### 3.1 `profile` (single row: Ilze)
```sql
create table public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_lv text, role_en text, role_es text,
  bio_lv text, bio_en text, bio_es text,
  short_bio_lv text, short_bio_en text, short_bio_es text,
  avatar_storage_path text,
  hero_image_storage_path text,
  phone text,
  email text,
  whatsapp text,
  languages_spoken text[] default array['lv','en','ru','es'],
  certifications jsonb default '[]'::jsonb,
  years_of_experience integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- Seed: single row for Ilze Gulbe
```

### 3.2 `services` (excursions + hiking + transfers, unified)
```sql
create type service_type as enum ('excursion', 'hiking', 'transfer');
create type service_difficulty as enum ('easy', 'medium', 'hard');
create type enter_gauja_category as enum ('action', 'nature', 'history', 'culture');

create table public.services (
  id uuid primary key default gen_random_uuid(),
  type service_type not null,

  -- URL slugs (unique per language)
  slug_lv text unique,
  slug_en text unique,
  slug_es text unique,

  -- Titles & descriptions
  title_lv text not null,
  title_en text,
  title_es text,
  short_description_lv text,
  short_description_en text,
  short_description_es text,
  description_lv text,   -- markdown
  description_en text,
  description_es text,

  -- Meta
  duration_minutes integer,       -- 180, 240, 480 etc.
  price_from_eur numeric(10,2),
  price_per_person boolean default false,
  max_persons integer,
  min_persons integer default 1,

  -- Categorization
  enter_gauja_categories enter_gauja_category[] default '{}',
  difficulty service_difficulty,   -- only for hiking
  location_name text,              -- 'Sigulda', 'Cēsis', 'Līgatne', 'GNP', etc.
  location_geo point,              -- for map display

  -- Transfer-specific
  transfer_from text,
  transfer_to text,
  vehicle_info text,               -- 'Volvo XC60, 1–4 personas'

  -- Media
  hero_image_storage_path text,
  gallery_image_ids uuid[] default '{}',   -- references media(id)

  -- SEO
  meta_title_lv text, meta_title_en text, meta_title_es text,
  meta_description_lv text, meta_description_en text, meta_description_es text,

  -- Publishing
  is_active boolean default true,
  sort_order integer default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index services_type_active_idx on services(type, is_active);
create index services_slug_lv_idx on services(slug_lv);
```

### 3.3 `media` (image library)
```sql
create table public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,          -- 'services/turaida-castle-hero.jpg'
  bucket text not null default 'public-media',
  mime_type text,
  width integer,
  height integer,
  file_size_bytes bigint,
  alt_lv text, alt_en text, alt_es text,
  caption_lv text, caption_en text, caption_es text,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);
```

### 3.4 `bookings`
```sql
create type booking_status as enum ('pending', 'confirmed', 'declined', 'completed', 'cancelled', 'no_show');
create type booking_language as enum ('lv', 'en', 'es');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference_code text unique not null default 'WND-' || upper(substring(gen_random_uuid()::text, 1, 6)),

  service_id uuid references services(id),
  service_snapshot jsonb,               -- freeze service data at booking time

  requested_date date not null,
  requested_time time,
  persons_count integer not null default 1,

  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_country text,
  customer_language booking_language default 'en',

  notes text,                            -- what the customer wrote

  status booking_status default 'pending',
  admin_notes text,                      -- internal, not visible to customer
  quoted_price_eur numeric(10,2),
  final_price_eur numeric(10,2),

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz
);
create index bookings_status_idx on bookings(status);
create index bookings_date_idx on bookings(requested_date);
```

### 3.5 `faq`
```sql
create table public.faq (
  id uuid primary key default gen_random_uuid(),
  question_lv text not null, question_en text, question_es text,
  answer_lv text not null, answer_en text, answer_es text,
  category text,           -- 'booking', 'pricing', 'safety', 'weather', 'general'
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
```

### 3.6 `blog_posts` (infrastructure ready; use later)
```sql
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug_lv text unique, slug_en text unique, slug_es text unique,
  title_lv text, title_en text, title_es text,
  excerpt_lv text, excerpt_en text, excerpt_es text,
  content_lv text, content_en text, content_es text,  -- markdown
  featured_image_id uuid references media(id),
  tags text[] default '{}',
  meta_title_lv text, meta_title_en text, meta_title_es text,
  meta_description_lv text, meta_description_en text, meta_description_es text,
  status text default 'draft',   -- 'draft' | 'published'
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 3.7 `contact_messages`
```sql
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  language text,
  status text default 'new',   -- 'new' | 'read' | 'replied' | 'archived'
  created_at timestamptz default now()
);
```

### 3.8 `chat_conversations` + `chat_messages` (AI chatbot)
```sql
create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,          -- browser session, not authenticated
  language text default 'en',
  visitor_email text,                 -- optional, if user provides
  visitor_name text,
  started_at timestamptz default now(),
  last_message_at timestamptz default now(),
  message_count integer default 0
);
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references chat_conversations(id) on delete cascade,
  role text not null,                 -- 'user' | 'assistant'
  content text not null,
  tokens_used integer,
  created_at timestamptz default now()
);
create index chat_messages_conversation_idx on chat_messages(conversation_id, created_at);
```

### 3.9 `site_settings` (key-value for CMS)
```sql
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz default now()
);
-- Seed keys:
-- 'contact_email', 'contact_phone', 'contact_whatsapp'
-- 'social_facebook', 'social_instagram'
-- 'hero_headline_lv', 'hero_headline_en', 'hero_headline_es'
-- 'hero_subline_lv', 'hero_subline_en', 'hero_subline_es'
-- 'footer_text_lv', 'footer_text_en', 'footer_text_es'
-- 'privacy_policy_url', 'terms_url'
-- 'google_analytics_id', 'meta_pixel_id'
```

### 3.10 `enter_gauja_categories` (reference table)
```sql
create table public.enter_gauja_categories (
  key enter_gauja_category primary key,
  name_lv text, name_en text, name_es text,
  description_lv text, description_en text, description_es text,
  icon_name text,   -- lucide-react icon name
  color_hex text
);
-- Seed:
-- ('action', 'Piedzīvojums', 'Action', 'Aventura', ..., 'zap', '#D97757')
-- ('nature', 'Daba', 'Nature', 'Naturaleza', ..., 'trees', '#6B8E4E')
-- ('history', 'Vēsture', 'History', 'Historia', ..., 'landmark', '#A67C52')
-- ('culture', 'Kultūra', 'Culture', 'Cultura', ..., 'palette', '#7B6BA8')
```

---

## 4. ROW LEVEL SECURITY (RLS)

Enable RLS on **all** tables. Then:

**Public read** (SELECT):
- `services` WHERE `is_active = true`
- `faq` WHERE `is_active = true`
- `blog_posts` WHERE `status = 'published'`
- `media` (all)
- `profile` (single row)
- `site_settings` (all)
- `enter_gauja_categories` (all)

**Public insert**:
- `bookings` — anyone can create a booking (status auto-set to 'pending')
- `contact_messages` — anyone can submit
- `chat_conversations` + `chat_messages` — anyone can chat

**Authenticated (admin) only**:
- All INSERT/UPDATE/DELETE on content tables
- All SELECT on `bookings`, `contact_messages`, `chat_conversations`, `chat_messages` (admin sees all)

Example policy:
```sql
alter table services enable row level security;

create policy "services_public_read" on services
  for select using (is_active = true);

create policy "services_admin_all" on services
  for all using (auth.role() = 'authenticated');
```

---

## 5. STORAGE BUCKETS

**`public-media`** (public bucket)
- Path structure: `services/`, `profile/`, `blog/`, `hero/`
- Max file size: 10 MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`
- Public read via `getPublicUrl()`
- Upload only by authenticated (admin)

**`documents`** (private bucket, optional)
- For PDF documents (privacy policy, terms)
- Signed URLs for public access

---

## 6. ROUTES

### 6.1 Public routes (i18n prefix)

Default language redirect: `/` → `/lv/` (based on `navigator.language` or fallback LV)

```
/lv/                          # Sākumlapa
/en/                          # Home
/es/                          # Inicio

/lv/par-mani                  # Par mani (About)
/en/about
/es/sobre-mi

/lv/ekskursijas               # Excursions list
/en/tours
/es/excursiones

/lv/ekskursijas/:slug         # Excursion detail
/en/tours/:slug
/es/excursiones/:slug

/lv/pargajieni                # Hiking list
/en/hiking
/es/senderismo

/lv/pargajieni/:slug
/en/hiking/:slug
/es/senderismo/:slug

/lv/transferi                 # Transfers list
/en/transfers
/es/traslados

/lv/transferi/:slug
/en/transfers/:slug
/es/traslados/:slug

/lv/rezervacija               # Booking form (multi-step)
/en/booking
/es/reservas

/lv/rezervacija/apstiprinats/:reference  # Booking confirmation
/en/booking/confirmed/:reference
/es/reservas/confirmado/:reference

/lv/kontakti                  # Contact
/en/contact
/es/contacto

/lv/faq
/en/faq
/es/faq

/lv/blog                      # Blog list (empty initially, infrastructure ready)
/en/blog
/es/blog

/lv/blog/:slug
/en/blog/:slug
/es/blog/:slug

/lv/privatuma-politika        # Privacy policy
/en/privacy
/es/privacidad
```

### 6.2 Admin routes (auth required)

```
/admin/login
/admin                        # Dashboard: booking count, message count, quick stats
/admin/services               # List all (excursions/hiking/transfers)
/admin/services/new
/admin/services/:id           # Edit
/admin/bookings               # List, filter by status/date
/admin/bookings/:id           # Detail, change status, notes, send email to customer
/admin/messages               # Contact messages
/admin/faq
/admin/blog
/admin/media                  # Media library — upload, tag, reuse
/admin/chatbot                # AI conversations log + settings
/admin/settings               # Site settings (contact info, social, hero copy)
/admin/profile                # Ilze's profile edit
```

---

## 7. i18n SETUP

- Library: `react-i18next`
- Translations for UI strings in `src/i18n/lv.json`, `en.json`, `es.json`
- Content translations come from DB fields (`title_lv`, `title_en`, `title_es`)
- Helper hook: `useCurrentLanguage()` → returns `'lv' | 'en' | 'es'`
- Helper: `getField(entity, 'title')` → returns `entity[`title_${lang}`] || entity.title_lv` (fallback to LV)
- Language switcher in header: 3 short buttons `LV | EN | ES`
- `<html lang="{current}">` updates dynamically
- `hreflang` tags in `<head>` for every page (all 3 language versions)

---

## 8. KEY FEATURES

### 8.1 Home page (`/lv/`)
1. **Hero** — full-viewport image (Ilze in nature) + serif headline + language switcher + CTA "Rezervēt / Book now"
2. **About preview** — short bio, portrait, link to full About
3. **Service categories** — 3 large cards (Excursions, Hiking, Transfers) with hero image + short description + CTA
4. **Featured excursions** — 3 cards showing most popular services
5. **Enter Gauja categories** — 4 category tiles (Action, Nature, History, Culture) with icons
6. **Testimonials** (static for now, DB-ready later)
7. **Enter Gauja partnership block** — logo + "Enter Gauja sadarbības tīkla partneris" + link
8. **Newsletter** (infrastructure only, no send logic yet)
9. **Footer** with contact info, social links, language switcher, sitemap

### 8.2 Service detail page
- Hero image (large)
- Breadcrumbs: `Home > Excursions > {title}`
- Title (serif, large)
- Meta row: duration | max persons | price from | difficulty (if hiking) | location
- Enter Gauja category badges
- Rich description (markdown)
- Gallery (grid, lightbox)
- Map (Leaflet + OpenStreetMap tiles, marker at `location_geo`)
- **Sticky booking card** (desktop right column, bottom sheet on mobile) with:
  - Date picker
  - Persons count
  - Estimated price
  - "Book now" CTA → jumps to booking form pre-filled
- FAQ specific to this service (if we tag them by service_id later — future)
- Related services (3 cards)

### 8.3 Booking flow (multi-step)

Step 1: **Service** (skipped if arrived from service detail)
- Choose type: Excursion / Hiking / Transfer
- Choose specific service from list

Step 2: **Date & persons**
- Calendar (react-day-picker)
- Time slot (if applicable)
- Persons count with `+/-` controls
- Show estimated price

Step 3: **Contact info**
- Name, email, phone (required)
- Country, preferred language
- Notes textarea

Step 4: **Review & submit**
- Summary of everything
- Terms checkbox
- Submit → creates `bookings` row with `status = 'pending'`
- Trigger Edge Function `send-booking-notification`:
  - Email to Ilze (new booking alert with all details)
  - Email to customer (confirmation "we received your request, will reply within 24h")
- Redirect to `/booking/confirmed/{reference_code}`

Step 5: **Confirmation page**
- Reference code prominent
- "Save this code" message
- What happens next: "Ilze will contact you within 24h to confirm"
- Add to calendar link (`.ics` download)
- Share buttons

### 8.4 AI chatbot (floating widget)

- Persistent floating button (bottom-right)
- Opens as slide-up panel (mobile: full-screen)
- Language matches current UI language
- Uses Anthropic Claude API via Edge Function `chat-with-ai`
- Edge Function receives session_id → fetches conversation history → sends to Claude with system prompt
- **System prompt (embedded in Edge Function)**:
  ```
  You are a friendly, knowledgeable assistant for wanderlust.lv, the website of Ilze Gulbe,
  a certified tour guide in the Gauja region of Latvia.

  You help visitors:
  - Learn about excursions, hiking tours, and private transfers Ilze offers
  - Find the right experience based on their interests (nature, history, adventure, culture)
  - Understand practical details: pricing, duration, what to bring, weather
  - Get help with booking

  IMPORTANT:
  - Never invent services or prices — if unsure, say "Let me connect you with Ilze directly" and offer the contact form
  - Answer in the same language the user writes in (Latvian, English, or Spanish)
  - Be warm and enthusiastic about the region — Sigulda, Cēsis, Līgatne, Gauja National Park
  - Keep answers under 150 words unless asked for detail
  - Do NOT discuss politics, religion, or unrelated topics
  ```
- Available services and FAQ are injected into the system prompt as context (fetched fresh at conversation start)
- Log all conversations to `chat_conversations` / `chat_messages`
- Rate limit: max 20 messages per session_id per hour (client-side + Edge Function check)

### 8.5 CMS — Services editor
- Tab-based form for LV / EN / ES fields
- Rich text editor for `description_*` (markdown, with preview)
- Media picker for hero and gallery (drag from library or upload new)
- Slug auto-generation from title (with edit option)
- Enter Gauja categories multi-select (checkboxes with color)
- Live preview button (opens `/lv/{type}/{slug}` in new tab)
- Publish/unpublish toggle
- SEO section (collapsible): meta title/description per language

### 8.6 CMS — Bookings management
- Table with columns: reference | date | service | persons | customer | status | actions
- Filter: status, date range, service type
- Row detail: full booking info, customer contact, notes
- Status change: dropdown with reason field
- Send email to customer: templated ("Confirmed", "Declined with alternative", custom)
- Notes field (private, only admin sees)
- Real-time updates: use Supabase Real-time subscription so new bookings appear without refresh + toast notification with sound

---

## 9. SEO IMPLEMENTATION

- Every page uses `react-helmet-async` for `<head>` management
- Meta title format: `{page title} | Wanderlust.lv — Sigulda, Cēsis, Gauja`
- Auto-generate meta description if not set (from short_description)
- Schema.org JSON-LD:
  - Home: `LocalBusiness` + `TourismInformationCenter`
  - Service detail: `TouristTrip` with offers
  - Blog post: `Article`
  - Contact: `ContactPage` with `ContactPoint`
- `sitemap.xml` — Edge Function that queries all published services + blog posts + static pages, generates XML on request
- `robots.txt` in `public/`
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:type`, `og:url`
- Twitter Card: `summary_large_image`
- `hreflang` alternate tags for all 3 languages
- Canonical URL

---

## 10. ENTER GAUJA INTEGRATION

- Logo asset in `/public/enter-gauja-logo.svg` (client to provide, placeholder for now)
- Category system fully wired (see `enter_gauja_categories` table)
- Each service can have 1..N Enter Gauja categories
- Category badges appear on service cards and detail pages
- Filter bar on service list pages: "All | Action | Nature | History | Culture"
- Home page has dedicated "Explore Gauja" block with 4 category tiles
- Footer includes: "Enter Gauja sadarbības tīkla partneris" + logo + link to entergauja.com

---

## 11. SAMPLE DATA (seed migrations)

Insert into `services` (LV samples, translations can come later):

**Excursions (7):**
1. **Siguldas viduslaiku pils un Turaidas muzejrezervāts** — 4h, from 45€/pers, min 2, categories: history + culture, location: Sigulda
2. **Cēsu vecpilsēta un pils komplekss** — 3h, from 35€/pers, categories: history + culture, location: Cēsis
3. **Līgatnes vēsturiskais ciemats un alu labirinti** — 3h, from 30€/pers, categories: history + nature, location: Līgatne
4. **Gaujas Nacionālais parks — dabas skaistums un vēsture** — 6h, from 65€/pers, categories: nature + history, location: GNP
5. **Krimuldas baznīca, muiža un Gaujas ainavas** — 3h, from 30€/pers, categories: history + nature, location: Krimulda
6. **Āraišu ezerpils un arheoloģiskais parks** — 4h, from 40€/pers, categories: history + culture, location: Āraiši
7. **Zvārtes iezis un Amatas upes ainavas** — 4h, from 40€/pers, categories: nature + action, location: Amata

**Hiking (7):**
1. **Ģimenes pārgājiens Turaidas apkaimē (3h)** — easy, from 25€/pers, categories: nature, location: Turaida
2. **Gaujas krastu pārgājiens Sigulda–Krimulda (4h)** — medium, from 30€/pers, categories: nature + action, location: Sigulda
3. **Zvārtes ieža un Amatas krastu pārgājiens (5h)** — medium, from 35€/pers, categories: nature + action, location: Amata
4. **Līgatnes dabas takas — pilna diena (6h)** — medium, from 45€/pers, categories: nature, location: Līgatne
5. **Cēsu apkaimes meži un ezeri (4h)** — easy, from 30€/pers, categories: nature, location: Cēsis
6. **Gaujas NP dienas maršruts (8h)** — hard, from 60€/pers, categories: nature + action, location: GNP
7. **Vakara pārgājiens ar saullēkta izbaudīšanu (3h)** — easy, from 30€/pers, categories: nature + culture, location: Sigulda

**Transfers (6):** all with `vehicle_info = 'Volvo XC60, 1–4 personas'`
1. **Rīga — Sigulda** — from 60€
2. **Rīgas lidosta — Sigulda / Cēsis** — from 70€
3. **Rīga — Cēsis / Līgatne** — from 80€
4. **Jūrmala — Sigulda** — from 70€
5. **Rīga — Ķemeru NP** — from 65€
6. **Baltijas pilsētu transfērs** (Rīga-Tallinn / Rīga-Viļņa) — from 200€

**FAQ (10 items):**
- "Kā rezervēt ekskursiju?" / "How do I book a tour?" / "¿Cómo reservo?"
- "Kādas valodas Jūs runājat?" (LV, EN, RU, ES)
- "Ko līdzi ņemt pārgājienā?"
- "Vai iespējams doties sliktos laika apstākļos?"
- "Vai piedāvājat pusdienas ekskursijas laikā?"
- "Kas notiek, ja jāatceļ rezervācija?"
- "Vai varu apvienot vairākas ekskursijas vienā dienā?"
- "Vai piedāvājat bērnu atlaides?"
- "Vai transfērs pieejams 24/7?"
- "Vai varu maksāt uz vietas?"

---

## 12. EDGE FUNCTIONS

### `send-booking-notification`
Trigger: `bookings` row INSERT (via database webhook or direct call from booking submit).

Sends 2 emails via Resend:
1. To Ilze: "New booking request — {reference_code}" with all details, link to `/admin/bookings/{id}`
2. To customer: "We received your booking request" in their `customer_language`

### `chat-with-ai`
POST `/functions/v1/chat-with-ai`
Body: `{ session_id, message, language }`
Response: `{ reply, conversation_id }`

Logic:
1. Find or create `chat_conversations` row
2. Fetch last N=10 messages for context
3. Fetch active `services` and `faq` for context injection
4. Call Anthropic API with system prompt + context + history + new message
5. Save user message + assistant reply to `chat_messages`
6. Update `chat_conversations.message_count` and `last_message_at`
7. Return reply

**Anthropic API key**: read from `Deno.env.get('ANTHROPIC_API_KEY')` — client will provide, we set as Edge Function secret.

### `contact-form-submit`
Trigger: called from contact form.
Sends email to Ilze + saves to `contact_messages`.

### `generate-sitemap`
GET `/functions/v1/generate-sitemap`
Returns `text/xml` with all published URLs (all 3 languages, all services, all blog posts, static pages).
Referenced by `/sitemap.xml` (via redirect or nginx rewrite later).

---

## 13. DEVELOPMENT PHASES

**Phase 1 (this prompt): Foundation**
- Project setup (Vite + React + TS + Tailwind + shadcn)
- Supabase connection, `.env` config
- All migrations (schema + RLS + seed data)
- i18n setup with LV/EN/ES resource files
- Public site skeleton: routing, header, footer, language switcher
- Home page (hero, category cards, featured services, Enter Gauja block)
- Service list page (excursions / hiking / transfers) with filters
- Service detail page (with sticky booking card)
- Booking flow (all 4 steps + confirmation)
- Contact page + FAQ page + About page

**Phase 2 (later prompt): Admin CMS**
- Admin auth (login page, protected routes)
- Dashboard
- Services CRUD with media picker
- Bookings management (list, filter, status, notes, real-time)
- Messages inbox
- FAQ editor
- Site settings editor
- Profile editor
- Media library

**Phase 3 (later prompt): AI Chatbot + Advanced**
- Chatbot widget + Edge Function
- Chat log viewer in admin
- Blog module (if time)
- Newsletter subscribe (if time)
- Advanced SEO: automatic sitemap.xml, canonical, hreflang
- Google Analytics 4 + Search Console verification

**Phase 4 (Claude Code, not Lovable): Migration to Hetzner**
- Export code from Lovable git
- Set up self-hosted Supabase on Hetzner
- pg_dump schema + data from Lovable Supabase → import
- Migrate Storage bucket contents (`rclone sync`)
- Update `.env` with new Supabase URL/keys
- Build React app, deploy to nginx behind Cloudflare
- Configure DNS: `wanderlust.lv` → Hetzner IP
- SSL: Let's Encrypt via nginx
- Set up daily database backups
- Configure Edge Functions on self-hosted Supabase (Anthropic key, Resend key)
- Smoke test all flows end-to-end
- Hand over admin credentials to Ilze

---

## 14. WHAT TO BUILD IN THIS FIRST PROMPT (Phase 1)

Deliver a fully working public website with:
- All 3 languages functional
- Home + all service list pages + service detail + booking + contact + FAQ + about
- Data comes from Supabase (real queries, not hardcoded)
- Seed data loaded so pages have content
- Booking flow ends at Supabase INSERT + confirmation page (but email sending is placeholder — Edge Function will come in Phase 3)
- Mobile-first responsive design
- Accessibility: semantic HTML, focus states, keyboard nav, alt text

**Do NOT build in this phase:**
- Admin panel (Phase 2)
- AI chatbot (Phase 3)
- Actual email sending (Phase 3)
- Blog UI (Phase 3)
- Google Analytics (Phase 4)

Keep the codebase clean, migration-safe, and easy to hand off. Add comments only where non-obvious. Use TypeScript strictly (no `any`).

---

## 15. FILE STRUCTURE (target)

```
wanderlust/
├── public/
│   ├── enter-gauja-logo.svg (placeholder)
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   └── Layout.tsx
│   │   ├── home/
│   │   │   ├── Hero.tsx
│   │   │   ├── AboutPreview.tsx
│   │   │   ├── ServiceCategories.tsx
│   │   │   ├── FeaturedServices.tsx
│   │   │   ├── EnterGaujaTiles.tsx
│   │   │   └── EnterGaujaBadge.tsx
│   │   ├── services/
│   │   │   ├── ServiceCard.tsx
│   │   │   ├── ServiceList.tsx
│   │   │   ├── ServiceHero.tsx
│   │   │   ├── ServiceMeta.tsx
│   │   │   ├── ServiceGallery.tsx
│   │   │   ├── ServiceMap.tsx
│   │   │   ├── ServiceBookingCard.tsx
│   │   │   └── ServiceFilterBar.tsx
│   │   ├── booking/
│   │   │   ├── BookingWizard.tsx
│   │   │   ├── StepService.tsx
│   │   │   ├── StepDateTime.tsx
│   │   │   ├── StepContact.tsx
│   │   │   ├── StepReview.tsx
│   │   │   └── BookingConfirmation.tsx
│   │   └── common/
│   │       ├── SeoHead.tsx
│   │       ├── Breadcrumbs.tsx
│   │       └── CategoryBadge.tsx
│   ├── hooks/
│   │   ├── useCurrentLanguage.ts
│   │   ├── useTranslatedField.ts
│   │   ├── useServices.ts
│   │   ├── useService.ts
│   │   ├── useCreateBooking.ts
│   │   └── useSiteSettings.ts
│   ├── lib/
│   │   ├── supabase.ts             # createClient
│   │   ├── i18n.ts                 # i18next init
│   │   ├── seo.ts                  # SEO helpers, schema.org builders
│   │   └── utils.ts                # cn(), formatPrice(), formatDuration()
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── ServicesList.tsx        # generic, filters by type prop
│   │   ├── ServiceDetail.tsx
│   │   ├── Booking.tsx
│   │   ├── BookingConfirmed.tsx
│   │   ├── Contact.tsx
│   │   ├── FAQ.tsx
│   │   ├── PrivacyPolicy.tsx
│   │   └── NotFound.tsx
│   ├── i18n/
│   │   ├── lv.json
│   │   ├── en.json
│   │   └── es.json
│   ├── types/
│   │   ├── database.ts             # generated from Supabase
│   │   └── domain.ts               # Service, Booking, etc.
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/
│       ├── 0001_initial_schema.sql
│       ├── 0002_rls_policies.sql
│       ├── 0003_seed_enter_gauja_categories.sql
│       ├── 0004_seed_site_settings.sql
│       ├── 0005_seed_faq.sql
│       ├── 0006_seed_services.sql
│       └── 0007_seed_profile.sql
├── .env.example
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 16. README requirements

Include in `README.md`:
- Project overview (1 paragraph)
- Tech stack
- Environment variables required
- Local dev setup instructions
- Deployment notes (mention future migration to Hetzner)
- Content editing guide for Ilze (screenshots come later in Phase 2)
- License/copyright: © 2026 social.tech SIA, licensed to Ilze Gulbe

---

**Start by creating the foundation in this order:**
1. Vite + React + TS + Tailwind + shadcn setup
2. `.env.example` with required variables
3. Supabase migrations (0001–0007) — schema, RLS, seed
4. i18n foundation (`lib/i18n.ts` + 3 language JSON files with UI strings)
5. Supabase client (`lib/supabase.ts`) + hooks (`useCurrentLanguage`, `useTranslatedField`)
6. Layout components (Header with language switcher, Footer)
7. Home page (all sections)
8. Services list + detail
9. Booking wizard
10. Contact + FAQ + About

Keep commits granular and descriptive. Test each page in all 3 languages before moving on.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://wanderlust-ilze.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/60285958-d505-4562-afc2-6f64b0cbc241).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
