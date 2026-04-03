require('dotenv').config();
const mongoose = require('mongoose');
const Product  = require('./models/Product');

// Valid categories — must match exactly
const VALID = ['Men', 'Women', 'Kids', 'Kurtas', 'Sarees', 'Fabrics', 'Home Decor', 'Accessories'];

const normalize = (cat) => {
  if (!cat) return null;
  const cleaned = cat.trim();
  // Find case-insensitive match
  const found = VALID.find(v => v.toLowerCase() === cleaned.toLowerCase());
  return found || cleaned;
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('✅ Connected');

  const products = await Product.find({});
  console.log(`Found ${products.length} products\n`);

  let fixed = 0;

  for (const p of products) {
    let changed = false;

    // Fix category field
    const normCat = normalize(p.category);
    if (normCat && normCat !== p.category) {
      console.log(`  category: "${p.category}" → "${normCat}"`);
      p.category = normCat;
      changed = true;
    }

    // Fix categories array
    if (p.categories?.length > 0) {
      const normCats = p.categories.map(normalize).filter(Boolean);
      if (JSON.stringify(normCats) !== JSON.stringify(p.categories)) {
        console.log(`  categories: ${JSON.stringify(p.categories)} → ${JSON.stringify(normCats)}`);
        p.categories = normCats;
        changed = true;
      }
    } else if (p.category) {
      // Fill empty categories from category
      p.categories = [p.category];
      console.log(`  filled categories: [${p.category}]`);
      changed = true;
    }

    // Make sure category is always first of categories
    if (p.categories?.length > 0 && p.category !== p.categories[0]) {
      p.category = p.categories[0];
      changed = true;
    }

    if (changed) {
      await p.save();
      console.log(`✅ Fixed: ${p.name}`);
      fixed++;
    }
  }

  console.log(`\n🎉 Done! Fixed ${fixed} of ${products.length} products`);
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});