import React from 'react';
import Hero from "../../components/datasetcrm/Hero.jsx";
import ServicesDivider from "../../components/datasetcrm/ServicesDivider.jsx";
import PainPointsSection from "../../components/datasetcrm/PainPointsSection.jsx";
import WhyChooseUs from "../../components/datasetcrm/WhyChooseUs.jsx";
import VideoSection from "../../components/datasetcrm/VideoSection.jsx";
import ClientsPartnersSection from "../../components/datasetcrm/ClientsPartnersSection.jsx";
import CommitmentSection from "../../components/datasetcrm/CommitmentSection.jsx";
import ConsultationSection from "../../components/ConsultationSection.jsx";
import WebsitePackages from "../../components/datasetcrm/WebsitePackages.jsx";
import ServicesSection from "../../components/ServicesSection.jsx";
import OffersSection from "../../components/datasetcrm/OffersSection.jsx";
import SEOManager from "../../components/SEO/SEOManager.jsx";
import { seoConfigs } from "../seo-configs.js";

const FacebookCrm = () => {
    const seoData = seoConfigs.services['facebook-crm'];
    return (
        <>
            <SEOManager
                title={seoData.title}
                description={seoData.description}
                keywords={seoData.keywords}
                ogUrl="/services/facebook-crm"
            />
            <div>
                <Hero/>
                <ServicesDivider/>
                <PainPointsSection/>
                <WhyChooseUs/>
                <VideoSection/>
                <WebsitePackages/>
                <OffersSection/>
                <ClientsPartnersSection/>
                <CommitmentSection/>
                <ConsultationSection/>
                <ServicesSection/>
            </div>
        </>
    );
};

export default FacebookCrm;