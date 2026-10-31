"use client";

import React from "react";
import { Truck, MapPin, Building2, Clock, ShieldCheck, ArrowRight, DollarSign } from "lucide-react";

export const LogisticsView: React.FC = () => {
  const suppliers = [
    {
      id: "SUP_001",
      name: "South India Agro Foods & Grains Ltd",
      city: "Kanchipuram, Tamil Nadu",
      leadTime: "4 Days",
      reliability: "94%",
      moq: "100 Units",
      deliveryRate: "₹1,200 (₹18/km)",
    },
    {
      id: "SUP_002",
      name: "Coromandel Edible Oils & Fats Corp",
      city: "Chennai, Tamil Nadu",
      leadTime: "3 Days",
      reliability: "96%",
      moq: "80 Units",
      deliveryRate: "₹950 (₹15/km)",
    },
    {
      id: "SUP_003",
      name: "Nilgiri Beverages & Dairy Producers",
      city: "Coimbatore, Tamil Nadu",
      leadTime: "5 Days",
      reliability: "91%",
      moq: "120 Units",
      deliveryRate: "₹1,800 (₹22/km)",
    },
    {
      id: "SUP_004",
      name: "Madras Consumer Hygiene & Home Care",
      city: "Sriperumbudur, Tamil Nadu",
      leadTime: "3 Days",
      reliability: "97%",
      moq: "60 Units",
      deliveryRate: "₹850 (₹16/km)",
    },
    {
      id: "SUP_005",
      name: "Deccan Spice Mills & Packaged Goods",
      city: "Madurai, Tamil Nadu",
      leadTime: "6 Days",
      reliability: "89%",
      moq: "50 Units",
      deliveryRate: "₹2,100 (₹20/km)",
    },
  ];

  const routes = [
    {
      orig: "DMart Chromepet (STORE_002)",
      dest: "DMart Velachery (STORE_001)",
      dist: "14.2 km",
      time: "52 min",
      cost: "₹762.40",
      arterial: "Grand Southern Trunk (GST) Road & Inner Ring Rd",
      capacity: "1,500 units (Tata Ace LCV)",
      status: "ACTIVE_RECOMMENDED",
    },
    {
      orig: "DMart Madipakkam (STORE_004)",
      dest: "DMart Velachery (STORE_001)",
      dist: "4.8 km",
      time: "27 min",
      cost: "₹555.60",
      arterial: "Medavakkam Main Road",
      capacity: "1,500 units (Tata Ace LCV)",
      status: "AVAILABLE",
    },
    {
      orig: "DMart Virugambakkam (STORE_003)",
      dest: "DMart Velachery (STORE_001)",
      dist: "12.8 km",
      time: "48 min",
      cost: "₹731.60",
      arterial: "Arcot Road & 100ft Inner Ring Rd",
      capacity: "1,500 units (Tata Ace LCV)",
      status: "AVAILABLE",
    },
    {
      orig: "DMart Kolathur (STORE_005)",
      dest: "DMart Virugambakkam (STORE_003)",
      dist: "13.6 km",
      time: "45 min",
      cost: "₹749.20",
      arterial: "200ft Inner Ring Road & Koyambedu Flyover",
      capacity: "1,500 units (Tata Ace LCV)",
      status: "AVAILABLE",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-hairline pb-4">
        <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
          Supply Network &amp; Logistics
        </span>
        <h1 className="font-serif text-3xl font-normal text-ink mt-0.5">Supplier Directory &amp; Inter-Store Transit Matrix</h1>
        <p className="text-sm text-muted mt-1 max-w-3xl">
          Regional wholesale suppliers with calibrated lead times and MOQ rules, combined with 20 directed intra-city transfer routes
          connecting all 5 Chennai branches via light commercial vehicles.
        </p>
      </div>

      {/* Regional Supplier Directory */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-normal text-ink">Regional Supplier Directory</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-surface-card border border-hairline rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted mb-1">
                  <span>{s.id}</span>
                  <span className="text-status-success font-semibold">{s.reliability} SLA</span>
                </div>
                <div className="font-medium text-xs text-ink">{s.name}</div>
                <div className="text-[11px] text-muted mt-0.5">{s.city}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-hairline/60 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-muted">Lead Time:</span>
                  <span className="font-semibold text-ink">{s.leadTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">MOQ:</span>
                  <span className="font-semibold text-ink">{s.moq}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Delivery:</span>
                  <span className="font-semibold text-primary">{s.deliveryRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inter-Store Transit Matrix Table */}
      <div className="bg-canvas border border-hairline rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h2 className="font-serif text-xl font-normal text-ink">Calibrated Inter-Store Logistics Routes</h2>
            <p className="text-xs text-muted">
              Distances derived from verified store coordinates using a 1.35x circuity factor for Chennai arterial traffic.
            </p>
          </div>
          <span className="font-mono text-xs text-muted bg-surface-card px-2.5 py-1 rounded border border-hairline">
            20 Directed Pairs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-muted font-mono uppercase text-[10px]">
                <th className="py-2.5 font-medium">Origin Branch</th>
                <th className="py-2.5 font-medium">Destination Branch</th>
                <th className="py-2.5 font-medium text-right">Road Distance</th>
                <th className="py-2.5 font-medium text-right">Travel Time</th>
                <th className="py-2.5 font-medium text-right text-primary">Route Cost</th>
                <th className="py-2.5 font-medium pl-3">Vehicle Capacity</th>
                <th className="py-2.5 font-medium">Arterial Highway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {routes.map((r, i) => (
                <tr key={i} className="hover:bg-surface-card transition-colors">
                  <td className="py-3 font-mono font-medium text-ink">{r.orig}</td>
                  <td className="py-3 font-mono font-semibold text-primary">{r.dest}</td>
                  <td className="py-3 text-right font-mono">{r.dist}</td>
                  <td className="py-3 text-right font-mono">{r.time}</td>
                  <td className="py-3 text-right font-mono font-bold text-ink">{r.cost}</td>
                  <td className="py-3 pl-3 font-mono text-muted">{r.capacity}</td>
                  <td className="py-3 text-body">{r.arterial}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
