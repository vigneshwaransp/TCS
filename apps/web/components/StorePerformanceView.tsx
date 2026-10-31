"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldAlert,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { api } from "../lib/api";

export const StorePerformanceView: React.FC = () => {
  const [storesData, setStoresData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);
  const [skuSearchQuery, setSkuSearchQuery] = useState<string>("");

  const fetchStorePerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStoresPerformance();
      setStoresData(data || []);
      if (data && data.length > 0 && !expandedStoreId) {
        setExpandedStoreId(data[0].store_id);
      }
    } catch (err: any) {
      console.error("Failed to load store performance:", err);
      setError(err?.message || "Failed to load dynamic store performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorePerformance();
  }, []);

  // Filtered stores
  const filteredStores = storesData.filter((s) => {
    const matchesSearch =
      s.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.locality.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === "ALL" || s.health_badge === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Network Totals calculated dynamically from live database records
  const networkTotals = storesData.reduce(
    (acc, s) => ({
      stock: acc.stock + (s.stock || 0),
      demand: acc.demand + (s.demand || 0),
      required: acc.required + (s.required || 0),
      inventory: acc.inventory + (s.inventory || 0),
      stockoutSkus: acc.stockoutSkus + (s.stockout_count || 0) + (s.imminent_count || 0),
      totalSkus: acc.totalSkus + (s.sku_count || 0),
    }),
    { stock: 0, demand: 0, required: 0, inventory: 0, stockoutSkus: 0, totalSkus: 0 }
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
            Network Operations
          </span>
          <h1 className="font-serif text-3xl font-normal text-ink mt-0.5">
            Store Performance &amp; Inventory Balancing
          </h1>
          <p className="text-sm text-muted mt-1 max-w-3xl">
            Real-time store performance across <strong>Stock</strong> (On-Hand), <strong>Demand</strong> (7-Day Forecast),{" "}
            <strong>Required</strong> (Replenishment Deficit), and <strong>Net Inventory</strong>. All metrics dynamically computed from live Neon DB records.
          </p>
        </div>

        <button
          onClick={fetchStorePerformance}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-card hover:bg-surface-soft border border-hairline text-xs font-mono text-ink transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Live DB</span>
        </button>
      </div>

      {/* Network KPI Summary Strip (Live Aggregation) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-card border border-hairline rounded-xl p-4">
          <div className="text-[10px] font-mono uppercase text-muted">Network Total Stock</div>
          <div className="text-2xl font-serif font-normal text-ink mt-1">
            {networkTotals.stock.toLocaleString()} <span className="text-xs font-mono text-muted">units</span>
          </div>
          <div className="text-[11px] font-mono text-muted mt-0.5">Physical on-hand across all stores</div>
        </div>

        <div className="bg-surface-card border border-hairline rounded-xl p-4">
          <div className="text-[10px] font-mono uppercase text-muted">7-Day Forecast Demand</div>
          <div className="text-2xl font-serif font-normal text-primary mt-1">
            {networkTotals.demand.toLocaleString()} <span className="text-xs font-mono text-muted">units</span>
          </div>
          <div className="text-[11px] font-mono text-muted mt-0.5">Aggregated predictive customer pull</div>
        </div>

        <div className="bg-surface-card border border-hairline rounded-xl p-4">
          <div className="text-[10px] font-mono uppercase text-muted">Total Required Replenishment</div>
          <div className="text-2xl font-serif font-normal text-status-warning mt-1">
            {networkTotals.required.toLocaleString()} <span className="text-xs font-mono text-muted">units</span>
          </div>
          <div className="text-[11px] font-mono text-muted mt-0.5">Safety buffer target deficit</div>
        </div>

        <div className="bg-surface-card border border-hairline rounded-xl p-4">
          <div className="text-[10px] font-mono uppercase text-muted">Net Inventory Position</div>
          <div className="text-2xl font-serif font-normal text-accent-teal mt-1">
            {networkTotals.inventory.toLocaleString()} <span className="text-xs font-mono text-muted">units</span>
          </div>
          <div className="text-[11px] font-mono text-muted mt-0.5">On-hand + incoming − reserved</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-card border border-hairline p-3 rounded-lg text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted" />
          <input
            type="text"
            placeholder="Search store name, locality, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-canvas border border-hairline rounded-md pl-8 pr-3 py-1.5 text-xs text-ink font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[11px]">
          <span className="text-muted">Status:</span>
          {(["ALL", "CRITICAL_DEFICIT", "NEEDS_REBALANCING", "BALANCED_HEALTH"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-2.5 py-1 rounded transition ${
                selectedStatusFilter === st
                  ? "bg-primary text-white font-semibold"
                  : "bg-canvas border border-hairline text-muted hover:text-ink"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Store Performance Matrix Table */}
      <div className="bg-canvas border border-hairline rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-hairline bg-surface-card flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-medium text-ink">Store Network Performance Matrix</h2>
            <p className="text-xs text-muted">Click any store row to drill down into SKU-level stock, demand, required, and inventory.</p>
          </div>
          <span className="font-mono text-xs text-primary font-medium">
            {filteredStores.length} Stores Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-muted font-mono uppercase text-[10px] bg-surface-soft">
                <th className="py-3 px-4 font-medium">Store &amp; Location</th>
                <th className="py-3 px-4 font-medium">Store Format</th>
                <th className="py-3 px-4 font-medium text-right text-ink font-bold">Stock (On-Hand)</th>
                <th className="py-3 px-4 font-medium text-right text-primary font-bold">7D Demand</th>
                <th className="py-3 px-4 font-medium text-right text-status-warning font-bold">Required</th>
                <th className="py-3 px-4 font-medium text-right text-accent-teal font-bold">Net Inventory</th>
                <th className="py-3 px-4 font-medium text-right">Avg DOS</th>
                <th className="py-3 px-4 font-medium text-center">Health Status</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredStores.map((store) => {
                const isExpanded = expandedStoreId === store.store_id;
                return (
                  <React.Fragment key={store.store_id}>
                    <tr
                      onClick={() => setExpandedStoreId(isExpanded ? null : store.store_id)}
                      className={`hover:bg-surface-card transition cursor-pointer ${
                        isExpanded ? "bg-surface-card font-medium" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-ink">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <div>
                            <div className="font-serif text-sm font-semibold text-ink">{store.store_name}</div>
                            <div className="text-[10px] text-muted font-mono">
                              {store.store_id} • {store.locality}, {store.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted text-xs">
                        {store.store_type}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm font-bold text-ink">
                        {store.stock.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm font-bold text-primary">
                        {store.demand.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm font-bold text-status-warning">
                        {store.required.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm font-bold text-accent-teal">
                        {store.inventory.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-muted">
                        {store.avg_days_of_supply}d
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                            store.health_badge === "CRITICAL_DEFICIT"
                              ? "bg-status-error text-white"
                              : store.health_badge === "NEEDS_REBALANCING"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-green-100 text-green-800 border border-green-300"
                          }`}
                        >
                          {store.health_badge.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="p-1 rounded hover:bg-surface-soft text-muted hover:text-ink">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Store SKU Breakdown Drilldown */}
                    {isExpanded && (
                      <tr className="bg-surface-soft/60">
                        <td colSpan={9} className="p-4">
                          <div className="bg-canvas border border-hairline rounded-lg p-4 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-serif font-medium text-ink text-sm">
                                  {store.store_name} SKU Breakdown
                                </span>
                                <span className="text-[11px] font-mono text-muted">
                                  ({store.skus?.length || 0} Assorted Products)
                                </span>
                              </div>
                              <input
                                type="text"
                                placeholder="Filter SKUs in this store..."
                                value={skuSearchQuery}
                                onChange={(e) => setSkuSearchQuery(e.target.value)}
                                className="bg-surface-card border border-hairline px-2.5 py-1 rounded text-xs font-mono text-ink w-60"
                              />
                            </div>

                            <div className="overflow-x-auto max-h-96">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b border-hairline text-muted font-mono uppercase text-[9px]">
                                    <th className="py-2 px-2 font-medium">SKU ID</th>
                                    <th className="py-2 px-2 font-medium">Product Name</th>
                                    <th className="py-2 px-2 font-medium">Category</th>
                                    <th className="py-2 px-2 font-medium text-right text-ink font-bold">Stock</th>
                                    <th className="py-2 px-2 font-medium text-right text-primary font-bold">7D Demand</th>
                                    <th className="py-2 px-2 font-medium text-right text-status-warning font-bold">Required</th>
                                    <th className="py-2 px-2 font-medium text-right text-accent-teal font-bold">Net Inventory</th>
                                    <th className="py-2 px-2 font-medium text-right">DOS</th>
                                    <th className="py-2 px-2 font-medium text-center">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-hairline">
                                  {store.skus
                                    ?.filter(
                                      (k: any) =>
                                        k.sku.toLowerCase().includes(skuSearchQuery.toLowerCase()) ||
                                        k.product_name.toLowerCase().includes(skuSearchQuery.toLowerCase()) ||
                                        k.category.toLowerCase().includes(skuSearchQuery.toLowerCase())
                                    )
                                    .slice(0, 30)
                                    .map((item: any) => (
                                      <tr key={item.sku} className="hover:bg-surface-card transition">
                                        <td className="py-2 px-2 font-mono text-[11px] text-muted">{item.sku}</td>
                                        <td className="py-2 px-2 text-ink font-medium">{item.product_name}</td>
                                        <td className="py-2 px-2 text-muted text-[11px]">{item.category}</td>
                                        <td className="py-2 px-2 text-right font-mono font-bold text-ink">{item.stock}</td>
                                        <td className="py-2 px-2 text-right font-mono font-bold text-primary">{item.demand_7d}</td>
                                        <td className="py-2 px-2 text-right font-mono font-bold text-status-warning">{item.required}</td>
                                        <td className="py-2 px-2 text-right font-mono font-bold text-accent-teal">{item.inventory}</td>
                                        <td className="py-2 px-2 text-right font-mono text-muted">{item.days_of_supply}d</td>
                                        <td className="py-2 px-2 text-center">
                                          <span
                                            className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                                              item.status === "IMMINENT_STOCKOUT" || item.status === "STOCKOUT"
                                                ? "bg-red-100 text-red-700 font-bold"
                                                : item.status === "LOW_STOCK"
                                                ? "bg-amber-100 text-amber-700"
                                                : item.status === "EXCESS_INVENTORY"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-green-100 text-green-700"
                                            }`}
                                          >
                                            {item.status.replace(/_/g, " ")}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};