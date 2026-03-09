import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();

  // If already logged in as admin, redirect to admin dashboard
  if (!authLoading && user && isAdmin) {
    navigate("/admin");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(phone, password);
    setLoading(false);
    if (error) {
      toast({ title: "خطأ في تسجيل الدخول", description: "بيانات غير صحيحة", variant: "destructive" });
      return;
    }
    navigate("/admin");
    toast({ title: "تم تسجيل الدخول ✅" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card rounded-2xl p-8 border border-border shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary font-cairo">mroj</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-bold text-card-foreground font-cairo">لوحة التحكم</h1>
            </div>
            <p className="text-muted-foreground font-cairo text-sm">دخول الإدارة</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2 font-cairo">رقم الهاتف</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" type="tel" dir="ltr" required className="font-cairo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2 font-cairo">كلمة المرور</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="font-cairo" />
            </div>
            <Button variant="hero" size="xl" className="w-full" type="submit" disabled={loading}>
              {loading ? "جاري..." : "دخول"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
