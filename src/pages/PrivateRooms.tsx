import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Zap, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import room1Img from "@/assets/room1.jpg";
import room2Img from "@/assets/room2.jpg";
import room3Img from "@/assets/room3.jpg";

type Tab = "instant" | "future";

const defaultImages = [room1Img, room2Img, room3Img];

const PrivateRooms = () => {
  const { user, codeVerified } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(codeVerified ? "instant" : "future");
  const [selectedDate, setSelectedDate] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("rooms").select("*").order("created_at").then(({ data }) => {
      setRooms(data || []);
      setLoading(false);
    });
  }, []);

  const handleInstantBook = async (room: any) => {
    if (!user) return;
    const { data, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      type: "private",
      details: `${room.name} - غرفة خاصة`,
      area_cost: 0,
      total_cost: 0,
      room_name: room.name,
      status: "active",
    }).select().single();

    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `تم حجز ${room.name} ✅`, description: "بدأ العداد الآن" });
    navigate("/session", { state: { room, bookingId: data.id } });
  };

  const handleFutureBook = (room: any) => {
    toast({ title: `تم حجز ${room.name} مسبقاً ✅`, description: `في ${selectedDate}` });
    navigate("/home");
  };

  const getRoomImage = (room: any, index: number) => {
    if (room.image_url) return room.image_url;
    return defaultImages[index % defaultImages.length];
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-emerald px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate("/home")} className="text-primary-foreground">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-primary-foreground font-cairo">الغرف الخاصة</h1>
        </div>
      </div>

      <div className="px-6 -mt-3">
        {codeVerified ? (
          <div className="bg-card rounded-xl p-1.5 flex gap-2 border border-border">
            <button onClick={() => setActiveTab("instant")}
              className={`flex-1 py-3 rounded-lg font-cairo font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === "instant" ? "gradient-gold text-emerald-dark shadow-gold" : "text-muted-foreground"
              }`}>
              <Zap className="w-4 h-4" /> حجز فوري
            </button>
            <button onClick={() => setActiveTab("future")}
              className={`flex-1 py-3 rounded-lg font-cairo font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === "future" ? "gradient-gold text-emerald-dark shadow-gold" : "text-muted-foreground"
              }`}>
              <Calendar className="w-4 h-4" /> حجز مسبق
            </button>
          </div>
        ) : (
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-center">
            <p className="text-sm font-cairo text-muted-foreground">📅 وضع الحجز المسبق فقط</p>
          </div>
        )}

        {activeTab === "future" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <input type="datetime-local" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-card text-card-foreground font-cairo" />
          </motion.div>
        )}

        {rooms.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-cairo">لا توجد غرف متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-6 pb-8">
            {rooms.map((room, index) => (
              <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-card rounded-2xl overflow-hidden border border-border shadow-sm ${
                  !room.available && activeTab === "instant" ? "opacity-60" : ""
                }`}>
                <div className="relative">
                  <img src={getRoomImage(room, index)} alt={room.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-cairo ${
                      room.available ? "bg-emerald text-primary-foreground" : "bg-destructive text-destructive-foreground"
                    }`}>
                      {room.available ? "🟢 متاحة" : "🔴 مشغولة"}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-card-foreground font-cairo">{room.name}</h3>
                    <span className="text-accent font-bold font-cairo">{room.price_per_hour} ج/ساعة</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm font-cairo mb-4">
                    <span>👥 {room.capacity} أشخاص</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> حجز بالساعة</span>
                  </div>
                  {activeTab === "instant" ? (
                    <Button variant="hero" className="w-full" disabled={!room.available} onClick={() => handleInstantBook(room)}>
                      {room.available ? "احجز الآن ⚡" : "غير متاحة"}
                    </Button>
                  ) : (
                    <Button variant="hero" className="w-full" disabled={!selectedDate} onClick={() => handleFutureBook(room)}>
                      حجز مسبق 📅
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateRooms;
