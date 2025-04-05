#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const { marked } = require('marked');
const fetch = require('node-fetch');
const matter = require('gray-matter');

// Configuration - Set these values
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const CONTENT_FOLDER = path.join(process.cwd(), 'content/blog');
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY; // Azure OpenAI API key
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT; // Azure OpenAI API endpoint
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT; // Azure OpenAI deployment name

// Ensure output directory exists
if (!fs.existsSync(CONTENT_FOLDER)) {
  fs.mkdirSync(CONTENT_FOLDER, { recursive: true });
}

/**
 * Cleans a Discord message
 * @param {string} content - The message content
 * @returns {string} - The cleaned message
 */
function cleanMessage(content) {
  // Remove bot commands (messages starting with !)
  if (content.startsWith('!')) return '';
  
  // Remove Discord mentions, replace with normal names if possible
  content = content.replace(/<@!?(\d+)>/g, '@user');
  
  // Remove Discord channel references
  content = content.replace(/<#(\d+)>/g, '#channel');
  
  // Remove Discord emotes
  content = content.replace(/<a?:\w+:\d+>/g, '');
  
  // Replace Discord markdown with standard markdown
  content = content.replace(/\*\*/g, '**');  // bold
  content = content.replace(/\*/g, '*');    // italic
  content = content.replace(/__/g, '__');   // underline
  content = content.replace(/~~/g, '~~');   // strikethrough
  content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, '```$1\n$2```'); // code blocks
  content = content.replace(/`([^`]+)`/g, '`$1`'); // inline code
  
  return content.trim();
}

/**
 * Creates a slug from text
 * @param {string} text - The text to slugify
 * @returns {string} - The slugified text
 */
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Groups messages into conversations
 * @param {Array} messages - Discord messages
 * @returns {Array} - Conversations
 */
function groupMessagesByConversation(messages) {
  const conversations = [];
  let currentConversation = [];
  let lastMessageTime = null;
  
  // Sort messages by timestamp (oldest first)
  messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  
  for (const message of messages) {
    // If no messages yet or if it's been more than 30 minutes since the last message,
    // start a new conversation
    if (currentConversation.length === 0 || 
        !lastMessageTime || 
        message.createdTimestamp - lastMessageTime > 30 * 60 * 1000) {
      if (currentConversation.length > 0) {
        conversations.push(currentConversation);
      }
      currentConversation = [message];
    } else {
      currentConversation.push(message);
    }
    
    lastMessageTime = message.createdTimestamp;
  }
  
  // Add the last conversation if it's not empty
  if (currentConversation.length > 0) {
    conversations.push(currentConversation);
  }
  
  // Filter out conversations that are too short (less than 3 messages)
  return conversations.filter(conversation => conversation.length >= 3);
}

/**
 * Formats a conversation into Markdown
 * @param {Array} conversation - Conversation messages
 * @returns {string} - Formatted Markdown
 */
function formatConversationToMarkdown(conversation) {
  let markdown = '';
  
  conversation.forEach(message => {
    const cleanedContent = cleanMessage(message.content);
    if (cleanedContent) {
      markdown += `**${message.author.username}:** ${cleanedContent}\n\n`;
    }
  });
  
  return markdown;
}

/**
 * Extracts a title from a conversation
 * @param {Array} conversation - Conversation messages
 * @returns {string} - Title
 */
function extractTitle(conversation) {
  // Get the first meaningful message
  for (const message of conversation) {
    const cleanedContent = cleanMessage(message.content);
    if (cleanedContent && cleanedContent.length > 3) {
      // Use the first line or first X characters as title
      const firstLine = cleanedContent.split('\n')[0];
      return firstLine.length > 50 
        ? firstLine.substring(0, 50) + '...'
        : firstLine;
    }
  }
  
  // Fallback: use date and first author
  return `Conversation on ${new Date(conversation[0].createdTimestamp).toLocaleDateString()}`;
}

/**
 * Extracts tags from a conversation
 * @param {Array} conversation - Conversation messages
 * @returns {Array} - Tags
 */
function extractTags(conversation) {
  const tags = new Set();
  
  conversation.forEach(message => {
    // Extract hashtags
    const hashtags = message.content.match(/#[\w-]+/g);
    if (hashtags) {
      hashtags.forEach(tag => tags.add(tag.substring(1)));
    }
  });
  
  return Array.from(tags);
}

/**
 * Polishes a blog post using Azure OpenAI (optional)
 * @param {string} content - The blog content
 * @returns {string} - Polished content
 */
async function polishWithAI(content) {
  // Check if Azure OpenAI configuration is available
  if (AZURE_OPENAI_API_KEY && AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_DEPLOYMENT) {
    try {
      // Azure OpenAI endpoint format: {endpoint}/openai/deployments/{deployment-id}/chat/completions?api-version=2023-05-15
      const apiUrl = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2023-05-15`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that polishes Discord conversations into coherent blog posts. Maintain the content and substance but improve readability, fix grammar, and organize into paragraphs.'
            },
            {
              role: 'user',
              content: `Polish this Discord conversation into a well-formatted blog post:\n\n${content}`
            }
          ],
          temperature: 0.7
        })
      });
      
      const result = await response.json();
      if (result.choices && result.choices[0] && result.choices[0].message) {
        return result.choices[0].message.content;
      }
    } catch (error) {
      console.error('Error using Azure OpenAI API:', error);
    }
  }
  
  return content;
}

