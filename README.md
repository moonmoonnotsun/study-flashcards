# study-flashcards.app

Landing page for **Flashcards Maker - Study Cards** (iOS).

## Deploy

Hosted on [GitHub Pages](https://pages.github.com/) with custom domain `study-flashcards.app`.

```bash
git push origin main
```

## GitHub Pages setup

1. Create repo `study-flashcards` on GitHub (public)
2. Push this folder
3. **Settings → Pages →** deploy from `main` branch, root `/`
4. Set custom domain: `study-flashcards.app`
5. Enable **Enforce HTTPS** after DNS check passes

## Cloudflare DNS

For apex domain `study-flashcards.app`:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `moonmoonnotsun.github.io` |

Use DNS only (grey cloud). Set SSL mode to **Full** in Cloudflare.

## Links

- App Store: https://apps.apple.com/us/app/flashcards-maker-study-cards/id6756944111
- Privacy: https://mpc-app-c2e7a.web.app/cards-privacy.html
- Terms: https://mpc-app-c2e7a.web.app/cards-terms.html
