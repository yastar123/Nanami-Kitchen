import { useState, useMemo } from "react";
import {
  UserPlus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Star,
  Search,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { actions, uid, useStore, type Account } from "@/lib/store";
import { SectionCard, fieldClass } from "./DashboardShell";

export function CustomerPanel() {
  const accounts = useStore((s) => s.accounts);
  const customers = useMemo(() => {
    return accounts.filter((a) => !a.role || a.role === "user");
  }, [accounts]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [points, setPoints] = useState(0);

  // Search & Pagination states
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4; // Exactly 4 data cards per pagination as requested

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      const matchName = (c.name || "").toLowerCase().includes(q);
      const matchEmail = (c.email || "").toLowerCase().includes(q);
      const matchPhone = (c.phone || "").toLowerCase().includes(q);
      const matchAddress = (c.address || "").toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchAddress;
    });
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedCustomers = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCustomers, safePage]);

  const save = () => {
    const acc: Account = {
      id: editingId || "cust-" + uid(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      addresses: address.trim() ? [address.trim()] : [],
      points: Number(points) || 0,
      password: "password123", // Default password for new manual entries
      role: "user",
    };

    actions.saveAccount(acc);
    reset();
  };

  const reset = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setPoints(0);
  };

  const edit = (a: Account) => {
    setEditingId(a.id);
    setName(a.name);
    setEmail(a.email);
    setPhone(a.phone);
    setAddress(a.address || "");
    setPoints(a.points || 0);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_1fr] xl:items-start">
      <SectionCard
        title={editingId ? "Edit Customer" : "Add New Customer"}
        description={
          editingId ? "Modify customer profile details." : "Register a new customer manually."
        }
      >
        <label className="block text-xs text-muted-foreground">
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </label>
        <label className="block text-xs text-muted-foreground">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Phone number
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Default Address
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Loyalty Points
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className={fieldClass}
          />
        </label>

        <div className="flex gap-2 pt-1">
          <button
            disabled={!name.trim() || !email.trim()}
            onClick={save}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40 cursor-pointer"
          >
            {editingId ? <Pencil className="size-4" /> : <UserPlus className="size-4" />}
            {editingId ? "Update Customer" : "Add Customer"}
          </button>
          {editingId && (
            <button
              onClick={reset}
              className="px-4 rounded-xl border border-border bg-secondary/40 text-sm font-bold cursor-pointer hover:bg-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </SectionCard>

      <div className="space-y-4">
        <SectionCard
          title="Customer List"
          description={`Total ${customers.length} registered customers.`}
        >
          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search customers by name, email, phone, or address..."
              className="w-full rounded-xl border border-input bg-secondary/30 pl-9 pr-8 py-2 text-xs outline-none focus:border-primary"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="grid gap-3">
            {paginatedCustomers.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="size-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground truncate">{c.name}</h4>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Mail className="size-3" /> {c.email}
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Phone className="size-3" /> {c.phone}
                        </div>
                      )}
                      {c.address && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <MapPin className="size-3" /> {c.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-lg">
                    <Star className="size-3 text-primary fill-primary" />
                    <span className="text-xs font-bold">{c.points || 0} pts</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => edit(c)}
                      className="p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors cursor-pointer"
                      title="Edit Customer"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete customer ${c.name}? This cannot be undone.`)) {
                          actions.deleteAccount(c.id);
                        }
                      }}
                      className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors cursor-pointer"
                      title="Delete Customer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="py-12 text-center rounded-xl border border-dashed border-border p-6">
                <Users className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-semibold text-foreground">No customers found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search ? "Try a different search keyword." : "No registered customers yet."}
                </p>
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1 text-xs font-semibold hover:bg-secondary/40 cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination Controls (4 data cards per page) */}
          {filteredCustomers.length > ITEMS_PER_PAGE && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border mt-4">
              <p className="text-[11px] text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(safePage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(safePage * ITEMS_PER_PAGE, filteredCustomers.length)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{filteredCustomers.length}</span>{" "}
                customers
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft className="size-3.5" /> Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                    if (
                      totalPages > 5 &&
                      num !== 1 &&
                      num !== totalPages &&
                      Math.abs(num - safePage) > 1
                    ) {
                      if (num === 2 || num === totalPages - 1) {
                        return (
                          <span key={num} className="px-1 text-xs text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCurrentPage(num)}
                        className={`size-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          safePage === num
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
