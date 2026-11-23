# VideoEmbed

A reusable, poster-first video figure for the docs. General-purpose — not
AutoPay-specific. Renders a poster image with a play button; the `<video>` mounts
and plays only on click, so **nothing moves until the reader opts in** (which is
also how it satisfies `prefers-reduced-motion`).

## Usage

```mdx
import VideoEmbed from "@site/src/components/VideoEmbed";

<VideoEmbed
  src="/video/autopay/customer-page-demo.mp4"
  poster="/video/autopay/customer-page-demo-poster.jpg"
  aspectRatio="1280 / 832"
  loop
  label="A customer on their AutoPay page adds a card, switches the active card, cancels and undoes it"
  caption="What your customers can do on their page"
/>
```

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `src` | `string` | — | **Required.** Site-root path to the MP4 (e.g. `/video/autopay/clip.mp4`). Resolved with `useBaseUrl`. Never a relative path. |
| `poster` | `string` | — | **Required.** Site-root path to the poster image (PNG or JPG). Shown before play and as the `<video poster>`. |
| `caption` | `React.ReactNode` | — | Optional `<figcaption>` under the frame. |
| `width` | `number \| string` | `720` | Max width of the figure. |
| `aspectRatio` | `string` | `"16 / 9"` | CSS `aspect-ratio` of the frame. Match the rendered clip's dimensions. |
| `loop` | `boolean` | `false` | A silent demo that plays on its own and loops, like the customer portal clip on [Stripe's recurring payments page](https://docs.stripe.com/recurring-payments#set-up-customer-portal). It plays only while a quarter of it is on screen, and has one control: a pause / play button. With reduced motion it stays poster-first and click-to-play, and then plays once with the native controls. |
| `label` | `string` | — | What the video shows, for screen readers (the `<video>`'s `aria-label`, and the play button's label). Give one with `loop`. |

## Behaviour

- **Poster-first, click-to-play.** The `<video>` uses `preload="none"`, so no video
  bytes are fetched until the reader clicks — good for page weight.
- **Muted + `playsInline`.** Clips are silent by design; `playsInline` avoids
  fullscreen hijack on iOS.
- **Plays on the first click.** `autoPlay` is unconditional, because the
  `<video>` only mounts from the poster's own click handler — playback here is
  always user-initiated. It was previously gated on `prefers-reduced-motion`,
  which that preference does not call for (it governs *unsolicited* motion) and
  which made the reader click twice: once on the poster, again on the native
  control.
- **`loop` (demo mode).** The `<video>` is `muted loop playsInline` with
  `preload="metadata"` and no native controls; an `IntersectionObserver` plays
  it while at least 25% is visible and pauses it otherwise. Until the browser
  reports the reader's `prefers-reduced-motion` (and on the server) the poster
  shows, so nothing starts before the preference is known (shown as a plain
  image, not a play button); with `reduce` the reader keeps the click-to-play
  poster, which plays once. The pause / play button (bottom right, shown on
  hover, on keyboard focus and always on touch screens) and a click on the video
  stop it (WCAG 2.2.2); a reader's pause holds when the video scrolls out and
  back in. The `<video>` has `role="img"` and the `label` as its name. Its
  right-click menu is off (Chrome's "Show all controls" would add a second
  play / pause bar), and so is picture-in-picture. Example:
  the AutoPay business page's self-service section
  (`/video/autopay/customer-page-demo.mp4`, recorded on the sandbox, #161111
  R18).
- **Theme-aware.** Uses the same border/radius/shadow tokens as `StepGuide`.

## Hosting

Clips are committed to `static/video/`. The AutoPay customer page demo
(`static/video/autopay/customer-page-demo.mp4`) is a recording of the real page
on the sandbox (#161111 R18). The `remotion/` workspace renders the earlier
AutoPay clips; none of them is on a page any more, so their MP4s were removed
from `static/video/autopay/` (`npm run render` in `remotion/` writes them back).
