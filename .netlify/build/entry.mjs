import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_BM-reGte.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/about.astro.mjs');
const _page1 = () => import('./pages/contact-advanced.astro.mjs');
const _page2 = () => import('./pages/get-started.astro.mjs');
const _page3 = () => import('./pages/insights.astro.mjs');
const _page4 = () => import('./pages/legal-safety/compliance.astro.mjs');
const _page5 = () => import('./pages/legal-safety/safety-protocols.astro.mjs');
const _page6 = () => import('./pages/legal-safety.astro.mjs');
const _page7 = () => import('./pages/posts/_---slug_.astro.mjs');
const _page8 = () => import('./pages/privacy.astro.mjs');
const _page9 = () => import('./pages/quiz-demo.astro.mjs');
const _page10 = () => import('./pages/readiness-assessment.astro.mjs');
const _page11 = () => import('./pages/resources/integration.astro.mjs');
const _page12 = () => import('./pages/resources/library.astro.mjs');
const _page13 = () => import('./pages/resources/preparation.astro.mjs');
const _page14 = () => import('./pages/resources.astro.mjs');
const _page15 = () => import('./pages/services/beyond.astro.mjs');
const _page16 = () => import('./pages/services/facilitation.astro.mjs');
const _page17 = () => import('./pages/services/integration.astro.mjs');
const _page18 = () => import('./pages/services/preparation.astro.mjs');
const _page19 = () => import('./pages/services.astro.mjs');
const _page20 = () => import('./pages/terms.astro.mjs');
const _page21 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["src/pages/about.astro", _page0],
    ["src/pages/contact-advanced.astro", _page1],
    ["src/pages/get-started.astro", _page2],
    ["src/pages/insights.astro", _page3],
    ["src/pages/legal-safety/compliance.astro", _page4],
    ["src/pages/legal-safety/safety-protocols.astro", _page5],
    ["src/pages/legal-safety.astro", _page6],
    ["src/pages/posts/[...slug].astro", _page7],
    ["src/pages/privacy.astro", _page8],
    ["src/pages/quiz-demo.astro", _page9],
    ["src/pages/readiness-assessment.astro", _page10],
    ["src/pages/resources/integration.astro", _page11],
    ["src/pages/resources/library.astro", _page12],
    ["src/pages/resources/preparation.astro", _page13],
    ["src/pages/resources.astro", _page14],
    ["src/pages/services/beyond.astro", _page15],
    ["src/pages/services/facilitation.astro", _page16],
    ["src/pages/services/integration.astro", _page17],
    ["src/pages/services/preparation.astro", _page18],
    ["src/pages/services.astro", _page19],
    ["src/pages/terms.astro", _page20],
    ["src/pages/index.astro", _page21]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "cf78444b-338b-4247-9b0b-e715a1789e98"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
