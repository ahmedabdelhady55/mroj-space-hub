import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Save, X, DoorOpen, Upload, Image, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminRooms = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", price_per_hour: 90, capacity: 4 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [publicAreaPrice, setPublicAreaPrice] = useState(30);
  const [savingPrice, setSavingPrice] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRooms = async () => {
    const { data } = await supabase.from("rooms").select("*").order("created_at");
    setRooms(data || []);
  };

  const fetchPublicAreaPrice = async () => {
    const { data } = await supabase.from("loyalty_settings").select("public_area_price_per_hour").limit(1).single();
    if (data) setPublicAreaPrice((data as any).public_area_price_per_hour);
  };

  useEffect(() => { fetchRooms(); fetchPublicAreaPrice(); }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("room-images").upload(path, file);
    if (error) { toast({ title: "خطأ في رفع الصورة", variant: "destructive" }); return null; }
    const { data } = supabase.storage.from("room-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAdd = async () => {
    setUploading(true);
    let image_url: string | null = null;
    if (imageFile) image_url = await uploadImage(imageFile);
    await supabase.from("rooms").insert({ ...form, image_url });
    setAdding(false);
    setForm({ name: "", price_per_hour: 90, capacity: 4 });
    setImageFile(null);
    setImagePreview(null);
    setUploading(false);
    toast({ title: "تم إضافة الغرفة ✅" });
    fetchRooms();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("rooms").delete().eq("id", id);
    toast({ title: "تم حذف الغرفة" });
    fetchRooms();
  };

  const toggleAvailability = async (room: any) => {
    await supabase.from("rooms").update({ available: !room.available }).eq("id", room.id);
    fetchRooms();
  };

  const handleEditSave = async (room: any, newImageFile?: File | null) => {
    let image_url = room.image_url;
    if (newImageFile) {
      const url = await uploadImage(newImageFile);
      if (url) image_url = url;
    }
    await supabase.from("rooms").update({ name: room.name, price_per_hour: room.price_per_hour, capacity: room.capacity, image_url }).eq("id", room.id);
    setEditing(null);
    toast({ title: "تم تحديث الغرفة ✅" });
    fetchRooms();
  };

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const savePublicAreaPrice = async () => {
    setSavingPrice(true);
    await supabase.from("loyalty_settings").update({ public_area_price_per_hour: publicAreaPrice } as any).neq("id", "");
    setSavingPrice(false);
    toast({ title: "تم تحديث سعر المساحة العامة ✅" });
  };

  return (
    <div className="space-y-6">
      {/* Public Area Pricing */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-accent" />
          <h3 className="font-bold font-cairo text-card-foreground">سعر المساحة العامة</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              value={publicAreaPrice}
              onChange={e => setPublicAreaPrice(+e.target.value)}
              className="font-cairo max-w-[200px]"
            />
            <span className="text-sm text-muted-foreground font-cairo">ج.م / ساعة / فرد</span>
          </div>
          <Button variant="hero" onClick={savePublicAreaPrice} disabled={savingPrice}>
            <Save className="w-4 h-4" /> حفظ
          </Button>
        </div>
      </motion.div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-cairo">إدارة الغرف الخاصة</h2>
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
            <Input type="number" placeholder="السعر/ساعة" value={form.price_per_hour} onChange={e => setForm({ ...form, price_per_hour: +e.target.value })} className="font-cairo" />
            <Input type="number" placeholder="السعة" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} className="font-cairo" />
          </div>
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-cairo text-muted-foreground">صورة الغرفة</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full max-h-40 object-cover rounded-lg" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground font-cairo">اضغط لرفع صورة</span>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="hero" onClick={handleAdd} disabled={!form.name || uploading}>
              <Save className="w-4 h-4" /> {uploading ? "جاري الرفع..." : "حفظ"}
            </Button>
            <Button variant="outline" onClick={() => { setAdding(false); setImageFile(null); setImagePreview(null); }} className="font-cairo"><X className="w-4 h-4" /> إلغاء</Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room, i) => (
          <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Room Image */}
            {room.image_url ? (
              <img src={room.image_url} alt={room.name} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-muted flex items-center justify-center">
                <Image className="w-10 h-10 text-muted-foreground/40" />
              </div>
            )}
            <div className="p-5">
              {editing === room.id ? (
                <EditRoomForm room={room} onSave={handleEditSave} onCancel={() => setEditing(null)} />
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <DoorOpen className="w-5 h-5 text-accent" />
                    <h3 className="font-bold text-card-foreground font-cairo">{room.name}</h3>
                  </div>
                  <div className="space-y-1 text-sm font-cairo text-muted-foreground mb-4">
                    <p>السعر: {room.price_per_hour} ج.م/ساعة</p>
                    <p>السعة: {room.capacity} أشخاص</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <button onClick={() => toggleAvailability(room)}
                      className={`px-3 py-1 rounded-full text-xs font-bold font-cairo ${room.available ? "bg-emerald-500/20 text-emerald-500" : "bg-destructive/20 text-destructive"}`}>
                      {room.available ? "🟢 متاحة" : "🔴 مشغولة"}
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(room.id)} className="p-2 rounded-lg hover:bg-muted"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(room.id)} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const EditRoomForm = ({ room, onSave, onCancel }: { room: any; onSave: (r: any, file?: File | null) => void; onCancel: () => void }) => {
  const [form, setForm] = useState(room);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(room.image_url);
  const editFileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setNewImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="font-cairo" />
      <Input type="number" value={form.price_per_hour} onChange={e => setForm({ ...form, price_per_hour: +e.target.value })} className="font-cairo" />
      <Input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} className="font-cairo" />
      <div
        onClick={() => editFileRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center cursor-pointer hover:border-accent transition-colors"
      >
        {preview ? (
          <img src={preview} alt="preview" className="max-h-24 object-cover rounded" />
        ) : (
          <span className="text-xs text-muted-foreground font-cairo"><Upload className="w-4 h-4 inline ml-1" /> تغيير الصورة</span>
        )}
        <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
      <div className="flex gap-2">
        <Button variant="hero" size="sm" onClick={() => onSave(form, newImage)}><Save className="w-3 h-3" /> حفظ</Button>
        <Button variant="outline" size="sm" onClick={onCancel} className="font-cairo"><X className="w-3 h-3" /> إلغاء</Button>
      </div>
    </div>
  );
};

export default AdminRooms;
