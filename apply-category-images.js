const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, 'data', 'products.js');

let fileContent = fs.readFileSync(productsFilePath, 'utf8');

// Mapping categories to their local image paths
const categoryImageMap = {
  'Necklaces': '/images/categories/Necklace1.jpg',
  'Harams': '/images/categories/Harams.jpg',
  'Earrings': '/images/categories/Earrings.jpg',
  'Jhumkas': '/images/categories/Jumkas.jpg',
  'Rings': '/images/categories/Rings.jpg',
  'Bangles': '/images/categories/Bangles.png',
  'Bracelets': '/images/categories/Bracelets.jpg',
  'Mangalsutras': '/images/categories/Mangalasustras.jpg',
  // Fallbacks for categories without exact images
  'Pendants': '/images/categories/Necklace1.jpg',
  'Anklets': '/images/categories/Bracelets.jpg',
  'Nose Pins': '/images/categories/Earrings.jpg',
  'Papidi': '/images/categories/Earrings.jpg',
  'Watches': '/images/categories/Bracelets.jpg'
};

// Regex to match and replace the images array based on the category found earlier in the object
let currentCategory = '';
const lines = fileContent.split('\n');
const newLines = lines.map(line => {
  const categoryMatch = line.match(/category:\s*'([^']+)'/);
  if (categoryMatch) {
    currentCategory = categoryMatch[1];
  }
  
  if (line.includes('images: [') && currentCategory) {
    const imageUrl = categoryImageMap[currentCategory] || '/images/categories/Necklace1.jpg';
    return line.replace(/images:\s*\[.*\]/, `images: ['${imageUrl}']`);
  }
  return line;
});

fs.writeFileSync(productsFilePath, newLines.join('\n'), 'utf8');
console.log('Successfully updated product images to category images!');
