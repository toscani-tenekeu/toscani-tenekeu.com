# toscani-tenekeu.com

Personal site of Toscani MODJOU TENEKEU. Plain HTML, CSS and JS, no build step.

## Publish a post

1. Write the post in Markdown: `posts/my-post.md` (lowercase letters, digits and dashes).
2. Add it to `posts/index.json`:

```json
[
  { "slug": "my-post", "title": "My post", "date": "2026-11-14", "summary": "One line shown in the list." }
]
```

It then appears in the Posts section and opens at `/post.html?p=my-post`. Images can go in `posts/` too and be used as `![alt](/posts/photo.jpg)`.

## Education

Edit the `Education` list in `index.html`.

## Deploy

Copy the site into `/var/www/toscani-tenekeu-static/releases/<commit>` and point `current` to it.
