import { loadCSS, loadBlocks } from './aem.js';

// Add any global functionality here
function loadPage() {
  // Load all blocks
  loadBlocks();
  
  // Add any additional page initialization here
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', loadPage);
} else {
  loadPage();
} 