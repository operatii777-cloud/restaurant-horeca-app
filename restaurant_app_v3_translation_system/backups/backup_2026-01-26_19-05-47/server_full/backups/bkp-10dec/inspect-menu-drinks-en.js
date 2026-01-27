const { getMenuData } = require('./services/menuDataService');

(async () => {
  const data = await getMenuData('drinks', 'en');
  const summary = data.categories.map(category => ({
    category_ro: category.name_ro,
    category_en: category.name_en,
    products: category.products.map(p => ({
      name: p.name,
      source_category: p.category
    }))
  }));

  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
})();

