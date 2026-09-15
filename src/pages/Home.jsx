import Hero from '../components/sections/Hero'
import TrustBar from '../components/sections/TrustBar'
import Philosophy from '../components/sections/Philosophy'
import Packages from '../components/sections/Packages'
import Sustainability from '../components/sections/Sustainability'
import Gallery from '../components/sections/Gallery'
import Journal from '../components/sections/Journal'
import Reviews from '../components/sections/Reviews'
import Faq from '../components/sections/Faq'
import CtaBand from '../components/sections/CtaBand'

export default function Home() {
  return (
    <main className="page-enter">
      <Hero />
      <TrustBar />
      <Philosophy />
      <Packages />
      <Sustainability />
      <Gallery />
      <Journal />
      <Reviews />
      <Faq />
      <CtaBand />
    </main>
  )
}
