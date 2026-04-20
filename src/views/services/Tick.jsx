import React from 'react';
import HeroSection from "../../components/tick/HeroSection.jsx";
import WhyChooseUs from "../../components/tick/WhyChooseUs.jsx";
import ConsultationSection from "../../components/ConsultationSection.jsx";
import ServicesSection from "../../components/ServicesSection.jsx";
import WebsitePackages from "../../components/tick/WebsitePackages.jsx";
import ProfileSection from "../../components/tick/ProfileSection.jsx";
import ProcessSection from "../../components/tick/ProcessSection.jsx";
import SEOManager from "../../components/SEO/SEOManager.jsx";
import { seoConfigs } from "../seo-configs.js";

const Tick = () => {
    const seoData = seoConfigs.services['tick-xanh-facebook'];
    return (
        <>
            <SEOManager
                title={seoData.title}
                description={seoData.description}
                keywords={seoData.keywords}
                ogUrl="/services/tick-xanh-facebook"
            />
            <div>
                <HeroSection/>
                <WhyChooseUs/>
                <WebsitePackages/>
                <ProfileSection/>
                <ProcessSection/>
                <ConsultationSection/>
                <ServicesSection/>
            </div>
        </>
    );
};

export default Tick;