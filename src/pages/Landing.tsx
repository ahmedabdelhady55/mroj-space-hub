import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";

const Landing = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      localStorage.setItem("moroug_user", JSON.stringify({ name, phone, points: 0 }));
      navigate("/home");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="مروج" className="w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-80" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <AnimatePresence mode="wait">
          {!showAuth ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-primary/20 backdrop-blur-sm border-2 border-primary flex items-center justify-center">
                <span className="text-4xl font-bold text-primary font-cairo">mroj</span>
              </div>
              <motion.h1
                className="text-5xl md:text-7xl font-bold text-primary-foreground mb-4 font-cairo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {t("app.name")}
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-primary-foreground/80 mb-10 font-cairo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t("app.subtitle")}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  variant="hero"
                  size="xl"
                  onClick={() => setShowAuth(true)}
                  className="animate-pulse-gold"
                >
                  {t("app.start")}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              <div className="bg-card/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                    <span className="text-xl font-bold text-primary font-cairo">mroj</span>
                  </div>
                  <h2 className="text-2xl font-bold text-card-foreground font-cairo">
                    {t("auth.welcome")}
                  </h2>
                  <p className="text-muted-foreground mt-2 font-cairo">
                    {t("auth.login_prompt")}
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2 font-cairo">
                      {t("auth.name")}
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("auth.name_placeholder")}
                      className={`font-cairo ${lang === "ar" ? "text-right" : "text-left"}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2 font-cairo">
                      {t("auth.phone")}
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("auth.phone_placeholder")}
                      type="tel"
                      className={`font-cairo ${lang === "ar" ? "text-right" : "text-left"}`}
                      dir="ltr"
                      required
                    />
                  </div>
                  <Button variant="hero" size="xl" className="w-full" type="submit">
                    {t("auth.login")}
                  </Button>
                </form>

                <button
                  onClick={() => setShowAuth(false)}
                  className="mt-4 text-muted-foreground text-sm hover:text-foreground transition-colors w-full text-center font-cairo"
                >
                  {t("auth.back")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Landing;