/**
 * Saves a blog post to a file
 * @param {string} title - Post title
 * @param {string} content - Post content
 * @param {string} author - Post author
 * @param {Array} tags - Post tags
 * @param {Date} date - Post date
 */
function saveBlogPost(title, content, author, tags, date) {
  const slug = createSlug(title);
  const fileName = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${slug}.md`;
  const filePath = path.join(CONTENT_FOLDER, fileName);
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    // Read existing file to check if it's the same conversation
    const existingContent = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(existingContent);
    
    // If the content is substantially the same, skip it
    if (parsed.content.trim() === content.trim()) {
      console.log(`Skipping duplicate post: ${title}`);
      return;
    }
  }
  
  // Create front matter
  const frontMatter = {
    title,
    author,
    date: date.toISOString(),
    tags: tags
  };
  
  // Combine front matter and content
  const fileContent = matter.stringify(content, frontMatter);
  
  // Save to file
  fs.writeFileSync(filePath, fileContent);
  console.log(`Saved blog post: ${fileName}`);
}

/**
 * Main function to fetch Discord messages and convert to blog posts
 */
async function main() {
  if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID) {
    console.error('Environment variables DISCORD_TOKEN and DISCORD_CHANNEL_ID must be set');
    process.exit(1);
  }
  
  console.log('Starting Discord to Blog conversion...');
  
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  try {
    // Login to Discord
    await client.login(DISCORD_TOKEN);
    console.log('Logged in to Discord');
    
    // Get the channel
    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
    if (!channel || channel.type !== ChannelType.GuildText) {
      console.error('Channel not found or not a text channel');
      process.exit(1);
    }
    
    console.log(`Fetching messages from channel: ${channel.name}`);
    
    // Fetch the last X messages
    const messages = await channel.messages.fetch({ limit: 100 });
    console.log(`Fetched ${messages.size} messages`);
    
    // Group messages into conversations
    const conversations = groupMessagesByConversation(Array.from(messages.values()));
    console.log(`Grouped into ${conversations.length} conversations`);
    
    // Process each conversation
    for (const conversation of conversations) {
      // Extract title, author, and tags
      const title = extractTitle(conversation);
      const author = conversation[0].author.username;
      const tags = extractTags(conversation);
      const date = new Date(conversation[0].createdTimestamp);
      
      // Format conversation to Markdown
      let content = formatConversationToMarkdown(conversation);
      
      // Polish with AI if available
      if (AZURE_OPENAI_API_KEY && AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_DEPLOYMENT) {
        console.log(`Polishing post with AI: ${title}`);
        content = await polishWithAI(content);
      }
      
      // Save as blog post
      saveBlogPost(title, content, author, tags, date);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Logout from Discord
    client.destroy();
    console.log('Finished Discord to Blog conversion');
  }
}

// Run the main function
main(); 