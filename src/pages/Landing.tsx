import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

type AuthMode = "welcome" | "login" | "signup";

const Landing = () => {
  const [mode, setMode] = useState<AuthMode>("welcome");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { signUp, signIn, user, setCodeVerified } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user]);

  const verifyCode = async (enteredCode: string) => {
    if (!enteredCode.trim()) {
      setCodeVerified(false);
      return;
    }
    const { data } = await supabase.from("loyalty_settings").select("daily_code").limit(1).single();
    if (data && enteredCode.trim() === data.daily_code && data.daily_code !== "") {
      setCodeVerified(true);
      toast({ title: "تم التحقق ✅", description: "مرحباً بك! يمكنك استخدام جميع الخدمات" });
    } else {
      setCodeVerified(false);
      toast({ title: "كود غير صحيح", description: "يمكنك الحجز المسبق فقط", variant: "destructive" });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await signUp(name, phone, password);
    if (error) {
      setLoading(false);
      toast({ title: "خطأ في التسجيل", description: error, variant: "destructive" });
      return;
    }
    await verifyCode(code);
    setLoading(false);
    toast({ title: "تم إنشاء الحساب بنجاح ✅" });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await signIn(phone, password);
    if (error) {
      setLoading(false);
      toast({ title: "خطأ في تسجيل الدخول", description: "رقم الهاتف أو كلمة المرور غير صحيحة", variant: "destructive" });
      return;
    }
    await verifyCode(code);
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="مروج" className="w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-80" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <AnimatePresence mode="wait">
          {mode === "welcome" ? (
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
                className="space-y-3"
              >
                <Button variant="hero" size="xl" onClick={() => setMode("login")} className="w-64">
                  تسجيل الدخول
                </Button>
                <div>
                  <button
                    onClick={() => setMode("signup")}
                    className="text-primary-foreground/80 hover:text-primary-foreground font-cairo text-sm underline"
                  >
                    ليس لديك حساب؟ أنشئ حساب جديد
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key={mode}
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
                    {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
                  </h2>
                  <p className="text-muted-foreground mt-2 font-cairo">
                    {mode === "login" ? "أدخل رقم الهاتف وكلمة المرور" : "أدخل بياناتك لإنشاء حساب"}
                  </p>
                </div>

                <form onSubmit={mode === "login" ? handleLogin : handleSignUp} className="space-y-5">
                  {mode === "signup" && (
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
                  )}
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
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2 font-cairo">
                      كلمة المرور
                    </label>
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      type="password"
                      className="font-cairo"
                      required
                      minLength={6}
                    />
                  </div>

                  {/* Daily Code Field */}
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2 font-cairo">
                      كود الدخول اليومي
                      <span className="text-muted-foreground font-normal text-xs mr-2">(اختياري)</span>
                    </label>
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="اطلب الكود من المسؤول"
                      className="font-cairo text-center tracking-widest"
                      dir="ltr"
                    />
                    <p className="text-muted-foreground text-xs mt-1.5 font-cairo">
                      بدون الكود يمكنك الحجز المسبق فقط
                    </p>
                  </div>

                  <Button variant="hero" size="xl" className="w-full" type="submit" disabled={loading}>
                    {loading ? "جاري..." : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
                  </Button>
                </form>

                <div className="mt-4 text-center space-y-2">
                  <button
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="text-accent text-sm hover:underline font-cairo"
                  >
                    {mode === "login" ? "ليس لديك حساب؟ أنشئ حساب جديد" : "لديك حساب؟ سجل دخول"}
                  </button>
                  <br />
                  <button
                    onClick={() => setMode("welcome")}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors font-cairo"
                  >
                    {t("auth.back")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Landing;