# Discord to Blog Project Setup Guide

This document outlines the steps taken to create the Discord to Blog Converter project using Adobe Edge Delivery Services (EDS).

## 1. Project Structure Setup

We started by creating the basic directory structure for an Adobe EDS project:

```bash
# Create main project directories
mkdir -p blocks content blocks/header blocks/footer blocks/blog blocks/blog-list scripts styles
```

This created the foundational directories needed for an EDS project:
- `blocks/`: For component blocks (header, footer, blog components)
- `content/`: For content pages and blog posts
- `scripts/`: For JavaScript utilities and the Discord message converter
- `styles/`: For CSS stylesheets

## 2. Core Project Files

### Homepage (index.md)

Created a basic homepage that displays a title and the latest blog posts:

```markdown
---
title: Discord to Blog Converter
description: A blog generated from Discord conversations
---

# Discord to Blog

This blog is automatically generated from Discord conversations.

## Latest Posts

<div class="blog-list">
  <blog-list></blog-list>
</div>
```

### Blog Index (content/blog.md)

Created the blog index page to list all blog posts:

```markdown
---
title: Blog
description: Blog posts generated from Discord conversations
---

<div class="blog-list">
  <blog-list></blog-list>
</div>
```

## 3. Component Blocks

We created several component blocks to build the site:

### Header (blocks/header/header.js)

```javascript
export default function decorate(block) {
  const h1 = document.createElement('h1');
  h1.innerHTML = '<a href="/">Discord to Blog</a>';
  block.textContent = '';
  block.append(h1);
  
  const nav = document.createElement('nav');
  nav.innerHTML = `
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/blog">Blog</a></li>
    </ul>
  `;
  block.append(nav);
}
```

### Footer (blocks/footer/footer.js)

```javascript
export default function decorate(block) {
  block.innerHTML = `
    <div>
      <p>&copy; ${new Date().getFullYear()} Discord to Blog Converter - Generated with Adobe Edge Delivery Services</p>
    </div>
  `;
}
```

### Blog List (blocks/blog-list/blog-list.js)

Created a component to fetch and display a list of blog posts, including:
- Fetching blog index data
- Sorting posts by date
- Creating cards for each blog post
- Displaying metadata (author, date, tags)

### Blog Component (blocks/blog/blog.js)

Created a component to display individual blog posts with:
- Post title and metadata
- Formatted content
- Author information and publication date
- Tags

## 4. Discord Integration Script

Created a comprehensive script (scripts/generate-posts.js) that:

1. Authenticates with Discord using environment variables
2. Fetches messages from a specified channel
3. Groups messages into conversations based on time gaps
4. Cleans and formats messages for blog posts
5. Extracts metadata (title, author, date, tags)
6. Optionally polishes content using OpenAI's API
7. Generates Markdown files with front matter

Key functions include:
- `cleanMessage()`: Removes Discord-specific formatting and commands
- `groupMessagesByConversation()`: Groups messages based on timing
- `formatConversationToMarkdown()`: Converts Discord messages to Markdown
- `polishWithAI()`: Optional enhancement using OpenAI
- `saveBlogPost()`: Creates Markdown files with front matter

## 5. GitHub Actions Automation

Created a workflow file (.github/workflows/discord-to-blog.yml) to:
- Run on a schedule (every 6 hours)
- Set up Node.js environment
- Install dependencies
- Run the blog post generator script with environment variables
- Commit and push new blog posts to the repository

## 6. Styling

Added comprehensive CSS styling (styles/styles.css) for:
- Responsive layouts using CSS Grid and Flexbox
- Card-based design for blog posts
- Typography and spacing
- Blog post content formatting
- Syntax highlighting for code blocks

## 7. Package Configuration

Set up package.json with:
- Required dependencies:
  - discord.js for Discord API integration
  - gray-matter for front matter handling
  - marked for Markdown processing
  - node-fetch for API requests
- Development dependencies:
  - @adobe/helix-cli for local preview
- Scripts for generating posts and previewing the site

## Next Steps

To complete the setup:
1. Configure Discord credentials (bot token and channel ID)
2. Optionally set up OpenAI API key for content polishing
3. Set up GitHub repository secrets for automated workflow
4. Run the generate script to create initial blog posts
5. Deploy to Adobe EDS hosting 