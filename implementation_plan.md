# Verba Dictionary Mobile Application - Production Implementation Plan

This document provides a comprehensive, production-ready implementation plan for **Verba**, a modern Neo-Minimalist Dictionary Mobile Application built with React Native and Expo. It translates design artifacts, academic assessment criteria, and technical constraints into a detailed execution blueprint.

---

## Goal Description

The objective is to develop a premium academic-grade Dictionary Mobile Application named **Verba** using **React Native (Expo CLI)**. The application integrates with the public `DictionaryAPI.dev` service to fetch rich definitions, phonetics, parts of speech, synonyms, antonyms, examples, and origins. 

Key features include:
*   **Search Engine**: Instant word lookups with live suggestions, input validation, and robust error/empty states.
*   **Pronunciation Audio**: Regional audio playback using `expo-av` with automatic fallbacks and buffering feedback.
*   **Search History**: Persisted, date-grouped list (`AsyncStorage`) supporting sliding deletions and re-searches.
*   **Saved Words & Collections**: Vocabulary categorization (e.g., Favorites, Academic, Travel) with streak tracking and mastery indicators.
*   **Learning Analytics**: Streak counter (e.g., 14 days), Words Mastered metrics, and a "Start Quiz" mock feature.
*   **Settings Preferences**: Theme customizer (Royal Indigo, Electric Blue, Premium Cyan), Dark Mode toggle, font size scale, and audio autoplay toggles.
*   **Neo-Minimalist Styling**: A clean, technical design utilizing glassmorphism, harmonious HSL palettes, custom typography (Inter), and subtle card shadow depths.

---

## User Review Required

> [!IMPORTANT]
> **Android Backdrop-Blur Limitation**
> React Native's standard style definitions do not support CSS `backdrop-filter: blur(20px)` on Android natively.
> *   **Proposed Solution**: Utilize `expo-blur` on iOS to achieve the premium glassmorphism effect. For Android, implement a fallback using high-translucency solid colors (e.g., `#f8f9ff` with 85% opacity in light mode) combined with an inner 1px border (`rgba(255, 255, 255, 0.4)`) and a soft, diffused shadow configuration (`shadowColor: '#0b1c30'`, `shadowRadius: 16`, `shadowOpacity: 0.05`, `elevation: 4`).

> [!WARNING]
> **Dictionary API Variations**
> The `DictionaryAPI.dev` service has varying formats: some words lack phonetic text or regional audio recordings (e.g., US/UK), and some examples are empty.
> *   **Proposed Solution**: Implement a robust parsing helper (`apiParser.ts`) that extracts phonetic spelling from the first non-empty field, gathers all audio links (checking if they end with `.mp3`), and dynamically disables the volume trigger if no audio stream is present, showing a custom Toast alert instead of crashing.

---

## Open Questions

> [!IMPORTANT]
> 1. **Authentication Scope**: The stitch designs include `authentication_login`, `authentication_signup`, and Recovery flows. Since this is an academic mobile application, should we simulate the login/profile logic locally using `AsyncStorage` (storing credentials and profile stats on-device), or is a mock bypass screen sufficient?
> 2. **Quiz Logic**: The dashboard displays a "Start Quiz" button. Should we implement a lightweight local multiple-choice vocabulary quiz based on the user's Saved Words, or should it show a temporary mock dialogue explaining the feature? (A local quiz would earn additional marks for assessment optimization).

---

## 1. Requirements Analysis

