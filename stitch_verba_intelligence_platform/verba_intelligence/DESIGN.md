---
name: Verba Intelligence
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#00505f'
  on-tertiary: '#ffffff'
  tertiary-container: '#006a7c'
  on-tertiary-container: '#93e8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-word:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-word-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  section-heading:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  definition-body:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  caption:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  gutter: 16px
---

## Brand & Style
The design system is rooted in **Neo-Minimalism**, prioritizing high-clarity information architecture and sophisticated visual polish. It draws inspiration from the utility of the Apple Dictionary, the technical elegance of Stripe, and the spatial logic of Notion.

The personality is **Intelligent and Calm**. The UI avoids unnecessary decorative elements, instead using whitespace, precise typography, and subtle glassmorphism to establish a sense of modern authority. Every interaction should feel intentional and lightweight, reducing the cognitive load of complex linguistic data.

## Colors
The palette is built on a foundation of cool neutrals and vibrant technical blues. 

- **Primary (Royal Indigo):** Reserved for brand moments and high-level navigation.
- **Secondary (Electric Blue):** The workhorse for primary actions and interactive states.
- **Accent (Premium Cyan):** Exclusively utilized for audio, phonetics, and pronunciation features to create a distinct mental model for the user.
- **Surface Strategy:** Surfaces use a layered approach. In light mode, the primary surface is pure white against a light grey background to create subtle contrast. In dark mode, deep navy surfaces sit atop a charcoal background.

## Typography
This design system utilizes **Inter** for its systematic clarity and modern geometric structure. 

The typographic hierarchy is aggressive to ensure scannability. **Display Word** sizes use tight letter-spacing and heavy weights to anchor the page. **Definition Body** text is sized at 18px with generous line-height (1.55x) to ensure long-form readability during deep study. Labels use uppercase styling with tracking to differentiate metadata from content.

## Layout & Spacing
The system employs a strict **8-point grid**. 

- **Mobile Layout:** 4-column fluid grid with 24px side margins to provide "breathing room" consistent with premium editorial designs.
- **Vertical Rhythm:** Elements are stacked in multiples of 8px. Grouped content (e.g., a word and its phonetic spelling) uses 8px spacing, while distinct sections (e.g., Definitions vs. Examples) use 32px spacing.
- **Safe Areas:** Navigation bars and bottom sheets respect standard system safe areas but extend background blurs to the screen edges.

## Elevation & Depth
Depth is communicated through **Glassmorphism** and **Ambient Shadows**.

- **Surfaces:** Floating elements (Cards, Bottom Sheets) use a semi-transparent background (80-90% opacity) with a `20px` backdrop blur to maintain context of the content beneath.
- **Shadows:** Use a "soft-glow" technique. Avoid black; instead, use a highly diffused primary or neutral tint (e.g., `rgba(79, 70, 229, 0.08)` for Indigo-themed cards).
- **Outlines:** All elevated elements feature a 1px inner border (stroke) at 10% opacity to define edges against vibrant backgrounds, mimicking Apple's premium glass effect.

## Shapes
The shape language is consistently **Rounded (0.5rem / 8px)** for standard components. Larger containers like Word Cards and Bottom Sheets scale to `rounded-xl` (1.5rem / 24px) to soften the overall aesthetic. 

- **Interactive Elements:** Buttons and Chips utilize the base 8px radius.
- **Search Bars:** Utilize a fully pill-shaped radius (999px) to distinguish the primary entry point from the content cards below.

## Components

### Buttons
- **Default:** Solid `Secondary` color with white text.
- **Focused/Pressed:** Subtle scale down (98%) and dark overlay (10%).
- **Loading:** Replace label with a centered 2px width spinner in white.
- **Disabled:** 40% opacity with `grayscale` filter.

### Search Bars
Glassmorphic style. Background: `surface` at 70% opacity with `backdrop-blur`. Border: 1px solid white (10%). Leading icon is a subtle search glyph; trailing icon is a "voice search" microphone in Premium Cyan.

### Word Cards
Large radius (24px). Soft ambient shadow. Include a "Pronunciation Trigger" in the top right—a circular button in Premium Cyan that pulses slightly when audio is available.

### Definition Components
Vertical line indicator on the left using `Primary` color (2px width). High contrast text for the definition, lower contrast (60% opacity) for the example sentences.

### Part-of-Speech Chips
Low-profile. Transparent background with a 1px border matching the text color (e.g., Indigo for Nouns, Teal for Verbs).

### Navigation & Bottom Sheets
Bottom sheets use a "grabber" handle (40px width, 4px height) at 20% opacity. Navigation bars are fully transparent with backdrop-blur, allowing content to bleed behind them during scroll.

### Skeleton Loaders
Use a subtle shimmer effect (linear gradient) moving from left to right. Colors: `surface` to a slightly darker grey/navy and back. Transitions should be 1.5s in duration for a "calm" feel.