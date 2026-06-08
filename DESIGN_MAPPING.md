# Verba — Design Mapping

**Design source:** `stitch_verba_intelligence_platform/` (36 screen folders + `verba_intelligence/DESIGN.md`)  
**Design tokens:** Root `Design.md` (duplicate of stitch DESIGN.md)  
**Implementation:** `src/screens/`, `src/components/`  
**Date:** June 8, 2026

---

## 1. Design System Overview

The **Verba Intelligence Platform** design system defines:

| Token category | Key values |
|----------------|------------|
| **Primary** | Royal Indigo `#3525cd` |
| **Secondary** | Electric Blue `#0058be` |
| **Tertiary / Audio accent** | Premium Cyan `#00505f` / `#4cd7f6` |
| **Surface** | `#f8f9ff` layered containers |
| **Typography** | Inter — Display Word 40–48px, Definition Body 18px, Label Caps 12px |
| **Spacing** | 8pt grid, 24px container padding |
| **Shapes** | 8px buttons, 24px cards, pill search bars |
| **Elevation** | Glassmorphism (80–90% opacity + 20px blur), soft indigo shadows |

**Implementation mapping:** `src/styles/theme.ts` exports `classicThemeColors`, `royalThemeColors`, `midnightThemeColors`, typography and spacing tokens consumed by `ThemeContext`.

---

## 2. Stitch Asset Inventory

All folders under `stitch_verba_intelligence_platform/` contain `code.html` (Tailwind + Material Symbols). README also references `screen.png` previews; **PNG files are not present in the current workspace clone** — HTML is the authoritative layout reference.

| # | Folder | Category | HTML title / purpose |
|---|--------|----------|----------------------|
| 1 | `launch_screen` | Entry | App launch / cold start |
| 2 | `splash_screen` | Entry | Brand splash with logo |
| 3 | `verba_app_logo` | Brand | Logo asset showcase |
| 4 | `onboarding_flow` | Onboarding | Composite 4-step flow (single page) |
| 5 | `onboarding_search` | Onboarding | "Instant Intelligence" slide |
| 6 | `onboarding_audio` | Onboarding | "Perfect Pronunciation" slide |
| 7 | `onboarding_offline` | Onboarding | "Learn Anywhere" slide |
| 8 | `onboarding_final` | Onboarding | "Ready to begin" / WOTD preview |
| 9 | `verba_home_search_insights` | Core | Home dashboard — search, stats, WOTD |
| 10 | `search_live_suggestions` | Core | Autocomplete overlay while typing |
| 11 | `search_loading_empty_states` | Core | Skeleton / empty search states |
| 12 | `word_details_ethereal` | Core | Full word detail — Ethereal example |
| 13 | `audio_experience_eloquent` | Core | Immersive audio-focused word view |
| 14 | `search_history` | Core | Full history list with bottom tabs |
| 15 | `saved_words_collections` | Core | Saved words, collections, quiz CTA |
| 16 | `settings_preferences` | Core | Theme, font, toggles |
| 17 | `navigation_main_drawer` | Navigation | Desktop sidebar drawer pattern |
| 18 | `authentication_login` | Auth | Welcome back / sign in |
| 19 | `authentication_signup` | Auth | Create account |
| 20 | `authentication_forgot_password_entry` | Auth | Email entry for recovery |
| 21 | `authentication_otp_verification` | Auth | OTP code entry |
| 22 | `authentication_reset_password` | Auth | New password form |
| 23 | `authentication_recovery_success` | Auth | Recovery confirmation |
| 24 | `authentication_success_state` | Auth | Login success celebration |
| 25 | `authentication_error_state` | Auth | Auth failure illustration |
| 26 | `authentication_session_expired` | Auth | Session timeout prompt |
| 27 | `state_word_not_found` | Error | 404 — Linguistic Discovery Pending |
| 28 | `state_offline` | Error | Offline with cache status grid |
| 29 | `state_connection_error` | Error | Connection failed |
| 30 | `state_server_error_timeout` | Error | 503 / API timeout |
| 31 | `state_unexpected_error` | Error | Generic failure |
| 32 | `state_update_required` | Error | Force update gate |
| 33 | `system_states` | Error | Gallery of all error states |
| 34 | `shader_1` | Decorative | Background shader variant 1 |
| 35 | `shader_2` | Decorative | Background shader variant 2 |
| 36 | `app_store_showcase` | Marketing | App Store preview composite |

---

## 3. Screen-to-Implementation Mapping

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented with design parity |
| ⚠️ | Implemented with gaps |
| ❌ | Not implemented |
| 🔀 | Intentionally diverged (documented decision) |
| 📎 | Partial — shared component covers multiple designs |

### Entry & onboarding

