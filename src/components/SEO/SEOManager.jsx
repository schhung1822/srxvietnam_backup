// src/components/SEO/SEOManager.jsx
import { useEffect } from 'react';

const SEOManager = ({
                        title,
                        description,
                        keywords,
                        author = 'Nextgency',
                        image,
                        url,
                        type = 'website',
                        twitterCard = 'summary_large_image',
                        locale = 'vi_VN',
                        canonicalUrl,
                        structuredData,
                        additionalMetaTags = []
                    }) => {
    const siteName = 'SRX Vietnam - Digital Marketing Agency';
    const defaultTitle = 'SRX Vietnam - Từ công nghệ sinh học đến gần hơn với làn da Việt';
    const defaultDescription = 'NSRX Tiên phong tích hợp công nghệ tiên tiến nhất trong nghiên cứu và phát triển sản phẩm chăm da';
    const defaultImage = '/assets/images/og-image.jpg';
    const baseUrl = 'https://srxvietnam.vn';

    const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
    const finalDescription = description || defaultDescription;
    const finalImage = image || defaultImage;
    const finalUrl = url || baseUrl;
    const finalCanonicalUrl = canonicalUrl || finalUrl;

    useEffect(() => {
        // Update title
        document.title = finalTitle;

        // Helper function to update or create meta tag
        const updateMetaTag = (selector, attribute, content) => {
            let element = document.querySelector(selector);
            if (!element) {
                element = document.createElement('meta');
                if (selector.includes('property=')) {
                    element.setAttribute('property', selector.split('"')[1]);
                } else if (selector.includes('name=')) {
                    element.setAttribute('name', selector.split('"')[1]);
                }
                document.head.appendChild(element);
            }
            element.setAttribute(attribute, content);
        };

        // Helper function to update or create link tag
        const updateLinkTag = (rel, href) => {
            let element = document.querySelector(`link[rel="${rel}"]`);
            if (!element) {
                element = document.createElement('link');
                element.setAttribute('rel', rel);
                document.head.appendChild(element);
            }
            element.setAttribute('href', href);
        };

        // Basic Meta Tags
        updateMetaTag('meta[name="description"]', 'content', finalDescription);
        updateMetaTag('meta[name="keywords"]', 'content', keywords || 'digital marketing, thiết kế website, google ads, facebook ads, tiktok ads, marketing outsource');
        updateMetaTag('meta[name="author"]', 'content', author);
        updateMetaTag('meta[name="robots"]', 'content', 'index, follow');
        updateMetaTag('meta[name="googlebot"]', 'content', 'index, follow');

        // Language and Region
        updateMetaTag('meta[name="language"]', 'content', 'Vietnamese');
        updateMetaTag('meta[name="geo.region"]', 'content', 'VN');
        updateMetaTag('meta[name="geo.placename"]', 'content', 'Ho Chi Minh City');

        // Open Graph Meta Tags
        updateMetaTag('meta[property="og:type"]', 'content', type);
        updateMetaTag('meta[property="og:title"]', 'content', finalTitle);
        updateMetaTag('meta[property="og:description"]', 'content', finalDescription);
        updateMetaTag('meta[property="og:image"]', 'content', finalImage);
        updateMetaTag('meta[property="og:url"]', 'content', finalUrl);
        updateMetaTag('meta[property="og:site_name"]', 'content', siteName);
        updateMetaTag('meta[property="og:locale"]', 'content', locale);

        // Twitter Card Meta Tags
        updateMetaTag('meta[name="twitter:card"]', 'content', twitterCard);
        updateMetaTag('meta[name="twitter:title"]', 'content', finalTitle);
        updateMetaTag('meta[name="twitter:description"]', 'content', finalDescription);
        updateMetaTag('meta[name="twitter:image"]', 'content', finalImage);
        updateMetaTag('meta[name="twitter:site"]', 'content', '@nextgency');
        updateMetaTag('meta[name="twitter:creator"]', 'content', '@nextgency');

        // Canonical URL
        updateLinkTag('canonical', finalCanonicalUrl);

        // Additional Meta Tags
        additionalMetaTags.forEach(tag => {
            if (tag.name) {
                updateMetaTag(`meta[name="${tag.name}"]`, 'content', tag.content);
            } else if (tag.property) {
                updateMetaTag(`meta[property="${tag.property}"]`, 'content', tag.content);
            }
        });

        // Structured Data
        if (structuredData) {
            let scriptElement = document.querySelector('script[type="application/ld+json"]');
            if (!scriptElement) {
                scriptElement = document.createElement('script');
                scriptElement.setAttribute('type', 'application/ld+json');
                document.head.appendChild(scriptElement);
            }
            scriptElement.textContent = JSON.stringify(structuredData);
        }

        // Cleanup function
        return () => {
            // Only clean up structured data script as other meta tags might be used by other pages
            const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
            if (structuredDataScript && structuredData) {
                structuredDataScript.remove();
            }
        };
    }, [finalTitle, finalDescription, finalImage, finalUrl, finalCanonicalUrl, keywords, author, type, locale, twitterCard, additionalMetaTags, structuredData]);

    return null; // This component doesn't render anything
};

export default SEOManager;