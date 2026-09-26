import { useState, useMemo, useRef } from "react";
import {
  Trash2,
  UserPlus,
  Pencil,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Key,
  Eye,
  EyeOff,
  Search,
  X,
  Check,
  Lock,
  Sparkles,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChefHat,
  BadgeCheck,
  User,
  KeyRound,
} from "lucide-react";
import {
  actions,
  uid,
  useStore,
  type StaffRole,
  type Account,
  type StaffMember,
} from "@/lib/store";
import { SectionCard, fieldClass } from "./DashboardShell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export type UserRole = "owner" | "admin" | "staff" | "user";

const ROLES: {
  value: UserRole;
  label: string;
  badge: string;
  desc: string;
  badgeClass: string;
  borderActive: string;
}[] = [
  {
    value: "owner",
    label: "Owner",
    badge: "Owner",
    desc: "Full system access, manage team & accounts, financial reports, and store settings",
    badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    borderActive: "border-purple-500 bg-purple-500/10",
  },
  {
    value: "admin",
    label: "Admin",
    badge: "Kitchen Admin",
    desc: "Kitchen operations, kitchen order board, order management, menu, and stock availability",
    badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    borderActive: "border-blue-500 bg-blue-500/10",
  },
  {
    value: "staff",
    label: "Staff",
    badge: "Staff / Cashier",
    desc: "Order taking & processing, cooking status updates, and cashier operations",
    badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    borderActive: "border-amber-500 bg-amber-500/10",
  },
  {
    value: "user",
    label: "Customer",
    badge: "Customer / User",
    desc: "Regular customer account: menu ordering, transaction history, and loyalty points",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    borderActive: "border-emerald-500 bg-emerald-500/10",
  },
];

export type UnifiedUser = {
  id: string;
  accountId?: string;
  staffId?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
  hasPassword: boolean;
  password?: string;
  createdAt: number;
  points?: number;
  address?: string;
};

