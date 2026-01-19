import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSettings } from '@/lib/storage';
import ncgrLogo from '@/assets/ncgr-logo.png';

interface HeaderProps {
  showHomeButton?: boolean;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const Header = ({ showHomeButton = false, title, subtitle, children }: HeaderProps) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [settings, setSettings] = useState({ headerTitle: 'التقرير الأسبوعي', headerSubtitle: 'نظام إدارة التقارير الأسبوعية للفرق' });

  useEffect(() => {
    // Load dark mode preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);

    // Load settings
    setSettings(getSettings());
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  const displayTitle = title || settings.headerTitle;
  const displaySubtitle = subtitle || settings.headerSubtitle;

  return (
    <header className="gradient-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex-shrink-0">
              <img 
                src={ncgrLogo} 
                alt="NCGR Logo" 
                className="h-12 md:h-16 w-auto bg-white/90 rounded-lg p-1"
              />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{displayTitle}</h1>
              {displaySubtitle && (
                <p className="text-sm opacity-80">{displaySubtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={toggleDarkMode}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            {children}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
