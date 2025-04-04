/**
 * Utilities for Adobe Edge Delivery Services
 */

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 */
export function loadCSS(href) {
  if (!document.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

/**
 * Retrieves the content of metadata tags.
 * @param {string} name The metadata name (or property)
 * @returns {string} The metadata value
 */
export function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = document.head.querySelector(`meta[${attr}="${name}"]`);
  return meta && meta.content;
}

/**
 * Decorates a block.
 * @param {Element} block The block element
 */
export function decorateBlock(block) {
  const shortBlockName = block.classList[0];
  if (shortBlockName) {
    block.classList.add('block');
    block.dataset.blockName = shortBlockName;
    block.dataset.blockStatus = 'initialized';
    const blockWrapper = block.parentElement;
    blockWrapper.classList.add(`${shortBlockName}-wrapper`);
    const section = block.closest('.section');
    if (section) section.classList.add(`${shortBlockName}-container`);
  }
}

/**
 * Loads JS and CSS for a block.
 * @param {Element} block The block element
 */
export async function loadBlock(block) {
  const status = block.dataset.blockStatus;
  if (status !== 'loading' && status !== 'loaded') {
    block.dataset.blockStatus = 'loading';
    const blockName = block.dataset.blockName;
    try {
      const cssPath = `/blocks/${blockName}/${blockName}.css`;
      loadCSS(cssPath);
      const jsPath = `/blocks/${blockName}/${blockName}.js`;
      const mod = await import(jsPath);
      if (mod.default) {
        await mod.default(block);
      }
    } catch (err) {
      console.log(`failed to load block ${blockName}`, err);
    }
    block.dataset.blockStatus = 'loaded';
  }
}

/**
 * Decorates all blocks in a container element.
 * @param {Element} main The container element
 */
export function decorateBlocks(main) {
  main
    .querySelectorAll('div.block-container > div')
    .forEach((block) => decorateBlock(block));
}

/**
 * Loads JS and CSS for all blocks in a container element.
 * @param {Element} main The container element
 */
export async function loadBlocks(main) {
  main
    .querySelectorAll('div.block')
    .forEach(async (block) => loadBlock(block));
}

/**
 * Extracts the config from a block.
 * @param {Element} block The block element
 * @returns {object} The block config
 */
export function readBlockConfig(block) {
  const config = {};
  block.querySelectorAll(':scope>div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const col = cols[1];
        const name = toClassName(cols[0].textContent);
        let value = '';
        if (col.querySelector('a')) {
          const as = [...col.querySelectorAll('a')];
          if (as.length === 1) {
            value = as[0].href;
          } else {
            value = as.map((a) => a.href);
          }
        } else if (col.querySelector('p')) {
          const ps = [...col.querySelectorAll('p')];
          if (ps.length === 1) {
            value = ps[0].textContent;
          } else {
            value = ps.map((p) => p.textContent);
          }
        } else value = col.textContent;
        config[name] = value;
      }
    }
  });
  return config;
}

/**
 * Converts a string to camel case.
 * @param {string} str The string to convert
 * @returns {string} The camel case string
 */
export function toCamelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|[-_])/g, (match, offset) => {
    if (offset === 0) return match.toLowerCase();
    if (match === '-' || match === '_') return '';
    return match.toUpperCase();
  });
}

/**
 * Converts a string to class name case.
 * @param {string} str The string to convert
 * @returns {string} The class name case string
 */
export function toClassName(str) {
  return toCamelCase(str.replaceAll(/[^0-9a-z]/gi, '-').replaceAll(/-+/g, '-'));
} 