# R8 — Clay character approach (2026-10-04)

**Decision: stay pure parametric SVG, add a gradient-only "lighting stack" and chibi proportions. No SVG filters, no raster sprites, no Three.js.**

## What makes 3D clay read as "production" (research)
- Claymorphism = inflated shapes, pastel gradients, a bright top-left edge and a dark lower-right emboss, soft contact shadow ([LogRocket](https://blog.logrocket.com/implementing-claymorphism-css/), [Claymorphism wiki](https://aesthetics.fandom.com/wiki/Claymorphism)).
- Depth cues from 3D rendering we can fake in 2D: rim/fresnel light on the silhouette ([rim lighting](https://lettier.github.io/3d-game-shaders-for-beginners/rim-lighting.html)), ambient occlusion in creases ([AO](https://en.wikipedia.org/wiki/Ambient_occlusion)), tight specular highlight, warm subsurface tone near shadow.
- Chibi: 2–3 heads tall, head wider than tall, eyes ≥ 1/4 head height and placed low, 1–2 catchlights per iris, short plump legs ([Clip Studio chibi proportions](https://tips.clip-studio.com/en-us/articles/4829), [aha0624 chibi tips](https://tips.clip-studio.com/en-us/articles/10582), [Anime Art Magazine](https://animeartmagazine.com/head-to-body-ratio-this-simple-anime-illustration-technique-will-give-you-perfect-proportions-every-time/)).

## Render options weighed
| Option | Quality | Cost | Verdict |
|---|---|---|---|
| SVG + `feGaussianBlur`/`feComposite` inner shadows | high | filters re-rasterise every frame while the guide walks; 11+ avatars on screen = jank on phones; unit test bans `<filter>` | rejected |
| Pre-rendered PNG/WebP sprites (Blender) | highest | 11 roles × ~8 poses × 2x DPR ≈ 1–2 MB, loses per-visitor skin/hair variants, blurry at 240px unless huge | rejected |
| Three.js / r3f live models | highest | +150 KB+ JS, GPU per avatar, overkill for 40px chips | rejected |
| **Layered SVG gradients (chosen)** | high | 0 KB JS added, ~2.4 KB more markup per figure, vector-crisp 40→240px, all variants keep working | **chosen** |

## The lighting stack (per instance, in `parts.tsx` `Defs`)
1. Base radial: light → mid → warm subsurface dark (dark mixed 12% toward a warm red) → dark.
2. Rim overlay (`r`): same shape refilled with a radial that is transparent in the core and white at the edge, focus offset up-left so the edge glows lower-right.
3. AO (`o`): warm-dark radial blobs at chin/collar and under shoes.
4. Specular: small tight white ellipses on skull, hair, chest, shoes.
5. Contact shadow under the feet (unchanged).

## Character changes
- Chibi: body scales 0.84 about the feet, head scales 1.34 about the neck (static SVG transforms; pose CSS transitions inside untouched). Head ≈ 45% of figure height.
- Anime eyes: tall iris with a vertical gradient (deep top → hair-tinted glow), pupil, upper lash line, two catchlights; blink still scaleY.
- Tiny nose dot, softer brows, blush lower on the cheeks. Removed the speckle texture (read as dirt).
- Reduced motion: unchanged (`useBlink` no-ops; callers don't step frames).

## Originality
All shapes are drawn from primitives in this repo; nothing is traced from Fluent emoji, Notion/Pitch avatars, or any third-party art.

## Known gaps
- Jump pose: raised arms now overlap the bigger head a little.
- Per-render markup cap raised 6 KB → 9 KB in `tests/unit/clay.test.ts`; the 17-bust gzip ≤ 30 KB guard still holds.