### Functional Requirements (FR)
*   **FR-1 (Search & Input Validation)**: Trims input whitespace, filters out numbers/special characters, and disables lookup triggers for empty strings.
*   **FR-2 (API Definition Display)**: Renders word, phonetic transcriptions, part of speech chips, numbered definitions, origin texts, and usage examples.
*   **FR-3 (Audio Playback)**: Buffers and plays phonetic `.mp3` tracks. Employs `expo-av` playback states and error handlers.
*   **FR-4 (Search History)**: Saves looked-up words in local storage. Groups lists temporally (Recent, Yesterday, Older). Supports swipe-to-delete.
*   **FR-5 (Saved Words / Collections)**: Saves/unsaves words into custom folders (Favorites, Academic, Travel). Organizes items into tabs.
*   **FR-6 (Progress Tracking)**: Records active streak days and count of mastered words (calculated based on number of saved words labeled "mastered").
*   **FR-7 (App Preferences)**: Allows adjusting Font Scale (Small/Medium/Large), Dark Mode toggling, Accent Theme switching, and Audio Autoplay.
*   **FR-8 (System States)**: Displays custom graphic screens for Word Not Found (404), Network Offline, and Server Timeouts.

### Non-Functional Requirements (NFR)
*   **NFR-1 (UX and Aesthetics)**: Strict adherence to the 8-point layout grid. Glassmorphic cards with rounded corners (8px for buttons, 24px for large content wrappers).
*   **NFR-2 (Typography)**: Loads and displays Google Font **Inter** for Display Words, Definition Bodies, and Caps Labels.
*   **NFR-3 (Responsiveness)**: Renders correctly in portrait mode on Android (e.g., Pixel series) and iOS (e.g., iPhones). Adapts columns for wider tablet layouts.
*   **NFR-4 (Offline Capability)**: Persists user settings, history, and bookmarks. Automatically blocks API queries when offline and prompts the user with the "Offline Screen."

### Acceptance Criteria
1.  **Search Input**: Tapping search executes an Axios query. While pending, a shimmer skeleton card appears.
2.  **Audio Pronunciation**: Tapping the Premium Cyan speaker icon streams audio. If it fails, a Toast message is displayed: "Pronunciation unavailable."
3.  **Local History**: History updates instantly on the History Screen. List limits are set to 100 items to conserve device memory.
4.  **UI Design**: Typography sizes must scale when adjusted in Settings, affecting all definition text dynamically.

---

## 2. Application Architecture

### Folder Structure
```
d:/Mobile/Verba-Mobile/
├── App.tsx                    # Application entry and provider wraps
├── app.json                   # Expo build details & permissions
├── package.json               # Package dependencies
├── tsconfig.json              # TypeScript compilation rules
└── src/
    ├── assets/                # App icon, splash screen, and local images
    ├── components/            # Reusable presentational components
    │   ├── SearchBar.tsx
    │   ├── LoadingSpinner.tsx
    │   ├── WordCard.tsx
    │   ├── MeaningCard.tsx
    │   ├── DefinitionItem.tsx
    │   ├── ExampleText.tsx
    │   ├── PronunciationButton.tsx
    │   ├── ErrorView.tsx
    │   ├── EmptyState.tsx
    │   └── HistoryItem.tsx
    ├── context/               # Global states
    │   ├── ThemeContext.tsx   # Color system, Dark Mode, Font Size Scale
    │   ├── HistoryContext.tsx # AsyncStorage search history sync
    │   └── SavedContext.tsx   # AsyncStorage saved words sync
    ├── hooks/                 # Custom hook utilities
    │   ├── useAudio.ts        # Buffering & audio playback engine
    │   └── useDebounce.ts     # Search suggestion debouncing
    ├── navigation/            # Navigation structure
    │   ├── AppNavigator.tsx   # Core drawer & stacks
    │   └── DrawerContent.tsx  # Custom side menu with profile details
    ├── screens/               # Screen modules
    │   ├── SplashScreen.tsx
    │   ├── OnboardingScreen.tsx
    │   ├── DiscoverScreen.tsx
    │   ├── WordDetailsScreen.tsx
    │   ├── HistoryScreen.tsx
    │   ├── SavedWordsScreen.tsx
    │   └── SettingsScreen.tsx
    ├── services/              # API connections
    │   ├── api.ts             # Axios configuration
    │   └── dictionaryService.ts # API request logic
    ├── storage/               # AsyncStorage schemas and transactions
    │   └── localStore.ts
    ├── styles/                # Brand style standards
    │   └── theme.ts
    └── utils/                 # General helpers
        ├── apiParser.ts       # Parses raw JSON from the dictionary API
        └── dateHelper.ts      # Grouping dates (Today/Yesterday)
```

