import Navbar from './components/Navbar'
import VideoBackground from './components/VideoBackground'
import HeroSection from './components/HeroSection'
import ServicesSection from './components/ServicesSection'
import CaseStudiesSection from './components/CaseStudiesSection'
import TestimonialsSection from './components/TestimonialsSection'

function App() {
  return (
    <>
      <div className="relative min-h-screen overflow-hidden">
        <VideoBackground />
        <Navbar />
        <HeroSection />
      </div>
      <ServicesSection />
      <CaseStudiesSection />
      <TestimonialsSection />
    </>
  )
}

export default App
