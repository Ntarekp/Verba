# Verba — Priority Implementation Plan (Assessment Only)

**Source:** `IMPLEMENTATION_GAP_REPORT.md` filtered against `Integrated Situation.md` (authoritative grading rubric)  
**Date:** June 8, 2026  
**Scope:** Missing items that can affect assessment marks — excludes design parity, extended FRs, and production hardening  
**Constraint:** Planning document only — no code changes

---

## 1. Assessment Baseline

| Metric | Value |
|--------|-------|
| Mandatory requirements (`A1.1`–`A5.8`) | **38 / 40 met (95%)** |
| Explicit failures in gap report | **2** — both in Activity 4 |
| Activities at 100% | Activities 1, 2, 3, 5 |
| Activity with gaps | Activity 4 (~85%) |

**Conclusion:** Only **one functional area** — literal **drawer navigation with history in the drawer menu** — is an unambiguous assessment gap. All other items in `IMPLEMENTATION_GAP_REPORT.md` are either complete, partial without grading consequence, or outside the five assessed activities.

---

## 2. Grading-Relevant Gaps (Filtered)

The following table lists **only** gaps that map to `Integrated Situation.md` activities or instructions. Everything else is listed in Section 6 as explicitly out of scope for grading.

| ID | Assessment reference | Gap | Gap report status | Grading relevance |
|----|---------------------|-----|-------------------|-------------------|
| **G-1** | A4.1 — *Implement a drawer navigation in the application* | No `DrawerNavigator` or `DrawerContent`; `@react-navigation/drawer` installed but unwired | ❌ Missing | **Direct mark risk** |
| **G-2** | A4.4 — *Display the list of searched items in the drawer menu* | History lives on History tab and Discover chips, not in a drawer sidebar | ❌ Missing | **Direct mark risk** |
| **G-3** | A4.1 + A4.4 (bundle) | Hamburger / slide-out menu pattern absent; assessor cannot demonstrate drawer UX | ❌ Missing | Same as G-1 + G-2 |
| **G-4** | Instructions — first-hour design deliverables | DFD, architecture, API endpoints, required screens | ✅ Documented in `docs/` and `design_documentation.md` | **No code gap** — verify submission includes docs |
| **G-5** | Instruction I6 — *Testing … using Expo CLI* | No automated test suite | N/A (process, not feature) | **Low** — manual Expo demo satisfies intent |

### Not grading-relevant (excluded from this plan)

These appear in `IMPLEMENTATION_GAP_REPORT.md` but **do not map** to `Integrated Situation.md` activities:

- Voice search, WOTD/trending mock data, collection picker on save
- Auth OTP / session-expired / success screens
- `useDebounce`, `MeaningCard` orphans, `localStore.ts`, deep linking
- NetInfo proactive offline (Activity 5 met reactively)
- Input sanitization beyond empty string (Activity 1 requires non-empty only)
- Design shaders, immersive audio, `state_update_required`, PNG assets
- Notifications toggle without push backend

---

## 3. Ranked Priority List

Items ranked by **assessment impact** (primary), then **development effort**, then **risk if omitted**.

### Rank 1 — Drawer navigation with search history in drawer menu

| Dimension | Rating | Rationale |
|-----------|--------|-----------|
| **Assessment impact** | 🔴 **Critical** | Only explicit ❌ in the 40-item matrix (`A4.1`, `A4.4`). Activity 4 is named *Drawer Navigation & Search History*. An assessor following the brief literally may fail or heavily deduct this activity. |
| **Development effort** | 🟡 **Medium** (4–8 hours) | `@react-navigation/drawer` already in `package.json`. Requires `DrawerContent.tsx`, navigator restructure, wiring recent history list, tap-to-re-search, and coexistence with existing bottom tabs without duplicate routes. |
| **Risk if omitted** | 🔴 **High** | 5% of mandatory requirements remain unmet; Activity 4 title matches the missing UI pattern exactly. |

