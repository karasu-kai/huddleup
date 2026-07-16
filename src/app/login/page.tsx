"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/");
    });
  }, [router]);

  async function signInWithGoogle() {
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured yet.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) setError(authError.message);
    setLoading(false);
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured yet.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) {
      setError(authError.message);
    } else {
      setMessage("Check your email for a magic link.");
    }
    setLoading(false);
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <Logo />
          <p className="mt-6 text-sm text-text-secondary">
            Supabase env vars are not set. The app is running in local JSON mode.
          </p>
          <Button className="mt-6 w-full" onClick={() => router.push("/")}>
            Continue without login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Logo />
          <p className="mt-3 text-text-secondary">
            Shared lists for anything you&apos;re planning together.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-tertiary">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={signInWithEmail} className="space-y-3">
            <div>
              <Label>Email magic link</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send magic link"}
            </Button>
          </form>

          {message && <p className="text-center text-sm text-brand-700">{message}</p>}
          {error && <p className="text-center text-sm text-warning">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <h1 className="text-3xl font-bold tracking-tight">
      Huddle<span className="text-neon">Up</span>
    </h1>
  );
}
