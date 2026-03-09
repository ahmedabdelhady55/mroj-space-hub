import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Gift, History, LogOut, Receipt, Clock, Users, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { profile, signOut, loading, user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loyaltySettings, setLoyaltySettings] = useState<any>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) { navigate("/"); return; }
    if (user) {
      supabase.from("bookings").select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setBookings(data || []));

      supabase.from("loyalty_settings").select("*").limit(1).single()
        .then(({ data }) => { if (data) setLoyaltySettings(data); });
    }
  }, [user, loading, navigate]);

  if (!profile) return null;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const pointsPerAmount = loyaltySettings?.points_per_amount || 10;
  const amountForPoints = loyaltySettings?.amount_for_points || 100;
  const minRedeem = loyaltySettings?.min_redeem_points || 50;
  const pointValue = loyaltySettings?.point_value || 1;
  const canRedeem = profile.points >= minRedeem;

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-emerald px-4 sm:px-6 pt-6 sm:pt-8 pb-10 sm:pb-12 text-center">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/home")} className="text-primary-foreground">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-primary-foreground font-cairo">{t("profile.title")}</h1>
        </div>
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-gold flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl sm:text-3xl font-bold text-emerald-dark font-cairo">{profile.name[0]}</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-foreground font-cairo">{profile.name}</h2>
        <p className="text-primary-foreground/70 font-cairo text-sm" dir="ltr">{profile.phone}</p>
      </div>

      <div className="px-4 sm:px-6 -mt-6 space-y-4 pb-8">
        {/* Points Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-lg">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-gold flex items-center justify-center">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-dark" />
            </div>
            <div>
              <p className="text-muted-foreground font-cairo text-xs sm:text-sm">{t("home.points")}</p>
              <p className="text-xl sm:text-2xl font-bold text-card-foreground font-cairo">{profile.points} {t("home.points_unit")}</p>
            </div>
          </div>

          {canRedeem && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-3">
              <p className="text-xs sm:text-sm font-cairo text-accent font-bold flex items-center gap-1">
                <Gift className="w-4 h-4" />
                يمكنك استخدام نقاطك للحصول على خصم {Math.min(profile.points * pointValue)} ج.م من فاتورتك القادمة!
              </p>
            </div>
          )}

          <div className="bg-muted rounded-xl p-3 sm:p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-cairo text-muted-foreground">
              <Gift className="w-4 h-4 text-accent flex-shrink-0" />
              <span>كل {amountForPoints} ج.م = {pointsPerAmount} نقطة</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-cairo text-muted-foreground">
              <Star className="w-4 h-4 text-accent flex-shrink-0" />
              <span>الحد الأدنى للاستبدال: {minRedeem} نقطة = {minRedeem * pointValue} ج.م خصم</span>
            </div>

            {/* Progress to min redeem */}
            {!canRedeem && (
              <div className="mt-2">
                <div className="flex justify-between text-xs font-cairo text-muted-foreground mb-1">
                  <span>{profile.points} / {minRedeem} نقطة</span>
                  <span>{Math.round((profile.points / minRedeem) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min((profile.points / minRedeem) * 100, 100)}%` }} />
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-cairo mt-1">
                  باقي {minRedeem - profile.points} نقطة لتتمكن من الاستبدال
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Booking History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 sm:p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-card-foreground font-cairo text-sm sm:text-base">{t("profile.history")}</h3>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-cairo text-sm">لا توجد حجوزات سابقة بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-muted rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {booking.type === "public" ? (
                        <Users className="w-4 h-4 text-accent" />
                      ) : (
                        <Clock className="w-4 h-4 text-accent" />
                      )}
                      <span className="font-bold text-card-foreground font-cairo text-xs sm:text-sm">{booking.details}</span>
                    </div>
                    <span className={`text-[10px] sm:text-xs font-cairo px-2 py-1 rounded-full ${
                      booking.status === "active"
                        ? "bg-accent/20 text-accent"
                        : "bg-emerald/20 text-emerald"
                    }`}>
                      {booking.status === "active" ? "جارية" : "مكتملة"}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-cairo mb-2">{formatDate(booking.created_at)}</p>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Receipt className="w-3 h-3 text-accent" />
                      <span className="font-bold text-card-foreground font-cairo text-xs sm:text-sm">{booking.total_cost} ج.م</span>
                    </div>
                    {booking.points_earned > 0 && (
                      <span className="text-[10px] sm:text-xs text-emerald font-cairo">+{booking.points_earned} نقطة</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <Button variant="outline" size="lg" className="w-full font-cairo" onClick={handleLogout}>
          <LogOut className="w-5 h-5" /> تسجيل الخروج
        </Button>
      </div>
    </div>
  );
};

export default Profile;
