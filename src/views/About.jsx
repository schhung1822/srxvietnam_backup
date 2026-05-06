'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AboutBrandStorySection from '../components/aboutus/AboutBrandStorySection.jsx';
import AboutFeaturedProductsSection from '../components/aboutus/AboutFeaturedProductsSection.jsx';
import AboutHistorySection from '../components/aboutus/AboutHistorySection.jsx';
import AboutIntroSection from '../components/aboutus/AboutIntroSection.jsx';
import AboutTechnologyJourneySection from '../components/aboutus/AboutTechnologyJourneySection.jsx';
import AboutContactSection from '../components/aboutus/AboutContactSection.jsx';
import SRXLogo from '../components/home/SrxLogo.jsx';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;

      gsap.utils.toArray('[data-about-section]').forEach((section, index) => {
        gsap.from(section, {
          opacity: 0,
          y: isMobile ? 0 : 44,
          duration: isMobile ? 0.65 : 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: index === 0 ? 'top 92%' : 'top 82%',
            once: true,
          },
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef}>
      <div data-about-section>
        <AboutIntroSection />
      </div>
      <div data-about-section>
        <AboutBrandStorySection />
      </div>
      <div data-about-section>
        <AboutHistorySection />
      </div>
      <div data-about-section>
        <AboutFeaturedProductsSection />
      </div>
      <div data-about-section>
        <AboutTechnologyJourneySection />
      </div>
      <div data-about-section>
        <AboutContactSection />
      </div>
      <SRXLogo />
    </div>
  );
};

export default About;
