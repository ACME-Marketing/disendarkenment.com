/**
 * XML Sitemap Generator for Disendarkenment.com
 * Generates comprehensive sitemap with proper priorities and change frequencies
 */

export class SitemapGenerator {
	constructor(baseUrl = 'https://disendarkenment.com') {
		this.baseUrl = baseUrl;
		this.urls = [];
		this.lastmod = new Date().toISOString().split('T')[0];
	}

	/**
	 * Add URL to sitemap
	 * @param {string} loc - URL location
	 * @param {number} priority - Priority (0.0 to 1.0)
	 * @param {string} changefreq - Change frequency
	 * @param {string} lastmod - Last modification date
	 */
	addUrl(loc, priority = 0.5, changefreq = 'monthly', lastmod = null) {
		this.urls.push({
			loc: `${this.baseUrl}${loc}`,
			priority: priority.toFixed(1),
			changefreq,
			lastmod: lastmod || this.lastmod
		});
	}

	/**
	 * Generate sitemap URLs for the website
	 */
	generateUrls() {
		// Homepage - highest priority
		this.addUrl('/', 1.0, 'weekly');

		// Main service pages - high priority
		this.addUrl('/services', 0.9, 'monthly');
		this.addUrl('/services/preparation', 0.8, 'monthly');
		this.addUrl('/services/facilitation', 0.8, 'monthly');
		this.addUrl('/services/integration', 0.8, 'monthly');
		this.addUrl('/services/beyond', 0.7, 'monthly');

		// Assessment and contact - high priority for conversions
		this.addUrl('/readiness-assessment', 0.9, 'monthly');
		this.addUrl('/readiness-assessment-enhanced', 0.9, 'monthly');
		this.addUrl('/contact-advanced', 0.8, 'monthly');
		this.addUrl('/get-started', 0.8, 'monthly');

		// Resources - medium-high priority
		this.addUrl('/resources', 0.7, 'weekly');
		this.addUrl('/resources/preparation', 0.6, 'monthly');
		this.addUrl('/resources/integration', 0.6, 'monthly');
		this.addUrl('/resources/library', 0.6, 'monthly');

		// About and informational pages
		this.addUrl('/about', 0.6, 'monthly');

		// Legal and safety pages - important for trust
		this.addUrl('/legal-safety', 0.5, 'quarterly');
		this.addUrl('/legal-safety/compliance', 0.5, 'quarterly');
		this.addUrl('/legal-safety/safety-protocols', 0.5, 'quarterly');
		this.addUrl('/terms', 0.4, 'yearly');
		this.addUrl('/privacy', 0.4, 'yearly');

		// Blog posts (if any exist)
		this.addBlogPosts();

		// Dynamic content
		this.addDynamicContent();
	}

	/**
	 * Add blog posts to sitemap (placeholder for future blog functionality)
	 */
	addBlogPosts() {
		// Example blog posts - replace with actual blog content
		const blogPosts = [
			{
				slug: '/blog/preparing-for-psychedelic-therapy',
				priority: 0.6,
				changefreq: 'monthly'
			},
			{
				slug: '/blog/integration-best-practices',
				priority: 0.6,
				changefreq: 'monthly'
			},
			{
				slug: '/blog/safety-first-approach',
				priority: 0.6,
				changefreq: 'monthly'
			}
		];

		blogPosts.forEach(post => {
			this.addUrl(post.slug, post.priority, post.changefreq);
		});
	}

	/**
	 * Add dynamic content to sitemap
	 */
	addDynamicContent() {
		// FAQ sections
		this.addUrl('/faq', 0.5, 'monthly');
		
		// Testimonials (if exists)
		this.addUrl('/testimonials', 0.5, 'monthly');
		
		// Research and studies (if exists)
		this.addUrl('/research', 0.6, 'monthly');
	}

	/**
	 * Generate XML sitemap
	 * @returns {string} XML sitemap content
	 */
	generateXML() {
		this.generateUrls();

		let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
		xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

		this.urls.forEach(url => {
			xml += '  <url>\n';
			xml += `    <loc>${url.loc}</loc>\n`;
			xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
			xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
			xml += `    <priority>${url.priority}</priority>\n`;
			xml += '  </url>\n';
		});

		xml += '</urlset>';
		return xml;
	}

