// src/components/SEO/schemas.js
export const generateServiceSchema = ({
                                          serviceName,
                                          serviceType,
                                          description,
                                          provider = 'SRX Việt Nam',
                                          areaServed = 'Việt Nam',
                                          url,
                                          image,
                                          priceRange = '$$'
                                      }) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: serviceType,
        name: serviceName,
        description: description,
        provider: {
            '@type': 'Organization',
            name: provider,
            url: 'https://nextgency.vn'
        },
        areaServed: {
            '@type': 'Country',
            name: areaServed
        },
        url: url,
        image: image,
        priceRange: priceRange,
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '127'
        }
    };
};

export const generateBreadcrumbSchema = (items) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    };
};

export const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://nextgency.vn/#business',
    name: 'SRX Việt Nam Digital Marketing Agency',
    image: 'https://nextgency.vn/assets/images/logo.png',
    url: 'https://nextgency.vn',
    telephone: '+84123456789',
    priceRange: '$$',
    address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Nguyễn Văn Cừ',
        addressLocality: 'Quận 1',
        addressRegion: 'Hồ Chí Minh',
        postalCode: '70000',
        addressCountry: 'VN'
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: 10.762622,
        longitude: 106.660172
    },
    openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00'
    },
    sameAs: [
        'https://www.facebook.com/nextgency',
        'https://www.linkedin.com/company/nextgency',
        'https://www.instagram.com/nextgency'
    ]
};