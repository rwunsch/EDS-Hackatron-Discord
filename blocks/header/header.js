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