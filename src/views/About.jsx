import React from 'react';
import SEOManager from "../components/SEO/SEOManager.jsx";
import {seoConfigs} from "./seo-configs.js";
import AboutBrandStorySection from "../components/aboutus/AboutBrandStorySection.jsx";
import AboutFeaturedProductsSection from "../components/aboutus/AboutFeaturedProductsSection.jsx";
import AboutHistorySection from "../components/aboutus/AboutHistorySection.jsx";
import AboutIntroSection from "../components/aboutus/AboutIntroSection.jsx";
import AboutTechnologyJourneySection from "../components/aboutus/AboutTechnologyJourneySection.jsx";
import SRXLogo from "../components/home/SrxLogo.jsx";

const About = () => {
    return (
        <div>
            <SEOManager
                title={seoConfigs.about.title}
                description={seoConfigs.about.description}
                keywords={seoConfigs.about.keywords}
                ogUrl="/about"
            />
            <AboutIntroSection />
            <AboutBrandStorySection />
            <AboutHistorySection />
            <AboutFeaturedProductsSection />
            <AboutTechnologyJourneySection />
            <SRXLogo/>
        </div> 
    );
};

export default About;
