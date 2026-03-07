import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Save, X, DoorOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Room {
  id: number;
  name: string;
  pricePerHour: number;
  capacity: number;
  available: boolean;
  image?: string;
}

const ROOMS_KEY = "moroug_admin_rooms";

const getStoredRooms = (): Room[] => {
  const stored = localStorage.getItem(ROOMS_KEY);
  if (stored) return JSON.parse(stored);
  // Default rooms
  const defaults: Room[] = [
    { id: 1, name: "غرفة الياسمين", pricePerHour: 90, capacity: 4, available: true },
    { id: 2, name: "غرفة النخيل", pricePerHour: 90, capacity: 2, available: false },
    { id: 3, name: "قاعة المؤتمرات", pricePerHour: 150, capacity: 8, available: true },
  ];
  localStorage.setItem(ROOMS_KEY, JSON.stringify(defaults));
  return defaults;
};

const AdminRooms = () => {
  const [rooms, setRooms] = useState<Room[]>(getStoredRooms);
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", pricePerHour: 90, capacity: 4 });
  const { toast } = useToast();

  const saveRooms = (updated: Room[]) => {
    setRooms(updated);
    localStorage.setItem(ROOMS_KEY, JSON.stringify(updated));
  };

  const handleAdd = () => {
    const newRoom: Room = { id: Date.now(), ...form, available: true };
    saveRooms([...rooms, newRoom]);
    setAdding(false);
    setForm({ name: "", pricePerHour: 90, capacity: 4 });
    toast({ title: "تم إضافة الغرفة ✅" });
  };

  const handleDelete = (id: number) => {
    saveRooms(rooms.filter(r => r.id !== id));
    toast({ title: "تم حذف الغرفة" });
  };

  const toggleAvailability = (id: number) => {
    saveRooms(rooms.map(r => r.id === id ? { ...r, available: !r.available } : r));
  };

  const handleEditSave = (room: Room) => {
    saveRooms(rooms.map(r => r.id === room.id ? room : r));
    setEditing(null);
    toast({ title: "تم تحديث الغرفة ✅" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-cairo">إدارة الغرف</h2>
        <Button variant="hero" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4" /> إضافة غرفة
        </Button>
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border space-y-4">
          <h3 className="font-bold font-cairo text-card-foreground">غرفة جديدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="اسم الغرفة" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="font-cairo" />
            <Input type="number" placeholder="السعر/ساعة" value={form.pricePerHour} onChange={e => setForm({ ...form, pricePerHour: +e.target.value })} className="font-cairo" />
            <Input type="number" placeholder="السعة" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} className="font-cairo" />
          </div>
          <div className="flex gap-2">
            <Button variant="hero" onClick={handleAdd} disabled={!form.name}><Save className="w-4 h-4" /> حفظ</Button>
            <Button variant="outline" onClick={() => setAdding(false)} className="font-cairo"><X className="w-4 h-4" /> إلغاء</Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room, i) => (
          <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-5 border border-border">
            {editing === room.id ? (
              <EditRoomForm room={room} onSave={handleEditSave} onCancel={() => setEditing(null)} />
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <DoorOpen className="w-5 h-5 text-accent" />
                  <h3 className="font-bold text-card-foreground font-cairo">{room.name}</h3>
                </div>
                <div className="space-y-1 text-sm font-cairo text-muted-foreground mb-4">
                  <p>السعر: {room.pricePerHour} ج.م/ساعة</p>
                  <p>السعة: {room.capacity} أشخاص</p>
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => toggleAvailability(room.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold font-cairo ${room.available ? "bg-emerald/20 text-emerald" : "bg-destructive/20 text-destructive"}`}>
                    {room.available ? "🟢 متاحة" : "🔴 مشغولة"}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(room.id)} className="p-2 rounded-lg hover:bg-muted"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(room.id)} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const EditRoomForm = ({ room, onSave, onCancel }: { room: Room; onSave: (r: Room) => void; onCancel: () => void }) => {
  const [form, setForm] = useState(room);
  return (
    <div className="space-y-3">
      <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="font-cairo" />
      <Input type="number" value={form.pricePerHour} onChange={e => setForm({ ...form, pricePerHour: +e.target.value })} className="font-cairo" />
      <Input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} className="font-cairo" />
      <div className="flex gap-2">
        <Button variant="hero" size="sm" onClick={() => onSave(form)}><Save className="w-3 h-3" /> حفظ</Button>
        <Button variant="outline" size="sm" onClick={onCancel} className="font-cairo"><X className="w-3 h-3" /> إلغاء</Button>
      </div>
    </div>
  );
};

export default AdminRooms;
