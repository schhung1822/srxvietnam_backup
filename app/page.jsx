import Home from '../src/views/Home.jsx';
import { getCatalogProducts } from '../src/lib/server/products.js';

export const dynamic = 'force-dynamic';

function pickRandomProducts(products, limit = 4) {
  const shuffled = [...products];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, Math.max(0, limit));
}

export default async function HomePage() {
  const products = await getCatalogProducts();
  const featuredProducts = pickRandomProducts(products, 4);

  return <Home featuredProducts={featuredProducts} />;
}
