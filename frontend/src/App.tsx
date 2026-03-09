import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { AuthProvider } from '@/contexts/AuthContext'
import SplashPage from '@/pages/SplashPage'
import HowItWorksPage from '@/pages/HowItWorksPage'
import DeckBuilderPage from '@/pages/DeckBuilderPage'
import AuthPage from '@/pages/AuthPage'
import BrowsePage from '@/pages/BrowsePage'
import StudyPage from '@/pages/StudyPage'
import StorybookPage from '@/pages/StorybookPage'
import ScrollToTop from '@/components/ScrollToTop'

export default function App() {
  const { isDark, toggle } = useTheme()

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<SplashPage isDark={isDark} onToggleTheme={toggle} />} />
          <Route path="/how-it-works" element={<HowItWorksPage isDark={isDark} onToggleTheme={toggle} />} />
          <Route path="/decks/new" element={<DeckBuilderPage isDark={isDark} onToggleTheme={toggle} />} />
          <Route path="/browse" element={<BrowsePage isDark={isDark} onToggleTheme={toggle} />} />
          <Route path="/login" element={<AuthPage isDark={isDark} onToggleTheme={toggle} />} />
          <Route path="/study/:deckId" element={<StudyPage isDark={isDark} onToggleTheme={toggle} />} />
          <Route path="/storybook" element={<StorybookPage isDark={isDark} onToggleTheme={toggle} />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
