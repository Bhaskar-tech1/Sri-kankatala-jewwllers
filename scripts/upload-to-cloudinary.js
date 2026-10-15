const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MAP_FILE = path.join(__dirname, 'cloudinary-map.json');

function getAllImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllImageFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
        // Skip favicon.ico, icon.png if needed, but let's check
        const relPath = '/' + path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/');
        fileList.push({ fullPath: filePath, relPath });
      }
    }
  }
  return fileList;
}

async function uploadFile(filePath, relPath) {
  // Generate a clean public_id based on relative path without extension
  const cleanId = relPath
    .replace(/^\//, '')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_\-\/]/g, '_');

  console.log(`Uploading ${relPath} -> public_id: skj/${cleanId}...`);

  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'skj',
    public_id: cleanId.replace(/^images\//, ''),
    overwrite: true,
    resource_type: 'image',
    // Apply automatic format and quality transformation for super fast loading
  });

  // Optimize URL with f_auto,q_auto
  // Cloudinary standard optimized URL format:
  // e.g., https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/v.../skj/...
  const optimizedUrl = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');

  return {
    relPath,
    secure_url: result.secure_url,
    optimized_url: optimizedUrl,
    public_id: result.public_id,
    bytes: result.bytes,
    format: result.format,
    width: result.width,
    height: result.height,
  };
}

async function main() {
  console.log('Testing Cloudinary config...');
  console.log('Cloud name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

  const images = getAllImageFiles(PUBLIC_DIR);
  console.log(`Found ${images.length} images to process:`);
  images.forEach((img) => console.log(' - ' + img.relPath));

  let existingMap = {};
  if (fs.existsSync(MAP_FILE)) {
    try {
      existingMap = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    } catch (e) {
      existingMap = {};
    }
  }

  const resultMap = { ...existingMap };

  for (const img of images) {
    try {
      const res = await uploadFile(img.fullPath, img.relPath);
      resultMap[img.relPath] = res;
      console.log(`✓ Uploaded ${img.relPath} -> ${res.optimized_url}`);
    } catch (err) {
      console.error(`✗ Failed to upload ${img.relPath}:`, err.message);
    }
  }

  fs.writeFileSync(MAP_FILE, JSON.stringify(resultMap, null, 2), 'utf8');
  console.log(`\nAll done! Saved mapping to ${MAP_FILE}`);
}

main().catch(console.error);
