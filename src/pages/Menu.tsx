import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, Minus, ShoppingCart, Send, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getActiveBooking, addOrdersToActiveBooking, type OrderItem } from "@/lib/bookingStore";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

const defaultMenuItems: MenuItem[] = [
  { id: 1, name: "قهوة أمريكانو", price: 35, category: "مشروبات ساخنة", description: "قهوة محمصة طازجة" },
  { id: 2, name: "لاتيه", price: 45, category: "مشروبات ساخنة", description: "إسبريسو مع حليب مخفوق" },
  { id: 3, name: "شاي أخضر", price: 25, category: "مشروبات ساخنة", description: "شاي أخضر مع نعناع" },
  { id: 4, name: "آيس موكا", price: 55, category: "مشروبات باردة", description: "موكا مثلجة بالشوكولاتة" },
  { id: 5, name: "عصير مانجو", price: 40, category: "مشروبات باردة", description: "عصير مانجو طبيعي" },
  { id: 6, name: "برجر كلاسيك", price: 85, category: "وجبات رئيسية", description: "لحم بقري مع جبنة شيدر" },
  { id: 7, name: "كلوب ساندويتش", price: 75, category: "وجبات رئيسية", description: "دجاج مشوي مع خضروات" },
  { id: 8, name: "كرواسون شوكولاتة", price: 30, category: "وجبات خفيفة", description: "كرواسون طازج محشو" },
  { id: 9, name: "كيك ريد فيلفيت", price: 45, category: "وجبات خفيفة", description: "كيك طبقات فاخر" },
];

const getMenuItems = (): MenuItem[] => {
  const stored = localStorage.getItem("moroug_admin_menu");
  if (stored) return JSON.parse(stored);
  return defaultMenuItems;
};

const Menu = () => {
  const [menuItems] = useState<MenuItem[]>(getMenuItems);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const activeBooking = getActiveBooking();

  const categories = ["الكل", ...Array.from(new Set(menuItems.map(i => i.category)))];
  const filtered = activeCategory === "الكل" ? menuItems : menuItems.filter((i) => i.category === activeCategory);

  const addToCart = (id: number) => setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: number) =>
    setCart((prev) => {
      const n = (prev[id] || 0) - 1;
      if (n <= 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: n };
    });

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((i) => i.id === Number(id));
    return sum + (item?.price || 0) * qty;
  }, 0);

  const handleSend = () => {
    const orderItems: OrderItem[] = Object.entries(cart).map(([id, qty]) => {
      const item = menuItems.find((i) => i.id === Number(id))!;
      return { id: item.id, name: item.name, price: item.price, quantity: qty };
    });

    const updatedBooking = addOrdersToActiveBooking(orderItems);

    if (updatedBooking) {
      setOrderSent(true);
      toast({
        title: "تم إرسال الطلب للمطبخ! 🍳",
        description: `طلبات: ${cartTotal} ج.م | إجمالي الفاتورة: ${updatedBooking.totalCost} ج.م`,
      });
    } else {
      toast({
        title: "تم إرسال الطلب للمطبخ! 🍳",
        description: `${cartCount} أصناف - ${cartTotal} ج.م`,
      });
    }
    setCart({});
    setShowCart(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-emerald px-6 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-primary-foreground">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-primary-foreground font-cairo">القائمة</h1>
        </div>
      </div>

      {activeBooking && (
        <div className="px-6 mt-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-center gap-3">
            <Receipt className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-cairo font-bold text-card-foreground">فاتورة جارية</p>
              <p className="text-xs font-cairo text-muted-foreground">
                {activeBooking.type === "public" ? `مساحة عامة: ${activeBooking.areaCost} ج.م` : activeBooking.roomName}
                {activeBooking.ordersCost > 0 && ` | طلبات: ${activeBooking.ordersCost} ج.م`}
              </p>
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-gradient-gold font-cairo">{activeBooking.totalCost} ج.م</p>
            </div>
          </motion.div>
        </div>
      )}

      {orderSent && activeBooking && (
        <div className="px-6 mt-3">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald/10 border border-emerald/20 rounded-xl p-4 text-center">
            <p className="font-cairo font-bold text-emerald text-sm">✅ تم إرسال طلبك! الفاتورة الإجمالية: {activeBooking.totalCost} ج.م</p>
            <div className="flex gap-2 mt-3 justify-center">
              <Button variant="outline" size="sm" className="font-cairo text-xs" onClick={() => setOrderSent(false)}>
                طلب المزيد
              </Button>
              <Button variant="hero" size="sm" className="font-cairo text-xs" onClick={() => navigate("/home")}>
                العودة للرئيسية
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="px-6 mt-4 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-cairo text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "gradient-gold text-emerald-dark shadow-gold"
                  : "bg-card text-muted-foreground border border-border"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 mt-4 space-y-3">
        {filtered.map((item, index) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-card-foreground font-cairo">{item.name}</h3>
              <p className="text-muted-foreground text-xs font-cairo">{item.description}</p>
              <p className="text-accent font-bold font-cairo mt-1">{item.price} ج.م</p>
            </div>
            <div className="flex items-center gap-2">
              {cart[item.id] ? (
                <>
                  <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <span className="font-bold text-card-foreground font-cairo w-6 text-center">{cart[item.id]}</span>
                </>
              ) : null}
              <button onClick={() => addToCart(item.id)} className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center shadow-gold">
                <Plus className="w-4 h-4 text-emerald-dark" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {cartCount > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-6 left-6 right-6 z-50">
          {showCart ? (
            <div className="bg-card rounded-2xl p-6 border border-border shadow-2xl">
              <h3 className="font-bold text-card-foreground font-cairo text-lg mb-4">سلة المشتريات</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {Object.entries(cart).map(([id, qty]) => {
                  const item = menuItems.find((i) => i.id === Number(id))!;
                  return (
                    <div key={id} className="flex justify-between text-sm font-cairo">
                      <span className="text-card-foreground">{item.name} × {qty}</span>
                      <span className="text-accent font-bold">{item.price * qty} ج.م</span>
                    </div>
                  );
                })}
              </div>
              {activeBooking && (
                <div className="border-t border-border pt-2 mb-2 space-y-1">
                  <div className="flex justify-between text-xs font-cairo text-muted-foreground">
                    <span>{activeBooking.type === "public" ? "تكلفة المساحة" : "تكلفة الغرفة"}</span>
                    <span>{activeBooking.areaCost} ج.م</span>
                  </div>
                  {activeBooking.ordersCost > 0 && (
                    <div className="flex justify-between text-xs font-cairo text-muted-foreground">
                      <span>طلبات سابقة</span>
                      <span>{activeBooking.ordersCost} ج.م</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-cairo text-muted-foreground">
                    <span>طلبات جديدة</span>
                    <span>{cartTotal} ج.م</span>
                  </div>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between mb-4">
                <span className="font-bold text-card-foreground font-cairo">
                  {activeBooking ? "الإجمالي الكلي" : "الإجمالي"}
                </span>
                <span className="font-bold text-gradient-gold font-cairo text-lg">
                  {activeBooking ? (activeBooking.totalCost + cartTotal) : cartTotal} ج.م
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 font-cairo" onClick={() => setShowCart(false)}>إغلاق</Button>
                <Button variant="hero" className="flex-1" onClick={handleSend}>
                  <Send className="w-4 h-4" /> إرسال للمطبخ
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="hero" size="xl" className="w-full" onClick={() => setShowCart(true)}>
              <ShoppingCart className="w-5 h-5" />
              السلة ({cartCount}) - {cartTotal} ج.م
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Menu;
