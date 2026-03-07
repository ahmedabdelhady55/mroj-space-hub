import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, mock admin login - will be replaced with Supabase auth
    if (username && password) {
      localStorage.setItem("moroug_admin", JSON.stringify({ username, role: "admin" }));
      navigate("/admin");
      toast({ title: "تم تسجيل الدخول ✅" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="bg-card rounded-2xl p-8 border border-border shadow-xl">
          <div className="text-center mb-8">
            <img src={logo} alt="مروج" className="w-16 h-16 mx-auto mb-4 object-contain" />
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-bold text-card-foreground font-cairo">لوحة التحكم</h1>
            </div>
            <p className="text-muted-foreground font-cairo text-sm">دخول الإدارة</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2 font-cairo">اسم المستخدم</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required className="font-cairo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2 font-cairo">كلمة المرور</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="font-cairo" />
            </div>
            <Button variant="hero" size="xl" className="w-full" type="submit">دخول</Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
