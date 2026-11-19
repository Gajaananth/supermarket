"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Clock3, MapPin, Save, Store as StoreIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { api, describeApiError, unwrapApiResponse } from "@/lib/api/client";
import type { Store, StoreList } from "@/lib/api/models";
import { ErrorState, LoadingState, PageHeader, Surface } from "@/components/admin/States";

interface StoreSettings {
  id: string;
  code: string;
  name: string;
  openingTime: string;
  closingTime: string;
  serviceRadiusKm: number | string;
  minOrderAmount: number | string;
  freeDeliveryThreshold: number | string;
  cashHoldThreshold: number | string;
  cashHoldMaxHours: number;
  deliveryZones: Store["deliveryZones"];
}

interface SettingsForm {
  openingTime: string;
  closingTime: string;
  serviceRadiusKm: string;
  minOrderAmount: string;
  freeDeliveryThreshold: string;
  cashHoldThreshold: string;
  cashHoldMaxHours: string;
}

function formFromSettings(settings: StoreSettings): SettingsForm {
  return {
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
    serviceRadiusKm: String(settings.serviceRadiusKm),
    minOrderAmount: String(settings.minOrderAmount),
    freeDeliveryThreshold: String(settings.freeDeliveryThreshold),
    cashHoldThreshold: String(settings.cashHoldThreshold),
    cashHoldMaxHours: String(settings.cashHoldMaxHours),
  };
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const loadStores = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await api.GET("/api/v1/stores/admin");
      const list = unwrapApiResponse<StoreList>(result);
      setStores(list.stores);
      setSelectedId((current) => current && list.stores.some((store) => store.id === current)
        ? current
        : list.stores[0]?.id ?? "");
    } catch (error) {
      setLoadError(describeApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async (storeId: string) => {
    if (!storeId) {
      setSettings(null);
      setForm(null);
      return;
    }
    setSettingsLoading(true);
    setActionError("");
    try {
      const result = await api.GET("/api/v1/stores/{id}/settings", { params: { path: { id: storeId } } });
      const data = unwrapApiResponse<StoreSettings>(result);
      setSettings(data);
      setForm(formFromSettings(data));
    } catch (error) {
      setActionError(describeApiError(error));
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    void loadStores();
  }, []);

  useEffect(() => {
    void loadSettings(selectedId);
  }, [selectedId]);

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedId) ?? null,
    [selectedId, stores],
  );
  const activeCount = stores.filter((store) => store.isActive).length;

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form || !selectedId) return;
    setSaving(true);
    setActionError("");
    setNotice("");
    try {
      const result = await api.PATCH("/api/v1/stores/{id}/settings", {
        params: { path: { id: selectedId } },
        body: {
          openingTime: form.openingTime,
          closingTime: form.closingTime,
          serviceRadiusKm: Number(form.serviceRadiusKm),
          minOrderAmount: Number(form.minOrderAmount),
          freeDeliveryThreshold: Number(form.freeDeliveryThreshold),
          cashHoldThreshold: Number(form.cashHoldThreshold),
          cashHoldMaxHours: Number(form.cashHoldMaxHours),
        },
      });
      unwrapApiResponse<unknown>(result);
      setNotice("Store settings saved.");
      await loadSettings(selectedId);
    } catch (error) {
      setActionError(describeApiError(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleStoreStatus = async () => {
    if (!selectedStore) return;
    const nextStatus = !selectedStore.isActive;
    setSaving(true);
    setActionError("");
    setNotice("");
    try {
      const result = await api.PATCH("/api/v1/stores/{id}/status", {
        params: { path: { id: selectedStore.id } },
        body: { isActive: nextStatus },
      });
      unwrapApiResponse<unknown>(result);
      setStores((current) => current.map((store) =>
        store.id === selectedStore.id ? { ...store, isActive: nextStatus } : store
      ));
      setNotice(nextStatus ? "Store activated." : "Store deactivated. It will no longer be eligible for new orders or transfers.");
    } catch (error) {
      setActionError(describeApiError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Network operations"
        title="Store management"
        description="Review operating status and edit service hours, delivery coverage, order thresholds, and cash-hold settings."
        action={
          <div className="rounded-xl border border-white bg-white/90 px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-500">Active locations</p>
            <p className="font-heading text-lg font-extrabold text-buyme-navy">{loading ? "—" : `${activeCount} / ${stores.length}`}</p>
          </div>
        }
      />

      {notice && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900" role="status">{notice}</p>}
      {actionError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900" role="alert">{actionError}</p>}

      {loading ? (
        <LoadingState label="Loading store network…" />
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={() => void loadStores()} />
      ) : stores.length === 0 ? (
        <Surface><p className="text-sm text-slate-600">No stores are configured in the API.</p></Surface>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.75fr)_minmax(0,1.5fr)]">
          <Surface className="p-0">
            <div className="border-b border-slate-100 px-4 py-4">
              <h2 className="font-heading text-sm font-extrabold text-buyme-navy">Store locations</h2>
              <p className="mt-1 text-xs text-slate-500">Approximate area-level positions</p>
            </div>
            <div className="divide-y divide-slate-100">
              {stores.map((store) => (
                <button
                  type="button"
                  key={store.id}
                  onClick={() => {
                    setSelectedId(store.id);
                    setNotice("");
                    setActionError("");
                  }}
                  className={`w-full px-4 py-4 text-left transition hover:bg-slate-50 ${store.id === selectedId ? "bg-rose-50/70" : ""}`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block font-mono text-[10px] font-bold text-buyme-primary">{store.code}</span>
                      <span className="mt-1 block truncate text-sm font-bold text-buyme-navy">{store.name}</span>
                      <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={13} aria-hidden="true" /> {store.locality ?? store.address ?? "Batticaloa"}
                      </span>
                    </span>
                    <span className={`mt-1 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${store.isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {store.isActive ? "Active" : "Inactive"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </Surface>

          <div className="space-y-5">
            {!selectedStore ? (
              <Surface><p className="text-sm text-slate-600">Select a store to manage its settings.</p></Surface>
            ) : settingsLoading ? (
              <LoadingState label={`Loading ${selectedStore.name} settings…`} />
            ) : settings && form ? (
              <>
                <Surface>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-buyme-primary">
                        <StoreIcon size={20} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-mono text-xs font-bold text-buyme-primary">{settings.code}</p>
                        <h2 className="mt-1 font-heading text-lg font-extrabold text-buyme-navy">{settings.name}</h2>
                        <p className="mt-1 text-xs text-slate-500">{selectedStore.contactPhone ?? selectedStore.locality ?? "Batticaloa"}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={toggleStoreStatus}
                      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-extrabold transition disabled:opacity-50 ${selectedStore.isActive ? "border border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:text-red-800" : "bg-emerald-700 text-white hover:bg-emerald-800"}`}
                    >
                      {selectedStore.isActive ? <ToggleRight size={17} aria-hidden="true" /> : <ToggleLeft size={17} aria-hidden="true" />}
                      {selectedStore.isActive ? "Deactivate store" : "Activate store"}
                    </button>
                  </div>
                  {!selectedStore.isActive && (
                    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950" role="status">
                      This store is inactive. It is not available for new orders or transfer destinations.
                    </p>
                  )}
                </Surface>

                <Surface>
                  <div className="mb-5 flex items-center gap-2">
                    <Clock3 size={18} className="text-buyme-primary" aria-hidden="true" />
                    <div>
                      <h3 className="font-heading text-sm font-extrabold text-buyme-navy">Operational settings</h3>
                      <p className="mt-1 text-xs text-slate-500">Changes are saved to the API and audit logged.</p>
                    </div>
                  </div>
                  <form onSubmit={(event) => void saveSettings(event)} className="grid gap-4 sm:grid-cols-2">
                    <SettingField label="Opening time" id="opening-time">
                      <input id="opening-time" type="time" required value={form.openingTime} onChange={(event) => setForm({ ...form, openingTime: event.target.value })} className="setting-input" />
                    </SettingField>
                    <SettingField label="Closing time" id="closing-time">
                      <input id="closing-time" type="time" required value={form.closingTime} onChange={(event) => setForm({ ...form, closingTime: event.target.value })} className="setting-input" />
                    </SettingField>
                    <SettingField label="Service radius (km)" id="service-radius">
                      <input id="service-radius" type="number" min="0.1" max="500" step="0.1" required value={form.serviceRadiusKm} onChange={(event) => setForm({ ...form, serviceRadiusKm: event.target.value })} className="setting-input" />
                    </SettingField>
                    <SettingField label="Minimum order (LKR)" id="min-order">
                      <input id="min-order" type="number" min="0" max="99999999.99" step="0.01" required value={form.minOrderAmount} onChange={(event) => setForm({ ...form, minOrderAmount: event.target.value })} className="setting-input" />
                    </SettingField>
                    <SettingField label="Free-delivery threshold (LKR)" id="free-delivery">
                      <input id="free-delivery" type="number" min="0" max="99999999.99" step="0.01" required value={form.freeDeliveryThreshold} onChange={(event) => setForm({ ...form, freeDeliveryThreshold: event.target.value })} className="setting-input" />
                    </SettingField>
                    <SettingField label="Rider cash-hold threshold (LKR)" id="cash-threshold">
                      <input id="cash-threshold" type="number" min="0.01" max="99999999.99" step="0.01" required value={form.cashHoldThreshold} onChange={(event) => setForm({ ...form, cashHoldThreshold: event.target.value })} className="setting-input" />
                    </SettingField>
                    <SettingField label="Cash-hold window (hours)" id="cash-hours">
                      <input id="cash-hours" type="number" min="1" max="168" step="1" required value={form.cashHoldMaxHours} onChange={(event) => setForm({ ...form, cashHoldMaxHours: event.target.value })} className="setting-input" />
                    </SettingField>
                    <div className="flex items-end sm:justify-end">
                      <button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-buyme-primary px-4 text-sm font-extrabold text-white hover:bg-buyme-primary-deep disabled:opacity-50 sm:w-auto">
                        <Save size={16} aria-hidden="true" /> {saving ? "Saving…" : "Save settings"}
                      </button>
                    </div>
                  </form>
                </Surface>

                <Surface>
                  <h3 className="font-heading text-sm font-extrabold text-buyme-navy">Delivery zones</h3>
                  <p className="mt-1 text-xs text-slate-500">Zone pricing and free-delivery rules are configured per store.</p>
                  {settings.deliveryZones.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-600">No delivery zones are configured for this store.</p>
                  ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {settings.deliveryZones.map((zone) => (
                        <div key={zone.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-buyme-navy">{zone.name}</p>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${zone.isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>{zone.isActive ? "Active" : "Inactive"}</span>
                          </div>
                          <p className="mt-2 text-xs text-slate-600">Base fee: LKR {Number(zone.baseFee).toFixed(2)}</p>
                          <p className="mt-1 text-xs text-slate-600">Free delivery from: LKR {Number(zone.minOrderForFreeDelivery).toFixed(2)}</p>
                          <p className="mt-1 text-xs text-slate-500">Estimated delivery: {zone.estimatedDeliveryMins} min</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Surface>
              </>
            ) : (
              <ErrorState message="Store settings are unavailable." onRetry={() => void loadSettings(selectedId)} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SettingField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">{label}</label>
      {children}
    </div>
  );
}
