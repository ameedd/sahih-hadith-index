# Sahih Hadith Index — Production Architecture & Implementation Plan

A production-grade, standalone, offline-capable digital index and commentary reader covering authentic (Sahih) and good (Hasan) narrations across the 7 major hadith collections, engineered with classical Islamic manuscript typography, IndexedDB storage for 30,000+ entries, diacritics-insensitive search, and verified commentary workflows.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during interactive clarification and will guide the production build:

- **Confirmed Decision 1 (Dataset Loading)**: Built-in multi-source catalog downloader with live preview, supporting verified open datasets (sunnah.com APIs and hadith-json repositories) alongside custom JSON import/export and the 7 baseline prototype samples.
- **Confirmed Decision 2 (Performance & Navigation for 30,000+ Entries)**: Chapter-by-chapter accordion navigation with on-demand chunk rendering backed by IndexedDB indexing (`book`, `chapter`, `num`, `grade`, `grader`, `search_tokens`) to ensure silky 60fps performance without memory degradation.
- **Confirmed Decision 3 (Visual Identity & Typography)**: Classical Islamic manuscript aesthetic utilizing Amiri and Traditional Arabic typography with relaxed line heights, archival warm alabaster canvas (`#FDFBF7`), antique charcoal ink (`#1C1917`), and dignified emerald accents (`#0A6B4F`), adhering to zero-pill metadata discipline.
- **Confirmed Decision 4 (Delivery Format)**: Delivered as both a standalone single-file production HTML application (`sahih_hadith_index.html`) that works offline with zero dependencies, and integrated into the applet root with an instant one-click standalone download affordance.

---

## 1. Overview & Core Concept

