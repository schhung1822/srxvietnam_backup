'use client';

import HeroSection from "../components/home/FramerHeroSection.jsx";
import {seoConfigs} from "./seo-configs.js";
import SEOManager from "../components/SEO/SEOManager.jsx";
import {generateBreadcrumbSchema} from "../components/SEO/schemas.js";
import HomeImageSlider from "../components/home/HomeImageSlider.jsx";
import HomeProductTechnologySection from "../components/home/HomeProductTechnologySection.jsx";
import HealingProcessSection from "../components/home/HealingProcessSection.jsx";
import HomeFeaturedProductsSection from "../components/home/HomeFeaturedProductsSection.jsx";
import ClinicalProofSection from "../components/home/ClinicalProofSection.jsx";
import DoctorQuoteSection from "../components/home/DoctorQuoteSection.jsx";
import HomeScientificTopicsSection from "../components/home/HomeScientificTopicsSection.jsx";
import HomeFaqSection from "../components/home/HomeFaqSection.jsx";
import SRXLogo from "../components/home/SrxLogo.jsx";

const Home = ({ featuredProducts = [] }) => {
    const breadcrumbs = [
        { name: 'Trang chủ', url: 'https://srxvietnam.vn' }
    ];
    return (
        <>
            <SEOManager
            title={seoConfigs.home.title}
            description={seoConfigs.home.description}
            keywords={seoConfigs.home.keywords}
            url="https://srxvietnam.vn"
            image="https://srxvietnam.vn/assets/images/home-og-image.jpg"
            structuredData={generateBreadcrumbSchema(breadcrumbs)}
            />
            <div className="home-page">
                <HeroSection />
                <HomeImageSlider />
                <HealingProcessSection />
                <HomeFeaturedProductsSection products={featuredProducts} />
                <HomeProductTechnologySection />
                <ClinicalProofSection />
                <DoctorQuoteSection />
                <HomeScientificTopicsSection />
                <HomeFaqSection />
                <SRXLogo/>
            </div>
        </>

    );
};

export default Home;

