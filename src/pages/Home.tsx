import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, DoorOpen, ClipboardList, User, Star, Coffee, LogOut as LeaveIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getActiveBooking } from "@/lib/bookingStore";
import heroBg from "@/assets/hero-bg.jpg";

interface UserData {
  name: string;
  phone: string;
  points: number;
}

const Home = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const menuItems = [
    { title: t("menu.public_areas"), subtitle: t("menu.public_areas_sub"), icon: Users, path: "/public-areas", gradient: "gradient-emerald" },
    { title: t("menu.private_rooms"), subtitle: t("menu.private_rooms_sub"), icon: DoorOpen, path: "/private-rooms", gradient: "gradient-gold" },
    { title: t("menu.bookings"), subtitle: t("menu.bookings_sub"), icon: ClipboardList, path: "/bookings", gradient: "gradient-emerald" },
    { title: t("menu.profile"), subtitle: t("menu.profile_sub"), icon: User, path: "/profile", gradient: "gradient-gold" },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("moroug_user");
    if (!stored) { navigate("/"); return; }
    setUser(JSON.parse(stored));
  }, [navigate]);

  const activeBooking = getActiveBooking();

  if (!user) return null;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-90" />
        </div>
        <div className="relative z-10 px-6 pt-8 pb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-3xl font-bold text-primary-foreground font-cairo mb-2">
              {t("home.welcome")} {firstName} 👋
            </h1>
            <p className="text-primary-foreground/70 font-cairo">{t("home.subtitle")}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-6 bg-card/20 backdrop-blur-md rounded-xl p-4 flex items-center justify-between border border-primary-foreground/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                <Star className="w-5 h-5 text-emerald-dark" />
              </div>
              <div>
                <p className="text-primary-foreground/70 text-sm font-cairo">{t("home.points")}</p>
                <p className="text-primary-foreground font-bold text-lg font-cairo">{user.points} {t("home.points_unit")}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 -mt-4 pb-8">
        {/* Active Session Banner */}
        {activeBooking && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              <span className="font-bold text-card-foreground font-cairo">جلسة نشطة</span>
              <span className="text-xs text-muted-foreground font-cairo">({activeBooking.details})</span>
            </div>
            <div className="flex items-center justify-between mb-3 text-sm font-cairo">
              <span className="text-muted-foreground">الإجمالي الحالي</span>
              <span className="text-xl font-bold text-gradient-gold">{activeBooking.totalCost} ج.م</span>
            </div>
            <div className="flex gap-2">
              <Button variant="hero" className="flex-1" onClick={() => navigate("/menu")}>
                <Coffee className="w-4 h-4" /> اطلب مشروبات
              </Button>
              <Button variant="destructive" className="flex-1 font-cairo" onClick={() => navigate("/checkout")}>
                <LeaveIcon className="w-4 h-4" /> مغادرة ودفع
              </Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <motion.div key={item.path} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.1 }}>
              <Button variant="ghost" onClick={() => navigate(item.path)}
                className="w-full h-auto flex flex-col items-center p-6 bg-card rounded-2xl border border-border hover:border-accent hover:shadow-gold transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-xl ${item.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-card-foreground font-cairo text-sm">{item.title}</h3>
                <p className="text-muted-foreground text-xs font-cairo mt-1">{item.subtitle}</p>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-8">
          <h2 className="text-xl font-bold text-foreground font-cairo mb-4">{t("home.gallery")}</h2>
          <div className="overflow-x-auto flex gap-4 pb-4 scrollbar-hide">
            <img src={heroBg} alt={t("app.name")} className="w-72 h-44 object-cover rounded-xl flex-shrink-0" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