### Component Hierarchy
```
App (Root)
 └── Providers (ThemeContext, HistoryContext, SavedContext)
      └── NavigationContainer
           └── DrawerNavigator
                ├── DrawerContent (Profile banner, Stats, Screen Links)
                └── MainStackNavigator (Screens)
                     ├── OnboardingScreen (Carousel slides)
                     ├── DiscoverScreen (Home / Dashboard / Recent lookups / Bento stats)
                     │    ├── SearchBar
                     │    ├── WordOfDayCard (PronunciationButton)
                     │    ├── BentoLearningStats
                     │    └── RecentSearchChips
                     ├── WordDetailsScreen (Def definitions, Synonyms/Antonyms)
                     │    ├── WordCard (PronunciationButton, BookmarkToggle)
                     │    ├── MeaningCard
                     │    │    ├── DefinitionItem (ExampleText)
                     │    │    └── SynonymAntonymGrid
                     │    └── NotesInputSection
                     ├── HistoryScreen (Grouped lookup logs)
                     │    ├── SearchBar (Internal filter)
                     │    └── HistoryItem (SwipeToDelete container)
                     ├── SavedWordsScreen (Collections tabs, Mastery stats)
                     │    ├── SearchBar
                     │    ├── CollectionsTabs
                     │    └── WordCard
                     ├── SettingsScreen (User customization panel)
                     │    └── SettingsToggles & Sliders
                     └── ErrorScreen (Offline / 404 / Server Timeout states)
```

### state Management Strategy
1.  **Theme State**: Shared via `ThemeContext`. Houses Dark Mode toggles, selected theme color profiles (Classic Indigo, Electric Blue, Teal), and Typography scaling multipliers (`fontSizeScale`).
2.  **History State**: Managed via `HistoryContext`. Pulls search logs on boot and updates the state whenever a query finishes successfully, writing edits straight to AsyncStorage.
3.  **Saved Words State**: Managed via `SavedContext`. Syncs bookmarks, tracks mastery indicators, and calculates user streak counts.

### Service & API Structure
Rely on Axios for networking. Wrap requests in try-catch-recovery envelopes. Execute responses through an parsing utility (`apiParser.ts`) to return clean, typed TypeScript models.

---

## 3. Screen Mapping

We translate the provided HTML & PNG screens into React Native layouts as follows:

| Stitch Mockup Folder | Route / Screen Name | Screen Purpose | Required UI Components | API Data Integration | User Interactions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `launch_screen` & `splash_screen` | `Splash` | Visual entry, checks first-time launch and preloads assets. | `LuminaLogo`, Custom Spinner. | Check first launch flag in storage. | None (auto-routes after 2s). |
| `onboarding_flow`, `onboarding_search`, `onboarding_audio`, `onboarding_final`, `onboarding_offline` | `Onboarding` | Introduces Features, Audio Pronunciations, and Offline abilities. | `Carousel`, `OnboardSlide`, indicator dots, "Next" & "Get Started" buttons. | Mock words & soundwave indicators. | Swipe gestures, Next button, Skip button, Get Started button. |
| `verba_home_search_insights` | `Discover` | Core portal showing search bar, stats widgets, and trending topics. | `SearchBar`, `WordOfDayCard`, `BentoStats`, `RecentChips`, `TrendingList`. | Fetch "Ethereal" or randomly cached daily word. | Focus search, trigger pronunciation, tap history chips, save trending word. |
| `search_live_suggestions` | `SuggestionsOverlay` | Displays real-time matching completions dynamically. | `SuggestionsPanel`, `SuggestionRow`. | Prefix queries (filtered lists). | Tap row to open word, tap close. |
| `search_loading_empty_states` | `Discover` / `Details` | Loading indicator during active queries. | `SkeletonCard`, `LoadingSpinner`. | API network status (pending). | Cancel lookup. |
| `word_details_ethereal` | `WordDetails` | Full definitions display, synonym grids, origin cards, and note fields. | `WordCard`, `MeaningCard`, `DefinitionItem`, `SynonymsGrid`, `NotesSection`. | Main Dictionary Entry JSON payload. | Play voice audio, toggle bookmark, edit & save mnemonic learning notes. |
| `search_history` | `History` | Displays previous search lookups organized by time stamps. | `HistoryItem`, `SearchBar` (filter), Clear All button. | `SearchHistoryItem[]` from local storage. | Search history filter, tap row to lookup, swipe-left to delete. |
| `saved_words_collections` | `SavedWords` | Lists saved words categorized in tabs (Favorites, Academic, Travel). | `StreakBento`, `CollectionsTabs`, `WordGrid`, `QuizStarterButton`. | `SavedWordItem[]` from local storage. | Change tabs, search saved words, untoggle bookmark, start mock quiz. |
| `settings_preferences` | `Settings` | System adjustment panel. | `ToggleSwitch`, Theme selector circles, Font size adjustment line. | AsyncStorage preferences. | Toggle Dark Mode, tap theme colors, slide font scales, logout. |
| `state_word_not_found` | `ErrorView` (404) | Informs user that search query yielded no results. | Circular graphic illustration, Request Word button, Return link. | None. | Request Word (mock trigger), search new word, tap Return link. |
| `state_offline`, `state_connection_error`, `state_server_error_timeout` | `ErrorView` (System) | Notifies user of network problems, server timeouts, or connection cuts. | Warning graphics, Retry button. | None (tracks network status). | Tap Retry Connection button. |

---

## 4. Navigation Design

We utilize React Navigation packages: `@react-navigation/drawer` for primary side menus and `@react-navigation/native-stack` for detailed transitions.

### Navigation Drawer Structure
*   **Discovery Drawer Item**: Routes to `MainStackNavigator` with `Discover` as home screen.
*   **Search History Drawer Item**: Stacks to `HistoryScreen`.
*   **Saved Words Drawer Item**: Stacks to `SavedWordsScreen`.
*   **Settings Drawer Item**: Stacks to `SettingsScreen`.

### Drawer & Screen Flow Diagram
```
              [ Splash Screen ]
                     │ (First-launch check)
                     ▼
           [ Onboarding Carousel ]
                     │ (Completed)
                     ▼
         ┌───────────────────────┐
         │   Drawer Navigator    │
         └───────────┬───────────┘
                     │
     ┌───────────────┼───────────────┬───────────────┐
     ▼               ▼               ▼               ▼
[ Discover ]    [ History ]     [ Saved Words ] [ Settings ]
     │ (Search)      │ (Select)      │ (Select)
     ▼               │               │
[ Loading Shimmer ]  │               │
     │               │               │
     ├───────────────┴───────────────┤
     ▼
[ Word Details ] ◄── (Synonym Tap) ──┐
     │                               │
     ├────────── (404 Error) ───────►[ Word Not Found ]
     │                               
     └────────── (No Connection) ───►[ Offline Screen ]
```

### Deep Linking Config
Deep linking enables users to navigate directly to word definitions from external sources or mobile browser lookups:
```typescript
export const linkingConfig = {
  prefixes: ['verba://', 'https://verba-dictionary.app'],
  config: {
    screens: {
      DrawerNavigator: {
        screens: {
          Discover: 'discover',
          History: 'history',
          SavedWords: 'saved',
          Settings: 'settings',
        },
      },
      WordDetails: 'word/:wordName',
    },
  },
};
```

---

## 5. API Integration Design

The application communicates with the public Dictionary API:
`https://api.dictionaryapi.dev/api/v2/entries/en/{word}`

### Axios Service Layer (`src/services/api.ts`)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.dictionaryapi.dev/api/v2/entries/en',
  timeout: 8000, // 8-second request limit before triggering Timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export default api;
