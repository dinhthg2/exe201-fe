import React from 'react';
import PromoBanner from '../components/home/PromoBanner';
import SubjectsGrid from '../components/home/SubjectsGrid';
import StatsStrip from '../components/home/StatsStrip';
import FeaturedCourses from '../components/home/FeaturedCourses';
import PromoShowcase from '../components/home/PromoShowcase';
import FinalCTA from '../components/home/FinalCTA';
import Roadmap from '../components/home/Roadmap';
import CourseCategories from '../components/home/CourseCategories'; // Import CourseCategories
import FeaturedInstructors from '../components/home/FeaturedInstructors'; // Import FeaturedInstructors
import Testimonials from '../components/home/Testimonials'; // Import Testimonials
import Hero from '../components/home/Hero'; // Import Hero component

export default function HomePage(){
  return (
    <div className="space-y-24 pb-20">
    <Hero />
  <CourseCategories /> {/* Add CourseCategories here */}
  {/* <PromoBanner /> */}
  <div className="animate-fadeInUp" style={{animationDelay:'.05s'}}><SubjectsGrid /></div>
  <div className="animate-fadeInUp" style={{animationDelay:'.1s'}}><StatsStrip /></div>
  <div className="animate-fadeInUp" style={{animationDelay:'.15s'}}><FeaturedCourses /></div>
  <div className="animate-fadeInUp" style={{animationDelay:'.25s'}}><FeaturedInstructors /></div>
  <div className="animate-fadeInUp" style={{animationDelay:'.3s'}}><Testimonials /></div>
  <div className="animate-fadeInUp" style={{animationDelay:'.2s'}}><PromoShowcase /></div>
  <div className="animate-fadeInUp" style={{animationDelay:'.35s'}}><FinalCTA /></div>
    </div>
  );
}

// Page-level file now delegates to modular home components.
