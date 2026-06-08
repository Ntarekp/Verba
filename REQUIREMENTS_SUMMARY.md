# Verba — Requirements Summary

**Sources:** `Integrated Situation.md` (authoritative assessment), `implementation_plan.md`, `README.md`, `design_documentation.md`, `docs/Instruction-1-Application-Design.md`  
**Date:** June 8, 2026

---

## 1. Problem Statement

LexiTech Solutions Ltd requires a **cross-platform Dictionary Mobile Application** that helps users:

- Search English words quickly
- View definitions, parts of speech, and usage examples
- Listen to pronunciations when available
- Access multiple meanings per word
- Handle missing words and network failures gracefully

The app must run on **Android and iOS**, use **React Native**, integrate with the **Free Dictionary API** via **Axios**, and be testable with **Expo CLI**.

---

## 2. Mandatory Assessment Requirements

Derived directly from `Integrated Situation.md` — **Activities 1–5** and **Instructions**.

### Activity 1: Word Search & API Integration

| ID | Requirement |
|----|-------------|
| A1.1 | Provide a search screen with text input and search trigger |
| A1.2 | Validate input — search field must not be empty |
| A1.3 | Capture and format the entered word (trim, lowercase for API) |
| A1.4 | Construct dynamic GET URL: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` |
| A1.5 | Send HTTP GET via **Axios** |
| A1.6 | Display loading indicator during request |
| A1.7 | Parse JSON response into displayable structures |
| A1.8 | Hold fetched data for display and navigation |

### Activity 2: Display Word Details

| ID | Requirement |
|----|-------------|
| A2.1 | Extract word, phonetics, meanings, definitions from API |
| A2.2 | Display searched word prominently |
| A2.3 | Show phonetic spelling |
| A2.4 | Display each part of speech (noun, verb, etc.) |
| A2.5 | List all definitions under respective parts of speech |
| A2.6 | Display example sentences when provided |
| A2.7 | Support multiple meanings and long definitions |
| A2.8 | Apply consistent styling and spacing |

### Activity 3: Audio Pronunciation

| ID | Requirement |
|----|-------------|
| A3.1 | Detect audio pronunciation URL in API response |
| A3.2 | Show speaker icon near word/phonetics |
| A3.3 | Load audio from provided URL |
| A3.4 | Play audio on tap |
| A3.5 | Handle multiple audio pronunciations |
| A3.6 | Disable/hide audio when no URL available |
| A3.7 | Manage play, pause, stop states |

### Activity 4: Drawer Navigation & Search History

| ID | Requirement |
|----|-------------|
| A4.1 | Implement drawer navigation |
| A4.2 | Define search history data structure |
| A4.3 | Add each successful search to history |
| A4.4 | Display history list in drawer menu |
| A4.5 | Allow tap on history item |
| A4.6 | Trigger new API request on history selection |
| A4.7 | Refresh word detail screen with selected data |
| A4.8 | Prevent duplicate history entries |

### Activity 5: Error Handling & User Feedback

| ID | Requirement |
|----|-------------|
| A5.1 | Detect API 404 / word not found |
| A5.2 | Show clear "word not found" message |
| A5.3 | Handle network connectivity issues |
| A5.4 | Show error when API request fails |
| A5.5 | Hide loading on error |
| A5.6 | Prevent crashes from malformed responses |
| A5.7 | Allow retry after error |
| A5.8 | Show empty-state messages when no data |

### Instructions (Process & Technical)

| ID | Requirement |
|----|-------------|
| I1 | First hour: produce DFD, architecture, API endpoints, required screens |
| I2 | Build with **React Native** (Android) |
| I3 | Validate inputs where applicable |
| I4 | Meaningful error messages for users |
| I5 | API calls via **Axios** |
| I6 | Test using **Expo CLI** |

---

## 3. Extended Functional Requirements

From `implementation_plan.md` and product documentation — **beyond minimum assessment**.

### Search & Discovery

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Trim whitespace; reject empty queries | P1 |
| FR-2 | Live autocomplete suggestions with POS badges | P2 |
| FR-3 | Shimmer/skeleton loading during fetch | P2 |
| FR-4 | Word of the Day card on home | P3 |
| FR-5 | Trending words list | P3 |
| FR-6 | Synonym/antonym tap → new lookup | P2 |

### Vocabulary Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-7 | Save/unsave words (bookmark) | P2 |
| FR-8 | Collections: Favorites, Academic, Travel | P2 |
| FR-9 | Mastery level tracking (1–3) | P3 |
| FR-10 | Learning notes per saved word | P3 |
| FR-11 | Study streak counter | P3 |
| FR-12 | Vocabulary quiz from saved words | P3 |

### History

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-13 | Persist history in AsyncStorage | P1 |
| FR-14 | Group by Today / Yesterday / Older | P2 |
| FR-15 | Swipe-to-delete individual items | P2 |
| FR-16 | Clear all history | P2 |
| FR-17 | Filter history by search | P3 |
| FR-18 | Limit history to 100 items | P3 |
| FR-19 | Recent lookup chips on home (last 4) | P2 |

### Audio & Settings

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-20 | Audio autoplay toggle (settings) | P3 |
| FR-21 | Accent/regional pronunciation switch | P2 |
| FR-22 | Toast/alert when pronunciation unavailable | P2 |
| FR-23 | Theme presets (Classic, Royal, Midnight) | P3 |
| FR-24 | Dark mode toggle | P3 |
| FR-25 | Font scale (Small / Medium / Large) | P3 |
| FR-26 | Notifications preference (UI) | P4 |

### Authentication (Design-driven, not in assessment)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-27 | Login / Sign up / Password recovery | P3 |
| FR-28 | Local credential storage (demo) | P3 |
| FR-29 | Session management with expiry | P3 |
| FR-30 | Demo account (`demo@verba.app`) | P3 |

### Onboarding & Entry

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-31 | Splash / bootstrap screen | P2 |
| FR-32 | First-launch onboarding carousel (4 steps) | P2 |
| FR-33 | Skip / Next / Get Started flows | P2 |

---

## 4. Non-Functional Requirements

| ID | Requirement | Source |
|----|-------------|--------|
| NFR-1 | Neo-Minimalist UI — 8pt grid, glass cards, rounded shapes | Design.md |
| NFR-2 | Inter typography throughout | Design.md |
| NFR-3 | Portrait responsiveness on phone form factors | implementation_plan |
| NFR-4 | Persist settings, history, bookmarks locally | implementation_plan |
| NFR-5 | Block or gracefully handle offline API queries | implementation_plan |
| NFR-6 | Axios timeout ~8 seconds | design_documentation |
| NFR-7 | Android glass fallback (solid translucency vs blur) | implementation_plan |
| NFR-8 | Cross-platform (iOS + Android via Expo) | Integrated Situation |
| NFR-9 | TypeScript for type safety | README |
| NFR-10 | No crashes on malformed API JSON | Activity 5 |

---

## 5. API Contract

### External endpoint

```
GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}
```

| Response | App behavior |
|----------|--------------|
| `200` + JSON array | Parse → display word details → add history |
| `404` | Word not found screen |
| `5xx` / `503` / `504` | Server / timeout error screen |
| No response / timeout | Offline / connection error screen |
| Empty array | `EMPTY_RESPONSE` → server error state |

### Audio (secondary)

```
GET {phonetics[n].audio}  — absolute URL from API response
```

Loaded via `expo-av`; protocol-less URLs normalized in `apiParser.ts`.

---

## 6. Data Models (Required Entities)

| Entity | Key fields | Storage |
|--------|------------|---------|
| `DictionaryEntry` | word, phonetic, phonetics[], meanings[], origin?, sourceUrls[] | Transient (screen state) |
| `SearchHistoryItem` | id, word, partOfSpeech, definitionSummary, timestamp | `verba_history` |
| `SavedWordItem` | word, phonetic, partOfSpeech, definitionSummary, timestamp, collection, masteryLevel, learningNotes?, audioUrl?, exampleSentence? | `verba_saved_vocabulary` |
| `AuthUser` | id, name, email | `verba_auth_users` |
| `AuthSession` | userId, email, expiresAt | `verba_auth_session` |
| Settings blob | theme, darkMode, fontScale, autoplay, notifications | `verba_settings` |
| First launch flag | boolean string | `verba_first_launch_done` |
| Streak data | streakCount, lastLookupDate | `verba_streak_data` |

---

## 7. Required Screens (Minimum vs Extended)

### Assessment minimum

| Screen | Route | Activities |
|--------|-------|------------|
| Search | `Discover` | 1 |
| Word Details | `WordDetails` | 1, 2, 3, 5 |
| Drawer + History | `DrawerContent` + `History` | 4 |
| Error states | Embedded in WordDetails | 5 |

### Extended (documented + implemented)

| Screen | Route | Purpose |
|--------|-------|---------|
| Splash | Bootstrap gate | Brand, init wait |
| Onboarding | `Onboarding` | First-run education |
| Saved Words | `Saved` (tab) | Bookmarks, quiz |
| Settings | `Settings` (stack) | Preferences |
| Auth | `Auth` stack | Login, SignUp, ForgotPassword |

---

## 8. Acceptance Criteria (from implementation_plan)

| # | Criterion | Verification method |
|---|-----------|---------------------|
| AC-1 | Search triggers Axios query; skeleton shown while pending | Manual: search "hello" |
| AC-2 | Speaker plays audio; failure shows "Pronunciation unavailable" | Manual: words with/without audio |
| AC-3 | History updates instantly; capped at 100 items | Manual: multiple searches |
| AC-4 | Font scale in Settings affects definition text globally | Manual: toggle Small/Large |
| AC-5 | Empty search blocked with user message | Manual: submit blank field |
| AC-6 | 404 shows dedicated not-found UI with retry | Manual: `xyzabc123notaword` |
| AC-7 | Offline shows connection UI, not crash | Manual: airplane mode |
| AC-8 | History tap re-fetches and updates Word Details | Manual: History tab → item |

---

## 9. Requirements Traceability Matrix (Summary)

| Requirement group | Total items | Implemented | Partial | Missing |
|-------------------|-------------|-------------|---------|---------|
| Activity 1 (Search/API) | 8 | 8 | 0 | 0 |
| Activity 2 (Display) | 8 | 8 | 0 | 0 |
| Activity 3 (Audio) | 7 | 7 | 0 | 0 |
| Activity 4 (Drawer/History) | 8 | 6 | 2 | 0 |
| Activity 5 (Errors) | 8 | 8 | 0 | 0 |
| Extended FR | 33 | 26 | 5 | 2 |
| NFR | 10 | 8 | 1 | 1 |

**Activity 4 partial items:** A4.1 (literal drawer), A4.4 (history in drawer menu) — functionally replaced by History tab + Discover chips per `docs/Navigation-Architecture-Report.md`.

**Extended partial:** Collection picker on save, notifications (UI only), WOTD/trending (mock data).

**Extended missing:** Voice search, deep linking.

---

## 10. Out of Scope (Explicit)

Per project documentation:

- Real backend / cloud sync
- Translation feature (Translate tab in exploration designs)
- Push notification delivery infrastructure
- App version check / forced update (`state_update_required`)
- Automated test suite
- Tablet-specific layout optimization
- `system_states` gallery as a navigable screen

---

*Requirements distilled from project documentation. See `IMPLEMENTATION_GAP_REPORT.md` for item-by-item implementation status.*
