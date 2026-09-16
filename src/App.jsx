import { Route, Routes } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import SplashIntro from './components/layout/SplashIntro'
import ScrollToTop from './components/ScrollToTop'
import ScrollProgress from './components/ui/ScrollProgress'
import { AuthProvider } from './auth/AuthContext'
import Home from './pages/Home'
import Journeys from './pages/Journeys'
import JourneyDetail from './pages/JourneyDetail'
import JournalPage from './pages/JournalPage'
import JournalDetail from './pages/JournalDetail'
import GalleryPage from './pages/GalleryPage'
import ReviewsPage from './pages/ReviewsPage'
import About from './pages/About'
import Contact from './pages/Contact'
import PlanPage from './pages/PlanPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <ScrollProgress />
      <ScrollToTop />
      <SplashIntro />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/journeys" element={<Journeys />} />
        <Route path="/journeys/:id" element={<JourneyDetail />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/journal/:id" element={<JournalDetail />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </AuthProvider>
  )
}