export function StaffPanel() {
  const staff = useStore((s) => s.staff);
  const accounts = useStore((s) => s.accounts);
  const profile = useStore((s) => s.profile);

  // Form states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("admin");
  const [isActive, setIsActive] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "team" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Quick Change Password Modal state
  const [passwordModalUser, setPasswordModalUser] = useState<UnifiedUser | null>(null);
  const [modalNewPassword, setModalNewPassword] = useState("");
  const [showModalPassword, setShowModalPassword] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // Merge staff and accounts into unified view without duplicate emails
  const allUsers = useMemo<UnifiedUser[]>(() => {
    const list: UnifiedUser[] = [];
    const seenEmails = new Set<string>();

    // 1. Add staff members
    for (const s of staff) {
      const emailLower = (s.email || "").trim().toLowerCase();
      const matchedAcc = accounts.find(
        (a) => a.id === s.id || (a.email && a.email.trim().toLowerCase() === emailLower),
      );

      list.push({
        id: s.id,
        accountId: matchedAcc?.id,
        staffId: s.id,
        name: s.name || matchedAcc?.name || "Staff Member",
        email: s.email,
        phone: s.phone || matchedAcc?.phone || "",
        role: (s.role as UserRole) || (matchedAcc?.role as UserRole) || "staff",
        active: s.active !== false,
        hasPassword: Boolean(matchedAcc?.password),
        password: matchedAcc?.password,
        createdAt: s.createdAt || Date.now(),
        points: matchedAcc?.points,
        address: matchedAcc?.address,
      });

      if (emailLower) {
        seenEmails.add(emailLower);
      }
    }

    // 2. Add accounts that are not in staff
    for (const a of accounts) {
      const emailLower = (a.email || "").trim().toLowerCase();
      if (seenEmails.has(emailLower)) {
        continue;
      }

      list.push({
        id: a.id,
        accountId: a.id,
        staffId: undefined,
        name: a.name || "Customer",
        email: a.email,
        phone: a.phone || "",
        role: (a.role as UserRole) || "user",
        active: true,
        hasPassword: Boolean(a.password),
        password: a.password,
        createdAt: Date.now(),
        points: a.points,
        address: a.address,
      });

      if (emailLower) {
        seenEmails.add(emailLower);
      }
    }

    return list;
  }, [staff, accounts]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      // Role filter
      if (roleFilter === "team") {
        if (u.role !== "owner" && u.role !== "admin" && u.role !== "staff") return false;
      } else if (roleFilter !== "all" && u.role !== roleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !u.active) return false;
      if (statusFilter === "inactive" && u.active) return false;

      // Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = u.phone.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }

      return true;
    });
  }, [allUsers, roleFilter, statusFilter, search]);

  const stats = useMemo(() => {
    return {
      total: allUsers.length,
      owners: allUsers.filter((u) => u.role === "owner").length,
      admins: allUsers.filter((u) => u.role === "admin").length,
      staff: allUsers.filter((u) => u.role === "staff").length,
      users: allUsers.filter((u) => u.role === "user").length,
      active: allUsers.filter((u) => u.active).length,
    };
  }, [allUsers]);

  const resetForm = () => {
    setEditingUserId(null);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setShowPassword(false);
    setRole("admin");
    setIsActive(true);
  };

  const startEdit = (user: UnifiedUser) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setRole(user.role);
    setIsActive(user.active);
    setPassword("");
    setShowPassword(false);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let res = "Nanami";
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setShowPassword(true);
    toast.info(`New password generated: ${res}`);
  };

  const generateModalPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let res = "Nanami";
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setModalNewPassword(res);
    setShowModalPassword(true);
    toast.info(`Password generated: ${res}`);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      toast.error("Full name is required.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Invalid email address.");
      return;
    }

    if (editingUserId) {
      // UPDATE EXISTING USER
      const userToEdit = allUsers.find(
        (u) => u.id === editingUserId || u.email.toLowerCase() === cleanEmail,
      );
      const existingAccount = accounts.find(
        (a) =>
          a.id === userToEdit?.accountId ||
          a.id === editingUserId ||
          a.email.toLowerCase() === cleanEmail,
      );
      const existingStaff = staff.find(
        (s) =>
          s.id === userToEdit?.staffId ||
          s.id === editingUserId ||
          s.email.toLowerCase() === cleanEmail,
      );

      const targetId = userToEdit?.accountId || userToEdit?.staffId || editingUserId;

      // Validate password if user typed one
      if (password.trim() && password.trim().length < 4) {
        toast.error("New password must be at least 4 characters.");
        return;
      }

      // 1. Save updated account
      const finalPassword = password.trim()
        ? password.trim()
        : existingAccount?.password || "password123";

      const updatedAccount: Account = {
        id: existingAccount?.id || targetId,
        email: cleanEmail,
        password: finalPassword,
        name: trimmedName,
        phone: trimmedPhone,
        role: role,
        address: existingAccount?.address || "",
        addresses: existingAccount?.addresses || [],
        points: existingAccount?.points || 0,
      };
      actions.saveAccount(updatedAccount);

      // 2. Save or remove staff entry based on role
      if (role === "owner" || role === "admin" || role === "staff") {
        const updatedStaff: StaffMember = {
          id: existingStaff?.id || targetId,
          name: trimmedName,
          email: cleanEmail,
          phone: trimmedPhone,
          role: role as StaffRole,
          active: isActive,
          createdAt: existingStaff?.createdAt || userToEdit?.createdAt || Date.now(),
        };
        actions.saveStaff(updatedStaff);
      } else {
        // Demoted to user, remove from staff if previously a staff member
        if (existingStaff) {
          actions.deleteStaff(existingStaff.id);
        }
      }

      toast.success(`User "${trimmedName}" updated successfully!`);
      resetForm();
    } else {
      // CREATE NEW USER - EMAIL & PASSWORD REQUIRED
      if (!password.trim()) {
        toast.error("Password is required to create a new account.");
        return;
      }
      if (password.trim().length < 4) {
        toast.error("Password must be at least 4 characters.");
        return;
      }

      const emailExists = allUsers.some((u) => u.email.toLowerCase() === cleanEmail);
      if (emailExists) {
        toast.error(`Email "${cleanEmail}" is already registered. Please edit the existing user.`);
        return;
      }

      const newId = "usr-" + uid();
      const finalPassword = password.trim();

      // 1. Create Account
      const newAccount: Account = {
        id: newId,
        name: trimmedName,
        email: cleanEmail,
        phone: trimmedPhone,
        role: role,
        password: finalPassword,
        address: "",
        addresses: [],
        points: 0,
      };
      actions.saveAccount(newAccount);

      // 2. If staff role, also create StaffMember
      if (role === "owner" || role === "admin" || role === "staff") {
        const newStaff: StaffMember = {
          id: newId,
          name: trimmedName,
          email: cleanEmail,
          phone: trimmedPhone,
          role: role as StaffRole,
          active: isActive,
          createdAt: Date.now(),
        };
        actions.saveStaff(newStaff);
      }

      toast.success(
        `User "${trimmedName}" created successfully with email "${cleanEmail}" and is ready to sign in!`,
      );
      resetForm();
    }
  };

  const handleQuickPasswordUpdate = () => {
    if (!passwordModalUser) return;
    if (!modalNewPassword.trim()) {
      toast.error("New password cannot be empty.");
      return;
    }
    if (modalNewPassword.trim().length < 4) {
      toast.error("Password must be at least 4 characters.");
      return;
    }

    const cleanEmail = passwordModalUser.email.trim().toLowerCase();
    const existingAccount = accounts.find(
      (a) => a.id === passwordModalUser.accountId || a.email.toLowerCase() === cleanEmail,
    );

    const updatedAccount: Account = {
      id: existingAccount?.id || passwordModalUser.id,
      name: passwordModalUser.name,
      email: cleanEmail,
      phone: passwordModalUser.phone,
      role: passwordModalUser.role,
      password: modalNewPassword.trim(),
      address: existingAccount?.address || "",
      addresses: existingAccount?.addresses || [],
      points: existingAccount?.points || 0,
    };

    actions.saveAccount(updatedAccount);
    toast.success(`Password for ${passwordModalUser.name} updated successfully!`);
    setPasswordModalUser(null);
    setModalNewPassword("");
    setShowModalPassword(false);
  };

  const handleDelete = (user: UnifiedUser) => {
    const cleanEmail = user.email.trim().toLowerCase();
    const currentEmail = (profile?.email || "").trim().toLowerCase();

    if (currentEmail && cleanEmail === currentEmail) {
      toast.error("You cannot delete your own currently active account!");
      return;
    }

    if (confirm(`Delete user "${user.name}" (${user.email})? This action cannot be undone.`)) {
      if (user.accountId) {
        actions.deleteAccount(user.accountId);
      }
      if (user.staffId) {
        actions.deleteStaff(user.staffId);
      }
      actions.deleteAccount(cleanEmail);
      actions.deleteStaff(cleanEmail);

      if (editingUserId === user.id) {
        resetForm();
      }
      toast.success(`User "${user.name}" deleted successfully.`);
    }
  };

  const handleQuickRoleChange = (user: UnifiedUser, newRole: UserRole) => {
    const cleanEmail = user.email.trim().toLowerCase();
    const currentEmail = (profile?.email || "").trim().toLowerCase();

    if (currentEmail && cleanEmail === currentEmail && newRole !== "owner") {
      toast.error("Cannot change the role of your own account while logged in!");
      return;
    }

    const existingAccount = accounts.find(
      (a) => a.id === user.accountId || a.email.toLowerCase() === cleanEmail,
    );
    if (existingAccount) {
      actions.saveAccount({ ...existingAccount, role: newRole });
    }

    if (newRole === "owner" || newRole === "admin" || newRole === "staff") {
      const existingStaff = staff.find(
        (s) => s.id === user.staffId || s.email.toLowerCase() === cleanEmail,
      );
      actions.saveStaff({
        id: existingStaff?.id || user.id,
        name: user.name,
        email: cleanEmail,
        phone: user.phone,
        role: newRole as StaffRole,
        active: user.active,
        createdAt: existingStaff?.createdAt || user.createdAt || Date.now(),
      });
    } else {
      if (user.staffId) {
        actions.deleteStaff(user.staffId);
      }
    }

    const roleLabel = ROLES.find((r) => r.value === newRole)?.label || newRole;
    toast.success(`Role for ${user.name} changed to ${roleLabel}`);
  };

  const handleQuickToggleActive = (user: UnifiedUser) => {
    const nextActive = !user.active;
    const cleanEmail = user.email.trim().toLowerCase();
    const currentEmail = (profile?.email || "").trim().toLowerCase();

    if (currentEmail && cleanEmail === currentEmail && !nextActive) {
      toast.error("Cannot deactivate your own account while logged in!");
      return;
    }

    if (user.staffId) {
      actions.updateStaff(user.staffId, { active: nextActive });
    } else if (user.role === "owner" || user.role === "admin" || user.role === "staff") {
      actions.saveStaff({
        id: user.id,
        name: user.name,
        email: cleanEmail,
        phone: user.phone,
        role: user.role as StaffRole,
        active: nextActive,
        createdAt: user.createdAt,
      });
    }
    toast.success(`Account status for ${user.name}: ${nextActive ? "Active" : "Inactive"}`);
  };

  const getRoleIcon = (r: UserRole) => {
    switch (r) {
      case "owner":
        return <ShieldCheck className="size-3.5 text-purple-600 dark:text-purple-400" />;
      case "admin":
        return <ChefHat className="size-3.5 text-blue-600 dark:text-blue-400" />;
      case "staff":
        return <BadgeCheck className="size-3.5 text-amber-600 dark:text-amber-400" />;
      case "user":
      default:
        return <User className="size-3.5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="glow-card p-3">
          <p className="text-[11px] font-medium text-muted-foreground">Total Accounts</p>
          <p className="mt-1 text-xl font-black">{stats.total}</p>
          <p className="text-[10px] text-emerald-500 font-semibold">{stats.active} active</p>
        </div>
        <div className="glow-card p-3 border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="size-3.5" />
            <span className="text-[11px] font-semibold">Owner</span>
          </div>
          <p className="mt-1 text-xl font-black">{stats.owners}</p>
          <p className="text-[10px] text-muted-foreground">Full access</p>
        </div>
        <div className="glow-card p-3 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <ChefHat className="size-3.5" />
            <span className="text-[11px] font-semibold">Admin</span>
          </div>
          <p className="mt-1 text-xl font-black">{stats.admins}</p>
          <p className="text-[10px] text-muted-foreground">Kitchen & Operations</p>
        </div>
        <div className="glow-card p-3 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <BadgeCheck className="size-3.5" />
            <span className="text-[11px] font-semibold">Staff</span>
          </div>
          <p className="mt-1 text-xl font-black">{stats.staff}</p>
          <p className="text-[10px] text-muted-foreground">Cashier & Orders</p>
        </div>
        <div className="glow-card p-3 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <User className="size-3.5" />
            <span className="text-[11px] font-semibold">Customers</span>
          </div>
          <p className="mt-1 text-xl font-black">{stats.users}</p>
          <p className="text-[10px] text-muted-foreground">App users</p>
        </div>
        <div className="glow-card p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-3.5" />
            <span className="text-[11px] font-semibold">Total Team</span>
          </div>
          <p className="mt-1 text-xl font-black">{stats.owners + stats.admins + stats.staff}</p>
          <p className="text-[10px] text-muted-foreground">Staff & Management</p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid gap-4 xl:grid-cols-[380px_1fr] xl:items-start">
        {/* Left Column: Create / Edit User Form */}
        <div ref={formRef}>
          <SectionCard
            title={editingUserId ? "Edit User & Credentials" : "Add New User"}
            description={
              editingUserId
                ? "Update account information, role permissions, and sign-in password."
                : "Create a new user account with an email address and sign-in password."
            }
          >
            {editingUserId && (
              <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary font-medium">
                <span>Currently editing this account</span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1 text-[11px] underline hover:opacity-80"
                >
                  <X className="size-3" /> Cancel edit
                </button>
              </div>
            )}

            <div className="space-y-3.5">
              {/* Profile Details */}
              <label className="block text-xs font-medium text-muted-foreground">
                User Full Name <span className="text-destructive">*</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className={fieldClass}
                />
              </label>

              {/* Dedicated Login Credentials Block (Email & Password) */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-3">
                <div className="flex items-center gap-2 border-b border-primary/15 pb-2">
                  <KeyRound className="size-4 text-primary" />
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Login Credentials (Email & Password)
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Email address and password used by the user to sign in to the application
                    </p>
                  </div>
                </div>

                {/* Email Input */}
                <label className="block text-xs font-medium text-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3 text-primary" /> Login Email Address{" "}
                    <span className="text-destructive">*</span>
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="user@nanami.id"
                    className={`${fieldClass} bg-background`}
                  />
                </label>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground flex items-center gap-1">
                      <Lock className="size-3 text-primary" /> Password{" "}
                      {editingUserId ? (
                        <span className="text-[10px] text-muted-foreground font-normal">
                          (Optional if unchanged)
                        </span>
                      ) : (
                        <span className="text-destructive">*</span>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <Sparkles className="size-3" /> Random Password
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        editingUserId
                          ? "Leave blank to keep current password"
                          : "At least 4 characters (e.g. nanami123)"
                      }
                      className={`${fieldClass} bg-background pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {editingUserId ? (
                    <p className="text-[10px] text-muted-foreground">
                      Leave this field blank if you want to keep the current password.
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">
                      Password is required so the user account can sign in immediately.
                    </p>
                  )}
                </div>
              </div>

              {/* Phone Input */}
              <label className="block text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="size-3" /> Phone Number / WhatsApp
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="0812-3456-7890"
                  className={fieldClass}
                />
              </label>

              {/* Role Selection */}
              <div className="space-y-1.5 pt-1">
                <span className="block text-xs font-medium text-muted-foreground">
                  Select Role / Permissions <span className="text-destructive">*</span>
                </span>
                <div className="space-y-1.5">
                  {ROLES.map((r) => {
                    const isSelected = role === r.value;
                    return (
                      <button
                        type="button"
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        className={`w-full rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${r.borderActive} shadow-sm`
                            : "border-border bg-secondary/30 hover:bg-secondary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(r.value)}
                            <span className="text-xs font-bold text-foreground">{r.label}</span>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${r.badgeClass}`}
                          >
                            {r.badge}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                          {r.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 p-2.5">
                <div>
                  <p className="text-xs font-semibold">Account Status</p>
                  <p className="text-[11px] text-muted-foreground">
                    {isActive
                      ? "Account active and allowed to sign in"
                      : "Account inactive / suspended"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-success/20 text-success border border-success/30"
                      : "bg-destructive/20 text-destructive border border-destructive/30"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={!name.trim() || !email.trim() || (!editingUserId && !password.trim())}
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  {editingUserId ? (
                    <>
                      <Check className="size-4" /> Save User Changes
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-4" /> Create New Account
                    </>
                  )}
                </button>

                {editingUserId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-xs font-semibold hover:bg-secondary/70 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: User & Staff List */}
        <div className="space-y-4">
          <SectionCard
            title="Accounts & Users List"
            description={`Total ${allUsers.length} users registered in the Nanami Kitchen system.`}
          >
            {/* Search & Filter Header */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or phone number..."
                  className="w-full rounded-xl border border-input bg-secondary/30 pl-9 pr-8 py-2 text-xs outline-none focus:border-primary"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Role filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                  Filter:
                </span>
                <button
                  type="button"
                  onClick={() => setRoleFilter("all")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    roleFilter === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  All ({allUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("team")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    roleFilter === "team"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  Team ({stats.owners + stats.admins + stats.staff})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("owner")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    roleFilter === "owner"
                      ? "bg-purple-600 text-white"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  Owner ({stats.owners})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("admin")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    roleFilter === "admin"
                      ? "bg-blue-600 text-white"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  Admin ({stats.admins})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("staff")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    roleFilter === "staff"
                      ? "bg-amber-600 text-white"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  Staff ({stats.staff})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("user")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    roleFilter === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  Customers ({stats.users})
                </button>

                {/* Status Toggle filter */}
                <div className="ml-auto flex items-center gap-1">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="rounded-lg border border-input bg-secondary/40 px-2 py-1 text-[11px] font-semibold outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* User Cards List */}
            <div className="space-y-2.5 pt-2">
              {filteredUsers.map((u) => {
                const roleConfig = ROLES.find((r) => r.value === u.role) || ROLES[1];
                const isCurrentSelf =
                  Boolean(profile?.email) && u.email.toLowerCase() === profile.email.toLowerCase();

                return (
                  <div
                    key={u.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 transition-shadow hover:shadow-sm ${
                      editingUserId === u.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-secondary/20"
                    }`}
                  >
                    {/* Left: Avatar + Details */}
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-black text-primary">
                        {u.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-bold text-foreground truncate">{u.name}</p>
                          {isCurrentSelf && (
                            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                              Your Account
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                          <span className="inline-flex items-center gap-1 truncate font-medium text-foreground/80">
                            <Mail className="size-3 text-primary" />
                            {u.email}
                          </span>
                          {u.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="size-3" />
                              {u.phone}
                            </span>
                          )}
                          {u.points !== undefined && u.points > 0 && (
                            <span className="inline-flex items-center gap-1 font-semibold text-primary text-[11px]">
                              ★ {u.points} pts
                            </span>
                          )}
                        </div>

                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${roleConfig.badgeClass}`}
                          >
                            {getRoleIcon(u.role)}
                            {roleConfig.label}
                          </span>

                          {u.hasPassword ? (
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordModalUser(u);
                                setModalNewPassword("");
                                setShowModalPassword(false);
                              }}
                              className="inline-flex items-center gap-1 rounded-md bg-secondary/80 hover:bg-secondary border border-border px-2 py-0.5 text-[10px] text-muted-foreground font-semibold cursor-pointer transition-colors"
                              title="Click to change password"
                            >
                              <Lock className="size-2.5 text-success" /> Active Password (Change)
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordModalUser(u);
                                setModalNewPassword("");
                                setShowModalPassword(false);
                              }}
                              className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-bold cursor-pointer transition-colors"
                              title="Click to set login password"
                            >
                              <AlertCircle className="size-2.5" /> Set Login Password
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Inline Quick Controls & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-border/50">
                      {/* Inline Role Selector */}
                      <select
                        value={u.role}
                        disabled={isCurrentSelf}
                        onChange={(e) => handleQuickRoleChange(u, e.target.value as UserRole)}
                        aria-label={`Change role for ${u.name}`}
                        className="rounded-lg border border-input bg-card px-2 py-1 text-xs font-semibold outline-none disabled:opacity-50 cursor-pointer"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>

                      {/* Active Status Button */}
                      <button
                        type="button"
                        disabled={isCurrentSelf}
                        onClick={() => handleQuickToggleActive(u)}
                        title={
                          isCurrentSelf
                            ? "Your own account cannot be deactivated"
                            : u.active
                              ? "Click to deactivate account"
                              : "Click to activate account"
                        }
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors disabled:opacity-50 cursor-pointer ${
                          u.active
                            ? "bg-success/15 text-success hover:bg-success/25"
                            : "bg-destructive/15 text-destructive hover:bg-destructive/25"
                        }`}
                      >
                        {u.active ? "Active" : "Inactive"}
                      </button>

                      {/* Action buttons: Key (Password), Edit & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordModalUser(u);
                            setModalNewPassword("");
                            setShowModalPassword(false);
                          }}
                          aria-label={`Change password for ${u.name}`}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          title="Change / Set Login Password"
                        >
                          <Key className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(u)}
                          aria-label={`Edit ${u.name}`}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          title="Edit User Data"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isCurrentSelf}
                          onClick={() => handleDelete(u)}
                          aria-label={`Delete ${u.name}`}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-25 cursor-pointer"
                          title={isCurrentSelf ? "Cannot delete your own account" : "Delete User"}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center rounded-xl border border-dashed border-border p-6">
                  <Users className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-semibold text-foreground">No users found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try changing your search terms or filters above.
                  </p>
                  {(search || roleFilter !== "all" || statusFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setRoleFilter("all");
                        setStatusFilter("all");
                      }}
                      className="mt-3 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1 text-xs font-semibold hover:bg-secondary/40 cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Quick Change Password Dialog */}
      <Dialog
        open={Boolean(passwordModalUser)}
        onOpenChange={(open) => !open && setPasswordModalUser(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <KeyRound className="size-5 text-primary" /> Change Account Password
            </DialogTitle>
            <DialogDescription className="text-xs">
              Set a new login password for user{" "}
              <strong className="text-foreground">{passwordModalUser?.name}</strong> (
              {passwordModalUser?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-border bg-secondary/30 p-3 text-xs space-y-1">
              <p className="text-muted-foreground">
                Login Email:{" "}
                <span className="font-semibold text-foreground">{passwordModalUser?.email}</span>
              </p>
              <p className="text-muted-foreground">
                Account Role:{" "}
                <span className="font-semibold text-foreground uppercase">
                  {ROLES.find((r) => r.value === passwordModalUser?.role)?.label ||
                    passwordModalUser?.role}
                </span>
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">
                  New Password <span className="text-destructive">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateModalPassword}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  <Sparkles className="size-3" /> Random Password
                </button>
              </div>
              <div className="relative">
                <input
                  value={modalNewPassword}
                  onChange={(e) => setModalNewPassword(e.target.value)}
                  type={showModalPassword ? "text" : "password"}
                  placeholder="Enter new password (minimum 4 characters)"
                  className={`${fieldClass} bg-background pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowModalPassword(!showModalPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title={showModalPassword ? "Hide password" : "Show password"}
                >
                  {showModalPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Once saved, the user can immediately sign in using this email and new password.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="rounded-xl border border-border bg-secondary/40 px-4 py-2 text-xs font-semibold hover:bg-secondary/70 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!modalNewPassword.trim() || modalNewPassword.trim().length < 4}
                onClick={handleQuickPasswordUpdate}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-40 cursor-pointer"
              >
                Save New Password
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