**Requirements satisfied when done:**

- A4.1 — Drawer navigation implemented
- A4.4 — Search history visible inside drawer menu
- A4.5 — Tap word in drawer (reuses existing `navigateToWordDetails`)
- A4.6 — New API request on selection (existing `WordDetailsScreen` fetch)
- A4.7 — Detail screen refresh (existing `route.params.word` sync)

**Already complete (no work needed):**

- A4.2 — `HistoryContext` + `SearchHistoryItem` model
- A4.3 — `addHistoryWord` on successful lookup
- A4.8 — Duplicate prevention in `HistoryContext`

**Recommended implementation approach (plan only):**

1. Add `DrawerContent` showing: navigation links (Home, History, Saved, Settings) + **recent searches** (last 5–10 from `HistoryContext`).
2. Wrap main content in `createDrawerNavigator` **or** add drawer as overlay from Discover header hamburger (matches `search_live_suggestions` design).
3. Preserve existing 3-tab bottom navigation for parity with mobile designs; drawer satisfies assessment wording without removing tabs.
4. Reuse `navigateToWordDetails` for drawer history taps.
5. Manual test: search 3 words → open drawer → see list → tap item → Word Details updates.

**Files likely touched (for implementer reference):**

- `src/navigation/AppNavigator.tsx`
- `src/navigation/DrawerContent.tsx` (new)
- `src/screens/DiscoverScreen.tsx` (hamburger trigger, if header-led)
- `src/navigation/navigationHelpers.ts` (optional drawer routes)

---

### Rank 2 — Assessment submission pack (non-code mitigation)

| Dimension | Rating | Rationale |
|-----------|--------|-----------|
| **Assessment impact** | 🟠 **Medium** | Does not fix `A4.1`/`A4.4` but may recover partial credit if assessor accepts functional equivalence. |
| **Development effort** | 🟢 **Low** (1–2 hours) | Written evidence only. |
| **Risk if omitted** | 🟡 **Medium** | Viable only if assessor accepts History tab as drawer substitute; fails if grading is literal. |

**Use when:** Team chooses **not** to implement Rank 1 before submission deadline.

**Deliverables:**

1. One-page **Activity 4 traceability note** citing `docs/Navigation-Architecture-Report.md`: history storage, display, tap-to-re-fetch, dedup all satisfied via History tab + Discover recent chips.
2. **Demo script** walking assessor through Activities 1–5 in order (see Section 5).
3. Include first-hour design artifacts (`docs/Instruction-1-Application-Design.md`, `design_documentation.md`) in submission folder.

**Limitation:** This is a **fallback**, not a substitute for Rank 1 if the rubric grades literal drawer implementation.

---

### Rank 3 — Manual Expo verification log (Instruction I6)

| Dimension | Rating | Rationale |
|-----------|--------|-----------|
| **Assessment impact** | 🟢 **Low–Medium** | Supports process compliance; does not add marks for missing features. |
| **Development effort** | 🟢 **Low** (30–60 minutes) | Run app via `npx expo start`, record results. |
| **Risk if omitted** | 🟢 **Low** | Unlikely to fail assessment alone; weakens defensibility under scrutiny. |

**Deliverable:** Completed checklist (Section 5) with screenshots or screen recording referenced in submission.

---

## 4. Priority Matrix (Summary)

| Rank | Item | Assessment impact | Effort | Risk | Action |
|------|------|-------------------|--------|------|--------|
| **1** | Drawer + history in drawer menu (G-1, G-2, G-3) | Critical | Medium | High | **Implement before submission** |
| **2** | Submission / Activity 4 justification pack (G-4) | Medium | Low | Medium | **Required if Rank 1 skipped** |
| **3** | Expo manual verification log (G-5) | Low–Medium | Low | Low | **Recommended regardless** |

---

## 5. Assessment Demo Script (Activities 1–5)

