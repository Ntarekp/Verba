# Stitch Screen Checklist

Audit of every subfolder under `stitch_verba_intelligence_platform/`, compared against the current React Native implementation as of this review. Implementation status is based on **actual routes, navigation reachability, and UI behavior** — not folder-name assumptions.

**Legend:** Mark **✓** in exactly one implementation column per row.

| Stitch Folder | Screen Purpose | Implemented | Partially Implemented | Not Implemented | RN Screen/File | Notes |
|---|---|:---:|:---:|:---:|---|---|
| `app_store_showcase` | Decorative/marketing — **Verba Marketing Showcase** | — | — | ✓ | — | App-store marketing layout with hero copy and device frames. No RN route or screen; not part of app navigation. |
| `audio_experience_eloquent` | Core feature — **Eloquent Pronunciation** (immersive audio) | — | ✓ | — | `src/screens/WordDetailsScreen.tsx`, `src/context/AudioContext.tsx` | Stitch shows a dedicated full-screen pronunciation experience with WebGL shader background, waveform, and phonetic chips. RN plays pronunciation inline on Word Details (play/pause, accent switch, autoplay). No separate navigable route; immersive layout and shader card not replicated. |
| `authentication_error_state` | Authentication — **Account Temporary Locked** | — | — | ✓ | — | Dedicated locked-account screen with countdown/support CTA. RN auth errors surface as inline text and `Alert` via `getAuthErrorMessage` / `showAuthAlert`; no lockout screen or route. |
| `authentication_forgot_password_entry` | Authentication — **Reset Password** (email entry) | — | ✓ | — | `src/screens/auth/ForgotPasswordScreen.tsx` | Step 1 (`request`) of a two-step flow in one screen. Reachable: `Auth` → `Login` → “Forgot password?” → `ForgotPassword`. Stitch OTP/email-verification step before reset is skipped (demo alert instead). |
| `authentication_login` | Authentication — **Welcome Back** | ✓ | — | — | `src/screens/auth/LoginScreen.tsx` | Reachable on first launch after onboarding (`Onboarding` → `Auth/Login`) and after logout (`Settings` → sign out → `resetToAuth`). Successful login resets root to `Main`. Layout matches Stitch glass-card login intent. |
| `authentication_otp_verification` | Authentication — **Verification Code** | — | — | ✓ | — | 6-digit OTP UI with resend timer. No RN screen, route, or navigation path in `AuthStackParamList`. |
| `authentication_recovery_success` | Authentication — **Account Recovered** | — | ✓ | — | `src/screens/auth/ForgotPasswordScreen.tsx` (alert only) | Stitch shows a full success screen after recovery. RN shows `showAuthAlert('Password Updated', …)` then `navigation.navigate('Login')`; no dedicated success route. |
| `authentication_reset_password` | Authentication — **Create New Password** | — | ✓ | — | `src/screens/auth/ForgotPasswordScreen.tsx` | Step 2 (`reset`) in same file as forgot-password entry. Reachable only after completing step 1 in-session. Stitch treats this as a separate screen; RN merges both steps. |
| `authentication_session_expired` | Authentication — **Session Expired** | — | ✓ | — | `src/context/AuthContext.tsx`, `src/screens/auth/LoginScreen.tsx` | On expired session, `restoreSession` clears storage and sets `lastMessage`; `LoginScreen` shows alert on mount. No dedicated session-expired screen or route. |
| `authentication_signup` | Authentication — **Create Your Account** | ✓ | — | — | `src/screens/auth/SignUpScreen.tsx` | Reachable: `Auth/Login` → “Sign up”. Success alert then root reset to `Main`. Matches Stitch signup intent. |
| `authentication_success_state` | Authentication — **Success** (post-auth) | — | ✓ | — | `src/context/AuthContext.tsx` (alerts) | Stitch full-screen success states after login/signup. RN uses `lastMessage` welcome alerts and SignUp success alert; immediately navigates to `Main` without a success screen. |
| `launch_screen` | Onboarding — **Verba \| Pure Intelligence** (brand launch) | — | ✓ | — | `src/screens/SplashScreen.tsx` | Shown during bootstrap while `authLoading` or `bootstrapRoute === null` in `AppNavigator` — not a registered route. Logo + “INTELLIGENCE” tagline approximates launch; not a separate timed launch sequence from `splash_screen`. |
| `navigation_main_drawer` | Navigation — **Navigation Drawer** | — | ✓ | — | `src/navigation/DrawerContent.tsx`, `src/navigation/AppNavigator.tsx` (`MainDrawerNavigator`) | Reachable: swipe from any `Main` tab, or hamburger on `Discover` only. RN drawer has profile, Home, Search History, Saved Words, Settings, recent lookups (8). Missing Stitch items: Word of the Day link, About, Feedback, Support, Premium upgrade card, tier/level stats. |
| `onboarding_audio` | Onboarding — **Perfect Pronunciation** | ✓ | — | — | `src/screens/OnboardingScreen.tsx`, `src/components/onboarding/OnboardingAudioSlide.tsx` | Slide 2 of 4 in horizontal pager. Reachable: first launch → `Onboarding` (before `verba_first_launch_done`). Title and copy match Stitch (“Perfect Pronunciation”). |
| `onboarding_final` | Onboarding — **Ready to Begin** | ✓ | — | — | `src/screens/OnboardingScreen.tsx`, `src/components/onboarding/OnboardingFinalSlide.tsx` | Slide 4; “Get Started” sets `verba_first_launch_done` and `navigation.replace('Auth', { screen: 'Login' })`. Reachable on first launch only (unless manually reset). |
| `onboarding_flow` | Onboarding — **Verba Onboarding** (3-slide composite) | — | — | ✓ | `src/screens/OnboardingScreen.tsx` (individual slides used instead) | Single HTML composites three slides (“Intelligence at your fingertips”, “Speaks your language”, “Always with you”). RN implements four separate slide components, not this composite layout. Content overlap exists but this specific composite screen is not used. |
| `onboarding_offline` | Onboarding — **Learn Anywhere** | ✓ | — | — | `src/screens/OnboardingScreen.tsx`, `src/components/onboarding/OnboardingOfflineSlide.tsx` | Slide 3. Reachable on first launch. Title matches Stitch. |
| `onboarding_search` | Onboarding — **Instant Intelligence** | ✓ | — | — | `src/screens/OnboardingScreen.tsx`, `src/components/onboarding/OnboardingSearchSlide.tsx` | Slide 1 with header Skip. Reachable on first launch. Title matches Stitch. |
| `saved_words_collections` | Core feature + Learning — **Saved Words** | — | ✓ | — | `src/screens/SavedWordsScreen.tsx` | Reachable: `Main` → `Saved` tab or drawer → Saved Words. Has collection tabs (ALL, Favorites, Academic, Travel), stats, search, quiz `Modal`. Missing Stitch “+ NEW COLLECTION” and some collection-management UX; quiz is modal not full-screen route. |
| `search_history` | Core feature — **Search History** | ✓ | — | — | `src/screens/HistoryScreen.tsx` | Reachable: `Main` → `History` tab or drawer → Search History. Tap entry → `navigateToWordDetails`. Dedicated tab matches assessment scope; Stitch also shows history in drawer (RN adds recent lookups in drawer). |
| `search_live_suggestions` | Core feature — **Verba Search** (live suggestions overlay) | ✓ | — | — | `src/screens/DiscoverScreen.tsx`, `src/components/SearchSuggestionsPanel.tsx` | Overlay appears on `Discover` when query non-empty (`showSuggestions`). Selecting suggestion navigates to `WordDetails`. Not a separate route; behavior matches Stitch overlay intent on home search. |
| `search_loading_empty_states` | Error state + Core — **Loading & Error States** (design gallery) | — | ✓ | — | `src/screens/WordDetailsScreen.tsx`, `src/components/LoadingSpinner.tsx`, `src/components/ErrorView.tsx` | Stitch gallery shows inline home loading plus multiple error variants. RN navigates immediately to `WordDetails` on search submit; loading spinner and `ErrorView` render there only. No gallery route; Discover has no inline search-loading state. |
| `settings_preferences` | Settings — **Settings** | ✓ | — | — | `src/screens/SettingsScreen.tsx` | Reachable: `Discover` header account icon → `Settings`, or drawer → Settings. Theme, font scale, autoplay, notifications, account, logout. Registered in `DictionaryStackParamList`. |
| `shader_1` | Decorative/marketing — **WebGL Shader Demo 1** | — | — | ✓ | — | Standalone shader canvas for design exploration. No RN equivalent (no WebGL backgrounds). |
| `shader_2` | Decorative/marketing — **WebGL Shader Demo 2** | — | — | ✓ | — | Same as `shader_1`; decorative asset only. |
| `splash_screen` | Onboarding — **Verba** (minimal splash) | — | ✓ | — | `src/screens/SplashScreen.tsx` | Minimal brand splash in Stitch. RN uses one bootstrap `SplashScreen` for both launch and splash intent while resolving auth/onboarding; not a post-onboarding route. |
| `state_connection_error` | Error state — **Connection Failed** | — | ✓ | — | `src/components/ErrorView.tsx` (`connection_error`), `src/screens/WordDetailsScreen.tsx` | Shown when `fetchDetails` catches `CONNECTION_ERROR`. Reachable only via failed word lookup on `WordDetails`. Not a standalone navigable error route. Copy aligns with Stitch title. |
| `state_offline` | Error state — **You're Offline** | — | ✓ | — | `src/components/ErrorView.tsx` (`offline`), `src/screens/WordDetailsScreen.tsx` | Triggered by `NETWORK_OFFLINE` on word fetch. Includes “Access Saved Words” → `navigateToSavedTab`. Inline on `WordDetails`, not global offline gate. |
| `state_server_error_timeout` | Error state — **Connection Lost** (503 / timeout) | — | ✓ | — | `src/components/ErrorView.tsx` (`timeout`, `server`), `src/screens/WordDetailsScreen.tsx` | `timeout` maps `NETWORK_TIMEOUT` / `SERVER_TIMEOUT` (“Connection Lost”, 503 badge). `server` maps `SERVER_ERROR` / empty response (“Server Error” — title differs from Stitch). Both inline on `WordDetails`. |
| `state_unexpected_error` | Error state — **Something Went Astray** | — | ✓ | — | `src/components/ErrorView.tsx` (`unexpected`), `src/screens/WordDetailsScreen.tsx` | Triggered by `UNKNOWN_ERROR` or unclassified errors during word fetch. Title matches Stitch. Inline only. |
| `state_update_required` | Error state — **Update Required** (force update) | — | — | ✓ | — | Force-update blocking screen with store CTA. No RN version check, screen, or route. |
| `state_word_not_found` | Error state — **Linguistic Discovery Pending** (404) | — | ✓ | — | `src/components/ErrorView.tsx` (`404`), `src/screens/WordDetailsScreen.tsx` | Triggered by `WORD_NOT_FOUND`. Includes hero image, search-new-word field, retry. Title matches Stitch. Inline on `WordDetails`. |
| `system_states` | Error state — **System States** (error gallery) | — | — | ✓ | — | Developer/design gallery of all error variants in one HTML page. No RN equivalent route; errors are triggered contextually on `WordDetails` only. |
| `verba_app_logo` | Decorative/marketing — **Verba App Logo** (SVG asset) | — | ✓ | — | `src/screens/SplashScreen.tsx`, auth screens (inline “V” / “Verba” text) | SVG logo spec in Stitch. RN uses typographic “V” circle and “Verba” wordmark inline; no dedicated logo screen or imported SVG asset route. |
| `verba_home_search_insights` | Core feature — **Verba Home Search** | — | ✓ | — | `src/screens/DiscoverScreen.tsx` | Reachable: `Main` → `Dictionary/Discover` (default tab). Search bar, recent lookups, Word of the Day, trending words implemented. Diverges: RN bottom tabs are Dictionary / History / Saved (Stitch mobile mock shows Dictionary / Translate / History / Profile); WOD and trending are hardcoded, not API-driven. |
| `verba_intelligence` | Decorative/marketing — **Verba Intelligence** (design tokens) | — | ✓ | — | `src/styles/theme.ts`, `src/context/ThemeContext.tsx` | `DESIGN.md` color/type tokens — not a navigable screen. Token values are applied via theme system across the app; no standalone UI. |
| `word_details_ethereal` | Core feature — **Ethereal Word Details** | ✓ | — | — | `src/screens/WordDetailsScreen.tsx` | Reachable: search/history/saved/drawer recent → `WordDetails` with `{ word }`. Header hidden; glass cards, phonetics, meanings, notes, related words, save. Matches core word-details intent; no separate “ethereal” route name. |

---

## Summary counts (this audit only)

| Status | Count |
|---|---|
| Implemented | 11 |
| Partially implemented | 21 |
| Not implemented | 5 |

**Total Stitch subfolders audited:** 37

---

## Reachability quick reference (RN registered routes)

| Route | How to reach |
|---|---|
| `Onboarding` | First launch (`verba_first_launch_done` ≠ `'true'`) |
| `Auth/Login` | After onboarding; session expired bootstrap; logout from Settings |
| `Auth/SignUp` | Login → Sign up |
| `Auth/ForgotPassword` | Login → Forgot password |
| `Main` → `Dictionary/Discover` | Login success; default tab |
| `Main` → `Dictionary/WordDetails` | Search submit; history/saved/drawer word tap |
| `Main` → `Dictionary/Settings` | Discover account icon; drawer → Settings |
| `Main` → `History` | Bottom tab; drawer → Search History |
| `Main` → `Saved` | Bottom tab; drawer → Saved Words |
| Drawer | Swipe from any Main tab; hamburger on Discover only |
| `SplashScreen` | Bootstrap only (not in navigator) |
| Quiz modal | Saved tab → Start Quiz (≥4 saved words) |