```

### Response Parsing Logic (`src/utils/apiParser.ts`)
Raw responses from DictionaryAPI.dev can contain deep, duplicate phonetic records. The parser processes raw arrays and outputs a structured `DictionaryEntry` entity:
```typescript
import { DictionaryEntry, Phonetic, Meaning } from '../models/DictionaryTypes';

export const parseApiResponse = (data: any[]): DictionaryEntry => {
  const raw = data[0]; // Take primary entry
  
  // Find first non-empty phonetic text
  const textPhonetic = raw.phonetic || 
    raw.phonetics?.find((p: any) => p.text !== undefined)?.text || '';
    
  // Filter phonetics containing valid audio streams
  const validPhonetics: Phonetic[] = (raw.phonetics || [])
    .filter((p: any) => p.audio && p.audio.trim().length > 0)
    .map((p: any) => ({
      text: p.text || textPhonetic,
      audio: p.audio,
      sourceUrl: p.sourceUrl,
    }));

  const structuredMeanings: Meaning[] = (raw.meanings || []).map((m: any) => ({
    partOfSpeech: m.partOfSpeech,
    definitions: (m.definitions || []).map((d: any) => ({
      definition: d.definition,
      synonyms: d.synonyms || [],
      antonyms: d.antonyms || [],
      example: d.example,
    })),
    synonyms: m.synonyms || [],
    antonyms: m.antonyms || [],
  }));

  return {
    word: raw.word,
    phonetic: textPhonetic,
    phonetics: validPhonetics,
    meanings: structuredMeanings,
    origin: raw.origin || '', // Origin field is optional
    sourceUrls: raw.sourceUrls || [],
  };
};
```

### Error Handler Strategy (`src/services/dictionaryService.ts`)
```typescript
import api from './api';
import { parseApiResponse } from '../utils/apiParser';
import { DictionaryEntry } from '../models/DictionaryTypes';

export const lookupWord = async (word: string): Promise<DictionaryEntry> => {
  try {
    const formattedWord = word.trim().toLowerCase();
    const response = await api.get(`/${encodeURIComponent(formattedWord)}`);
    return parseApiResponse(response.data);
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('WORD_NOT_FOUND');
      }
      throw new Error('SERVER_ERROR');
    } else if (error.request) {
      throw new Error('NETWORK_TIMEOUT');
    } else {
      throw new Error('UNKNOWN_ERROR');
    }
  }
};
```

---

## 6. Data Models (`src/models/DictionaryTypes.ts`)

```typescript
export interface Phonetic {
  text: string;
  audio: string;
  sourceUrl?: string;
}

export interface Definition {
  definition: string;
  synonyms: string[];
  antonyms: string[];
  example?: string;
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  origin?: string;
  sourceUrls: string[];
}

export interface SearchHistoryItem {
  id: string;
  word: string;
  partOfSpeech: string;
  definitionSummary: string;
  timestamp: number;
}

