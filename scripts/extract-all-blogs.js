const fs = require('fs');
const path = require('path');

// Ensure data directory exists
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

const blogHtml = fs.readFileSync('blog.html', 'utf8');

// Read sitemap to get existing lastmod for each file if available
const sitemapContent = fs.readFileSync('sitemap.xml', 'utf8');
const sitemapDates = {};
const sitemapRegex = /<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g;
let sm;
while ((sm = sitemapRegex.exec(sitemapContent)) !== null) {
  const loc = sm[1].trim();
  const lastmod = sm[2].trim();
  const filename = loc.split('/').pop().trim();
  if (filename) {
    sitemapDates[filename] = lastmod;
  }
}

// Parse blog cards from blog.html in order
const cardRegex = /<div class="blog-card">([\s\S]*?)<\/div>\s*<\/div>/g;
let match;
const blogs = [];

while ((match = cardRegex.exec(blogHtml)) !== null) {
  const block = match[0];
  const imgSrc = (block.match(/<img[^>]+src="([^">]+)"/) || [])[1] || '';
  const imgAlt = (block.match(/<img[^>]+alt="([^">]*)"/) || [])[1] || '';
  const date = (block.match(/theme-icon calender[^<]*<\/i>\s*<span>([^<]+)<\/span>/i) || [])[1] || '';
  const category = (block.match(/theme-icon category[^<]*<\/i>\s*<span>([^<]+)<\/span>/i) || [])[1] || '';
  const titleMatch = (block.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i) || [])[1] || '';
  const cardTitle = titleMatch.replace(/\s+/g, ' ').trim();
  const excerpt = (block.match(/<p>([\s\S]*?)<\/p>/i) || [])[1] || '';
  const hrefMatch = block.match(/<a[^>]+href="([^">]+)"[^>]*class="read-btn"/i) || block.match(/<a[^>]+class="read-btn"[^>]*href="([^">]+)"/i);
  const href = hrefMatch ? hrefMatch[1].trim() : '';

  if (!href) continue;

  const id = href.replace(/\.html$/i, '');
  const blogItem = {
    id: id,
    slug: href,
    title: cardTitle,
    date: date.trim(),
    author: 'Author',
    category: category.trim(),
    image: imgSrc.trim(),
    imageAlt: imgAlt.trim(),
    excerpt: excerpt.replace(/\s+/g, ' ').trim(),
    bannerBg: 'img/resource/slider4.jpg',
    bannerTitle: cardTitle,
    metaTitle: cardTitle + ' | Moraya Hospital Chinchwad',
    metaDescription: excerpt.replace(/\s+/g, ' ').trim(),
    keywords: category.trim() + ', Moraya Hospital, Chinchwad, PCMC',
    canonical: `https://morayamultispecialitycharitablehospital.com/${href}`,
    lastmod: sitemapDates[href] || new Date().toISOString(),
    content: '',
    faqs: []
  };

  // If individual file exists, parse rich details from it
  if (fs.existsSync(href)) {
    const fileHtml = fs.readFileSync(href, 'utf8');

    // Title tag
    const pageTitle = (fileHtml.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
    if (pageTitle) blogItem.metaTitle = pageTitle.trim();

    // Meta description
    const descMatch = fileHtml.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i);
    if (descMatch) blogItem.metaDescription = descMatch[1].trim();

    // Meta keywords
    const kwMatch = fileHtml.match(/<meta[^>]+name="keywords"[^>]+content="([^"]*)"/i);
    if (kwMatch) blogItem.keywords = kwMatch[1].trim();

    // Canonical
    const canMatch = fileHtml.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i);
    if (canMatch) blogItem.canonical = canMatch[1].trim();

    // Banner image
    const bgMatch = fileHtml.match(/class="innerpagebanner"[^>]*style="[^"]*background:[^"]*url\(([^)]+)\)/i);
    if (bgMatch) blogItem.bannerBg = bgMatch[1].replace(/['"]/g, '').trim();

    // Banner title
    const bTitleMatch = fileHtml.match(/<div class="innerpagebannertitle">[\s\S]*?<h1>([\s\S]*?)<\/h1>/i);
    if (bTitleMatch) blogItem.bannerTitle = bTitleMatch[1].replace(/\s+/g, ' ').trim();

    // Featured image in detail page
    const detailImgMatch = fileHtml.match(/<div class="blogcontainerleft">[\s\S]*?<img[^>]+src="([^">]+)"/i);
    if (detailImgMatch && detailImgMatch[1]) {
      blogItem.image = detailImgMatch[1].trim();
    }
    const detailAltMatch = fileHtml.match(/<div class="blogcontainerleft">[\s\S]*?<img[^>]+alt="([^">]*)"/i);
    if (detailAltMatch && detailAltMatch[1]) {
      blogItem.imageAlt = detailAltMatch[1].trim();
    }

    // Body content inside blogcontainerleft
    const leftMatch = fileHtml.match(/<div class="blogcontainerleft">([\s\S]*?)<\/div>\s*<div class="blogcontainerright">/i);
    if (leftMatch) {
      let body = leftMatch[1];
      // Remove the top featured image if it was included in blogcontainerleft
      body = body.replace(/<img[^>]+src="[^"]*"[^>]*>/i, '');
      // Remove <ul class="bloginfo">...</ul>
      body = body.replace(/<div class="blog-content">\s*<ul class="bloginfo">[\s\S]*?<\/ul>/i, '');
      // Remove trailing closing </div> if remaining
      body = body.replace(/<\/div>\s*$/, '');
      blogItem.content = body.trim();
    }

    // FAQs
    const faqMatch = fileHtml.match(/<dl class="accordions">([\s\S]*?)<\/dl>/i);
    if (faqMatch) {
      const dtDdRegex = /<dt><a[^>]*>(?:<i[^>]*><\/i>)?\s*([\s\S]*?)<\/a><\/dt>\s*<dd[^>]*>\s*<p>([\s\S]*?)<\/p>\s*<\/dd>/gi;
      let fMatch;
      while ((fMatch = dtDdRegex.exec(faqMatch[1])) !== null) {
        blogItem.faqs.push({
          question: fMatch[1].replace(/\s+/g, ' ').trim(),
          answer: fMatch[2].replace(/\s+/g, ' ').trim()
        });
      }
    }
  }

  blogs.push(blogItem);
}

fs.writeFileSync('data/blogs.json', JSON.stringify(blogs, null, 2), 'utf8');
console.log(`Successfully extracted ${blogs.length} blogs into data/blogs.json!`);
