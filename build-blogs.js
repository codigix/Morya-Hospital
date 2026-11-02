/**
 * Build Script for Moraya Hospital Blogs and Sitemap
 * 
 * Usage:
 *   node build-blogs.js
 * 
 * Functions:
 * 1. Reads blog posts from data/blogs.json
 * 2. Generates 100% pure static HTML files for every individual blog post
 * 3. Compiles blog.html (listing page) with all blog cards
 * 4. Automatically updates sitemap.xml with all blog URLs & lastmod timestamps
 * 5. Automatically updates "Recent Blogs" sidebar across all blog pages
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const DATA_FILE = path.join(ROOT_DIR, 'data', 'blogs.json');
const DETAIL_TEMPLATE_FILE = path.join(ROOT_DIR, 'templates', 'blog-detail-template.html');
const LIST_TEMPLATE_FILE = path.join(ROOT_DIR, 'templates', 'blog-list-template.html');
const SITEMAP_FILE = path.join(ROOT_DIR, 'sitemap.xml');
const BASE_URL = 'https://morayamultispecialitycharitablehospital.com';

function run() {
  console.log('🚀 Starting Moraya Hospital Blog & Sitemap Builder...\n');

  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Error: ${DATA_FILE} not found!`);
    process.exit(1);
  }

  const rawBlogs = fs.readFileSync(DATA_FILE, 'utf8');
  const blogs = JSON.parse(rawBlogs);

  if (!Array.isArray(blogs) || blogs.length === 0) {
    console.error('❌ Error: blogs.json must contain a non-empty array of blogs!');
    process.exit(1);
  }

  console.log(`📖 Loaded ${blogs.length} blog entries from data/blogs.json`);

  const detailTemplate = fs.readFileSync(DETAIL_TEMPLATE_FILE, 'utf8');
  const listTemplate = fs.readFileSync(LIST_TEMPLATE_FILE, 'utf8');

  // Build Recent Blogs HTML (shared across all blog detail pages)
  const recentBlogsHtml = blogs.map(b => {
    return `<li><a href="${escapeHtml(b.slug)}">${escapeHtml(b.title)}</a></li>`;
  }).join('\n                                        ');

  // 1. Generate individual static blog HTML pages
  let generatedCount = 0;
  for (const blog of blogs) {
    const slug = blog.slug || `${blog.id}.html`;
    const canonical = blog.canonical || `${BASE_URL}/${slug}`;
    const metaTitle = blog.metaTitle || `${blog.title} | Moraya Hospital Chinchwad`;
    const metaDescription = blog.metaDescription || blog.excerpt || '';
    const keywords = blog.keywords || `${blog.category || 'Hospital'}, Moraya Hospital, Chinchwad, PCMC`;
    const ogTitle = blog.ogTitle || metaTitle;
    const ogImage = blog.ogImage || (blog.image.startsWith('http') ? blog.image : `${BASE_URL}/${blog.image.replace(/^\//, '')}`);
    const bannerBg = blog.bannerBg || 'img/resource/ot.jpg';
    const bannerTitle = blog.bannerTitle || blog.title;
    const breadcrumbTitle = blog.breadcrumbTitle || blog.title;
    const image = blog.image || 'img/resource/slider4.jpg';
    const imageAlt = blog.imageAlt || blog.title;
    const date = blog.date || '';
    const author = blog.author || 'Author';
    const category = blog.category || 'Healthcare';
    const content = blog.content || '';

    // FAQ Section
    let faqSectionHtml = '';
    if (blog.faqs && Array.isArray(blog.faqs) && blog.faqs.length > 0) {
      const faqsListHtml = blog.faqs.map(faq => `
                                <dt><a href="#"><i class="icon-arrow-right"></i> ${escapeHtml(faq.question)}</a></dt>
                                <dd style="display: none;"><p>${faq.answer}</p></dd>`).join('');

      faqSectionHtml = `
            <!-- FAQ Section -->
            <div class="FAQSection">
                <div class="container">
                    <div class="faqblock faqblogpage">
                        <div class="servicedetailtitle">
                            <h2>Frequently Asked Questions</h2>
                        </div>
                        <p> Quick information to help patients understand our services and facilities.</p>
                        <div class="faqblockright">
                            <dl class="accordions">${faqsListHtml}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // Schema JSON-LD
    const schemaHtml = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "@id": "${canonical}#webpage",
      "url": "${canonical}",
      "name": ${JSON.stringify(blog.title)},
      "description": ${JSON.stringify(metaDescription)},
      "inLanguage": "en-IN",
      "publisher": {
        "@type": "Hospital",
        "@id": "${BASE_URL}/#hospital",
        "name": "Moraya Multispecialty Charitable Hospital Chinchwad",
        "url": "${BASE_URL}/"
      },
      "mainEntity": {
        "@type": "Article",
        "@id": "${canonical}#article",
        "headline": ${JSON.stringify(blog.title)},
        "description": ${JSON.stringify(metaDescription)},
        "author": {
          "@type": "Organization",
          "name": "Moraya Multispecialty Charitable Hospital Chinchwad",
          "url": "${BASE_URL}/"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Moraya Multispecialty Charitable Hospital Chinchwad",
          "url": "${BASE_URL}/"
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "${canonical}"
        },
        "inLanguage": "en-IN"
      }
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Hospital",
      "@id": "${BASE_URL}/#hospital",
      "name": "Moraya Multispecialty Charitable Hospital Chinchwad",
      "url": "${BASE_URL}/",
      "telephone": "+91-20-6730-6525",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Chaphekar Chowk, Morya Gosavi Main Road, Chinchwad Gaon",
        "addressLocality": "Pimpri-Chinchwad",
        "addressRegion": "Maharashtra",
        "postalCode": "411033",
        "addressCountry": "IN"
      }
    }
    </script>`;

    // Replace placeholders
    let pageHtml = detailTemplate
      .replace(/{{META_TITLE}}/g, escapeHtml(metaTitle))
      .replace(/{{META_DESCRIPTION}}/g, escapeHtml(metaDescription))
      .replace(/{{KEYWORDS}}/g, escapeHtml(keywords))
      .replace(/{{CANONICAL_URL}}/g, canonical)
      .replace(/{{OG_TITLE}}/g, escapeHtml(ogTitle))
      .replace(/{{OG_IMAGE}}/g, ogImage)
      .replace(/{{BANNER_BG}}/g, bannerBg)
      .replace(/{{BANNER_TITLE}}/g, escapeHtml(bannerTitle))
      .replace(/{{BREADCRUMB_TITLE}}/g, escapeHtml(breadcrumbTitle))
      .replace(/{{FEATURED_IMAGE}}/g, image)
      .replace(/{{IMAGE_ALT}}/g, escapeHtml(imageAlt))
      .replace(/{{DATE}}/g, escapeHtml(date))
      .replace(/{{AUTHOR}}/g, escapeHtml(author))
      .replace(/{{CATEGORY}}/g, escapeHtml(category))
      .replace(/{{CONTENT}}/g, content)
      .replace(/{{RECENT_BLOGS_LIST}}/g, recentBlogsHtml)
      .replace(/{{FAQ_SECTION}}/g, faqSectionHtml)
      .replace(/{{SCHEMA_JSON}}/g, schemaHtml);

    const targetFile = path.join(ROOT_DIR, slug);
    fs.writeFileSync(targetFile, pageHtml, 'utf8');
    generatedCount++;
  }
  console.log(`✅ Generated ${generatedCount} separate static blog HTML pages!`);

  // 2. Generate blog.html (List page)
  const blogCardsHtml = blogs.map(b => {
    return `
                        <!-- Blog Post: ${escapeHtml(b.title)} -->
                        <div class="blog-card">
                            <img src="${b.image}" alt="${escapeHtml(b.imageAlt || b.title)}">
                            <div class="blog-content">
                                <ul>
                                    <li><i class="theme-icon calender"></i><span>${escapeHtml(b.date)}</span> </li>
                                    <li><i class="theme-icon user"></i><span>${escapeHtml(b.author || 'Author')}</span> </li>
                                    <li><i class="theme-icon category"></i><span>${escapeHtml(b.category)}</span></li>
                                </ul>
                                <h2 style="line-height: 25px;">${escapeHtml(b.title)}</h2>
                                <p>${escapeHtml(b.excerpt)}</p>
                                <a href="${escapeHtml(b.slug)}" class="read-btn">Read More</a>
                            </div>
                        </div>`;
  }).join('\n');

  const listHtml = listTemplate.replace(/{{BLOG_CARDS}}/g, blogCardsHtml);
  fs.writeFileSync(path.join(ROOT_DIR, 'blog.html'), listHtml, 'utf8');
  console.log(`✅ Generated blog.html with all ${blogs.length} blog cards!`);

  // 3. Update sitemap.xml
  updateSitemap(blogs);

  console.log('\n🎉 ALL DONE! Your website blogs and sitemap are 100% up to date!');
}

function updateSitemap(blogs) {
  if (!fs.existsSync(SITEMAP_FILE)) {
    console.warn(`⚠️ sitemap.xml not found at ${SITEMAP_FILE}, skipping sitemap update.`);
    return;
  }

  const sitemapContent = fs.readFileSync(SITEMAP_FILE, 'utf8');

  // Extract all existing URL entries
  const urlEntryRegex = /<url>([\s\S]*?)<\/url>/g;
  let match;
  const nonBlogEntries = [];
  const existingBlogLastmods = {};

  const blogSlugs = new Set(blogs.map(b => b.slug.toLowerCase().trim()));

  while ((match = urlEntryRegex.exec(sitemapContent)) !== null) {
    const fullEntry = match[0];
    const inner = match[1];
    const locMatch = inner.match(/<loc>([^<]+)<\/loc>/i);
    const lastmodMatch = inner.match(/<lastmod>([^<]+)<\/lastmod>/i);

    if (locMatch) {
      const loc = locMatch[1].trim();
      const filename = loc.split('/').pop().toLowerCase().trim();

      if (blogSlugs.has(filename)) {
        if (lastmodMatch) {
          existingBlogLastmods[filename] = lastmodMatch[1].trim();
        }
      } else {
        // Keep non-blog core pages
        nonBlogEntries.push(fullEntry);
      }
    }
  }

  // Format blog URL entries
  const nowIso = new Date().toISOString();
  const blogUrlEntries = blogs.map(b => {
    const slugLower = b.slug.toLowerCase().trim();
    const lastmod = b.lastmod || existingBlogLastmods[slugLower] || nowIso;
    const priority = b.sitemapPriority || '0.64';
    return `  <url>
    <loc>${BASE_URL}/${b.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
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
<!-- Automatically generated & synced by Moraya Hospital Blog Builder -->
`;

  const newSitemap = `${header}
${nonBlogEntries.join('\n')}
${blogUrlEntries.join('\n')}
</urlset>`;

  fs.writeFileSync(SITEMAP_FILE, newSitemap, 'utf8');
  console.log(`✅ Updated sitemap.xml with ${nonBlogEntries.length} core pages and ${blogUrlEntries.length} blog pages!`);
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

run();
