import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import ServicesSection from '../components/ServicesSection'
import AboutSection from '../components/AboutSection'
import BrandsSection from '../components/BrandsSection'
import DistribucionSection from '../components/DistribucionSection'
import ContactSection from '../components/ContactSection'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <BrandsSection />
        <DistribucionSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
