import { Outlet, Route, Routes } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import SplashIntro from './components/layout/SplashIntro'
import ScrollToTop from './components/ScrollToTop'
import ScrollProgress from './components/ui/ScrollProgress'
import AdminLayout from './components/admin/AdminLayout'
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
import AdminOverview from './pages/admin/Overview'
import AdminBookings from './pages/admin/Bookings'
import AdminQueries from './pages/admin/Queries'
import AdminPackages from './pages/admin/Packages'
import AdminJournal from './pages/admin/Journal'
import AdminGallery from './pages/admin/Gallery'
import AdminReviews from './pages/admin/Reviews'

/** The public site: brand intro, marketing header and footer. */
function SiteLayout() {
  return (
    <>
      <ScrollProgress />
      <ScrollToTop />
      <SplashIntro />
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

export default function App({ initialSession = null }) {
  return (
    <AuthProvider initialSession={initialSession}>
      <Routes>
        <Route element={<SiteLayout />}>
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
        </Route>

        {/* Staff console: its own shell, its own theme, role-guarded in AdminLayout. */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="queries" element={<AdminQueries />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="journal" element={<AdminJournal />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
