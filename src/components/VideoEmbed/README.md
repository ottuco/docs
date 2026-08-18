# VideoEmbed

A reusable, poster-first video figure for the docs. General-purpose — not
AutoPay-specific. Renders a poster image with a play button; the `<video>` mounts
and plays only on click, so **nothing moves until the reader opts in** (which is
also how it satisfies `prefers-reduced-motion`).

## Usage

```mdx
import VideoEmbed from "@site/src/components/VideoEmbed";

<VideoEmbed
  src="/video/autopay/setup-subscription.mp4"
  poster="/video/autopay/setup-subscription-poster.png"
  caption="Setting up an AutoPay subscription."
/>
```

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `src` | `string` | — | **Required.** Site-root path to the MP4 (e.g. `/video/autopay/clip.mp4`). Resolved with `useBaseUrl`. Never a relative path. |
| `poster` | `string` | — | **Required.** Site-root path to the poster PNG. Shown before play and as the `<video poster>`. |
| `caption` | `React.ReactNode` | — | Optional `<figcaption>` under the frame. |
| `width` | `number \| string` | `720` | Max width of the figure. |
| `aspectRatio` | `string` | `"16 / 9"` | CSS `aspect-ratio` of the frame. Match the rendered clip's dimensions. |

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
- **Theme-aware.** Uses the same border/radius/shadow tokens as `StepGuide`.

## Hosting

Clips are committed to `static/video/`. See `remotion/README.md` for the hosting
rationale and the render pipeline that produces the MP4 + poster pairs.
