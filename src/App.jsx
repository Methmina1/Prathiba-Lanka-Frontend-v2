import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import TrustBar from './components/sections/TrustBar'
import Philosophy from './components/sections/Philosophy'
import Packages from './components/sections/Packages'
import Sustainability from './components/sections/Sustainability'
import Gallery from './components/sections/Gallery'
import Journal from './components/sections/Journal'
import Reviews from './components/sections/Reviews'
import Plan from './components/sections/Plan'
import Faq from './components/sections/Faq'
import CtaBand from './components/sections/CtaBand'

export default function App() {
  const focusTracker = () => {
    document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => document.getElementById('pin-input')?.focus(), 600)
  }

  return (
    <>
      <Header onTrackClick={focusTracker} />
      <main>
        <Hero />
        <TrustBar />
        <Philosophy />
        <Packages />
        <Sustainability />
        <Gallery />
        <Journal />
        <Reviews />
        <Plan />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </>
  )
}
