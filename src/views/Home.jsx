'use client';

import HeroSection from '../components/home/FramerHeroSection.jsx';
import HomeImageSlider from '../components/home/HomeImageSlider.jsx';
import HomeStandardsSection from '../components/home/HomeStandardsSection.jsx';
import HomeProductTechnologySection from '../components/home/HomeProductTechnologySection.jsx';
import HealingProcessSection from '../components/home/HealingProcessSection.jsx';
import HomeFeaturedProductsSection from '../components/home/HomeFeaturedProductsSection.jsx';
import ClinicalProofSection from '../components/home/ClinicalProofSection.jsx';
import HomeFeedbackGallerySection from '../components/home/HomeFeedbackGallerySection.jsx';
import DoctorQuoteSection from '../components/home/DoctorQuoteSection.jsx';
import HomeScientificTopicsSection from '../components/home/HomeScientificTopicsSection.jsx';
import HomeFaqSection from '../components/home/HomeFaqSection.jsx';
import SRXLogo from '../components/home/SrxLogo.jsx';

const Home = ({ featuredProducts = [] }) => {
  return (
    <div className="home-page">
      <HeroSection />
      <HomeImageSlider />
      <HomeStandardsSection />
      <HealingProcessSection />
      <HomeFeaturedProductsSection products={featuredProducts} />
      <HomeProductTechnologySection />
      <ClinicalProofSection />
      <HomeFeedbackGallerySection />
      <DoctorQuoteSection />
      <HomeScientificTopicsSection />
      <HomeFaqSection />
      <SRXLogo />
    </div>
  );
};

export default Home;
