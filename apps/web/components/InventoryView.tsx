"use client";

import React, { useState, useEffect } from "react";
import { Package, Search, Filter, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { api } from "../lib/api";

interface InventoryProps {
  onSelectAction?: (storeId: string, sku: string) => void;
}

export const InventoryView: React.FC<InventoryProps> = ({ onSelectAction }) => {
  const [positions, setPositions] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStores = async () => {
    try {
      const res = await api.getStores();
      setStores(res || []);
    } catch (err) {
      console.error("Stores fetch error:", err);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.getInventoryPositions(selectedStore || undefined, selectedStatus || undefined);
      setPositions(res || []);
    } catch (err) {
      console.error("Inventory positions fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [selectedStore, selectedStatus]);

  const filteredPositions = positions.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.product_name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.store_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
            Operational Intelligence
          </span>
          <h1 className="font-serif text-3xl font-normal text-ink mt-0.5">Inventory Positions &amp; Stockout Radar</h1>
          <p className="text-sm text-body mt-1 max-w-3xl">
            Live audited inventory balance across {stores.length || "all"} distribution stores. Formula: 
            <code className="text-xs font-mono bg-surface-card px-1.5 py-0.5 rounded ml-1 text-ink">
              Net Position = On-Hand + Confirmed Inbound - Reserved
            </code>
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="bg-surface-card hover:bg-surface-cream-strong border border-hairline text-ink px-3.5 py-2 rounded-md text-xs font-medium transition flex items-center gap-1.5 self-start md:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : "text-muted"}`} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Filter and Search Bar (100% Dynamic from active dataset) */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SKU, product, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-canvas border border-hairline pl-9 pr-3 py-1.5 rounded-md text-xs text-ink placeholder:text-muted focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-surface-card border border-hairline px-3 py-1.5 rounded-md text-xs font-mono text-ink focus:outline-none focus:border-primary"
          >
            <option value="">All Stores ({stores.length} Nodes)</option>
            {stores.map((s) => (
              <option key={s.store_id} value={s.store_id}>
                {s.store_name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface-card border border-hairline px-3 py-1.5 rounded-md text-xs font-mono text-ink focus:outline-none focus:border-primary"
          >
            <option value="">All Health Statuses</option>
            <option value="IMMINENT_STOCKOUT">Imminent Stockout</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="HEALTHY">Healthy</option>
            <option value="EXCESS_INVENTORY">Excess Inventory</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-card border-b border-hairline text-muted font-mono uppercase text-[10px]">
                <th className="py-3 px-4 font-medium">Store &amp; SKU</th>
                <th className="py-3 px-3 font-medium">Product Name</th>
                <th className="py-3 px-2 font-medium">Category</th>
                <th className="py-3 px-2 font-medium text-right">On-Hand</th>
                <th className="py-3 px-2 font-medium text-right">Reserved</th>
                <th className="py-3 px-2 font-medium text-right">Inbound</th>
                <th className="py-3 px-2 font-medium text-right font-bold text-ink">Net Position</th>
                <th className="py-3 px-2 font-medium text-right">Safety Stock</th>
                <th className="py-3 px-2 font-medium text-right">ROP</th>
                <th className="py-3 px-2 font-medium text-right">Days of Supply</th>
                <th className="py-3 px-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredPositions.slice(0, 40).map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-card transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-ink">
                    <div>{row.store_name}</div>
                    <div className="text-[10px] text-muted">{row.sku}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-ink max-w-xs truncate">
                    {row.product_name}
                  </td>
                  <td className="py-3 px-2 text-muted">{row.category}</td>
                  <td className="py-3 px-2 text-right font-mono font-semibold text-ink">{row.on_hand_units}u</td>
                  <td className="py-3 px-2 text-right font-mono text-muted">{row.reserved_units}u</td>
                  <td className="py-3 px-2 text-right font-mono text-status-success font-semibold">
                    {row.confirmed_incoming_units > 0 ? `+${row.confirmed_incoming_units}u` : "0"}
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-primary text-sm">
                    {row.net_inventory_position}u
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-muted">{row.safety_stock_units}u</td>
                  <td className="py-3 px-2 text-right font-mono text-muted">{row.reorder_point_units}u</td>
                  <td className="py-3 px-2 text-right font-mono font-medium text-ink">
                    <span className={row.days_of_supply < 3 ? "text-status-error font-bold" : ""}>
                      {row.days_of_supply}d
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-canvas border border-hairline text-ink">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          row.inventory_status === "IMMINENT_STOCKOUT"
                            ? "bg-status-error"
                            : row.inventory_status === "LOW_STOCK"
                            ? "bg-status-warning"
                            : row.inventory_status === "EXCESS_INVENTORY"
                            ? "bg-accent-teal"
                            : "bg-status-success"
                        }`}
                      />
                      <span>{row.inventory_status?.replace(/_/g, " ")}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
