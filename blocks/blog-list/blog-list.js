import { getMetadata } from '../../scripts/aem.js';

async function fetchBlogIndex() {
  const resp = await fetch('/blog/query-index.json');
  if (!resp.ok) return [];
  const json = await resp.json();
  return json.data;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default async function decorate(block) {
  const blogPosts = await fetchBlogIndex();
  
  // Sort posts by date (newest first)
  blogPosts.sort((a, b) => {
    const dateA = new Date(a.date || a.lastModified);
    const dateB = new Date(b.date || b.lastModified);
    return dateB - dateA;
  });

  const blogList = document.createElement('div');
  blogList.className = 'blog-posts';
  
  blogPosts.forEach((post) => {
    const postDiv = document.createElement('div');
    postDiv.className = 'blog-post-card';
    
    const title = document.createElement('h2');
    const titleLink = document.createElement('a');
    titleLink.href = post.path;
    titleLink.textContent = post.title;
    title.appendChild(titleLink);
    
    const meta = document.createElement('div');
    meta.className = 'blog-post-meta';
    
    if (post.author) {
      const author = document.createElement('span');
      author.className = 'blog-post-author';
      author.textContent = `Author: ${post.author}`;
      meta.appendChild(author);
    }
    
    if (post.date) {
      const date = document.createElement('span');
      date.className = 'blog-post-date';
      date.textContent = `Posted: ${formatDate(post.date)}`;
      meta.appendChild(date);
    }
    
    if (post.tags && post.tags.length) {
      const tags = document.createElement('div');
      tags.className = 'blog-post-tags';
      tags.textContent = `Tags: ${post.tags.join(', ')}`;
      meta.appendChild(tags);
    }
    
    const description = document.createElement('p');
    description.className = 'blog-post-description';
    description.textContent = post.description || '';
    
    const readMore = document.createElement('a');
    readMore.className = 'blog-post-read-more';
    readMore.href = post.path;
    readMore.textContent = 'Read More';
    
    postDiv.appendChild(title);
    postDiv.appendChild(meta);
    postDiv.appendChild(description);
    postDiv.appendChild(readMore);
    
    blogList.appendChild(postDiv);
  });
  
  block.textContent = '';
  
  if (blogPosts.length === 0) {
    const noPosts = document.createElement('p');
    noPosts.textContent = 'No blog posts found.';
    block.appendChild(noPosts);
  } else {
    block.appendChild(blogList);
  }
} 