# Setup Instructions

## Prerequisites

Make sure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

To check if Node.js is installed, run:
```bash
node --version
```

## Installation Steps

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install Express and other required dependencies listed in `package.json`.

### 2. Start the Server

Run the following command to start the local development server:

```bash
npm start
```

Or alternatively:

```bash
node server.js
```

### 3. View the Website

Once the server is running, open your web browser and navigate to:

```
http://localhost:3000
```

The server will display a message in the terminal confirming it's running:
```
Server is running on http://localhost:3000
Press Ctrl+C to stop the server
```

## Stopping the Server

To stop the server, press `Ctrl+C` in the terminal where the server is running.

## Quick Start Command Sequence

For a quick start, run these commands in order:

```bash
# Navigate to project directory (if not already there)
cd c:\Users\Jaron\Jaronerba-website\dev-notes

# Install dependencies (only needed the first time)
npm install

# Start the server
npm start
```

Then open `http://localhost:3000` in your browser.

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can change it by setting the PORT environment variable:

**Windows PowerShell:**
```powershell
$env:PORT=8000; npm start
```

**Windows Command Prompt:**
```cmd
set PORT=8000 && npm start
```

Then access the site at `http://localhost:8000`

### Node.js Not Found

If you get an error that Node.js is not found, make sure:
1. Node.js is installed
2. Node.js is added to your system PATH
3. You've restarted your terminal after installing Node.js

## Development Notes

- The server serves static files from the `public/` directory
- Changes to HTML, CSS, or JavaScript files will be visible after refreshing the browser
- The server runs on port 3000 by default
- All static assets (CSS, JS, images) are served automatically

## Writing Posts (Markdown)

Create markdown files under the `public/posts/` folder using this structure:

```
public/posts/MM-YYYY/slug.md
```

Example:

```
public/posts/01-2026/hello-world.md
```

That becomes this URL:

```
/posts/01-2026/hello-world
```
