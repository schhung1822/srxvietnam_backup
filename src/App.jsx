// App.jsx - Updated with conditional Header/Footer
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './views/Home';
import Footer from "./components/Footer.jsx";
import WebsiteLandingPage from "./views/services/WebsiteLandingPage.jsx";
import AiData from "./views/services/AiData.jsx";
import GoogleAds from "./views/services/GoogleAds.jsx";
import PageTransition from './components/PageTransition';
import { usePageTransition } from './hooks/usePageTransition';
import FacebookAds from "./views/services/FacebookAds.jsx";
import TiktokAds from "./views/services/TiktokAds.jsx";
import FacebookCrm from "./views/services/FacebookCrm.jsx";
import MarketingOutsource from "./views/services/MarketingOutsource.jsx";
import About from "./views/About.jsx";
import Tick from "./views/services/Tick.jsx";
import { useSEO } from './hooks/useSEO';
import Contact from "./views/Contact.jsx";
import PrivacyPolicyPage from "./views/PrivacyPolicyPage.jsx";
import TiktokVerification from "./views/TiktokVerification.jsx";

// Router Content Component
const RouterContent = () => {
    const location = useLocation();
    const { transitionPhase } = usePageTransition();

    // Initialize SEO hooks
    useSEO();

    // Kiểm tra xem có phải trang TiktokVerification không
    const isVerificationPage = location.pathname === '/tiktok-verification/';

    return (
        <div className="App min-h-screen flex flex-col">
            {/* Global SEO for all pages - this sets default values */}
            {/*<SEOManager*/}
            {/*    structuredData={localBusinessSchema}*/}
            {/*    additionalMetaTags={[*/}
            {/*        { name: 'theme-color', content: '#000000' },*/}
            {/*        { name: 'apple-mobile-web-app-capable', content: 'yes' },*/}
            {/*        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },*/}
            {/*        { name: 'format-detection', content: 'telephone=no' }*/}
            {/*    ]}*/}
            {/*/>*/}

            {/* Chỉ hiển thị Header nếu không phải trang verification */}
            {!isVerificationPage && <Header />}

            <main className={!isVerificationPage ? "page-content flex-1 pt-[70px] lg:pt-[85px]" : "flex-1"}>
                <Routes>
                    {/* Trang chủ */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />

                    {/* Các trang dịch vụ */}
                    <Route path="/services/website-landing-page" element={<WebsiteLandingPage />} />
                    <Route path="/services/ai-data" element={<AiData />} />
                    <Route path="/services/google-ads" element={<GoogleAds />} />
                    <Route path="/services/facebook-ads" element={<FacebookAds />} />
                    <Route path="/services/tiktok-ads" element={<TiktokAds />} />
                    <Route path="/services/facebook-crm" element={<FacebookCrm />} />
                    <Route path="/services/marketing-outsource" element={<MarketingOutsource />} />
                    <Route path="/services/tick-xanh-facebook" element={<Tick />} />
                    <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicyPage />} />
                    <Route path="/tiktok-verification/" element={<TiktokVerification />} />
                </Routes>
            </main>

            {/* Chỉ hiển thị Footer nếu không phải trang verification */}
            {!isVerificationPage && <Footer />}

            {/* Page Transition */}
            <PageTransition
                logoSrc="/assets/images/header/logo_primary.webp"
                transitionPhase={transitionPhase}
            />
        </div>
    );
};

function App() {
    return (
        <Router>
            <RouterContent />
        </Router>
    );
}

export default App;
