import { Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const FloatingToolbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();

  return (
    <div className="fixed top-4 left-4 z-50 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="bg-card/80 backdrop-blur-md border-border shadow-lg hover:shadow-xl transition-all"
        title={theme === "light" ? "الوضع الليلي" : "الوضع النهاري"}
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleLang}
        className="bg-card/80 backdrop-blur-md border-border shadow-lg hover:shadow-xl transition-all font-bold text-xs"
        title={lang === "ar" ? "English" : "العربية"}
      >
        {lang === "ar" ? "EN" : "ع"}
      </Button>
    </div>
  );
};

export default FloatingToolbar;
