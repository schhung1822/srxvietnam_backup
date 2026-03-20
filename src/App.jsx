// App.jsx - Updated with conditional Header/Footer
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Footer from "./components/Footer.jsx";
import WebsiteLandingPage from "./pages/services/WebsiteLandingPage.jsx";
import AiData from "./pages/services/AiData.jsx";
import GoogleAds from "./pages/services/GoogleAds.jsx";
import PageTransition from './components/PageTransition';
import { usePageTransition } from './hooks/usePageTransition';
import FacebookAds from "./pages/services/FacebookAds.jsx";
import TiktokAds from "./pages/services/TiktokAds.jsx";
import FacebookCrm from "./pages/services/FacebookCrm.jsx";
import MarketingOutsource from "./pages/services/MarketingOutsource.jsx";
import About from "./pages/About.jsx";
import Tick from "./pages/services/Tick.jsx";
import { useSEO } from './hooks/useSEO';
import NewsListPage from "./pages/news/NewsListPage.jsx";
import Contact from "./pages/Contact.jsx";
import Projects from "./pages/projects/Projects.jsx";
import Portfolio from "./pages/projects/Portfolio.jsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.jsx";
import TiktokVerification from "./pages/TiktokVerification.jsx";
import WorkflowAutomation from "./pages/projects/WorkflowAutomation.jsx";
import ProjectDetail from "./pages/projects/ProjectDetail.jsx";
import NewsDetailPage from "./pages/news/NewsDetailPage.jsx";

// Router Content Component
const RouterContent = () => {
    const location = useLocation();
    const {
        isTransitioning,
        handleTransitionComplete
    } = usePageTransition();

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
                    <Route path="/news" element={<NewsListPage />} />
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

                    {/* Các trang dự án */}
                    <Route path="/projects/all" element={<Projects />} />
                    <Route path="/projects/portfolio" element={<Portfolio />} />
                    <Route path="/projects/workflow" element={<WorkflowAutomation />} />
                    <Route path="/projects/:slug" element={<ProjectDetail />} />
                    {/*trang chi tiết về tin tức công nghệ*/}
                    <Route path="/news/:slug" element={<NewsDetailPage />} />
                </Routes>
            </main>

            {/* Chỉ hiển thị Footer nếu không phải trang verification */}
            {!isVerificationPage && <Footer />}

            {/* Page Transition */}
            <PageTransition
                isTransitioning={isTransitioning}
                onTransitionComplete={handleTransitionComplete}
                logoSrc="/assets/images/header/navbarfavicon.png"
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