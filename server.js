/// <summary>
/// Simple Express server to serve static files
/// </summary>
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname, 'public');
const POSTS_DIR = path.join(PUBLIC_DIR, 'posts');

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

// Serve static files from /public (industry-standard)
// NOTE:
// - index:false prevents /posts from being intercepted by /public/posts/index.html
// - redirect:false prevents express.static from auto-redirecting directory paths (avoids redirect loops with our slash normalizer)
app.use(express.static(PUBLIC_DIR, { index: false, redirect: false }));

// Normalize trailing slashes (except "/") so /posts/ -> /posts, etc.
app.use((req, res, next) => {
    if (req.path.length > 1 && req.path.endsWith('/')) {
        const query = req.url.slice(req.path.length);
        return res.redirect(301, req.path.slice(0, -1) + query);
    }
    next();
});

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Route for main category pages (no trailing slash)
app.get('/posts', (req, res) => {
    renderPostsIndex(res);
});

app.get('/games', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'games', 'index.html'));
});

app.get('/updates', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'updates', 'index.html'));
});

// Routes for individual games (no trailing slash)
app.get('/games/theonehourgame', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'games', 'theonehourgame', 'index.html'));
});

app.get('/games/rotational', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'games', 'rotational', 'index.html'));
});

// Back-compat redirect for the old format: /YYYY/MM/DD/slug -> /posts/MM-YYYY/slug
app.get('/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug', (req, res) => {
    const { year, month, slug } = req.params;
    res.redirect(301, `/posts/${month}-${year}/${slug}`);
});

app.get('/posts/:monthYear(\\d{2}-\\d{4})/:slug', async (req, res) => {
    try {
        const { monthYear, slug } = req.params;
        const postPath = path.join(POSTS_DIR, monthYear, `${slug}.md`);
        const raw = await fs.readFile(postPath, 'utf8');
        const parsed = matter(raw);
        const title = getTitleFromMarkdown(parsed.content) || slug;
        const html = md.render(parsed.content);

        const displayDate = monthYearToDisplayDate(monthYear);

        res.type('html').send(renderPage({
            title: `${title} - Jaron Erba`,
            activeNav: 'posts',
            bodyHtml: `
                <section class="page-header">
                    <h1>${escapeHtml(title)}</h1>
                    <p>${escapeHtml(displayDate)}</p>
                </section>
                <section class="post-body">
                    ${html}
                </section>
            `
        }));
    } catch {
        res.status(404).type('html').send(renderPage({
            title: 'Post not found - Jaron Erba',
            activeNav: 'posts',
            bodyHtml: `
                <section class="page-header">
                    <h1>Post not found</h1>
                    <p>The post you’re looking for doesn’t exist.</p>
                </section>
            `
        }));
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop the server`);
});

/// <summary>
/// Render the posts index page by scanning the posts folder for markdown files.
/// </summary>
async function renderPostsIndex(res) {
    try {
        const posts = await listPosts();
        const items = posts
            .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
            .map(p => `
                <div class="post-card">
                    <h2><a class="post-link" href="${p.url}">${escapeHtml(p.title)}</a></h2>
                    <p class="post-date">${escapeHtml(p.displayDate)}</p>
                </div>
            `)
            .join('');

        res.type('html').send(renderPage({
            title: 'Posts - Jaron Erba',
            activeNav: 'posts',
            bodyHtml: `
                <section class="page-header">
                    <h1>Posts</h1>
                    <p>Thoughts, tutorials, and updates on my development journey.</p>
                </section>
                <section class="posts-list">
                    ${items || `<div class="post-card"><h2>No posts yet</h2><p class="post-date">—</p><p>Drop a markdown file into the <code>posts/</code> folder.</p></div>`}
                </section>
            `
        }));
    } catch {
        res.status(500).type('html').send(renderPage({
            title: 'Posts - Jaron Erba',
            activeNav: 'posts',
            bodyHtml: `
                <section class="page-header">
                    <h1>Posts</h1>
                    <p>Couldn’t load posts.</p>
                </section>
            `
        }));
    }
}

/// <summary>
/// List all markdown posts in public/posts/MM-YYYY/slug.md and return their titles + URLs.
/// </summary>
async function listPosts() {
    const files = await listMarkdownFiles(POSTS_DIR);
    const posts = [];

    for (const filePath of files) {
        const rel = path.relative(POSTS_DIR, filePath).split(path.sep);
        if (rel.length !== 2) continue;
        const [monthYear, filename] = rel;
        const slug = filename.replace(/\.md$/i, '');
        if (!/^\d{2}-\d{4}$/.test(monthYear)) continue;
        if (!slug) continue;

        const raw = await fs.readFile(filePath, 'utf8');
        const parsed = matter(raw);
        const title = getTitleFromMarkdown(parsed.content) || slug;
        const { month, year } = parseMonthYear(monthYear);

        posts.push({
            title,
            url: `/posts/${monthYear}/${slug}`,
            dateKey: `${year}-${month}`,
            displayDate: monthYearToDisplayDate(monthYear)
        });
    }

    return posts;
}

/// <summary>
/// Recursively list markdown files under a directory.
/// </summary>
async function listMarkdownFiles(dir) {
    let out = [];
    let entries;

    try {
        entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
        return [];
    }

    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out = out.concat(await listMarkdownFiles(full));
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
            out.push(full);
        }
    }

    return out;
}

/// <summary>
/// Render a consistent site shell with nav, using the shared CSS/JS from public/assets.
/// </summary>
function renderPage({ title, activeNav, bodyHtml }) {
    const isActive = (key) => (activeNav === key ? 'active' : '');
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
    <header>
        <div class="container">
            <h1><a href="/" class="header-link">Jaron Erba</a></h1>
            <nav class="main-nav">
                <a href="/posts" class="${isActive('posts')}">Posts</a>
                <a href="/games" class="${isActive('games')}">Games</a>
                <a href="/updates" class="${isActive('updates')}">Updates</a>
                <a href="https://github.com/TheCrystalKeeper" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                </a>
            </nav>
        </div>
    </header>

    <main>
        <div class="container">
            ${bodyHtml}
        </div>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2024 Jaron Erba</p>
        </div>
    </footer>

    <script src="/assets/js/script.js"></script>
</body>
</html>`;
}

/// <summary>
/// Attempt to extract the first H1 title (# Title) from markdown.
/// </summary>
function getTitleFromMarkdown(markdown) {
    const match = markdown.match(/^\s*#\s+(.+)\s*$/m);
    return match ? match[1].trim() : '';
}

/// <summary>
/// Parse "MM-YYYY" into { month, year }.
/// </summary>
function parseMonthYear(monthYear) {
    const match = String(monthYear).match(/^(\d{2})-(\d{4})$/);
    if (!match) return { month: '01', year: '1970' };
    return { month: match[1], year: match[2] };
}

/// <summary>
/// Convert "MM-YYYY" into "YYYY-MM".
/// </summary>
function monthYearToDisplayDate(monthYear) {
    const { month, year } = parseMonthYear(monthYear);
    return `${year}-${month}`;
}

/// <summary>
/// Minimal HTML escaping for injected text.
/// </summary>
function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
