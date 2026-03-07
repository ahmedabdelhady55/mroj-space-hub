import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Gift, History, LogOut, Receipt, Clock, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getBookings, type Booking } from "@/lib/bookingStore";

const Profile = () => {
  const [user, setUser] = useState<{ name: string; phone: string; points: number } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const stored = localStorage.getItem("moroug_user");
    if (!stored) { navigate("/"); return; }
    setUser(JSON.parse(stored));
    setBookings(getBookings());
  }, [navigate]);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem("moroug_user");
    navigate("/");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-emerald px-6 pt-8 pb-12 text-center">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/home")} className="text-primary-foreground">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-primary-foreground font-cairo">{t("profile.title")}</h1>
        </div>
        <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl font-bold text-emerald-dark font-cairo">{user.name[0]}</span>
        </div>
        <h2 className="text-xl font-bold text-primary-foreground font-cairo">{user.name}</h2>
        <p className="text-primary-foreground/70 font-cairo" dir="ltr">{user.phone}</p>
      </div>

      <div className="px-6 -mt-6 space-y-4 pb-8">
        {/* Points Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 border border-border shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center">
              <Star className="w-6 h-6 text-emerald-dark" />
            </div>
            <div>
              <p className="text-muted-foreground font-cairo text-sm">{t("home.points")}</p>
              <p className="text-2xl font-bold text-card-foreground font-cairo">{user.points} {t("home.points_unit")}</p>
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-cairo text-muted-foreground">
              <Gift className="w-4 h-4 text-accent" />
              <span>كل 100 ج.م = 10 نقاط</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-cairo text-muted-foreground">
              <Star className="w-4 h-4 text-accent" />
              <span>استخدم نقاطك للحصول على خصم</span>
            </div>
          </div>
        </motion.div>

        {/* Booking History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-card-foreground font-cairo">{t("profile.history")}</h3>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-cairo">لا توجد حجوزات سابقة بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-muted rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {booking.type === "public" ? (
                        <Users className="w-4 h-4 text-accent" />
                      ) : (
                        <Clock className="w-4 h-4 text-accent" />
                      )}
                      <span className="font-bold text-card-foreground font-cairo text-sm">{booking.details}</span>
                    </div>
                    <span className={`text-xs font-cairo px-2 py-1 rounded-full ${
                      booking.status === "active"
                        ? "bg-accent/20 text-accent"
                        : "bg-emerald/20 text-emerald"
                    }`}>
                      {booking.status === "active" ? "جارية" : "مكتملة"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-cairo mb-2">{formatDate(booking.date)}</p>
                  
                  <div className="space-y-1 text-xs font-cairo">
                    {booking.areaCost > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>{booking.type === "public" ? "تكلفة المساحة" : "تكلفة الغرفة"}</span>
                        <span>{booking.areaCost} ج.م</span>
                      </div>
                    )}
                    {booking.ordersCost > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>طلبات ({booking.orders.length} صنف)</span>
                        <span>{booking.ordersCost} ج.م</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Receipt className="w-3 h-3 text-accent" />
                      <span className="font-bold text-card-foreground font-cairo text-sm">{booking.totalCost} ج.م</span>
                    </div>
                    {booking.pointsEarned > 0 && (
                      <span className="text-xs text-emerald font-cairo">+{booking.pointsEarned} نقطة</span>
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
