import React from 'react';
import ServicesDivider from "../../components/aidata/ServicesDivider.jsx";
import WhyChooseUs from "../../components/aidata/WhyChooseUs.jsx";
import WebsitePackages from "../../components/aidata/WebsitePackages.jsx";
import ClientsPartnersSection from "../../components/aidata/ClientsPartnersSection.jsx";
import CommitmentSection from "../../components/aidata/CommitmentSection.jsx";
import ConsultationSection from "../../components/ConsultationSection.jsx";
import ServicesSection from "../../components/ServicesSection.jsx";
import Hero from "../../components/aidata/Hero.jsx";
import PainPointsSection from "../../components/aidata/PainPointsSection.jsx";
import OffersSection from "../../components/aidata/OffersSection.jsx";
import WorkflowMindmap from "../../components/aidata/WorkflowMindmap.jsx";
import SEOManager from "../../components/SEO/SEOManager.jsx";
import { seoConfigs } from "../seo-configs.js";

const AiData = () => {
    const seoData = seoConfigs.services['ai-data'];
    return (
        <>
            <SEOManager
                title={seoData.title}
                description={seoData.description}
                keywords={seoData.keywords}
                ogUrl="/services/ai-data"
            />
            <div>
                <Hero/>
                <ServicesDivider/>
                <PainPointsSection/>
                <WebsitePackages/>
                <OffersSection/>
                <WorkflowMindmap/>
                <ClientsPartnersSection/>
                <CommitmentSection/>
                <ConsultationSection/>
                <ServicesSection/>
            </div>
        </>
    );
};

export default AiData;