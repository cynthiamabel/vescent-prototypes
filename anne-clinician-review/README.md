# Vescent app demo

A simple account-to-app journey using the current app’s screens, components, shared colors and local fonts. No reviewer dashboard, names, prompts or note-taking tools. A proposed wellbeing check-in appears once on first reaching Home; it is optional, simulated and does not save or send a rating.

The journey starts with a browser adaptation of the mobile registration form, then plan selection, simulated checkout for paid tiers, simulated email confirmation, the unchanged web sign-in screen and its original authentication layout, the complete current survey question set and the current matching screen. Continue into the app to explore Home, Circles, messages, resources, notifications and settings. Everyone sees General Circle in their Circles list. Free accounts see General Circle; paid accounts also see their mentor Circles. General Circle has no separate navigation tab. Home includes a fictional direct-message notification that opens the sample conversation. The demo opens in light mode, including when the earlier version was left in dark mode.

All identities and conversations are fictional. No accounts, purchases, emails, messages, reports or calls reach live services. Profile values and interactions live only in browser memory. Payment and verification steps are labeled simulations. The source app remains unchanged.

From this folder, start the local preview:

```sh
python3 -m http.server 4317 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4317. This address works on this Mac only. Stop with Control-C.

`source/` contains unchanged app source snapshots; `source-manifest.json` records their original commit and file fingerprints. The separate prototype adapters supply fictional data and browser navigation. To rebuild with the app checkout’s already-installed dependencies:

```sh
VESCENT_APP_PATH=/Users/cynthiamabel/dev/vescent node scripts/build.mjs
```

The output in `dist/` is ready to view without installing dependencies. To check the running saved preview:

```sh
PREVIEW_URL=http://127.0.0.1:4317 node scripts/check-preview.cjs
```

Checks use local Chrome and the app’s installed Playwright. Results are in `docs/issues/verification.json`.

Saved separately from app code in `vescent-prototypes/anne-clinician-review`, on `feature/anne-clinician-review`. Changes are saved on the feature branch and submitted through a pull request for human review. A person must merge the reviewed change before the existing GitHub Pages site publishes it. The existing prototype library is preserved.

The sign-in page and authentication layout are preserved byte-for-byte from the app. Demo credentials appear in the separate simulation banner; fields, Teen/Mentor tabs, links, brand heading and tagline are rendered by the actual web screen. The demo supports teen sign-in only and does not enable live Apple authentication.
