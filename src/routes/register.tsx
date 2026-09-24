import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/nanami-logo.png";
import { AppShell } from "@/components/AppShell";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create New Account — Nanami Kitchen" },
      {
        name: "description",
        content:
          "Create a Nanami Kitchen account with email and password. Save your name, WhatsApp number, and delivery address for faster checkout.",
      },
      { property: "og:title", content: "Create Account — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Register with email and password for faster checkout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const field =
  "mt-1 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary";

function RegisterPage() {
  const navigate = useNavigate();
  const profile = useStore((s) => s.profile);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }
    if (!/^[0-9+\-\s()]{8,20}$/.test(phone.trim())) {
      setError("Invalid WhatsApp number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const cleanAddr = address.trim();
      const result = await actions.signUp({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        address: cleanAddr || undefined,
      });

      if (!result.ok) {
        setError(result.error ?? "An error occurred during registration.");
        setLoading(false);
        return;
      }

      if (cleanAddr) {
        actions.updateProfile({ address: cleanAddr });
        actions.saveAddress(cleanAddr);
      }
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  }

  if (profile.signedIn) {
    return (
      <AppShell hideCartBar hideBottomNav>
        <div className="py-16 text-center">
          <h1 className="text-xl font-bold">You already have an active account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Signed in as {profile.email}</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            Start Shopping
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideCartBar hideBottomNav>
      <div className="flex items-center gap-4">
        <Link to="/login" aria-label="Back to sign in page" className="text-foreground">
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="text-2xl font-bold">Create Account</h1>
      </div>

      <img
        src={logo}
        alt="Nanami Kitchen Logo"
        width={64}
        height={64}
        className="mx-auto mt-8 size-16"
      />
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Create an account for faster checkout and earn points with every order.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <label className="block text-xs text-muted-foreground">
          Full Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={100}
            required
            className={field}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          WhatsApp Number
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            required
            className={field}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Delivery Address (Optional)
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            maxLength={300}
            className={`${field} resize-none`}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            maxLength={255}
            required
            className={field}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Password (min. 6 characters)
          <span className="relative block">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={show ? "text" : "password"}
              autoComplete="new-password"
              minLength={6}
              maxLength={72}
              required
              className={`${field} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </span>
        </label>
        <label className="block text-xs text-muted-foreground">
          Confirm Password
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type={show ? "text" : "password"}
            autoComplete="new-password"
            minLength={6}
            maxLength={72}
            required
            className={field}
          />
        </label>

        {error && (
          <p className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password || !confirm || !name || !phone}
          className="!mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Sign In Here
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Your account data is saved locally on this device.
      </p>
    </AppShell>
  );
}
