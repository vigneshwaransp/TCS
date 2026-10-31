"use client";

import React from "react";
import { Tag, TrendingUp, DollarSign, Calendar, Percent, CheckCircle2 } from "lucide-react";

export const PromotionsView: React.FC = () => {
  const promotions = [
    {
      id: "PROM_2026_01",
      name: "Mega Pongal & Weekend Grocery Bash",
      store: "DMart Velachery (STORE_001)",
      sku: "SKU_DM_0001 (Basmati Rice 1KG)",
      discountPct: "15%",
      period: "Nov 01, 2026 – Nov 07, 2026",
      budget: "₹45,000",
      regularPrice: "₹125.00",
      promoPrice: "₹106.25",
      unitCost: "₹94.89",
      grossMargin: "10.7%",
      projectedDemandLift: "+95%",
      status: "PLANNED_ACTIVE",
    },
    {
      id: "PROM_2026_02",
      name: "Deepavali Cooking Oil Super Saver",
      store: "DMart Velachery (STORE_001)",
      sku: "SKU_DM_0010 (Sunflower Oil 1L)",
      discountPct: "12%",
      period: "Nov 02, 2026 – Nov 08, 2026",
      budget: "₹60,000",
      regularPrice: "₹140.00",
      promoPrice: "₹123.20",
      unitCost: "₹110.00",
      grossMargin: "10.7%",
      projectedDemandLift: "+80%",
      status: "PLANNED_ACTIVE",
    },
    {
      id: "PROM_2026_03",
      name: "Monsoon Warmth Filter Coffee Festival",
      store: "DMart Chromepet (STORE_002)",
      sku: "SKU_DM_0019 (Coffee 200g)",
      discountPct: "10%",
      period: "Oct 25, 2026 – Nov 05, 2026",
      budget: "₹25,000",
      regularPrice: "₹160.00",
      promoPrice: "₹144.00",
      unitCost: "₹124.80",
      grossMargin: "13.3%",
      projectedDemandLift: "+45%",
      status: "IN_PROGRESS",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-hairline pb-4">
        <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
          Commercial Intelligence
        </span>
        <h1 className="font-serif text-3xl font-normal text-ink mt-0.5">Promotion &amp; Margin Analytics</h1>
        <p className="text-sm text-muted mt-1 max-w-3xl">
          Track revenue, cost of goods sold, discount depth, and unit gross margins.
          Distinguish gross profit from contribution profit without double counting storage or freight logistics.
        </p>
      </div>

      {/* Accounting Definitions Callout Banner */}
      <div className="bg-surface-card border border-hairline rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div>
          <span className="text-muted block text-[10px] uppercase">Revenue Definition</span>
          <span className="text-ink font-semibold">Units Sold × Actual Selling Price</span>
        </div>
        <div>
          <span className="text-muted block text-[10px] uppercase">Gross Profit Formula</span>
          <span className="text-ink font-semibold">Revenue − Cost of Goods Sold (COGS)</span>
        </div>
        <div>
          <span className="text-muted block text-[10px] uppercase">Contribution Profit Formula</span>
          <span className="text-primary font-semibold">Gross Profit − Dispatch Costs − Holding − Stockouts</span>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-canvas border border-hairline rounded-xl p-6 space-y-4">
        <h2 className="font-serif text-xl font-normal text-ink">Active &amp; Scheduled Promotional Campaigns</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hairline text-muted font-mono uppercase text-[10px]">
                <th className="py-2.5 font-medium">Promotion &amp; Branch</th>
                <th className="py-2.5 font-medium">SKU &amp; Schedule</th>
                <th className="py-2.5 font-medium text-right">Discount</th>
                <th className="py-2.5 font-medium text-right">Promo Price</th>
                <th className="py-2.5 font-medium text-right">Unit Cost</th>
                <th className="py-2.5 font-medium text-right">Gross Margin</th>
                <th className="py-2.5 font-medium text-right text-primary">Expected Lift</th>
                <th className="py-2.5 font-medium pl-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {promotions.map((p) => (
                <tr key={p.id} className="hover:bg-surface-card transition-colors">
                  <td className="py-3 font-medium text-ink">
                    <div>{p.name}</div>
                    <div className="text-[11px] text-muted font-normal">{p.store}</div>
                  </td>
                  <td className="py-3 font-mono text-body">
                    <div>{p.sku}</div>
                    <div className="text-[10px] text-muted">{p.period}</div>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-primary">{p.discountPct}</td>
                  <td className="py-3 text-right font-mono text-ink font-semibold">{p.promoPrice}</td>
                  <td className="py-3 text-right font-mono text-muted">{p.unitCost}</td>
                  <td className="py-3 text-right font-mono font-bold text-status-success">{p.grossMargin}</td>
                  <td className="py-3 text-right font-mono font-bold text-primary">{p.projectedDemandLift}</td>
                  <td className="py-3 pl-3 text-center">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-surface-card border border-hairline text-ink">
                      {p.status}
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
