# Mentor-to-teen resource-sharing review

## Review question

Does this help a mentor turn a useful resource into a conversation teens want to join?

Open the prototype at `#/demo/resources`, or choose **Resource sharing** in its simulation banner. The journey starts in a fictional mentor Circle where Riley and Maya discuss saving for college. Jordan opens New Post, writes an introduction, searches a combined library, previews and attaches a sample, edits her question and publishes. The view switches to Riley, who can reply or open the resource in a separate simulated provider tab.

This is an extension of the existing prototype, not an app implementation. No admin portal, live catalog, real approval workflow, provider integration or analytics has been added. No actual teen records or licensed resource content is used. The prototype’s existing signup-to-app journey is preserved.

## What local code verifies

Inspected November 22, 2026 in app checkout `f5dcbee90d89d9d56a3186c606c8e4ea8c43c693`:

- `apps/web/src/components/feed/create-post-form.tsx`: Mentor/Admin roles can use the Sharpen toolbar action. It opens SharpenPicker, retains the post body and selected attachment in component state, and sends the selected module ID as `sharpenReference` with the post.
- `apps/web/src/components/feed/sharpen-picker.tsx`: a search field calls `searchSharpenCatalog(query)`. Results are Sharpen-only; choosing a row attaches it directly. The current picker has no pre-attachment resource-preview step.
- `apps/mobile/src/components/feed/CreatePostSheet.tsx` and `SharpenPickerSheet.tsx`: corresponding mentor-eligible search and attachment controls exist on mobile.
- `packages/shared/src/api/sharpen.ts`: catalog requests use `/api/v1/sharpen/catalog?q=...&page=...`; module and video details are separate requests.
- `apps/api/app/routers/sharpen.py`: catalog access is restricted to mentors/admins. `services/sharpen_service.py` searches provider tracks/modules and video metadata. The catalog includes modules with a first video; it is not an existing multi-provider article library. It searches one tracks page per request, rather than proving an exhaustive provider search.
- `apps/api/app/routers/post.py`: only eligible roles retain the supplied Sharpen reference. `models/post.py` stores it on the post. `schemas/post.py` exposes it.
- `apps/web/src/components/feed/post-card.tsx` renders the attachment. `sharpen-attachment.tsx` opens an in-app module reader, not the new provider-site handoff.

These are source-code findings only. No hosted app, API, provider credential, live Sharpen search or deployed behavior was tested. Provider licensing and ownership are not established by this inspection.

## Reuse and proposed behavior

Reused unchanged from the existing source snapshots: the shared Button, Input, Card, Badge and Avatar primitives; web design variables, colors, fonts and backdrop; and the PostCard renderer for the mentor discussion and published teen post, including its reply controls. The New Post adaptation follows the current composer layout and state ownership.

Proposed and simulated: the Add a resource label, combined-provider library, article/video metadata, preview-before-attach step, attachment card and sponsorship disclosure, publishing/view switching, and provider-site opening. A small adapter recognizes only `demo-resource:` attachments; existing Sharpen attachments still use their original renderer.

The new journey uses local sample records and browser memory. A proposed catalog approval is represented by placing a fictional record in the sample library; there is no real approval. Greenlight is illustrative, Future Fund is an invented provider, and the Sharpen samples contain no licensed Sharpen text or video. All entries are visibly labeled Sample. The Greenlight record demonstrates a sponsored-content label with an explicit statement that no real sponsorship, partnership or approval is represented. That disclosure appears in preview, attachment, teen post and simulated external destination.

The teen’s provider link opens a separate local tab. The visible `.example` address communicates the proposed destination, but is not visited. No live partner site or video service is contacted. No genuine Greenlight article URL, sponsorship or partnership is asserted.

## Focus and assumptions

