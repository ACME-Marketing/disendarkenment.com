# Booking Button Refactor Migration Guide

## Overview
This guide documents the centralized booking button system implemented in bemorefree.com and provides steps to replicate it in disendarkenment.com.

## What Was Changed

### 1. Created Centralized Configuration
**File:** `/src/config/booking.ts`
```typescript
export const BOOKING_CONFIG = {
  cal: {
    username: "takealook",
    events: {
      freeSession: {
        slug: "neutral-zone-free-session",
        namespace: "neutral-zone-free-session",
        config: {
          layout: "month_view"
        }
      },
      paidSession: {
        slug: "neutral-zone-one-hour-session",
        namespace: "neutral-zone-one-hour-session",
        config: {
          layout: "month_view"
        }
      }
    }
  }
};
```

### 2. Created Reusable BookingButton Component
**File:** `/src/components/BookingButton.astro`
```astro
---
import { BOOKING_CONFIG } from '../config/booking';

export interface Props {
  type: 'free' | 'paid';
  text?: string;
  className?: string;
  showArrow?: boolean;
}

const { type, text, className = '', showArrow = true } = Astro.props;

const eventConfig = type === 'free' 
  ? BOOKING_CONFIG.cal.events.freeSession 
  : BOOKING_CONFIG.cal.events.paidSession;

const defaultText = type === 'free' 
  ? 'Book Your Free 30-Minute Session' 
  : 'Book a Full Session';

const buttonText = text || defaultText;
---

<button 
  data-cal-link={`${BOOKING_CONFIG.cal.username}/${eventConfig.slug}`}
  data-cal-namespace={eventConfig.namespace}
  data-cal-config={JSON.stringify(eventConfig.config)}
  class={`cursor-pointer ${className}`}>
  {buttonText}
  {showArrow && <span class="ml-2">→</span>}
</button>
```

### 3. Updated BaseLayout Cal.com Script
**File:** `/src/layouts/BaseLayout.astro`
Updated the Cal.com initialization script to support both event types:
```javascript
Cal("init", "neutral-zone-free-session", {origin:"https://app.cal.com"});
Cal.ns["neutral-zone-free-session"]("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
Cal("init", "neutral-zone-one-hour-session", {origin:"https://app.cal.com"});
Cal.ns["neutral-zone-one-hour-session"]("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
```

### 4. Replaced All Button Instances
**Files Updated (17 total):**
- `/src/pages/index.astro` (2 buttons)
- `/src/pages/booking/free-trial.astro` (1 button)
- `/src/layouts/BaseLayout.astro` (2 buttons in header/mobile menu)
- `/src/pages/about/index.astro` (1 button)
- `/src/pages/disclaimer.astro` (1 button)
- `/src/pages/facilitator/index.astro` (1 button)
- `/src/pages/services/index.astro` (3 buttons - 2 free, 1 paid)
- `/src/pages/terms.astro` (1 button)
- `/src/pages/privacy.astro` (1 button)
- `/src/pages/blog/index.astro` (1 button)
- `/src/pages/blog/[...slug].astro` (1 button)
- `/src/pages/neutral-zone/index.astro` (1 button)
- All 6 principle pages in `/src/pages/principles/` (6 buttons)

**Old Pattern:**
```html
<button 
  data-cal-link="be-more-free/30min"
  data-cal-namespace="30min"
  data-cal-config='{"layout":"month_view"}'
  class="...">
  Button Text
  <span>→</span>
</button>
```

**New Pattern:**
```astro
<BookingButton 
  type="free"
  text="Button Text"
  className="..." />
```

## Migration Steps for disendarkenment.com

### Step 1: Create Configuration File
1. Create `/src/config/booking.ts` with the appropriate Cal.com settings for disendarkenment
2. Update the `username` and event `slug`/`namespace` values as needed

### Step 2: Create BookingButton Component
1. Create `/src/components/BookingButton.astro` 
2. Copy the component code and adjust default text as needed

### Step 3: Update BaseLayout
1. Add the BookingButton import to BaseLayout
2. Update the Cal.com initialization script with correct event namespaces
3. Replace existing button elements with BookingButton components

### Step 4: Update All Pages
1. Add BookingButton import to each page that has booking buttons
2. Replace all `<button>` elements that have `data-cal-link` with `<BookingButton>` components
3. Preserve existing CSS classes by passing them to the `className` prop
4. Preserve custom button text by passing it to the `text` prop

### Step 5: Testing
1. Run `npm run build` to ensure no compilation errors
2. Test buttons in development to verify Cal.com integration works
3. Deploy and test on production

## Benefits of This Approach

1. **Centralized Management:** All Cal.com settings in one file
2. **Consistency:** All buttons behave identically
3. **Type Safety:** TypeScript interface prevents configuration errors
4. **Maintainability:** Easy to update button behavior site-wide
5. **Scalability:** Easy to add new event types or modify existing ones

## Cal.com Configuration Requirements

For the buttons to work, ensure your Cal.com account has:
- Correct event types with matching slugs
- Proper availability settings
- Appropriate booking questions configured

## Notes
- The component preserves all existing styling through the `className` prop
- Custom button text can be overridden with the `text` prop
- Arrow display can be controlled with the `showArrow` prop
- Both free and paid session types are supported via the `type` prop