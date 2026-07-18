# Toscani Tenekeu — Dev Resource Hub

A Vite + Vue site with a Node.js + SQLite CMS for **Articles** and **Tutorials**.

## Features

- Keep the current UI and design system
- Dynamic Articles and Tutorials from SQLite
- Hidden admin panel
- Markdown content editing
- Cover image uploads
- Comment submissions with moderation
- SEO-friendly detail pages
- `.env`-based admin login

## Setup

1. Copy `.env.example` to `.env`
2. Fill in:
   - `PORT`
   - `SESSION_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`

3. Install dependencies:

```bash
npm install
```

## Run in development

```bash
npm run dev
```

This starts:
- Vite frontend
- Express + SQLite backend

## Admin

- `/admin/login`
- `/admin`
- `/admin/content/new`
- `/admin/comments`

## Content routes

- `/articles`
- `/articles/:slug`
- `/tutorials`
- `/tutorials/:slug`

## Notes

- No blog section is used.
- The existing Articles and Tutorials sections now behave as the CMS.
- Uploaded cover images are stored in `public/uploads`.
