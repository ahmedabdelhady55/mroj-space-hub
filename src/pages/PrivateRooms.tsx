import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Zap, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createPrivateRoomBooking } from "@/lib/bookingStore";
import room1Img from "@/assets/room1.jpg";
import room2Img from "@/assets/room2.jpg";
import room3Img from "@/assets/room3.jpg";

type Tab = "instant" | "future";

interface Room {
  id: number;
  name: string;
  image?: string;
  pricePerHour: number;
  capacity: number;
  available: boolean;
  busyUntil?: string;
}

const defaultImages = [room1Img, room2Img, room3Img];

const getAdminRooms = (): Room[] => {
  const stored = localStorage.getItem("moroug_admin_rooms");
  if (stored) return JSON.parse(stored);
  return [
    { id: 1, name: "غرفة الياسمين", pricePerHour: 90, capacity: 4, available: true },
    { id: 2, name: "غرفة النخيل", pricePerHour: 90, capacity: 2, available: false, busyUntil: "3:00 م" },
    { id: 3, name: "قاعة المؤتمرات", pricePerHour: 150, capacity: 8, available: true },
  ];
};

const PrivateRooms = () => {
  const [activeTab, setActiveTab] = useState<Tab>("instant");
  const [selectedDate, setSelectedDate] = useState("");
  const [rooms] = useState<Room[]>(getAdminRooms);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInstantBook = (room: Room) => {
    createPrivateRoomBooking(room.name, room.pricePerHour);
    toast({ title: `تم حجز ${room.name} ✅`, description: "بدأ العداد الآن" });
    navigate("/session", { state: { room } });
  };

  const handleFutureBook = (room: Room) => {
    toast({ title: `تم حجز ${room.name} مسبقاً ✅`, description: `في ${selectedDate}` });
    navigate("/home");
  };

  const getRoomImage = (room: Room, index: number) => {
    if (room.image) return room.image;
    return defaultImages[index % defaultImages.length];
  };

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
        <div className="bg-card rounded-xl p-1.5 flex gap-2 border border-border">
          <button
            onClick={() => setActiveTab("instant")}
            className={`flex-1 py-3 rounded-lg font-cairo font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === "instant" ? "gradient-gold text-emerald-dark shadow-gold" : "text-muted-foreground"
            }`}
          >
            <Zap className="w-4 h-4" /> حجز فوري
          </button>
          <button
            onClick={() => setActiveTab("future")}
            className={`flex-1 py-3 rounded-lg font-cairo font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === "future" ? "gradient-gold text-emerald-dark shadow-gold" : "text-muted-foreground"
            }`}
          >
            <Calendar className="w-4 h-4" /> حجز مسبق
          </button>
        </div>

        {activeTab === "future" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <input
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-card text-card-foreground font-cairo"
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4 mt-6 pb-8">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-card rounded-2xl overflow-hidden border border-border shadow-sm ${
                !room.available && activeTab === "instant" ? "opacity-60" : ""
              }`}
            >
              <div className="relative">
                <img src={getRoomImage(room, index)} alt={room.name} className="w-full h-48 object-cover" />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold font-cairo ${
                      room.available
                        ? "bg-emerald text-primary-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }`}
                  >
                    {room.available ? "🟢 متاحة" : `🔴 مشغولة${room.busyUntil ? ` حتى ${room.busyUntil}` : ""}`}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-card-foreground font-cairo">{room.name}</h3>
                  <span className="text-accent font-bold font-cairo">{room.pricePerHour} ج/ساعة</span>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground text-sm font-cairo mb-4">
                  <span>👥 {room.capacity} أشخاص</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> حجز بالساعة
                  </span>
                </div>

                {activeTab === "instant" ? (
                  <Button
                    variant="hero"
                    className="w-full"
                    disabled={!room.available}
                    onClick={() => handleInstantBook(room)}
                  >
                    {room.available ? "احجز الآن ⚡" : "غير متاحة"}
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    className="w-full"
                    disabled={!selectedDate}
                    onClick={() => handleFutureBook(room)}
                  >
                    حجز مسبق 📅
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivateRooms;
