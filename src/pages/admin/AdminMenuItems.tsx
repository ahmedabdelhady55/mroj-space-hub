import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Save, X, UtensilsCrossed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const categories = ["مشروبات ساخنة", "مشروبات باردة", "وجبات رئيسية", "وجبات خفيفة"];

const AdminMenuItems = () => {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", price: 0, category: categories[0], description: "" });
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from("menu_items").select("*").order("created_at");
    setItems(data || []);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async () => {
    await supabase.from("menu_items").insert(form);
    setAdding(false);
    setForm({ name: "", price: 0, category: categories[0], description: "" });
    toast({ title: "تم إضافة الصنف ✅" });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("menu_items").delete().eq("id", id);
    toast({ title: "تم حذف الصنف" });
    fetchItems();
  };

  const handleEditSave = async (item: any) => {
    await supabase.from("menu_items").update({ name: item.name, price: item.price, description: item.description, category: item.category }).eq("id", item.id);
    setEditing(null);
    toast({ title: "تم تحديث الصنف ✅" });
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-cairo">إدارة القائمة</h2>
        <Button variant="hero" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4" /> إضافة صنف
        </Button>
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border space-y-4">
          <h3 className="font-bold font-cairo text-card-foreground">صنف جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="اسم الصنف" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="font-cairo" />
            <Input type="number" placeholder="السعر" value={form.price || ""} onChange={e => setForm({ ...form, price: +e.target.value })} className="font-cairo" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="p-2 rounded-lg border border-border bg-card text-card-foreground font-cairo">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Input placeholder="الوصف" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="font-cairo" />
          </div>
          <div className="flex gap-2">
            <Button variant="hero" onClick={handleAdd} disabled={!form.name || !form.price}><Save className="w-4 h-4" /> حفظ</Button>
            <Button variant="outline" onClick={() => setAdding(false)} className="font-cairo"><X className="w-4 h-4" /> إلغاء</Button>
          </div>
        </motion.div>
      )}

      {categories.map(cat => {
        const catItems = items.filter((i: any) => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat}>
            <h3 className="font-bold text-foreground font-cairo mb-3 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-accent" /> {cat}
            </h3>
            <div className="space-y-2">
              {catItems.map((item: any) => (
                <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                  {editing === item.id ? (
                    <EditItemForm item={item} onSave={handleEditSave} onCancel={() => setEditing(null)} />
                  ) : (
                    <>
                      <div>
                        <p className="font-bold text-card-foreground font-cairo">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-cairo">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-accent font-cairo">{item.price} ج.م</span>
                        <button onClick={() => setEditing(item.id)} className="p-2 rounded-lg hover:bg-muted"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EditItemForm = ({ item, onSave, onCancel }: { item: any; onSave: (i: any) => void; onCancel: () => void }) => {
  const [form, setForm] = useState(item);
  return (
    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
      <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="font-cairo text-sm" />
      <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} className="font-cairo text-sm" />
      <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="font-cairo text-sm" />
      <div className="flex gap-1">
        <Button variant="hero" size="sm" onClick={() => onSave(form)}><Save className="w-3 h-3" /></Button>
        <Button variant="outline" size="sm" onClick={onCancel}><X className="w-3 h-3" /></Button>
      </div>
    </div>
  );
};

export default AdminMenuItems;
