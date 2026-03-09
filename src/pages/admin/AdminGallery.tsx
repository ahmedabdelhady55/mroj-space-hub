import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, X, Trash2, Edit2, Upload, Image, GripVertical, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

const AdminGallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .order("sort_order", { ascending: true });
    setItems((data as GalleryItem[]) || []);
  };

  useEffect(() => { fetchItems(); }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("gallery-images").upload(path, file);
    if (error) {
      toast({ title: "خطأ في رفع الصورة", variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from("gallery-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!imageFile) {
      toast({ title: "يرجى اختيار صورة", variant: "destructive" });
      return;
    }
    setUploading(true);
    const image_url = await uploadImage(imageFile);
    if (!image_url) { setUploading(false); return; }

    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) : 0;
    await supabase.from("gallery").insert({
      title: form.title,
      description: form.description,
      image_url,
      sort_order: maxOrder + 1,
    } as any);

    setAdding(false);
    setForm({ title: "", description: "" });
    setImageFile(null);
    setImagePreview(null);
    setUploading(false);
    toast({ title: "تم إضافة الصورة ✅" });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("gallery").delete().eq("id", id);
    toast({ title: "تم حذف الصورة" });
    fetchItems();
  };

  const toggleActive = async (item: GalleryItem) => {
    await supabase.from("gallery").update({ active: !item.active } as any).eq("id", item.id);
    fetchItems();
  };

  const handleEditSave = async (item: GalleryItem, newFile?: File | null) => {
    let image_url = item.image_url;
    if (newFile) {
      const url = await uploadImage(newFile);
      if (url) image_url = url;
    }
    await supabase.from("gallery").update({
      title: item.title,
      description: item.description,
      image_url,
    } as any).eq("id", item.id);
    setEditing(null);
    toast({ title: "تم تحديث الصورة ✅" });
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-cairo">إدارة معرض الصور</h2>
        <Button variant="hero" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4" /> إضافة صورة
        </Button>
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border space-y-4">
          <h3 className="font-bold font-cairo text-card-foreground">صورة جديدة</h3>
          <Input placeholder="العنوان (اختياري)" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} className="font-cairo" />
          <Textarea placeholder="الوصف أو العرض (اختياري)" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} className="font-cairo" />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="w-full max-h-48 object-cover rounded-lg" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground font-cairo">اضغط لرفع صورة</span>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
          </div>
          <div className="flex gap-2">
            <Button variant="hero" onClick={handleAdd} disabled={!imageFile || uploading}>
              <Save className="w-4 h-4" /> {uploading ? "جاري الرفع..." : "حفظ"}
            </Button>
            <Button variant="outline" onClick={() => { setAdding(false); setImageFile(null); setImagePreview(null); }} className="font-cairo">
              <X className="w-4 h-4" /> إلغاء
            </Button>
          </div>
        </motion.div>
      )}

      {items.length === 0 && !adding && (
        <div className="text-center py-12 text-muted-foreground font-cairo">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد صور في المعرض بعد</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-card rounded-xl border border-border overflow-hidden ${!item.active ? "opacity-60" : ""}`}>
            <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              {editing === item.id ? (
                <EditGalleryForm item={item} onSave={handleEditSave} onCancel={() => setEditing(null)} />
              ) : (
                <>
                  {item.title && (
                    <h3 className="font-bold text-card-foreground font-cairo mb-1">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="text-sm text-muted-foreground font-cairo mb-3 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <button onClick={() => toggleActive(item)}
                      className={`px-3 py-1 rounded-full text-xs font-bold font-cairo flex items-center gap-1 ${
                        item.active ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
                      }`}>
                      {item.active ? <><Eye className="w-3 h-3" /> ظاهرة</> : <><EyeOff className="w-3 h-3" /> مخفية</>}
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(item.id)} className="p-2 rounded-lg hover:bg-muted">
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
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

const EditGalleryForm = ({ item, onSave, onCancel }: {
  item: GalleryItem;
  onSave: (item: GalleryItem, file?: File | null) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState(item);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(item.image_url);
  const editFileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setNewImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
        placeholder="العنوان" className="font-cairo" />
      <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
        placeholder="الوصف" className="font-cairo" />
      <div onClick={() => editFileRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center cursor-pointer hover:border-accent transition-colors">
        <img src={preview} alt="preview" className="max-h-24 object-cover rounded" />
        <input ref={editFileRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
      <div className="flex gap-2">
        <Button variant="hero" size="sm" onClick={() => onSave(form, newImage)}>
          <Save className="w-3 h-3" /> حفظ
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel} className="font-cairo">
          <X className="w-3 h-3" /> إلغاء
        </Button>
      </div>
    </div>
  );
};

export default AdminGallery;
