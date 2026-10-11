const fs = require('fs');

const file = 'c:\\Projects\\SKJ\\data\\products.js';
let content = fs.readFileSync(file, 'utf8');

const imageMap = {
  Necklaces: 'https://images.unsplash.com/photo-1599643478524-fb66f7ac3112?auto=format&fit=crop&q=80&w=800',
  Harams: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
  Earrings: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
  Jhumkas: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
  Rings: 'https://images.unsplash.com/photo-1605100804763-247f6612d540?auto=format&fit=crop&q=80&w=800',
  Bangles: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
  Bracelets: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
  Watches: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800',
  default: 'https://images.unsplash.com/photo-1599643478524-fb66f7ac3112?auto=format&fit=crop&q=80&w=800'
};

// Regex to find category and replace images array
content = content.replace(/category:\s*'([^']+)',([\s\S]*?)images:\s*\[\],/g, (match, category, middle) => {
  const url = imageMap[category] || imageMap.default;
  return `category: '${category}',${middle}images: ['${url}'],`;
});

fs.writeFileSync(file, content);
console.log('Updated products.js');
