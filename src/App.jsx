import { Outlet, Route, Routes } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import SplashIntro from './components/layout/SplashIntro'
import WhatsAppFab from './components/layout/WhatsAppFab'
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
import EnquiryPage from './pages/EnquiryPage'
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
import AdminMedia from './pages/admin/Media'
import AdminContent from './pages/admin/Content'
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
      {/* Public pages only - it hides itself on the account and sign-in pages. */}
      <WhatsAppFab />
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
          {/* The customer's own enquiry, opened by the token in their acknowledgement email. */}
          <Route path="/enquiry/:token" element={<EnquiryPage />} />
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
          <Route path="media" element={<AdminMedia />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
