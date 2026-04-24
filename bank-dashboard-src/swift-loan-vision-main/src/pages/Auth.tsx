import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const dest = loc.state?.from || "/dashboard";

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  // sign in
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // sign up
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(siEmail.trim(), siPassword);
      toast.success("Welcome back!");
      nav(dest, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Sign in failed");
    } finally { setLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password, branch.trim());
      toast.success("Account created");
      nav(dest, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Sign up failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-primary p-10 text-primary-foreground md:flex">
        <Logo variant="light" />
        <div>
          <h2 className="text-3xl font-bold leading-tight">Lend with confidence.</h2>
          <p className="mt-3 max-w-md text-sm text-primary-100">
            KisanKhata gives you satellite-verified credit intelligence for every farmer who walks into your branch.
          </p>
        </div>
        <div className="text-xs text-primary-100/80">© 2026 KisanKhata · Banker portal</div>
      </div>

      {/* Right form */}
      <div className="flex flex-col bg-background p-6 md:p-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="mx-auto my-auto w-full max-w-md">
          <div className="md:hidden mb-8"><Logo /></div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Banker portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to access your KisanKhata dashboard.</p>

          <Tabs value={tab} onValueChange={v => setTab(v as any)} className="mt-6">
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted/50 p-1">
              <TabsTrigger value="signin" className="rounded-full">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" type="email" required autoComplete="email"
                    value={siEmail} onChange={e => setSiEmail(e.target.value)} placeholder="banker@bank.in" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="si-pw">Password</Label>
                  <Input id="si-pw" type="password" required autoComplete="current-password"
                    value={siPassword} onChange={e => setSiPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full rounded-full bg-primary-500 text-primary-foreground hover:bg-primary-600 shadow-green">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
                <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  Demo account: <span className="font-mono">priya@kisankhata.in</span> / <span className="font-mono">demo1234</span>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" required value={name} onChange={e => setName(e.target.value)} placeholder="Priya Nair" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email">Bank email</Label>
                  <Input id="su-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="priya@bank.in" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-branch">Branch</Label>
                  <Input id="su-branch" required value={branch} onChange={e => setBranch(e.target.value)} placeholder="Nashik Branch" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-pw">Password</Label>
                  <Input id="su-pw" type="password" required minLength={8} autoComplete="new-password"
                    value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full rounded-full bg-primary-500 text-primary-foreground hover:bg-primary-600 shadow-green">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