- **What It Does**: A comprehensive scholarly indexing tool for verified Sahih and Hasan narrations from 7 canonical works (*Sahih al-Bukhari*, *Sahih Muslim*, *Sunan Abi Dawud*, *Jami at-Tirmidhi*, *Sunan an-Nasa'i*, *Sunan Ibn Majah*, and *Mishkat al-Masabih*). It features dual-view toggles ("One-liner" key matn vs. "Full narration + commentary"), 3 specific classical commentators per collection, cross-referencing, chapter navigation, and a rate-limited Gemini commentary generator for unannotated narrations with rigorous verification badges.
- **Target Audience / Persona**: Students of Islamic knowledge, researchers, educators, and readers who need rapid, diacritics-tolerant search, authoritative classical commentary citations, and strict grading attribution.
- **Key Value**: Guarantees authenticity boundaries (strict exclusion of Da'if, Munkar, Matruk, and Mawdu' hadiths), attributes every non-Bukhari/Muslim grading to named masters (e.g. al-Albani, Shu'ayb al-Arnaut), prevents AI hallucination through explicit "UNVERIFIED" safeguards, and works 100% offline.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Curatorial One-Pager Onboarding**: Collapsible scholarly primer at the top detailing Ibn al-Salah's five conditions of Sahih (*Ittisal al-sanad*, *Adalah*, *Dabt tamm*, *No shudhudh*, *No illah*), Hasan conditions (*khafif al-dabt*), the 4 subdivisions, and collection inclusion criteria.
2. **Search & Exploration**:
   - Diacritics-insensitive search (normalizing `َ ُ ِ ً ٌ ٍ ّ ْ`, dagger alif, and hamza variations) across Arabic matn, English translations, chapter titles, hadith numbers, and commentary text.
   - Filtering by Book, Grade (`Sahih`, `Hasan`), and Grader.
   - Chapter-by-chapter accordion browsing with hadith count badges and fast jump navigation.
3. **Card Reading & View Modes**:
   - Global and card-level toggle between "One-liner" (key excerpt `ar` + concise commentary `text`) and "Full narration + commentary" (`arFull` + detailed `full`).
   - Large Amiri/Traditional Arabic RTL typography with generous line height (1.9–2.2).
   - Structured 3-scholar commentary breakdown with provenance citations.
   - "AI-generated, verify" amber badge that changes to verified upon user approval.
   - Bookmarking, cross-reference links (`also: [...]`), and one-click copy in formatted citation style.
4. **Data Management & Auto-Fill**:
   - Modal for adding, editing, or deleting entries with strict field validation.
   - Import/Export JSON compliant with `{id, book, num, chapter, grade, grader, also, ar, arFull, c:[{scholar, text, full, verified}]}`.
   - Built-in multi-source catalog downloader with live preview.
   - Gemini auto-fill tool with progress bar, 4-second delay for free tier, 429 rate-limit backoff retry, and resume capability.

### Visual Identity & Theme
- **Aesthetic Direction**: Archival museum and manuscript aesthetic. Evokes classical leather-bound commentary works (*Sharh*) with contemporary digital precision.
- **Palette**:
  - Light mode: Archival paper canvas (`#FDFBF7`), subtle card container (`#F7F4EE`), hairline borders (`#E5DFD5`), charcoal body text (`#1C1917`), antique emerald accent (`#0A6B4F`), deep lapis reference links (`#1E3A8A`), amber verification notice (`#92400E`).
  - Dark mode: Deep obsidian ink (`#141412`), structural surface (`#1F1E1B`), muted border (`#33312B`), crisp ivory text (`#EDEDE8`), radiant jade accent (`#34D399`).
- **Typography & Hierarchy**:
  - Arabic: `'Amiri', 'Traditional Arabic', 'Scheherazade New', serif` (24px–28px for full narration, 20px–22px for key matn).
  - English Headings & Accents: High-contrast serif (`Playfair Display`, `Georgia`, serif).
  - UI Prose & Controls: Clean editorial sans-serif (`system-ui`, `-apple-system`, `sans-serif`).
  - Metadata: Unboxed quiet text with `·` separators (`Book · #Number · Chapter · Grade by Grader`).
- **Zero-Pill Discipline**: Eliminates colored bubble capsules. Metadata is presented with clean typographic hierarchy and subtle text accents.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: IndexedDB Primary Storage with Memory Caching**
  - *Chosen Approach*: Store records in an IndexedDB object store (`sahih_hadith_db`) with transactional indices on `book`, `grade`, `chapter`, and indexed text tokens. Keep active query results in memory with on-demand chunk slicing (50 items per batch).
  - *Why*: Allows seamless storage of 30,000+ hadiths (50MB+ payload) without exceeding `localStorage` 5MB limits or freezing the browser main thread.
  - *Alternatives Considered*: Pure in-memory arrays (causes memory spikes and crashes on mobile); WebSQL (deprecated).

- **Decision 2: Arabic Diacritics Normalization Engine**
  - *Chosen Approach*: Custom normalization stripping Tashkeel (Fathah, Dammah, Kasrah, Sukun, Shaddah, Tanwin) and unifying Alif forms (`أ إ آ ٱ` -> `ا`), Ta Marbuta (`ة` -> `ه`), and Ya (`ى` -> `ي`) for both search queries and index entries.
  - *Why*: Allows users to search with or without vowels and find exact matches immediately.

- **Decision 3: Strict 3-Scholar Commentary Matrix per Book**
  - *Chosen Approach*: Enforce the exact specified classical scholars per book:
    - *Bukhari*: Ibn Hajar, al-Ayni, al-Qastallani
    - *Muslim*: al-Nawawi, Qadi Iyad, al-Qurtubi
    - *Abu Dawud*: al-Khattabi, al-Azimabadi, al-Mundhiri
    - *Tirmidhi*: Ibn al-Arabi, al-Mubarakpuri, Ibn Rajab
    - *Nasa'i*: al-Suyuti, al-Sindi, Ibn Hajar
    - *Ibn Majah*: al-Sindi, al-Suyuti, al-Busiri
    - *Mishkat*: Mulla Ali al-Qari, al-Tibi, al-Mubarakpuri
  - *Why*: Ensures domain rigor and consistent layout structure across all 7 collections.

- **Decision 4: Rate-Limited Gemini Auto-Fill with Safety Directives**
  - *Chosen Approach*: Client-side streaming auto-fill executing sequential calls with 4-second delays between items, exponential backoff upon HTTP 429, pause/resume capability, and strict system instruction: *"If you do not know or are unsure of the scholar's authentic commentary, write 'UNVERIFIED'. Never invent quotes or commentary."* Commentary items retain `verified: false` and display the "AI-generated, verify" badge until explicitly reviewed.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Sahih Hadith Index App                          │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Top Navigation & One-Pager Scholarly Definition Banner           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │ Filter & Search Rail  │  │ Action Toolbar                        │  │
│  │ • Text Search (Arabic/│  │ • Global View: One-liner / Full       │  │
│  │   English/Number)     │  │ • Import / Export JSON                │  │
│  │ • Book (7 Books)      │  │ • Catalog Loader (Live Preset Import) │  │
│  │ • Grade (Sahih/Hasan) │  │ • + Add Hadith Modal                  │  │
│  │ • Grader Filter       │  │ • Standalone HTML Download (.html)    │  │
│  │ • Bookmarks Only      │  │ • Dark/Light Mode Switcher            │  │
│  └───────────────────────┘  └───────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Chapter-by-Chapter Accordion & On-Demand Chunk Virtual List      │  │
│  │                                                                  │  │
│  │  ▼ Chapter: Beginning of Revelation (1 hadith)                   │  │
│  │    ┌──────────────────────────────────────────────────────────┐  │  │
│  │    │ Hadith Card #1 (Sahih al-Bukhari #1)                     │  │  │
│  │    │ • Meta line: Book · #1 · Chapter · Grade                 │  │  │
│  │    │ • Arabic Matn (RTL, Amiri 26px font)                     │  │  │
│  │    │ • 3 Commentary Sections (Ibn Hajar, al-Ayni, al-Qastallani│  │
│  │    │ • AI / Sample Verification Status Badge                  │  │  │
│  │    │ • Action buttons: Toggle Full/Short, Bookmark, Copy, Edit│  │  │
│  │    └──────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Gemini Commentary Auto-Fill Engine                               │  │
│  │ • API Key & Model Config                                         │  │
│  │ • Queue Manager: ~4s delay, 429 auto-retry, pause/resume         │  │
│  │ • Progress Bar & Unverified Tagging                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ IndexedDB Persistence Layer (`sahih_hadith_db`)                  │  │
│  │ Stores 30,000+ entries, bookmarks, verified status               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Schema
```typescript
interface CommentaryItem {
  scholar: string;      // Specific commentator for the book
  text: string;         // One-line concise interpretation
  full: string;         // Fuller multi-sentence commentary
  verified: boolean;    // false for sample / AI-generated; true once verified
}

interface HadithEntry {
  id: number;           // Unique identifier
  book: string;         // One of the 7 canonical books
  num: number | string; // Hadith number within the collection
  chapter: string;      // Chapter name (English / Arabic)
  grade: 'Sahih' | 'Hasan'; // Strictly Sahih or Hasan
  grader: string;       // Consensus / Bukhari & Muslim or named scholar (e.g., al-Albani)
  also: string[];       // Cross-reference strings e.g. ["Sahih Muslim 1907"]
  ar: string;           // Key matn sentence excerpt (Arabic RTL)
  arFull: string;       // Complete Arabic narration (Arabic RTL)
  c: CommentaryItem[];  // Exactly 3 commentators corresponding to the book
  bookmarked?: boolean; // User favorite flag
}
```

### 6. 7th-Century Classical Manuscript Aesthetic & Synchronized View Linking (Completed)
- **Unified Synchronized View**:
  - `setUnifiedViewMode('one' | 'full')`: Switches all hadith cards across every chapter simultaneously between concise One-Liner Matn (`الوجيز`) and Full Vocalized Matn & Classical Commentary (`المبسوط والشرح`).
  - Clears individual per-card overrides so the entire reader remains strictly synchronized.
  - Linked toggle button on every card (`[ 📜 Make All One-Liner (الوجيز) ]` / `[ 📖 Explain All Cards (المبسوط) ]`) and in the top toolbar actions strip.
- **7th-Century Classical Manuscript Presentation**:
  - Dedicated Manuscript Tab Bar above chapter listings with antique gold illuminated medallion (`۞`), parchment background (`#F6F1E5`), and segmented controls.
  - Authentic early Islamic Golden Age parchment vellum cards with illuminated hairline gold/emerald trim gradient.
  - Classical star seals for grading (`۞ صحيح · Sahih` in emerald leaf, `✦ حسن · Hasan` in warm amber).
  - Arabic Matn Cartouche with Amiri typography (`text-2xl sm:text-[27px] leading-[2.4]`), illuminated scribe header, and antique parchment recess.
  - Classical Scholarly Commentary & Glosses (*Hashiyah / Sharh*) styled as traditional scholar margins with verified provenance seals.