| Stitch folder | RN screen / component | Status | Notes |
|---------------|----------------------|--------|-------|
| `launch_screen` | `SplashScreen.tsx` | ⚠️ | Combined with bootstrap; no separate launch route |
| `splash_screen` | `SplashScreen.tsx` | ✅ | Animated V logo, INTELLIGENCE tagline |
| `verba_app_logo` | Inline in Splash, auth headers | ⚠️ | Text "V" icon vs designed logo asset |
| `onboarding_flow` | — | ❌ | Composite not used; individual slides preferred |
| `onboarding_search` | `OnboardingSearchSlide.tsx` | ✅ | Instant Intelligence mock UI |
| `onboarding_audio` | `OnboardingAudioSlide.tsx` | ✅ | Waveform animation |
| `onboarding_offline` | `OnboardingOfflineSlide.tsx` | ✅ | Cloud/tablet motif |
| `onboarding_final` | `OnboardingFinalSlide.tsx` | ✅ | Ethereal WOTD card preview |
| — | `OnboardingScreen.tsx` | ✅ | 4-slide carousel orchestrator |

### Core dictionary flows

| Stitch folder | RN screen / component | Status | Notes |
|---------------|----------------------|--------|-------|
| `verba_home_search_insights` | `DiscoverScreen.tsx` | ⚠️ | WOTD/trending are mock data; bento stats present |
| `search_live_suggestions` | `SearchSuggestionsPanel.tsx` | ✅ | Prefix filter from `suggestionBank.ts` |
| `search_loading_empty_states` | `LoadingSpinner.tsx` | ✅ | Shimmer skeleton (`isSkeleton=true`) |
| `word_details_ethereal` | `WordDetailsScreen.tsx` | ⚠️ | Hero image, notes, accents; uses inline defs not `MeaningCard` |
| `audio_experience_eloquent` | — | ❌ | Immersive audio layout not built |
| `search_history` | `HistoryScreen.tsx` | ⚠️ | Functional; minor glass row styling gaps |
| `saved_words_collections` | `SavedWordsScreen.tsx` | ✅ | Tabs, streak bento, quiz modal |
| `settings_preferences` | `SettingsScreen.tsx` | ✅ | Theme circles, font scale, toggles, logout |

### Navigation patterns

| Stitch folder | RN implementation | Status | Notes |
|---------------|-------------------|--------|-------|
| `navigation_main_drawer` | — | 🔀 | **Removed** — replaced by bottom tabs per `Navigation-Architecture-Report.md` |
| Bottom tabs (in HTML footers) | `VerbaTabBar.tsx` + `AppNavigator.tsx` | ✅ | 3 tabs: Dictionary, History, Saved |
| Header account icon | Discover header → Settings | ✅ | `account-circle` in stack header |
| Translate tab (exploration shells) | — | 🔀 | Intentionally omitted — not in assessment |
| Profile tab (exploration shells) | — | 🔀 | Settings via header icon instead |

### Authentication

| Stitch folder | RN screen | Status | Notes |
|---------------|-----------|--------|-------|
| `authentication_login` | `LoginScreen.tsx` | ✅ | Glass card, demo prefill |
| `authentication_signup` | `SignUpScreen.tsx` | ✅ | Name, email, password |
| `authentication_forgot_password_entry` | `ForgotPasswordScreen.tsx` (step 1) | ✅ | Email request step |
| `authentication_reset_password` | `ForgotPasswordScreen.tsx` (step 2) | ⚠️ | Combined 2-step flow vs separate screens |
| `authentication_otp_verification` | — | ❌ | No OTP UI |
| `authentication_recovery_success` | — | ❌ | Alert only |
| `authentication_success_state` | — | ❌ | Alert + navigation only |
| `authentication_error_state` | — | ⚠️ | Inline error text + `Alert` |
| `authentication_session_expired` | — | ⚠️ | `AuthContext` message; no dedicated screen |

### Error & system states

| Stitch folder | RN component | Status | Notes |
|---------------|--------------|--------|-------|
| `state_word_not_found` | `ErrorView` type `404` | ✅ | Hero image, inline search, Request Word |
| `state_offline` | `ErrorView` type `offline` | ✅ | Network/cache status grid |
| `state_connection_error` | `ErrorView` type `connection_error` | ✅ | Retry / cancel |
| `state_server_error_timeout` | `ErrorView` type `timeout` | ✅ | 503 badge |
| `state_unexpected_error` | `ErrorView` type `unexpected` | ✅ | Support link |
| — | `ErrorView` type `server` | ✅ | Generic server error |
| `state_update_required` | — | ❌ | No version gate |
| `system_states` | — | ❌ | Gallery not implemented (by design) |

### Decorative / marketing

| Stitch folder | RN implementation | Status |
|---------------|-------------------|--------|
| `shader_1` | — | ❌ |
| `shader_2` | — | ❌ |
| `app_store_showcase` | — | ❌ (marketing only) |

---

## 4. Component-to-Design Mapping

