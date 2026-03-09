import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Users, Calculator, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PRICE_PER_PERSON = 35;

const PublicAreas = () => {
  const [count, setCount] = useState(1);
  const [booked, setBooked] = useState(false);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, codeVerified } = useAuth();
  const total = count * PRICE_PER_PERSON;

  useEffect(() => {
    if (!codeVerified) {
      navigate("/home");
      return;
    }
  }, [codeVerified, navigate]);

  useEffect(() => {
    if (!user) return;
    // Check for active public booking today
    const today = new Date().toISOString().split("T")[0];
    supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "public")
      .eq("status", "active")
      .gte("created_at", today)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setActiveBooking(data[0]);
        setLoading(false);
      });
  }, [user]);

  const handleBook = async () => {
    if (activeBooking) {
      navigate("/menu");
      return;
    }
    if (!user) return;
    const areaCost = count * PRICE_PER_PERSON;
    const { data, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      type: "public",
      details: `${count} فرد - مساحة عامة`,
      area_cost: areaCost,
      total_cost: areaCost,
      person_count: count,
      status: "active",
    }).select().single();

    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }
    setActiveBooking(data);
    setBooked(true);
    toast({ title: `${t("public.success")} ✅` });
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-emerald px-6 pt-8 pb-10">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate("/home")} className="text-primary-foreground">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-primary-foreground font-cairo">{t("menu.public_areas")}</h1>
        </div>
        <div className="flex items-center gap-3 bg-primary-foreground/10 rounded-xl p-4 backdrop-blur">
          <Users className="w-8 h-8 text-primary-foreground" />
          <div>
            <p className="text-primary-foreground font-cairo font-bold">{t("public.pricing")}</p>
            <p className="text-primary-foreground/80 font-cairo text-2xl font-bold">{PRICE_PER_PERSON} {t("public.currency")}</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {activeBooking ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 border border-border shadow-lg text-center">
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-card-foreground font-cairo mb-2">لديك حجز نشط اليوم</h2>
            <p className="text-muted-foreground font-cairo mb-2">الإجمالي الحالي: {activeBooking.total_cost} ج.م</p>
            <div className="space-y-3 mt-4">
              <Button variant="hero" size="lg" className="w-full" onClick={() => navigate("/menu")}>
                {t("public.order_now")} ☕
              </Button>
              <Button variant="destructive" size="lg" className="w-full font-cairo" onClick={() => navigate("/checkout")}>
                مغادرة ودفع 💳
              </Button>
              <Button variant="outline" size="lg" className="w-full font-cairo" onClick={() => navigate("/home")}>
                {t("nav.back")}
              </Button>
            </div>
          </motion.div>
        ) : !booked ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-bold text-card-foreground font-cairo">{t("public.people_count")}</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2 font-cairo">{t("public.people_count")}</label>
                <Input type="number" min={1} max={50} value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center text-xl font-bold font-cairo" />
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-muted-foreground font-cairo text-sm">{t("public.total")}</p>
                <p className="text-3xl font-bold text-gradient-gold font-cairo mt-1">{total} {t("public.currency")}</p>
              </div>
              <Button variant="hero" size="xl" className="w-full" onClick={handleBook}>
                {t("public.confirm")}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 border border-border shadow-lg text-center">
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-card-foreground font-cairo mb-2">{t("public.success")}</h2>
            <p className="text-muted-foreground font-cairo mb-6">
              {count} {count > 1 ? "أفراد" : "فرد"} - {total} {t("public.currency")}
            </p>
            <div className="space-y-3">
              <Button variant="hero" size="lg" className="w-full" onClick={() => navigate("/menu")}>
                {t("public.order_now")} ☕
              </Button>
              <Button variant="outline" size="lg" className="w-full font-cairo" onClick={() => navigate("/home")}>
                {t("nav.back")}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PublicAreas;
