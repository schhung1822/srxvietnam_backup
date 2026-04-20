// src/hooks/useSEO.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSEO = () => {
    const location = useLocation();

    useEffect(() => {
        // Scroll to top on route change
        window.scrollTo(0, 0);

        // Update HTML lang attribute
        document.documentElement.lang = 'vi';
    }, [location]);

    // Performance monitoring
    useEffect(() => {
        // Log Core Web Vitals
        const logWebVitals = async () => {
            if ('web-vital' in window) return;

            try {
                const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

                getCLS(console.log);
                getFID(console.log);
                getFCP(console.log);
                getLCP(console.log);
                getTTFB(console.log);
                // eslint-disable-next-line no-unused-vars
            } catch (error) {
                console.log('Web Vitals not available');
            }
        };

        logWebVitals();
    }, []);
};