	/**
	 * Generate sitemap index for multiple sitemaps
	 * @param {Array} sitemaps - Array of sitemap objects
	 * @returns {string} XML sitemap index
	 */
	generateSitemapIndex(sitemaps) {
		let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
		xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

		sitemaps.forEach(sitemap => {
			xml += '  <sitemap>\n';
			xml += `    <loc>${this.baseUrl}${sitemap.loc}</loc>\n`;
			xml += `    <lastmod>${sitemap.lastmod || this.lastmod}</lastmod>\n`;
			xml += '  </sitemap>\n';
		});

		xml += '</sitemapindex>';
		return xml;
	}

	/**
	 * Validate sitemap URLs
	 * @returns {Array} Array of validation errors
	 */
	validateUrls() {
		const errors = [];
		const urlPattern = /^https?:\/\/.+/;
		const priorityPattern = /^[01](\.[0-9])?$/;
		const changefreqValues = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

		this.urls.forEach((url, index) => {
			if (!urlPattern.test(url.loc)) {
				errors.push(`URL ${index + 1}: Invalid URL format - ${url.loc}`);
			}

			if (!priorityPattern.test(url.priority)) {
				errors.push(`URL ${index + 1}: Invalid priority value - ${url.priority}`);
			}

			if (!changefreqValues.includes(url.changefreq)) {
				errors.push(`URL ${index + 1}: Invalid changefreq value - ${url.changefreq}`);
			}

			if (url.lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(url.lastmod)) {
				errors.push(`URL ${index + 1}: Invalid lastmod format - ${url.lastmod}`);
			}
		});

		return errors;
	}

	/**
	 * Get sitemap statistics
	 * @returns {Object} Sitemap statistics
	 */
	getStats() {
		const stats = {
			totalUrls: this.urls.length,
			priorityDistribution: {},
			changefreqDistribution: {},
			averagePriority: 0
		};

		let totalPriority = 0;

		this.urls.forEach(url => {
			// Priority distribution
			const priority = url.priority;
			stats.priorityDistribution[priority] = (stats.priorityDistribution[priority] || 0) + 1;
			totalPriority += parseFloat(priority);

			// Changefreq distribution
			const changefreq = url.changefreq;
			stats.changefreqDistribution[changefreq] = (stats.changefreqDistribution[changefreq] || 0) + 1;
		});

		stats.averagePriority = (totalPriority / this.urls.length).toFixed(2);

		return stats;
	}
}

/**
 * Generate robots.txt content
 * @param {string} baseUrl - Base URL of the website
 * @returns {string} Robots.txt content
 */
export function generateRobotsTxt(baseUrl = 'https://disendarkenment.com') {
	return `User-agent: *
Allow: /

# Disallow sensitive areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /*.json$
Disallow: /*?*

# Allow important resources
Allow: /css/
Allow: /js/
Allow: /images/
Allow: /icons/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1

# Specific bot instructions
User-agent: Googlebot
Crawl-delay: 0

User-agent: Bingbot
Crawl-delay: 1

User-agent: Slurp
Crawl-delay: 2`;
}

/**
 * Generate structured data for organization
 * @param {Object} config - Organization configuration
 * @returns {Object} JSON-LD structured data
 */
export function generateOrganizationSchema(config = {}) {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		"name": config.name || "Disendarkenment",
		"url": config.url || "https://disendarkenment.com",
		"logo": config.logo || "https://disendarkenment.com/icons/icon-512x512.png",
		"description": config.description || "Professional psychedelic therapy facilitation and integration services",
		"address": {
			"@type": "PostalAddress",
			"addressCountry": config.country || "US"
		},
		"contactPoint": {
			"@type": "ContactPoint",
			"contactType": "customer service",
			"availableLanguage": ["English"]
		},
		"sameAs": config.socialMedia || [],
		"foundingDate": config.foundingDate || "2024",
		"areaServed": config.areaServed || "Worldwide",
		"serviceType": [
			"Psychedelic Therapy Preparation",
			"Psychedelic Experience Facilitation",
			"Integration Support",
			"Readiness Assessment"
		]
	};
}

// Export default instance
export default new SitemapGenerator();