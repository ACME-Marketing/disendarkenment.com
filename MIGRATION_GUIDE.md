# Astro Static Site Migration Guide

This guide details the steps to migrate an Astro project to a purely static site on Render.com.

## 2. Update Astro Configuration for Static Output

Modify your `astro.config.mjs` file to ensure Astro builds a purely static site.

-   **Change Output Mode:**
    ```javascript
    // astro.config.mjs
    export default defineConfig({
      output: 'static', // Change from 'server' to 'static'
      // ...
    });
    ```
-   **Remove Server Adapters:**
    Remove any `import` statements and `adapter` configurations related to server-side rendering (e.g., `@astrojs/node`).
    ```javascript
    // astro.config.mjs
    import { defineConfig } from 'astro/config';
    import tailwind from "@astrojs/tailwind";
    // Remove: import node from '@astrojs/node';

    export default defineConfig({
      // Remove: site: 'https://your-site.com', // Optional: if not needed for static
      integrations: [tailwind()], // Remove react() if not using React components or if it causes issues
      output: 'static',
      // Remove: adapter: node({...}), // Remove any adapter configuration
    });
    ```
-   **Run `npm install`**: After modifying `package.json` or `astro.config.mjs` to remove/change dependencies, run `npm install` to update `node_modules` and `package-lock.json`.

## 3. Ensure All Pages are Prerendered

For a purely static site, all pages must be pre-rendered at build time.

-   **Add `export const prerender = true;`**: For every `.astro` page in your `src/pages/` directory that is not already marked, add this line at the top of the script section:
    ```astro
    ---
    export const prerender = true;
    // ... existing frontmatter
    ---
    ```
    This is especially important for dynamic routes (e.g., `[...slug].astro`) and pages that fetch data during the build.

## 4. Handle Server-Side Features (API Routes, Dynamic Data Fetching)

Purely static sites cannot have server-side API routes or perform dynamic data fetching at runtime.

-   **Remove API Routes**:
    -   Delete any files in `src/pages/api/` (e.g., `src/pages/api/course-notifications.ts`).
    -   Remove any code that calls these API routes from your frontend (e.g., `fetch('/api/...')`). For forms, you might need to simulate success or provide a static message.
-   **Adjust Dynamic Data Fetching**:
    -   If pages fetch data from external APIs (like Supabase) during the build process (e.g., in `getStaticPaths` or directly in the component's frontmatter), ensure these APIs are accessible during the build.
    -   If an API is not accessible during build, you will need to:
        -   Pre-fetch data and commit it to your repository.
        -   Or, remove the dynamic fetching and replace it with static placeholder data.
        -   Or, if the data is only needed client-side, ensure the fetch happens *after* the page loads in the browser, not during the build.

## 5. Clean Up Remaining References

Search your project for any lingering references to removed server-side features.

## 6. Configure Render.com Deployment

Once your project is configured for a static build, set up your service on Render.com.

-   **Build Command**: `npm run build`
-   **Publish Directory**: `dist/` (This is where Astro places the static output)
-   **Start Command**: Not required for a purely static site. Render.com will serve the `dist` directory directly.
-   **Environment Variables**: Crucially, ensure any environment variables required for your build process (e.g., `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` if you still have client-side Supabase interactions) are configured in Render.com's environment settings.

By following these steps, your Astro project should successfully build as a static site and deploy correctly on Render.com.