export interface SavedWordItem {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definitionSummary: string;
  timestamp: number;
  collection: 'Favorites' | 'Academic' | 'Travel';
  masteryLevel: 1 | 2 | 3; // Reflected visually by 3 progressive indicator dots
  learningNotes?: string;
}
```

---

## 7. UI Components

### 7.1 SearchBar
*   **Responsibility**: Renders a glassmorphic search input field that triggers queries, tracks focus states, and handles microphone input.
*   **Props**:
    ```typescript
    interface SearchBarProps {
      value: string;
      onChangeText: (text: string) => void;
      onSubmit: () => void;
      onClear: () => void;
      placeholder?: string;
    }
    ```
*   **State**: `isFocused: boolean`
*   **Example Implementation**:
    ```tsx
    import React, { useState } from 'react';
    import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
    import { MaterialIcons } from '@expo/vector-icons';
    import { useTheme } from '../context/ThemeContext';

    export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, onSubmit, onClear, placeholder }) => {
      const [isFocused, setIsFocused] = useState(false);
      const { themeColors } = useTheme();

      return (
        <View style={[
          styles.container,
          { 
            backgroundColor: themeColors.surface, 
            borderColor: isFocused ? themeColors.primary : 'rgba(199, 196, 216, 0.4)' 
          }
        ]}>
          <MaterialIcons name="search" size={22} color={themeColors.outline} />
          <TextInput
            style={[styles.input, { color: themeColors.onSurface }]}
            placeholder={placeholder || "Search millions of words..."}
            placeholderTextColor={`${themeColors.outline}90`}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {value.length > 0 ? (
            <TouchableOpacity onPress={onClear} style={styles.iconBtn}>
              <MaterialIcons name="close" size={20} color={themeColors.outline} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialIcons name="mic" size={20} color={themeColors.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      );
    };

    const styles = StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#0b1c30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
      },
      input: {
        flex: 1,
        fontFamily: 'Inter',
        fontSize: 16,
        paddingHorizontal: 8,
        paddingVertical: 0,
      },
      iconBtn: {
        padding: 4,
      }
    });
    ```

### 7.2 LoadingSpinner
*   **Responsibility**: Renders a loading spinner or skeleton shimmer card.
*   **Props**: `message?: string`
*   **State**: `shimmerAnim: Animated.Value`

### 7.3 WordCard
*   **Responsibility**: Core header card for searched words. Displays phonetic spelling, play trigger, POS badge, and save toggle.
*   **Props**:
    ```typescript
    interface WordCardProps {
      word: string;
      phonetic: string;
      partOfSpeech: string;
      audioUrl: string | null;
      isSaved: boolean;
      onPlay: () => void;
      onToggleSave: () => void;
    }
    ```
*   **State**: `pulseAnim: Animated.Value` (for the pronunciation icon trigger pulse).

### 7.4 MeaningCard
*   **Responsibility**: Groups dictionary senses (noun, verb, etc.), displays synonym/antonym chips, and maps definitions.
*   **Props**: `meaning: Meaning`
*   **State**: None.

### 7.5 DefinitionItem
*   **Responsibility**: Render a numbered definition block with vertical bar left highlights.
*   **Props**: `index: number; definition: Definition`
*   **State**: None.

### 7.6 ExampleText
*   **Responsibility**: Style and render example sentences in light card containers.
*   **Props**: `text: string`
*   **State**: None.

### 7.7 PronunciationButton
*   **Responsibility**: Play soundwaves and handle loading indicators during buffering.
*   **Props**: `audioUrl: string | null; onPress: () => void`
*   **State**: `isLoading: boolean`

### 7.8 ErrorView
*   **Responsibility**: Common placeholder layout supporting offline notifications, 404 views, and timeouts.
*   **Props**: `type: '404' | 'offline' | 'timeout'; onRetry: () => void; query?: string`
*   **State**: None.

### 7.9 EmptyState
*   **Responsibility**: Lightweight indicator when lists are empty (e.g., search history is cleared).
*   **Props**: `title: string; description: string; icon: string`
*   **State**: None.

### 7.10 HistoryItem
*   **Responsibility**: List item representation in Search History. Handles swipe-left triggers to delete.
*   **Props**: `item: SearchHistoryItem; onSelect: () => void; onDelete: () => void`
*   **State**: `swipeOffset: Animated.Value`

---

## 8. Feature-by-Feature Implementation

### Feature 1: Search Engine Lookups
1.  **Sanitization**: Scrub numerical characters or spaces. Validate length > 0.
2.  **State Change**: Trigger loading state (`isLoading: true`). If in Discover Screen, transition search inputs to the details header.
3.  **API Call**: Execute `lookupWord(query)`.
    *   *Success*: Save query parameters to `HistoryStore` (AsyncStorage), add payload variables, navigate to `WordDetailsScreen`.
    *   *404 Failure*: Navigate to `ErrorScreen` with type `404` (Linguistic Discovery Pending).
    *   *Timeout / Network cuts*: Navigate to `ErrorScreen` with type `offline` (Connection Lost).
4.  **Auto-Suggestions**: As user types, trigger search-debounce hook. Return matches filtered from recent history or popular collections.

### Feature 2: Rich Word Details Layout
1.  **Typographic hierarchy**: Anchor pages with `Display Word` styles. Ensure font sizes adapt dynamically to the slider values saved in `ThemeContext`.
2.  **POS Filtering**: Map part-of-speech strings to distinct colors (e.g. Indigo for Nouns, Teal for Verbs).
3.  **Synonym Navigation**: Make Synonym/Antonym chips interactive. Tapping a synonym triggers a new definition lookup instantly.
4.  **Notes Section**: Save user-written comments to local storage mapped to the word. Render a multi-line input box at the bottom of definitions.

### Feature 3: Pronunciation Playback
1.  **Audio Engine**: Initialize `Audio.Sound` from `expo-av`.
2.  **Resource Handling**: Always use `try-catch` wrappers during sound load, buffer, play, and release.
3.  **State Management**: Set buffering flags. While buffering, display a spinner in the circular trigger button. Pulse the button when audio is ready.
4.  **Lifecycle Release**: Trigger `soundObject.unloadAsync()` on screen transitions to prevent memory leaks.

### Feature 4: Persistent Search History
1.  **Storage Transaction**: Store as JSON lists in `AsyncStorage`.
2.  **Deduplication**: If looked-up word matches an existing record, move the old record to the top of the history list.
3.  **Temporal Grouping**: Compute timestamp differences to divide lookups into sections: "Recent" (Today), "Yesterday", and "Older".
4.  **SwipeToDelete**: Combine a gesture responder (`PanResponder`) with `Animated` translations to reveal a delete button (Red background, trash icon) when an item is swiped left.

### Feature 5: Preferences and Theming
1.  **Color Profiles**: Map key style guides dynamically:
    *   `Classic (Indigo)`: Primary `#3525cd`, Secondary `#0058be`, Background `#f8f9ff`
    *   `Royal (Navy)`: Primary `#0b1c30`, Secondary `#2170e4`, Background `#eff4ff`
    *   `Midnight (Dark)`: Primary `#1e293b`, Secondary `#3b82f6`, Background `#0f172a`
