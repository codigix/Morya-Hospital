const fs = require('fs');

const sitemapContent = fs.readFileSync('sitemap.xml', 'utf8');
const blogs = JSON.parse(fs.readFileSync('data/blogs.json', 'utf8'));
const blogSlugs = new Set(blogs.map(b => b.slug.toLowerCase().trim()));

const urlEntryRegex = /<url>([\s\S]*?)<\/url>/g;
let match;
const coreEntries = [];

while ((match = urlEntryRegex.exec(sitemapContent)) !== null) {
  const fullEntry = match[0];
  const inner = match[1];
  const locMatch = inner.match(/<loc>([^<]+)<\/loc>/i);
  if (locMatch) {
    const loc = locMatch[1].trim();
    const filename = loc.split('/').pop().toLowerCase().trim();
    if (!blogSlugs.has(filename) && !loc.includes("blog-details.html?slug=") && !blogSlugs.has(filename.replace(/\.html$/,""))) {
      coreEntries.push(fullEntry);
    }
  }
}

// Add blog-details.html entry if not present
const hasBlogDetails = coreEntries.some(e => e.includes('blog-details.html'));
if (!hasBlogDetails) {
  const blogDetailsEntry = `  <url>
    <loc>https://morayamultispecialitycharitablehospital.com/blog-details.html</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.80</priority>
  </url>`;
  coreEntries.push(blogDetailsEntry);
}

// Add query URLs for each blog post for crawler discoverability
const blogUrlEntries = blogs.map(b => {
  const slug = b.slug.replace(/\.html$/, '');
  const lastmod = b.lastmod || new Date().toISOString();
  return `  <url>
    <loc>https://morayamultispecialitycharitablehospital.com/blog.html/${encodeURIComponent(slug)}.html</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.64</priority>
  </url>`;
});

const header = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/css" href="https://www.xml-sitemaps.com/css/sitemap.css"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:fo="http://www.w3.org/1999/XSL/Format"
      xmlns:xhtml="http://www.w3.org/1999/xhtml"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<!-- Automatically synced for dynamic JSON blogs -->
`;

const newSitemap = `${header}
${coreEntries.join('\n')}
${blogUrlEntries.join('\n')}
</urlset>`;

fs.writeFileSync('sitemap.xml', newSitemap, 'utf8');
console.log('Successfully updated sitemap.xml!');
console.log('Core pages:', coreEntries.length);
console.log('Blog pages:', blogUrlEntries.length);
