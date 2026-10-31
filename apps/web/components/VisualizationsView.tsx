"use client";

import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import {
  BarChart3,
  TrendingUp,
  RefreshCw,
  Layers,
  Sparkles,
  Sliders,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Database,
} from "lucide-react";

export const VisualizationsView: React.FC = () => {
  const [loadingSuite, setLoadingSuite] = useState(true);
  const [charts, setCharts] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"suite" | "custom">("suite");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic Dataset Columns State (NO Hardcoding)
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [columnDataMap, setColumnDataMap] = useState<{ [key: string]: number[] }>({});
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [binCount, setBinCount] = useState(25);
  const [customChart, setCustomChart] = useState<any>(null);
  const [customLoading, setCustomLoading] = useState(false);

  const loadVisualSuite = async () => {
    setLoadingSuite(true);
    setErrorMsg(null);
    try {
      const res = await api.getVisualizationSuite();
      if (res.status === "success" && res.charts) {
        setCharts(res.charts);
      } else {
        setErrorMsg("Failed to load Matplotlib visual suite.");
      }
    } catch (err: any) {
      console.error("Visual suite load error:", err);
      setErrorMsg(err.message || "Failed to generate server-side Matplotlib charts.");
    } finally {
      setLoadingSuite(false);
    }
  };

  const loadDatasetColumns = async () => {
    try {
      const res = await api.getDatasetColumns();
      if (res.status === "success" && res.available_columns) {
        setAvailableColumns(res.available_columns);
        setColumnDataMap(res.column_data || {});
        if (res.available_columns.length > 0) {
          const firstCol = res.available_columns[0];
          setSelectedColumn(firstCol);
          generateDynamicHistogram(firstCol, 25, res.column_data?.[firstCol] || []);
        }
      }
    } catch (err) {
      console.error("Failed to load dataset columns:", err);
    }
  };

  const generateDynamicHistogram = async (colName: string, bins: number, valuesOverride?: number[]) => {
    setCustomLoading(true);
    try {
      const values = valuesOverride || columnDataMap[colName] || [];
      if (values.length === 0) return;
      const res = await api.getColumnHistogram(colName, values, bins);
      if (res.status === "success" && res.result) {
        setCustomChart(res.result);
      }
    } catch (err) {
      console.error("Dynamic histogram error:", err);
    } finally {
      setCustomLoading(false);
    }
  };

  useEffect(() => {
    loadVisualSuite();
    loadDatasetColumns();
  }, []);

  const handleColumnChange = (colName: string) => {
    setSelectedColumn(colName);
    generateDynamicHistogram(colName, binCount, columnDataMap[colName]);
  };

  const handleBinChange = (b: number) => {
    setBinCount(b);
    generateDynamicHistogram(selectedColumn, b, columnDataMap[selectedColumn]);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-hairline gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
              Scientific Analytics
            </span>
            <span className="text-muted text-xs">•</span>
            <span className="text-muted text-xs font-mono">Headless Matplotlib Engine</span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-ink mt-1">
            Visual Analytics &amp; Distribution Lab
          </h1>
          <p className="text-sm text-body mt-1">
            Charts and empirical histograms generated directly from active database records using Matplotlib. Zero hardcoded data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-md border border-hairline bg-surface-card p-0.5">
            <button
              onClick={() => setActiveTab("suite")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                activeTab === "suite"
                  ? "bg-surface-dark text-on-dark shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              Core Visual Suite
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                activeTab === "custom"
                  ? "bg-surface-dark text-on-dark shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              Dynamic Column Inspector
            </button>
          </div>

          <button
            onClick={loadVisualSuite}
            disabled={loadingSuite}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas hover:bg-surface-card border border-hairline rounded-md text-xs font-mono text-ink transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSuite ? "animate-spin text-primary" : "text-muted"}`} />
            <span>Re-render</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-status-error/10 border border-status-error/30 rounded-lg text-xs text-status-error flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* View Mode 1: Core Matplotlib Visual Suite */}
      {activeTab === "suite" && (
        <div className="space-y-8">
          {loadingSuite && !charts ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <div className="font-serif text-lg text-ink">Rendering Matplotlib Analytical Suite...</div>
              <div className="text-xs text-muted font-mono mt-1">Executing empirical KDE, forecast envelopes, and inventory comparison</div>
            </div>
          ) : charts ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Demand Histogram with KDE */}
              <div className="bg-surface-card border border-hairline rounded-lg p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
                      Demand Distribution
                    </span>
                    <span className="text-xs font-mono text-muted">Gaussian KDE</span>
                  </div>
                  <h3 className="font-serif text-xl font-medium text-ink mb-1">
                    Daily Sales Velocity &amp; Density
                  </h3>
                  <p className="text-xs text-muted mb-4">
                    Computed from live transactional sales records in the active dataset.
                  </p>

                  {charts.demand_histogram?.image_url && (
                    <div className="rounded border border-hairline overflow-hidden bg-canvas mb-4 shadow-sm">
                      <img
                        src={charts.demand_histogram.image_url}
                        alt="Demand Histogram with KDE"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                </div>

                {charts.demand_histogram?.metrics && (
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-hairline text-center text-xs">
                    <div className="bg-canvas p-2 rounded border border-hairline">
                      <span className="text-[10px] text-muted block">Mean</span>
                      <strong className="text-ink font-mono">{charts.demand_histogram.metrics.mean}</strong>
                    </div>
                    <div className="bg-canvas p-2 rounded border border-hairline">
                      <span className="text-[10px] text-muted block">Median</span>
                      <strong className="text-ink font-mono">{charts.demand_histogram.metrics.median}</strong>
                    </div>
                    <div className="bg-canvas p-2 rounded border border-hairline">
                      <span className="text-[10px] text-muted block">Std Dev</span>
                      <strong className="text-ink font-mono">{charts.demand_histogram.metrics.std_dev}</strong>
                    </div>
                    <div className="bg-canvas p-2 rounded border border-hairline">
                      <span className="text-[10px] text-muted block">P95 Peak</span>
                      <strong className="text-primary font-mono">{charts.demand_histogram.metrics.p95}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Chart 2: Store Inventory Posture Comparison */}
              <div className="bg-surface-card border border-hairline rounded-lg p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-accent-teal font-semibold">
                      Inventory Posture
                    </span>
                    <span className="text-xs font-mono text-muted">Active Stores</span>
                  </div>
                  <h3 className="font-serif text-xl font-medium text-ink mb-1">
                    On-Hand vs. Safety Stock vs. Reorder Point
                  </h3>
                  <p className="text-xs text-muted mb-4">
                    Direct comparison across stores present in your active dataset.
                  </p>

                  {charts.inventory_comparison?.image_url && (
                    <div className="rounded border border-hairline overflow-hidden bg-canvas mb-4 shadow-sm">
                      <img
                        src={charts.inventory_comparison.image_url}
                        alt="Inventory Comparison"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-hairline text-xs">
                  <div className="flex items-center justify-between bg-canvas p-2.5 rounded border border-hairline">
                    <span className="text-muted">Network Avg On-Hand:</span>
                    <strong className="text-ink font-mono">{charts.inventory_comparison?.avg_on_hand} units</strong>
                  </div>
                  <div className="flex items-center justify-between bg-canvas p-2.5 rounded border border-hairline">
                    <span className="text-muted">Avg Safety Stock:</span>
                    <strong className="text-accent-teal font-mono">{charts.inventory_comparison?.avg_safety_stock} units</strong>
                  </div>
                </div>
              </div>

              {/* Chart 3: Days-of-Supply & Stockout Exposure */}
              <div className="bg-surface-card border border-hairline rounded-lg p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-status-warning font-semibold">
                      Stockout Exposure
                    </span>
                    <span className="text-xs font-mono text-muted">Days of Supply</span>
                  </div>
                  <h3 className="font-serif text-xl font-medium text-ink mb-1">
                    Days-of-Supply (DoS) Risk Distribution
                  </h3>
                  <p className="text-xs text-muted mb-4">
                    Color-coded empirical histogram. Items with DoS &lt; 3.0 days indicate acute stockout peril.
                  </p>

                  {charts.stockout_exposure?.image_url && (
                    <div className="rounded border border-hairline overflow-hidden bg-canvas mb-4 shadow-sm">
                      <img
                        src={charts.stockout_exposure.image_url}
                        alt="Days of Supply Distribution"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-hairline text-xs">
                  <div className="flex items-center justify-between bg-canvas p-2.5 rounded border border-hairline">
                    <span className="text-muted">Critical Risk (&lt;3d):</span>
                    <strong className="text-primary font-mono">{charts.stockout_exposure?.critical_exposure_pct}%</strong>
                  </div>
                  <div className="flex items-center justify-between bg-canvas p-2.5 rounded border border-hairline">
                    <span className="text-muted">Median Days-of-Supply:</span>
                    <strong className="text-ink font-mono">{charts.stockout_exposure?.median_dos} days</strong>
                  </div>
                </div>
              </div>

              {/* Chart 4: 30-Day Probabilistic Forecast Confidence Bands */}
              <div className="bg-surface-card border border-hairline rounded-lg p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
                      Probabilistic Forecast
                    </span>
                    <span className="text-xs font-mono text-muted">P10 / P50 / P90</span>
                  </div>
                  <h3 className="font-serif text-xl font-medium text-ink mb-1">
                    Demand Uncertainty Envelope
                  </h3>
                  <p className="text-xs text-muted mb-4">
                    Empirical trajectory calibrated to observed historical variance in your dataset.
                  </p>

                  {charts.forecast_confidence?.image_url && (
                    <div className="rounded border border-hairline overflow-hidden bg-canvas mb-4 shadow-sm">
                      <img
                        src={charts.forecast_confidence.image_url}
                        alt="Forecast Confidence Bands"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-hairline text-xs">
                  <div className="flex items-center justify-between bg-canvas p-2.5 rounded border border-hairline">
                    <span className="text-muted">P50 Expected Mean:</span>
                    <strong className="text-ink font-mono">{charts.forecast_confidence?.forecast_mean_p50} units/day</strong>
                  </div>
                  <div className="flex items-center justify-between bg-canvas p-2.5 rounded border border-hairline">
                    <span className="text-muted">P90 Maximum Surge:</span>
                    <strong className="text-primary font-mono">{charts.forecast_confidence?.forecast_p90_peak} units</strong>
                  </div>
                </div>
              </div>

              {/* Chart 5: Counterfactual Decision Tradeoff Curve (Full Width) */}
              <div className="lg:col-span-2 bg-surface-card border border-hairline rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
                    Decision Frontier
                  </span>
                  <span className="text-xs font-mono text-muted">Counterfactual Optimization</span>
                </div>
                <h3 className="font-serif text-xl font-medium text-ink mb-1">
                  Counterfactual Decision Frontier: Expected Net Margin vs. Stockout Exposure
                </h3>
                <p className="text-xs text-muted mb-4">
                  Multi-scenario tradeoff curve comparing operational alternatives calculated from your decision engine.
                </p>

                {charts.counterfactual_frontier?.image_url && (
                  <div className="rounded border border-hairline overflow-hidden bg-canvas mb-4 shadow-sm max-w-4xl mx-auto">
                    <img
                      src={charts.counterfactual_frontier.image_url}
                      alt="Counterfactual Decision Frontier"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* View Mode 2: Dynamic Generic Column Histogram Inspector (100% Dynamic from active dataset) */}
      {activeTab === "custom" && (
        <div className="space-y-6">
          <div className="bg-surface-card border border-hairline rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
                  Generic Tabular Analysis
                </span>
                <h2 className="font-serif text-2xl font-medium text-ink mt-0.5">
                  Dynamic Column Histogram Inspector
                </h2>
                <p className="text-xs text-muted mt-1">
                  Select any attribute from your active dataset to generate an empirical Matplotlib distribution.
                </p>
              </div>

              {/* Dynamic Column Selector */}
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-muted mb-1">
                    Attribute from Active Dataset
                  </label>
                  <select
                    value={selectedColumn}
                    onChange={(e) => handleColumnChange(e.target.value)}
                    className="bg-canvas border border-hairline rounded-md px-3 py-1.5 text-xs font-mono text-ink focus:outline-none focus:border-primary"
                  >
                    {availableColumns.map((col) => (
                      <option key={col} value={col}>
                        {col} ({columnDataMap[col]?.length || 0} rows)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-muted mb-1">
                    Bin Granularity ({binCount} bins)
                  </label>
                  <div className="flex items-center gap-2">
                    {[15, 25, 40].map((b) => (
                      <button
                        key={b}
                        onClick={() => handleBinChange(b)}
                        className={`px-2.5 py-1 text-xs font-mono rounded border transition ${
                          binCount === b
                            ? "bg-surface-dark text-on-dark border-surface-dark"
                            : "bg-canvas text-muted border-hairline hover:text-ink"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rendered Matplotlib Output */}
            {customLoading ? (
              <div className="py-24 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <div className="font-serif text-base text-ink">Generating Matplotlib Histogram for '{selectedColumn}'...</div>
              </div>
            ) : customChart?.image_url ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-canvas border border-hairline rounded-lg p-4 shadow-sm">
                  <img
                    src={customChart.image_url}
                    alt={`Histogram for ${selectedColumn}`}
                    className="w-full h-auto object-contain mx-auto"
                  />
                </div>

                {/* Column Moments & Descriptive Statistics */}
                <div className="lg:col-span-4 bg-canvas border border-hairline rounded-lg p-5 space-y-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-primary font-semibold border-b border-hairline pb-2">
                    Empirical Distribution Moments
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-hairline">
                      <span className="text-muted">Attribute:</span>
                      <strong className="text-ink font-mono">{customChart.column_name}</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-hairline">
                      <span className="text-muted">Dataset Observations:</span>
                      <span className="text-ink font-mono">{customChart.statistics?.count}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-hairline">
                      <span className="text-muted">Arithmetic Mean (μ):</span>
                      <strong className="text-primary font-mono">{customChart.statistics?.mean}</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-hairline">
                      <span className="text-muted">Median (50th percentile):</span>
                      <span className="text-ink font-mono">{customChart.statistics?.median}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-hairline">
                      <span className="text-muted">Standard Deviation (σ):</span>
                      <span className="text-ink font-mono">{customChart.statistics?.std_dev}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-hairline">
                      <span className="text-muted">Minimum / Maximum:</span>
                      <span className="text-ink font-mono">[{customChart.statistics?.min}, {customChart.statistics?.max}]</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted">Skewness Coefficient:</span>
                      <span className={`font-mono font-medium ${
                        customChart.statistics?.skewness > 0.5 ? "text-primary" : "text-ink"
                      }`}>
                        {customChart.statistics?.skewness} {customChart.statistics?.skewness > 0.5 ? "(Right-Skewed)" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-soft rounded border border-hairline text-[11px] text-body leading-relaxed">
                    <strong>Statistical Heuristic:</strong> With skewness = {customChart.statistics?.skewness}, standard symmetric normal models will distort tail inventory buffer targets. KINTRAL automatically employs empirical distribution quantiles.
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
