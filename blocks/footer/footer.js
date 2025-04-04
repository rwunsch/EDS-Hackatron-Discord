export default function decorate(block) {
  block.innerHTML = `
    <div>
      <p>&copy; ${new Date().getFullYear()} Discord to Blog Converter - Generated with Adobe Edge Delivery Services</p>
    </div>
  `;
} 