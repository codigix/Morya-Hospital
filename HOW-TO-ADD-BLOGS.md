# Dynamic JSON Blog System (Moraya Hospital)

All blog cards and blog details are dynamically fetched from a single JSON file: [`data/blogs.json`](./data/blogs.json).
There is **only ONE blog details page**: [`blog-details.html`](./blog-details.html).
All redundant static individual blog files have been removed from the website root.

---

## ⚡ How to Add or Edit a Blog (Only 1 Step!)

### Step 1: Open [`data/blogs.json`](./data/blogs.json)
Add your new blog at the top of the array:

```json
{
  "id": "my-new-treatment-pcmc",
  "slug": "my-new-treatment-pcmc",
  "title": "My New Treatment Title Here",
  "date": "26/10/2026",
  "author": "Author",
  "category": "Orthopaedics / ENT / General",
  "image": "img/resource/your-image.webp",
  "imageAlt": "Alt text for image",
  "excerpt": "Short 1-2 sentence preview for the card on blog.html...",
  "bannerBg": "img/resource/ot.webp",
  "bannerTitle": "My New Treatment Title Here",
  "metaTitle": "SEO Title Here | Moraya Hospital Chinchwad",
  "metaDescription": "SEO meta description under 160 characters...",
  "keywords": "keyword 1, keyword 2, Moraya Hospital, Chinchwad, PCMC",
  "schema": {"@context": "https://schema.org", "@type": "Article", "headline": "My New Treatment Title Here"},
  "content": "<h2>Introduction</h2><p>Your full blog HTML content goes here...</p>",
  "faqs": [
    {
      "question": "What is the recovery period?",
      "answer": "Recovery usually takes 2-4 weeks depending on the individual."
    }
  ]
}
```

### Done! 🎉
- It will **immediately appear** on [blog.html](./blog.html).
- Clicking it opens `/blog/my-new-treatment-pcmc` with all images, content, and FAQs.
- The "Recent Blogs" sidebar in [blog-details.html](./blog-details.html) will automatically include it.

---

## 🗺️ Updating the Sitemap (Optional)

Whenever you add new blogs, you can update [sitemap.xml](./sitemap.xml) by running:

```bash
node scripts/update-sitemap-dynamic.js
```
or
```bash
npm run sitemap
```



## Adding schema (JSON-LD) to a blog

Add an optional `"schema"` field to the blog in `data/blogs.json`. The blog page injects it into `<head>` as `<script type="application/ld+json">` automatically.
The value can be a JSON object, an array of objects, or the pasted `<script type="application/ld+json">...</script>` text as a string (escape the quotes).
Blogs without a `schema` field get no schema.
