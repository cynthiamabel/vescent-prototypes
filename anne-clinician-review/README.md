# Vescent team review

An updated version of the full signup-to-app prototype, with mentor resource sharing integrated through Circles. Yesterday’s published assets are preserved in `archive/2026-11-21/dist/`.

## Review paths

- Established teen: the link opens Sign In. Choose Teen, enter `riley_demo` and `DemoOnly123!` to open Home without onboarding.
- New teen: choose Register, create an account and complete the 36-question onboarding as before.
- Mentor: open `#/auth/login`, choose Mentor, enter `jordan_mentor_demo` and `DemoOnly123!`, then select **Finding our footing** in Circles. Create a post and attach a resource from the combined list. Publishing switches to the teen view of that post.
- Direct resource review: `#/demo/resources`.

All people, resources and interactions are fictional; no accounts, messages, approvals, sponsorships or partnerships are created. Resource review notes were intentionally removed from the screens at the user's request. The sponsor label demonstrates disclosure placement only. Provider links open local stand-ins in separate tabs; no live service is called. No admin portal is included.

## Local build and checks

Uses the app checkout's existing dependencies, with unchanged app-source snapshots recorded in `source-manifest.json`.

```sh
VESCENT_APP_PATH=/Users/cynthiamabel/dev/vescent node scripts/build.mjs
python3 -m http.server 4320 --bind 127.0.0.1 --directory dist
PREVIEW_URL=http://127.0.0.1:4320 node scripts/check-preview.cjs
PREVIEW_URL=http://127.0.0.1:4320 node scripts/check-resource-sharing.cjs
PREVIEW_URL=http://127.0.0.1:4320 node scripts/check-mentor-entry.cjs
```

Source inspection, assumptions and verification are in `docs/issues/`. The app repository is unchanged.

## Sharing

The existing team link is updated by this change:

https://cynthiamabel.github.io/vescent-prototypes/anne-clinician-review/dist/

Yesterday's experience is preserved at:

https://cynthiamabel.github.io/vescent-prototypes/archive/2026-11-21/dist/

The user approved committing, uploading and opening a review request on November 22. A human must review and merge; GitHub Pages serves main and publishes the reviewed changes after merge.
