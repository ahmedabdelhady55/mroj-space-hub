import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
    if (!caller) throw new Error("Unauthorized");

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    if (!isAdmin) throw new Error("Not an admin");

    const { action, ...body } = await req.json();

    if (action === "create") {
      const { name, phone, password, permissions, role_label } = body;
      const email = `${phone.replace(/\s+/g, "")}@mroj.app`;

      // Create auth user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, phone },
      });
      if (createError) throw createError;

      // Assign moderator role
      await supabaseAdmin.from("user_roles").insert({ user_id: newUser.user!.id, role: "moderator" });

      // Insert staff permissions
      await supabaseAdmin.from("staff_permissions").insert({
        user_id: newUser.user!.id,
        permissions,
        role_label,
      });

      return new Response(JSON.stringify({ success: true, user_id: newUser.user!.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update") {
      const { user_id, name, phone, password, permissions, role_label, active } = body;

      // Update permissions
      await supabaseAdmin.from("staff_permissions").update({ permissions, role_label, active }).eq("user_id", user_id);

      // Update user metadata
      const updates: any = { user_metadata: { name, phone } };
      if (password) updates.password = password;
      const email = `${phone.replace(/\s+/g, "")}@mroj.app`;
      updates.email = email;
      await supabaseAdmin.auth.admin.updateUserById(user_id, updates);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { user_id } = body;
      // Delete auth user (cascades to profiles, user_roles, staff_permissions)
      await supabaseAdmin.auth.admin.deleteUser(user_id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
