
# disendarkenment.com

## Features

### Not Live Mode

This site includes a "not live" mode that disables the ability for users to schedule new consultations. This is useful for when you are not accepting new clients.

**To activate "not live" mode:**

1.  Open the file `src/config/site.ts`.
2.  Change the value of `GoLive` to `false`.

```typescript
// src/config/site.ts
export const siteConfig = {
  GoLive: false // Set to false to activate 'not live' mode
};
```

**To deactivate "not live" mode:**

1.  Open the file `src/config/site.ts`.
2.  Change the value of `GoLive` to `true`.

```typescript
// src/config/site.ts
export const siteConfig = {
  GoLive: true // Set to true to activate normal functionality
};
```

When "not live" mode is active, the Calendly integration will be disabled, and users will see a message indicating that new clients are not being accepted at this time.
