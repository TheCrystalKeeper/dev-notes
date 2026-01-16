# dev-notes

This repo is a **static GitHub Pages site built with Jekyll**.

## GitHub Pages settings

- **Settings → Pages**
- **Source**: Deploy from a branch
- **Branch**: `main`
- **Folder**: `/ (root)`

## Preview locally (Docker)

From PowerShell in the repo root:

```powershell
docker run --rm -it -p 4000:4000 -v "${PWD}:/srv/jekyll" -w /srv/jekyll jekyll/jekyll:latest sh -lc "bundle install && bundle exec jekyll serve --watch --force_polling --host 0.0.0.0"
```

Then open `http://localhost:4000`.

## Writing posts

Add markdown files here:

```
posts/MM-YYYY/slug.md
```

Example:

```
posts/01-2026/hello-world.md
```

URL:

```
/posts/01-2026/hello-world/
```