2.  **Dark Mode Integration**: Set context switches that automatically toggle backgrounds, text color sheets, and ambient shadows.
3.  **Text Adjustment**: Provide standard scaling factor coefficients (`0.85`, `1.0`, `1.25`) which compute line-height ratios dynamically to keep readability sharp.

---

## 9. Local Storage Strategy

Using `@react-native-async-storage/async-storage` as the storage layer.

### AsyncStorage Schema Definition
```json
{
  "verba_history": [
    {
      "id": "1717834567000",
      "word": "ephemeral",
      "partOfSpeech": "adjective",
      "definitionSummary": "Lasting for a very short time.",
      "timestamp": 1717834567000
    }
  ],
  "verba_bookmarks": [
    {
      "word": "ubiquitous",
      "phonetic": "/juːˈbɪk.wɪ.təs/",
      "partOfSpeech": "adjective",
      "definitionSummary": "Seeming to be everywhere.",
      "timestamp": 1717834567000,
      "collection": "Academic",
      "masteryLevel": 2,
      "learningNotes": "Mnemonic: U-bi-quitous, like you quit smoking everywhere."
    }
  ],
  "verba_settings": {
    "darkMode": false,
    "theme": "Classic",
    "fontScale": "Medium",
    "audioAutoplay": true,
    "userStreak": 14,
    "lastLookupDate": "2026-06-08"
  }
}
```

### Storage Interface Functions (`src/storage/localStore.ts`)
*   `saveHistoryItem(item: SearchHistoryItem): Promise<void>`: Reads history JSON, filters duplicate keys, pushes the item to the front of the list, truncates items beyond the 100-item limit, and saves.
*   `saveBookmarkItem(item: SavedWordItem): Promise<void>`: Saves word bookmarks, and sets defaults for `masteryLevel` (1) and `collection` (Favorites).
*   `updateWordNotes(word: string, notes: string): Promise<void>`: Appends/modifies `learningNotes` for saved words.
*   `syncStreakMetrics(): Promise<number>`: Computes daily streak updates. Increments the streak if the last search date was yesterday. Reset to 1 if more than 48 hours have elapsed since the last search.

