# Discord to Blog Converter with Adobe Edge Delivery Services

This project automatically converts Discord chat messages into a blog using Adobe Edge Delivery Services (EDS). It fetches messages from a specified Discord channel, processes them, and generates Markdown blog posts that can be rendered by EDS.

## Features

- Fetch messages from a specified Discord channel
- Group messages into conversations based on time gaps
- Clean messages to remove bot commands, mentions, and other Discord-specific formatting
- Extract titles, authors, and tags from conversations
- Generate Markdown files with front matter
- Optionally use AI to polish and improve the blog post content
- Automatically update the blog via GitHub Actions

## Project Structure

```
.
├── blocks/                   # EDS blocks (components)
│   ├── blog/                 # Blog component
│   ├── blog-list/            # Blog listing component
│   ├── header/               # Header component
│   └── footer/               # Footer component
├── content/                  # Content files
│   ├── blog/                 # Blog posts
│   ├── blog.md               # Blog index page
│   └── index.md              # Home page
├── scripts/                  # JavaScript
│   ├── aem.js                # AEM utilities
│   └── generate-posts.js     # Discord to blog generator
├── styles/                   # CSS
│   └── styles.css            # Main stylesheet
├── .github/workflows/        # GitHub Actions
│   └── discord-to-blog.yml   # Workflow to regenerate blog posts
└── package.json              # Project dependencies
```

## Setup Instructions

### Prerequisites

- Node.js 18 or later
- Discord bot token with message read permissions
- Discord channel ID
- [Optional] OpenAI API key for post polishing

### Installation

1. Clone this repository
   ```bash
   git clone https://github.com/your-username/discord-to-blog-eds.git
   cd discord-to-blog-eds
   ```

2. Install dependencies
   ```bash
   npm install
   ```

   > **Note**: The installation may show some vulnerability warnings related to the Adobe Helix CLI dependencies. These vulnerabilities are present in the local development tools and don't affect the production functionality of the Discord to Blog conversion. For production use, the core functionality (discord.js, gray-matter, marked, node-fetch) is secure.

3. Set up environment variables
   - For local development, copy `.env.example` to `.env` and add your credentials:
     ```bash
     cp .env.example .env
     # Edit the .env file with your actual credentials
     ```
   
   - For GitHub Actions, add these as repository secrets

### Usage

#### Run Locally

To generate blog posts from Discord messages:

```bash
npm run generate
```

To preview the site locally using Adobe Helix:

```bash
npm run dev
```

This will start a local server, typically at http://localhost:3000.

#### Automated Deployment

The included GitHub Actions workflow will:

1. Run every 6 hours to fetch new messages
2. Generate blog posts as Markdown files
3. Commit and push any changes back to the repository

You can also manually trigger the workflow through the GitHub Actions tab.

## Customization

### Discord Message Processing

You can customize how Discord messages are processed in `scripts/generate-posts.js`:

- Adjust the `cleanMessage` function to change how messages are formatted
- Modify the time gap in `groupMessagesByConversation` to change conversation grouping
- Edit the `extractTitle` and `extractTags` functions for different title/tag extraction

### Blog Appearance

To customize the appearance:

- Edit the CSS in `styles/styles.css`
- Modify the block components in the `blocks/` directory to change how posts are displayed

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 