- One resource per Circle post; the mentor supplies her own introduction or discussion question.
- Draft, selected resource and search text remain while moving among New Post, search and preview. Refresh or leaving this journey does not create durable draft storage.
- Search starts combined and matches the fictional “saving for college” scenario. No provider sections, no-results design, unavailable-resource states or admin workflow are implemented.
- The published teen post uses the actual post renderer. Replies are simulated, like the rest of the existing prototype; local publishing does not test moderation, delivery, permissions or persistence.

## Essential decisions after this review

1. Who approves age suitability and reuse/linking rights for each resource, and what evidence is required?
2. Should Sharpen continue opening in-app while partners open externally? What access or login requirements would teens encounter?
3. What sponsorship eligibility and disclosure wording should apply? The prototype illustrates placement, not a settled policy.

## Verification

Run `PREVIEW_URL=http://127.0.0.1:4319 node scripts/check-resource-sharing.cjs` against a local preview. Evidence is in `resource-sharing-verification.json`. The check covers combined results and formats, preview metadata, sponsor disclosure, preservation of draft/search, editing and publishing, teen replies, separate provider tab, a video attachment, removal/replacement, narrow-screen containment and blocked external traffic.

Work is local on `feature/mentor-resource-sharing`. Committing, pushing, opening a pull request and publication require fresh user approval for this change. The previously published prototype is unaffected until reviewed and published.

## Mobile screenshot correction — November 22

The user supplied screenshots of the actual mobile mentor composer, published Sharpen card and teen composer. The browser adaptation now follows the mobile sheet: close and send controls at the top, an open writing area, compact removable attachment above the bottom toolbar, and a provider-branded card in the feed. Card artwork is a local abstract illustration, not a licensed provider image. The existing mobile Sharpen label becomes **Add a resource** only for this proposed combined library. Teens can create text Circle posts, but never see Sharpen or resource attachment controls. Photo attachment and video calling are outside this focused review and displayed disabled.

## Clean app presentation — November 22

At the user's request, review banners, sample badges, simulation notes, role-switch explanations and restart controls are removed from the resource journey. All resources and posting remain fictional/local as documented above; no partnership is established. Sponsorship disclosure remains as app-facing “Sponsored content.” The attached resource is removed with its X; there is no Change resource action. Closing New Post or pressing Escape cancels the draft and selected resource. Going to search and preview still preserves the draft.

## Simple resource picker — November 22

Following the user's current-app picker screenshots, selection now uses a sheet with a close X, one search field and compact thumbnail/title/provider-format/short-description rows. Duration and preview-action labels are removed from results; full destination and sponsorship information remain in preview. Provider and format stay visible in the combined list. Thumbnails are local format illustrations, with no provider photos imported. Closing the picker returns to the existing post draft.

## Full-experience sharing preparation

The release copy lives in `team-review/`, separate from the unchanged `anne-clinician-review/` directory. The new version retains the full teen signup and onboarding. The actual login screen's Mentor tab now signs into fictional Jordan and opens Circles. Selecting Finding our footing opens the focused resource-sharing experience. There is no reviewer-only Resource sharing button in the banner. The direct resource route remains available for focused tests. Authentication and mentor access are simulated, not a live role implementation.

The full-version landing page now opens the actual Sign In screen. A direct teen sign-in uses an established fictional account and skips onboarding; Register retains the full new-account flow. Completed matching updates the browser-memory onboarding state so a subsequent sign-in does not repeat the survey. Mentor sign-in opens Circles. All sign-in behavior remains local simulation.

## Final sharing decision — November 22

The user chose to update the existing team link rather than introduce a new primary address. The finished full experience is therefore stored in `anne-clinician-review/`; `team-review/` is not part of this change. Before replacement, the original published assets were copied byte-for-byte into `archive/2026-11-21/dist/`. The original source remains available at commit 80dd50a. Prior notes about a separate team-review release describe the superseded preparation arrangement. The user approved committing, uploading and opening a review request; human review and merge remain required before GitHub Pages updates the live site.
