import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Login = () => {
  const [teamMember, setTeamMember] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const storedTeamMember = localStorage.getItem("team_member");
    if (storedTeamMember) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if admin login
      if (teamMember.toLowerCase().trim() === "admin" && password === "12345") {
        // Admin login successful
        localStorage.setItem("team_member", "admin");
        toast.success("Login successful!");
        navigate("/");
        return;
      }

      // Check if team member exists in bookings table
      const { data, error } = await supabase
        .from("bookings")
        .select("team_member")
        .eq("team_member", teamMember.trim())
        .limit(1);

      if (error) {
        console.error("Error checking team member:", error);
        toast.error("Login failed", {
          description: "An error occurred while checking credentials.",
        });
        setIsLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        toast.error("Team member not found", {
          description: "The team member name does not exist in the system.",
        });
        setIsLoading(false);
        return;
      }

      // Team member found, login successful
      localStorage.setItem("team_member", teamMember.trim());
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      console.error("Unexpected error during login:", err);
      toast.error("Login failed", {
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to access the calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team_member">Team Member</Label>
              <Input
                id="team_member"
                type="text"
                value={teamMember}
                onChange={(e) => setTeamMember(e.target.value)}
                placeholder="Enter team member name"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

