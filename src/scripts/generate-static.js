const fs = require('fs');
const path = require('path');

// Generate sitemap
const generateSitemap = () => {
    const baseUrl = 'https://nextgency.vn';
    const currentDate = new Date().toISOString();

    const routes = [
        { url: '/', priority: 1.0 },
        { url: '/about', priority: 0.8 },
        { url: '/services/website-landing-page', priority: 0.9 },
        { url: '/services/ai-data', priority: 0.9 },
        { url: '/services/google-ads', priority: 0.9 },
        { url: '/services/facebook-ads', priority: 0.9 },
        { url: '/services/tiktok-ads', priority: 0.9 },
        { url: '/services/facebook-crm', priority: 0.8 },
        { url: '/services/marketing-outsource', priority: 0.9 },
        { url: '/services/tick-xanh-facebook', priority: 0.7 }
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
};

// Generate robots.txt
const generateRobots = () => {
    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://nextgency.vn/sitemap.xml`;
};

// Write files to public folder
const publicDir = path.join(__dirname, '..', 'public');

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), generateSitemap());
fs.writeFileSync(path.join(publicDir, 'robots.txt'), generateRobots());

console.log('✅ Generated sitemap.xml and robots.txt');