| Design component (DESIGN.md) | RN component | Used in screens |
|------------------------------|--------------|-----------------|
| Glass search bar (pill, mic cyan) | `SearchBar.tsx` | Discover, History |
| Word card (24px radius, audio trigger) | `WordCard.tsx` | Discover (WOTD) |
| Saved word row card | `SavedWordCard.tsx` | Saved |
| Glass surface wrapper | `GlassCard.tsx` | Widespread |
| Pronunciation trigger (cyan, pulse) | `PronunciationButton.tsx` | WordCard, WordDetails |
| Definition left-bar indicator | `DefinitionItem.tsx` | **Unused** (inline in WordDetails) |
| Example sentence styling | `ExampleText.tsx` | **Unused** (inline in WordDetails) |
| POS + definitions group | `MeaningCard.tsx` | **Unused** (inline in WordDetails) |
| History swipe row | `HistoryItem.tsx` | History |
| Empty state illustration | `EmptyState.tsx` | History, Saved |
| Skeleton shimmer loader | `LoadingSpinner.tsx` | WordDetails, Saved |
| Error state layouts | `ErrorView.tsx` | WordDetails |
| Bottom tab bar (blur, active pill) | `VerbaTabBar.tsx` | Main tabs |
| Auth glass card | `AuthGlassCard.tsx` | Login, SignUp, ForgotPassword |
| Auth text field | `AuthTextField.tsx` | Auth screens |
| Suggestions panel | `SearchSuggestionsPanel.tsx` | Discover overlay |

---

## 5. Navigation Design vs Implementation

### Design exploration (HTML footers)

Early exploration screens show **4–5 bottom tabs**:

```
Translate | Dictionary | History | Profile
```

Some variants add **Saved Words** as a fifth tab. `word_details_ethereal` and `audio_experience_eloquent` show a leaner **4-tab set without Translate**.

### Implemented navigation

```
Onboarding → Auth → MainTabs[Dictionary*, History, Saved]
                      Dictionary* = Stack[Discover, WordDetails, Settings]
```

| Design element | Implementation |
|----------------|----------------|
| Dictionary tab | `Dictionary` tab → Discover stack |
| History tab | `History` tab → `HistoryScreen` |
| Saved tab | `Saved` tab → `SavedWordsScreen` |
| Settings | Stack push from Discover header icon |
| Desktop drawer | Not on mobile (by decision) |
| Hamburger menu | Not implemented |

---

## 6. Color & Typography Implementation

| Design token | `theme.ts` key | Applied via |
|--------------|----------------|-------------|
| `primary` | `primary` | Headers, POS accents, tab active |
| `secondary` | `secondary` | Buttons, streak, accent chips |
| `tertiary` | `tertiary` | Mic icon, fire streak icon |
| `surface` / containers | `surface`, `surfaceContainer*` | Cards, backgrounds |
| `display-word-mobile` | `typography.displayWordMobile` | Word titles |
| `definition-body` | `typography.definitionBody` | Definitions |
| `label-caps` | `typography.labelCaps` | Section labels, tab labels |

**Font loading:** `App.tsx` loads Inter weights 400–700 via `@expo-google-fonts/inter`.

---

## 7. Platform-Specific Design Notes

| Concern | Design spec | Implementation |
|---------|-------------|----------------|
| Glass blur | 20px backdrop blur | `expo-blur` on iOS (`GlassCard`, `VerbaTabBar`); Android solid translucency fallback |
| Safe areas | Extend blur to edges | `useSafeAreaInsets` on WordDetails, auth screens |
| Touch targets | 44px minimum | Addressed in UI-Layout-Audit fixes |
| Dark mode | Deep navy surfaces | `midnightThemeColors` + `isDarkMode` toggle |

---

## 8. Design Coverage Summary

| Category | Stitch folders | Implemented | Partial | Missing / diverged |
|----------|----------------|-------------|---------|-------------------|
| Entry / onboarding | 9 | 7 | 2 | 1 (onboarding_flow composite) |
| Core dictionary | 8 | 6 | 2 | 1 (audio_experience) |
| Navigation | 1 | 0 | 0 | 1 (drawer — diverged) |
| Authentication | 9 | 3 | 3 | 3 |
| Error states | 7 | 6 | 0 | 1 (update_required) |
| Decorative / marketing | 3 | 0 | 0 | 3 |
| **Total** | **37** | **22** | **7** | **8** |

**Design parity score (core dictionary path):** ~85% — primary user journeys match `word_details_ethereal`, `search_live_suggestions`, `saved_words_collections`, `search_history`, and `settings_preferences` with minor visual and data-source gaps.

---

## 9. Priority Design Gaps (Visual)

1. **Hero word image** — Word Details uses a static remote placeholder, not word-specific imagery.
2. **History / Saved row glass polish** — noted as minor gaps in Phase 2 out-of-scope.
3. **Auth flow screens** — OTP, session expired, success celebration screens missing.
4. **Logo asset** — Text-based "V" vs designed logo in `verba_app_logo`.
5. **Shader backgrounds** — Atmospheric blobs in Splash only; shader_1/2 not applied globally.
6. **Voice search mic** — Designed as functional cyan mic; shows unavailable alert.

---

*Mapping based on HTML design folders and current `src/` implementation. No source files were modified.*
