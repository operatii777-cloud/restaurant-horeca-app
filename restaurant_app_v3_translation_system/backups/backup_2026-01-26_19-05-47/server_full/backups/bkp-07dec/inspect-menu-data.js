const { getMenuData } = require('./services/menuDataService');

(async () => {
  const drinks = await getMenuData('drinks', 'en');
  const food = await getMenuData('food', 'en');

  console.log('Drinks categories:');
  console.log(JSON.stringify(
    drinks.categories.map(c => ({
      ro: c.name_ro,
      en: c.name_en,
      products: c.products.map(p => p.name)
    })), null, 2));

  console.log('\nFood categories:');
  console.log(JSON.stringify(
    food.categories.map(c => ({
      ro: c.name_ro,
      en: c.name_en,
      firstProduct: c.products[0]?.name || null
    })), null, 2));

  process.exit(0);
})();

