"use client";

import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import {
  UserPlus,
  Users,
  Database,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RefreshCw,
  PackagePlus,
  ShieldCheck,
  Mail,
  Building,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";

export const ManualDataEntryView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"users" | "retail">("users");

  // User form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Supply Chain Planner");
  const [department, setDepartment] = useState("Supply Chain & Logistics");
  const [phone, setPhone] = useState("");
  const [assignedLocation, setAssignedLocation] = useState("Chennai Metro Hub");
  const [accessTier, setAccessTier] = useState("OPERATOR");
  const [notes, setNotes] = useState("");

  // Retail record form state
  const [recordType, setRecordType] = useState<"product" | "inventory">("product");
  const [storeId, setStoreId] = useState("STORE_001");
  const [sku, setSku] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Groceries & Staples");
  const [sellingPrice, setSellingPrice] = useState("180.0");
  const [unitCost, setUnitCost] = useState("135.0");
  const [onHand, setOnHand] = useState("75");
  const [safetyStock, setSafetyStock] = useState("25");

  // Status & Feedback state
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storedUsers, setStoredUsers] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const fetchUsers = async () => {
    setLoadingList(true);
    try {
      const res = await api.getManualUsers();
      if (res.status === "success" && res.entries) {
        setStoredUsers(res.entries);
      }
    } catch (err: any) {
      console.error("Failed to fetch stored users:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.storeManualUser({
        full_name: fullName.trim(),
        email: email.trim(),
        role,
        department,
        phone: phone.trim() || undefined,
        assigned_location: assignedLocation,
        access_tier: accessTier,
        notes: notes.trim() || undefined,
      });

      if (res.status === "success") {
        setSuccessMessage(`User '${fullName}' permanently stored in Neon PostgreSQL!`);
        // Reset form
        setFullName("");
        setEmail("");
        setPhone("");
        setNotes("");
        fetchUsers();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to permanently store user details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) return;

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.storeRetailRecord({
        record_type: recordType,
        store_id: storeId,
        sku: sku.trim(),
        product_name: productName.trim() || undefined,
        category,
        selling_price_inr: parseFloat(sellingPrice) || 150.0,
        unit_cost_inr: parseFloat(unitCost) || 110.0,
        on_hand_units: parseInt(onHand, 10) || 50,
        safety_stock_units: parseInt(safetyStock, 10) || 20,
      });

      if (res.status === "success") {
        setSuccessMessage(`Retail record for SKU '${sku}' saved permanently to Neon DB.`);
        setSku("");
        setProductName("");
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to store retail record.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (entryId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user entry?")) return;
    try {
      await api.deleteManualUser(entryId);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to delete user entry.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-hairline gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
              Persistent Records Registry
            </span>
            <span className="text-muted text-xs">•</span>
            <span className="text-muted text-xs font-mono">Neon PostgreSQL Permanent Persistence</span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-ink mt-1">
            Manual Data Entry &amp; User Directory
          </h1>
          <p className="text-sm text-body mt-1">
            Enter and store permanent operational user credentials, roles, and on-demand retail inventory records directly into the cloud database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-md border border-hairline bg-surface-card p-0.5">
            <button
              onClick={() => setActiveSubTab("users")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition flex items-center gap-1.5 ${
                activeSubTab === "users"
                  ? "bg-surface-dark text-on-dark shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Directory</span>
            </button>
            <button
              onClick={() => setActiveSubTab("retail")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition flex items-center gap-1.5 ${
                activeSubTab === "retail"
                  ? "bg-surface-dark text-on-dark shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>Manual SKU &amp; Stock</span>
            </button>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loadingList}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas hover:bg-surface-card border border-hairline rounded-md text-xs font-mono text-ink transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin text-primary" : "text-muted"}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-status-success/15 border border-status-success/40 rounded-lg text-xs text-status-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-status-error/10 border border-status-error/30 rounded-lg text-xs text-status-error flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SUB-TAB 1: USER DETAILS MANUAL ENTRY & REGISTRY */}
      {activeSubTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Add New User */}
          <div className="lg:col-span-5 bg-surface-card border border-hairline rounded-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                <h2 className="font-serif text-xl font-medium text-ink">Add User Credentials</h2>
              </div>
              <span className="text-[10px] font-mono text-muted uppercase">Permanent DB Storage</span>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                  Full Legal / Operational Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vigneshwaran SP"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-ink font-sans focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                  Corporate Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vignesh@enterprise-retail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-ink font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                    Operational Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2.5 py-2 bg-canvas border border-hairline rounded-md text-ink text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="VP Operations">VP Operations</option>
                    <option value="Retail Ops Manager">Retail Ops Manager</option>
                    <option value="Supply Chain Planner">Supply Chain Planner</option>
                    <option value="Lead Data Scientist">Lead Data Scientist</option>
                    <option value="Compliance Auditor">Compliance Auditor</option>
                    <option value="Store Operator">Store Operator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                    Access Tier
                  </label>
                  <select
                    value={accessTier}
                    onChange={(e) => setAccessTier(e.target.value)}
                    className="w-full px-2.5 py-2 bg-canvas border border-hairline rounded-md text-ink text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="ADMINISTRATOR">Administrator</option>
                    <option value="EXECUTIVE">Executive Tier</option>
                    <option value="PLANNER">Planner Tier</option>
                    <option value="OPERATOR">Operator Tier</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Merchandising"
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-ink focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                    Phone / Contact
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91-9876543210"
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-ink font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                  Assigned Store Hub / Regional Node
                </label>
                <input
                  type="text"
                  value={assignedLocation}
                  onChange={(e) => setAssignedLocation(e.target.value)}
                  placeholder="Chennai Central Terminal Hub"
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                  Operational Notes &amp; Clearances
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Granted autonomous AI override clearances and inventory rebalancing approval."
                  className="w-full p-2.5 bg-canvas border border-hairline rounded-md text-ink font-sans focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary hover:bg-primary-active text-on-primary rounded-md font-medium text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? "Persisting to Neon DB..." : "Save Permanently to Neon Database"}</span>
              </button>
            </form>
          </div>

          {/* Right Table: Stored Users in Neon DB */}
          <div className="lg:col-span-7 bg-surface-card border border-hairline rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
                  Live Persistent Registry
                </div>
                <h2 className="font-serif text-xl font-medium text-ink mt-0.5">
                  Stored User Details ({storedUsers.length})
                </h2>
              </div>
              <span className="text-xs font-mono text-accent-teal flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
                Neon Connected
              </span>
            </div>

            {loadingList ? (
              <div className="py-12 text-center text-xs text-muted font-mono">
                Querying Neon PostgreSQL user registry...
              </div>
            ) : storedUsers.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted">
                No custom user entries recorded yet. Add your first entry using the form.
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[540px] pr-1">
                {storedUsers.map((u) => (
                  <div
                    key={u.entry_id}
                    className="p-4 rounded-md bg-canvas border border-hairline hover:border-primary/40 transition flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink text-sm">{u.full_name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-card border border-hairline text-primary">
                          {u.role}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-surface-dark text-on-dark">
                          {u.access_tier}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted font-mono pt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-muted" />
                          {u.email}
                        </span>
                        {u.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted" />
                            {u.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-muted" />
                          {u.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted" />
                          {u.assigned_location}
                        </span>
                      </div>

                      {u.notes && (
                        <p className="text-xs text-body italic pt-1 border-t border-hairline/50 mt-1.5">
                          &ldquo;{u.notes}&rdquo;
                        </p>
                      )}

                      <div className="text-[10px] font-mono text-muted/70 pt-0.5">
                        Permanent ID: {u.entry_id} • Created: {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Active"}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteUser(u.entry_id)}
                      className="text-muted hover:text-status-error p-1.5 rounded transition"
                      title="Permanently Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MANUAL RETAIL DATA ENTRY */}
      {activeSubTab === "retail" && (
        <div className="bg-surface-card border border-hairline rounded-lg p-6 max-w-2xl mx-auto space-y-5">
          <div className="border-b border-hairline pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
              Manual ERP Inventory Update
            </span>
            <h2 className="font-serif text-xl font-medium text-ink mt-0.5">
              Record SKU or Store Inventory Position
            </h2>
            <p className="text-xs text-muted mt-1">
              Add or update product catalog parameters and store stock buffers permanently in Neon PostgreSQL.
            </p>
          </div>

          <form onSubmit={handleRetailSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                  Entry Type
                </label>
                <select
                  value={recordType}
                  onChange={(e: any) => setRecordType(e.target.value)}
                  className="w-full px-2.5 py-2 bg-canvas border border-hairline rounded-md text-ink text-xs focus:outline-none focus:border-primary"
                >
                  <option value="product">New SKU Catalog Product</option>
                  <option value="inventory">Store Inventory Snapshot</option>
                </select>
              </div>

              <div>
                <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                  Target Store Node
                </label>
                <input
                  type="text"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  placeholder="STORE_001"
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-ink font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                  SKU Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. SKU_DM_9999"
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-ink font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Organic Sunflower Cooking Oil 1L"
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-ink focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                  Selling Price MRP (INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-ink font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                  Unit Cost Price (INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-ink font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {recordType === "inventory" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                    On-Hand Units
                  </label>
                  <input
                    type="number"
                    value={onHand}
                    onChange={(e) => setOnHand(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-ink font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-muted font-mono uppercase tracking-wider mb-1">
                    Safety Stock Buffer
                  </label>
                  <input
                    type="number"
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-md text-ink font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary-active text-on-primary rounded-md font-medium text-xs transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Database className="w-4 h-4" />
              <span>{loading ? "Persisting Record..." : "Store Retail Record Permanently"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
