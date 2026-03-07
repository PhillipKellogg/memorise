import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import SplashPage from '@/pages/SplashPage'
import HowItWorksPage from '@/pages/HowItWorksPage'

export default function App() {
  const { isDark, toggle } = useTheme()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashPage isDark={isDark} onToggleTheme={toggle} />} />
        <Route path="/how-it-works" element={<HowItWorksPage isDark={isDark} onToggleTheme={toggle} />} />
      </Routes>
    </BrowserRouter>
  )
}