Use this sequence when verifying or presenting to an assessor. Confirms no hidden grading gaps beyond the drawer.

| Step | Activity | Action | Pass criterion |
|------|----------|--------|----------------|
| 1 | A1 | Open Discover → type `hello` → submit | Loading shown → Word Details loads |
| 2 | A1 | Submit empty search | Validation message; no navigation |
| 3 | A2 | On Word Details, scroll definitions | Word, phonetic, POS, definitions, examples visible |
| 4 | A3 | Tap speaker icon | Audio plays; pause works; multi-accent if available |
| 5 | A3 | Search word without audio | Speaker disabled or clear unavailable feedback |
| 6 | A4 | After 2–3 searches, open **drawer** (after Rank 1) or History tab (current) | Prior words listed |
| 7 | A4 | Tap a history item | New fetch; details refresh for that word |
| 8 | A4 | Search same word twice | No duplicate in history |
| 9 | A5 | Search `xyznotaword999` | Clear not-found message + retry |
| 10 | A5 | Enable airplane mode → search | Network error message + retry; no crash |
| 11 | A5 | History tab with no items (or after clear) | Empty-state message |

---

## 6. Explicitly Deprioritized (No Assessment Action)

Do **not** schedule these for grading purposes — they are documented in `IMPLEMENTATION_GAP_REPORT.md` but outside `Integrated Situation.md`:

| Gap report item | Why deprioritized |
|-----------------|-------------------|
| Collection picker on save | Extended FR-8; not in assessment |
| WOTD / trending mock data | Not in assessment |
| Voice search placeholder | Not in assessment |
| Auth OTP / session-expired screens | Not in assessment |
| `useDebounce` unused | FR-2 marked ✅; no assessor criterion |
| `MeaningCard` unused | "No functional gap" per gap report |
| Proactive NetInfo offline | A5.3 satisfied reactively |
| Automated test suite | I6 requires Expo CLI usage, not Jest |
| Deep linking, `localStore`, shaders | Production / design scope |

---

## 7. Decision Tree

```
Submission deadline firm?
│
├─ YES → Can spare 4–8 hours?
│         ├─ YES → Execute Rank 1 (drawer) + Rank 3 (demo log)
│         └─ NO  → Execute Rank 2 (justification) + Rank 3
│                  Accept Activity 4 partial-credit risk
│
└─ NO  → Execute Rank 1 first, then Rank 3
         Rank 2 optional once drawer ships
```

---

## 8. Expected Outcome After Rank 1

| Metric | Before | After Rank 1 |
|--------|--------|--------------|
| Mandatory requirements met | 38 / 40 (95%) | **40 / 40 (100%)** |
| Activity 4 status | ~85% | **100%** |
| Assessment submission risk | Medium–High | **Low** |

---

## 9. Effort Budget (Assessment-only)

| Rank | Item | Estimated hours |
|------|------|-----------------|
| 1 | Drawer + drawer history | 4–8 h |
| 2 | Submission pack (if needed) | 1–2 h |
| 3 | Expo verification log | 0.5–1 h |
| **Total (Rank 1 + 3)** | **Recommended path** | **5–9 h** |
| **Total (Rank 2 + 3 only)** | **Fallback path** | **1.5–3 h** |

---

## 10. Final Recommendation

**For maximum assessment outcome:** Implement **Rank 1 only** — a drawer navigator with search history rendered inside the drawer menu. This is the sole missing feature with direct, explicit mapping to failed requirements in `IMPLEMENTATION_GAP_REPORT.md`.

**All other gaps in that report are either already complete for grading purposes or belong to extended product scope.** Do not divert assessment time to voice search, auth polish, WOTD API, collection pickers, or test infrastructure unless Rank 1 is already done and time remains.

Complete **Rank 3** (manual Expo demo log) in all cases. Prepare **Rank 2** only if Rank 1 cannot ship before the deadline.

---

*Planning document only. No application code was written or modified.*
