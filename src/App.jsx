import { Route, Routes } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/ScrollToTop'
import ScrollProgress from './components/ui/ScrollProgress'
import Home from './pages/Home'
import PlanPage from './pages/PlanPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <ScrollProgress />
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  )
}