---

## 10. Testing Strategy

### 10.1 Manual Verification Checklist
- [ ] **Search Validation**: Type spaces only, and tap search. Confirm the input is trimmed and lookups are prevented.
- [ ] **Suggestions Overlay**: Verify that typing "eth" displays suggestions ("ethereal", etc.) and tapping a suggestion opens its detail screen.
- [ ] **Saved Words Sync**: Bookmark "Ethereal" on its details page, navigate to Saved Words, and verify it appears in the "ALL" and "Favorites" tabs.
- [ ] **Audio Playback**: Tap the pronunciation button on three different words. Verify US/UK recordings play correctly.
- [ ] **Offline Resilience**: Disable network connections, and perform a lookup. Confirm that the app displays the Offline Screen gracefully instead of crashing.
- [ ] **Settings Customization**: Toggle Dark Mode and switch themes. Confirm all screens update their background and accent colors instantly.

### 10.2 Edge Case Test Scenarios
1.  **Missing Audio MP3s**: If the API response lists no audio URLs, the circular volume trigger is rendered disabled (grayed out). Tapping it displays a Toast message: "Pronunciation unavailable."
2.  **Undefined Example Sentences**: If definitions lack example strings, the example card container is hidden, preventing empty quotes from rendering.
3.  **Network Dropouts during Lookup**: If connection drops mid-query, the Axios timeout handler captures the error and displays the "Connection Error" screen with a Retry button.

---

## 11. Code Generation Plan

1.  **Foundation & Tokens**: Install dependencies (`expo-av`, `@react-native-async-storage/async-storage`, `axios`). Create theme tokens (`src/styles/theme.ts`).
2.  **TypeScript Contracts**: Implement interfaces (`src/models/DictionaryTypes.ts`).
3.  **Global Providers**: Code context state machines (`src/context/ThemeContext.tsx`, `src/context/HistoryContext.tsx`, `src/context/SavedContext.tsx`).
4.  **Network & Parser Layers**: Develop the api connector (`api.ts`), service lookups (`dictionaryService.ts`), and parser utils (`apiParser.ts`).
5.  **Core UI Components**: Implement reusable elements (`SearchBar.tsx`, `PronunciationButton.tsx`, `WordCard.tsx`, etc.).
6.  **Navigation Layers**: Configure Stack & Drawer paths (`AppNavigator.tsx`, `DrawerContent.tsx`).
7.  **Main Application Screens**:
    *   *Onboarding*: Carousel slide layouts.
    *   *Discover*: Dashboard bento stats, daily words, search bar.
    *   *WordDetails*: Definitions, origin cards, custom mnemonic notebook inputs.
    *   *History*: Timestamps grouping and SwipeToDelete cards.
    *   *SavedWords*: Collections grids and mastery progress widgets.
    *   *Settings*: Adjustment toggles, sliders, and color switches.
8.  **Verification**: Execute manual test cases and confirm compatibility across platforms.

---

## 12. Assessment Optimization

*   **Premium Accent colors**: Use **Premium Cyan** for audio elements. This establishes a clear visual association for speech features.
- **Micro-Animations**: Add micro-interactions (e.g., using `Animated.spring` to scale buttons down to 95% on press) to enhance user experience.
*   **Audio Autoplay Toggle**: Implement the autoplay settings option. If enabled, the app automatically triggers pronunciation audio upon opening a word's detail screen.
*   **Mnemonic Learning Notebook**: Allow users to save custom notes for looked-up words. This is a highly valuable feature for students studying vocabulary.
*   **Active Streak Engine**: Track the user's daily search streak. This gamification element encourages daily use and helps secure extra marks for user engagement.
