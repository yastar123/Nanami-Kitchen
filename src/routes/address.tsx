import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronRight, Compass, Loader2, MapPin, Search } from "lucide-react";
import { actions, deliveryFeeFor, rupiah, useStore } from "@/lib/store";
import { haversineKm, parseLatLng } from "@/lib/geo";
import mapImg from "@/assets/checkout-map.jpg";

export const Route = createFileRoute("/address")({
  head: () => ({
    meta: [
      { title: "Delivery Address — Nanami Kitchen" },
      {
        name: "description",
        content: "Set your delivery address, delivery radius and see the estimated delivery fee.",
      },
      { property: "og:title", content: "Delivery Address — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Set your delivery address and delivery radius.",
      },
    ],
  }),
  component: AddressPage,
});

function AddressPage() {
  const navigate = useNavigate();
  const { profile, settings, orderType, distanceKm, customerMapsUrl } = useStore((s) => ({
    profile: s.profile,
    settings: s.settings,
    orderType: s.orderType,
    distanceKm: s.distanceKm,
    customerMapsUrl: s.customerMapsUrl,
  }));

  const [mapsUrl, setMapsUrl] = useState(customerMapsUrl);
  const [mapsError, setMapsError] = useState("");
  const [locating, setLocating] = useState(false);

  function applyMapsPoint() {
    const p = parseLatLng(mapsUrl);
    if (!p) {
      setMapsError(
        "Location coordinates not recognized. Please paste a Google Maps link or coordinates (lat, lng).",
      );
      return;
    }
    setMapsError("");
    const km = Math.max(
      1,
      Math.round(
        haversineKm({ lat: settings.storeLat, lng: settings.storeLng }, p) *
          (settings.routeFactor || 1) *
          10,
      ) / 10,
    );
    actions.setCustomerPoint(mapsUrl.trim(), km);
  }

  function requestCurrentLocation() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setMapsError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setMapsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const googleMapsLink = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        setMapsUrl(googleMapsLink);
        const km = Math.max(
          1,
          Math.round(
            haversineKm({ lat: settings.storeLat, lng: settings.storeLng }, { lat, lng }) *
              (settings.routeFactor || 1) *
              10,
          ) / 10,
        );
        actions.setCustomerPoint(googleMapsLink, km);
        if (!address.trim()) {
          setAddress(`Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1 /* PERMISSION_DENIED */) {
          setMapsError(
            "Location access was denied. Please enable permission in your browser or enter your address manually.",
          );
        } else {
          setMapsError(`Unable to fetch location: ${err.message}`);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const [query, setQuery] = useState("");
  const [address, setAddress] = useState(profile.address || "");
  const radius = distanceKm;
  const setRadius = (km: number) => actions.setDistanceKm(km);
  const [editingAddress, setEditingAddress] = useState(false);
  const [radiusOpen, setRadiusOpen] = useState(false);

  const estimatedFee = deliveryFeeFor(
    settings,
    orderType === "pickup" ? "delivery" : orderType,
    radius,
  );

  function save() {
    actions.saveAddress(address);
    actions.updateProfile({ address });
    navigate({ to: "/checkout" });
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground flex justify-center selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-md min-h-screen bg-background relative sm:shadow-2xl sm:border-x sm:border-border/40 px-4 pt-5 pb-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                navigate({ to: "/checkout" });
              }
            }}
            aria-label="Back"
            className="text-foreground"
          >
            <ArrowLeft className="size-6" />
          </button>
          <h1 className="text-2xl font-semibold">Delivery Address</h1>
        </div>

        {/* Search bar */}
        <label className="mt-6 flex items-center gap-3 rounded-full border border-input bg-secondary/40 px-4 py-3.5">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) setAddress(query.trim());
            }}
            placeholder="Search Street, Building, or Landmark..."
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        {/* Map */}
        <div className="relative mt-4 overflow-hidden rounded-2xl border border-border">
          <img
            src={mapImg}
            alt="Delivery area map"
            width={1024}
            height={640}
            className="h-64 w-full object-cover"
          />
          {/* Center pin */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <MapPin
              className="size-12 -translate-y-3 fill-primary text-primary drop-shadow-[0_6px_8px_rgba(0,0,0,0.45)]"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Google Maps Coordinates & Auto Geolocation */}
        <section className="mt-4 rounded-2xl border border-border bg-card px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-card-foreground">
              Your Google Maps Location
            </h2>
            <button
              type="button"
              onClick={requestCurrentLocation}
              disabled={locating}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50"
            >
              {locating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Compass className="size-3.5" />
              )}
              <span>{locating ? "Locating..." : "Use Current Location"}</span>
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Allow location access or paste your Google Maps link to calculate delivery fee
            automatically.
          </p>
          <input
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/?q=-22.5609,17.0658"
            className="mt-3 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          {mapsError ? <p className="mt-1 text-xs text-destructive">{mapsError}</p> : null}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={applyMapsPoint}
              className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90"
            >
              Calculate Distance & Fee
            </button>
          </div>
        </section>

        {/* Details card */}
        <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="px-5 py-5">
            {editingAddress ? (
              <div className="space-y-2">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => setEditingAddress(false)}
                  className="text-sm font-medium text-primary"
                >
                  Done
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingAddress(true)}
                className="w-full text-left text-base font-medium leading-relaxed text-card-foreground"
              >
                {address}
              </button>
            )}
          </div>

          <div className="border-t border-border" />

          {/* Delivery Radius row */}
          <button
            onClick={() => setRadiusOpen((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-5 text-left"
          >
            <span>
              <span className="block text-base font-medium text-card-foreground">
                Delivery Radius
              </span>
              <span className="mt-1 block text-lg text-card-foreground">{radius} km</span>
            </span>
            <ChevronRight
              className={`size-6 text-muted-foreground transition-transform ${radiusOpen ? "rotate-90" : ""}`}
            />
          </button>
          {radiusOpen && (
            <div className="px-5 pb-5">
              <input
                type="range"
                min={1}
                max={settings.maxRadiusKm}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                aria-label="Delivery radius in kilometers"
                className="w-full accent-[var(--primary)]"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Max delivery range: {settings.maxRadiusKm} km
              </p>
            </div>
          )}

          <div className="border-t border-border" />

          {/* Estimated Delivery Fee row */}
          <div className="flex w-full items-center justify-between px-5 py-5">
            <span>
              <span className="block text-base font-medium text-card-foreground">
                Estimated Delivery Fee
              </span>
              <span className="mt-1 block text-lg text-card-foreground">
                {rupiah(estimatedFee)}{" "}
                <span className="text-sm text-muted-foreground">
                  ({rupiah(settings.feePerKm)} per km)
                </span>
              </span>
            </span>
            <ChevronRight className="size-6 text-muted-foreground" />
          </div>
        </section>

        {/* Save button */}
        <button
          onClick={save}
          disabled={!address.trim()}
          className="mt-6 w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-[0_8px_24px_-8px_var(--color-primary)] disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
        >
          Save Address
        </button>
      </div>
    </div>
  );
}
