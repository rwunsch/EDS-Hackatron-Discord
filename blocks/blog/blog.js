import { getMetadata } from '../../scripts/aem.js';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default function decorate(block) {
  const title = getMetadata('title');
  const author = getMetadata('author');
  const date = getMetadata('date');
  const tags = getMetadata('tags');
  
  // Create blog header
  const blogHeader = document.createElement('div');
  blogHeader.className = 'blog-header';
  
  const titleEl = document.createElement('h1');
  titleEl.textContent = title;
  blogHeader.appendChild(titleEl);
  
  const meta = document.createElement('div');
  meta.className = 'blog-meta';
  
  if (author) {
    const authorEl = document.createElement('span');
    authorEl.className = 'blog-author';
    authorEl.textContent = `Author: ${author}`;
    meta.appendChild(authorEl);
  }
  
  if (date) {
    const dateEl = document.createElement('span');
    dateEl.className = 'blog-date';
    dateEl.textContent = `Posted: ${formatDate(date)}`;
    meta.appendChild(dateEl);
  }
  
  if (tags) {
    const tagsArray = tags.split(',').map(tag => tag.trim());
    if (tagsArray.length > 0) {
      const tagsEl = document.createElement('div');
      tagsEl.className = 'blog-tags';
      tagsEl.textContent = `Tags: ${tagsArray.join(', ')}`;
      meta.appendChild(tagsEl);
    }
  }
  
  blogHeader.appendChild(meta);
  
  // Create a container for the blog content
  const blogContent = document.createElement('div');
  blogContent.className = 'blog-content';
  
  // Move the existing content to the blog content container
  while (block.firstChild) {
    blogContent.appendChild(block.firstChild);
  }
  
  // Append the header and content to the block
  block.appendChild(blogHeader);
  block.appendChild(blogContent);
} 