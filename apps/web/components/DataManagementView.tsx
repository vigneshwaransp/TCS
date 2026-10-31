"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, Download, FileText, RefreshCw, Check, X, Sparkles, Database } from "lucide-react";
import { api } from "../lib/api";

interface DataManagementProps {
  onDatasetActivated?: (datasetName: string) => void;
  activeDatasetName?: string;
}

export const DataManagementView: React.FC<DataManagementProps> = ({
  onDatasetActivated,
  activeDatasetName = "Connected Retail Network",
}) => {
  const [datasetType, setDatasetType] = useState("inventory");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generic CSV Paste / Upload State
  const [rawCsvText, setRawCsvText] = useState("");
  const [datasetLabel, setDatasetLabel] = useState("Custom Retail Dataset");
  const [profileResult, setProfileResult] = useState<any>(null);
  const [profilingLoading, setProfilingLoading] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setErrorMessage(null);
    setValidationReport(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("dataset_type", datasetType);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/data/validate-upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Validation upload failed");
      setValidationReport(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to validate upload");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileRawCsv = async () => {
    if (!rawCsvText.trim()) return;
    setProfilingLoading(true);
    setErrorMessage(null);
    try {
      const lines = rawCsvText.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());
      const parsedData = lines.slice(1).map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = isNaN(Number(parts[idx])) ? parts[idx] : Number(parts[idx]);
        });
        return row;
      });

      const res = await api.profileGenericDataset(datasetLabel, parsedData);
      if (res.status === "success" && res.profile) {
        setProfileResult(res.profile);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to profile CSV dataset.");
    } finally {
      setProfilingLoading(false);
    }
  };

  const handleActivateDataset = async () => {
    if (!profileResult) return;
    try {
      const lines = rawCsvText.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());
      const parsedData = lines.slice(1).map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = isNaN(Number(parts[idx])) ? parts[idx] : Number(parts[idx]);
        });
        return row;
      });

      // Run agent pipeline on the new dataset
      await api.runAgentPipeline(datasetLabel, parsedData);
      setActivationSuccess(true);
      if (onDatasetActivated) {
        onDatasetActivated(datasetLabel);
      }
      setTimeout(() => setActivationSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to activate dataset.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
            Generic Ingestion &amp; Quality
          </span>
          <h1 className="font-serif text-3xl font-normal text-ink mt-0.5">Data Ingestion Hub</h1>
          <p className="text-sm text-body mt-1 max-w-3xl">
            Upload and profile ANY tabular retail dataset. KINTRAL autonomously infers schemas, runs validation, and powers all decision models without hardcoded schemas.
          </p>
        </div>

        <div className="bg-canvas border border-hairline px-3.5 py-2 rounded-md text-xs font-mono text-muted flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
          <span>Active Dataset: <strong className="text-ink">{activeDatasetName}</strong></span>
        </div>
      </div>

      {activationSuccess && (
        <div className="p-4 bg-status-success/15 border border-status-success/40 rounded-lg text-xs text-status-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Dataset '{datasetLabel}' activated! All cockpit metrics, Matplotlib visuals, and agent recommendations updated.</span>
        </div>
      )}

      {/* Generic CSV Ingestion Section (Strict No Hardcoding) */}
      <div className="bg-surface-card border border-hairline rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
              Generic Dataset Ingestion
            </div>
            <h2 className="font-serif text-xl font-medium text-ink mt-0.5">
              Analyze Any Tabular CSV
            </h2>
          </div>
          <span className="text-xs font-mono text-muted">Auto-Detects Columns</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-mono text-muted uppercase tracking-wider block mb-1">
              Dataset Name / Identifier
            </label>
            <input
              type="text"
              value={datasetLabel}
              onChange={(e) => setDatasetLabel(e.target.value)}
              className="w-full md:w-96 px-3 py-1.5 bg-canvas border border-hairline rounded text-xs font-mono text-ink focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-muted uppercase tracking-wider block mb-1">
              Paste Raw CSV Content (Must include column headers)
            </label>
            <textarea
              rows={5}
              value={rawCsvText}
              onChange={(e) => setRawCsvText(e.target.value)}
              placeholder="store_id,sku,daily_sales,on_hand_stock,unit_price,category&#10;STORE_NORTH,SKU_ELEC_01,28,14,1299.0,Electronics&#10;STORE_SOUTH,SKU_ELEC_02,42,8,2499.0,Electronics&#10;STORE_WEST,SKU_ELEC_03,19,35,899.0,Electronics"
              className="w-full p-3 bg-canvas border border-hairline rounded font-mono text-xs text-ink focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleProfileRawCsv}
              disabled={profilingLoading || !rawCsvText.trim()}
              className="px-4 py-2 bg-primary hover:bg-primary-active disabled:opacity-40 text-on-primary rounded text-xs font-medium transition flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{profilingLoading ? "Profiling Schema..." : "Profile Schema & Distribution"}</span>
            </button>

            {profileResult && (
              <button
                onClick={handleActivateDataset}
                className="px-4 py-2 bg-surface-dark hover:bg-surface-dark-elevated text-on-dark rounded text-xs font-medium transition flex items-center gap-2 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-accent-teal" />
                <span>Activate as Primary Dataset &amp; Run Optimization</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Output */}
        {profileResult && (
          <div className="mt-4 pt-4 border-t border-hairline space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-ink">Inferred Semantic Schema:</span>
              <span className="text-muted">{profileResult.total_rows} rows • {profileResult.total_columns} columns</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-canvas p-2.5 rounded border border-hairline">
                <span className="text-[10px] text-muted block uppercase">Demand Columns</span>
                <strong className="text-primary truncate block">
                  {profileResult.semantic_mapping?.demand_columns?.join(", ") || "None"}
                </strong>
              </div>
              <div className="bg-canvas p-2.5 rounded border border-hairline">
                <span className="text-[10px] text-muted block uppercase">Inventory Columns</span>
                <strong className="text-accent-teal truncate block">
                  {profileResult.semantic_mapping?.inventory_columns?.join(", ") || "None"}
                </strong>
              </div>
              <div className="bg-canvas p-2.5 rounded border border-hairline">
                <span className="text-[10px] text-muted block uppercase">Price/Cost Columns</span>
                <strong className="text-accent-amber truncate block">
                  {profileResult.semantic_mapping?.price_cost_columns?.join(", ") || "None"}
                </strong>
              </div>
              <div className="bg-canvas p-2.5 rounded border border-hairline">
                <span className="text-[10px] text-muted block uppercase">Entity Keys</span>
                <strong className="text-body truncate block">
                  {profileResult.semantic_mapping?.identifier_columns?.join(", ") || "None"}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canonical File Upload & Data Quality Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 bg-surface-card border border-hairline rounded-lg p-6 space-y-4">
          <h2 className="font-serif text-xl font-normal text-ink">Canonical File Upload &amp; Validation</h2>
          <form onSubmit={handleFileUpload} className="space-y-4 text-xs">
            <div>
              <label className="text-body font-medium block mb-1">Target Canonical Schema</label>
              <select
                value={datasetType}
                onChange={(e) => setDatasetType(e.target.value)}
                className="w-full bg-canvas border border-hairline px-3 py-2 rounded-md font-mono text-xs text-ink focus:outline-none focus:border-primary"
              >
                <option value="inventory">inventory.csv (Stock Snapshots)</option>
                <option value="sales">sales_history.csv (Transaction Log)</option>
                <option value="products">products.csv (SKU Catalogue)</option>
              </select>
            </div>

            <div>
              <label className="text-body font-medium block mb-1">Choose CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-canvas border border-hairline p-2 rounded-md font-mono text-xs text-ink file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-surface-dark file:text-on-dark file:cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full bg-primary hover:bg-primary-active disabled:opacity-40 disabled:cursor-not-allowed text-on-primary py-2.5 rounded-md font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{loading ? "Validating Canonical Integrity..." : "Validate & Ingest File"}</span>
            </button>
          </form>

          {errorMessage && (
            <div className="p-3 bg-canvas text-status-error border border-status-error/40 rounded text-xs font-mono">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Templates */}
        <div className="lg:col-span-6 bg-canvas border border-hairline rounded-lg p-6 space-y-4">
          <h2 className="font-serif text-xl font-normal text-ink">Canonical Templates &amp; Specifications</h2>
          <p className="text-xs text-muted">
            Pre-formatted CSV templates for high-speed enterprise ingestion matching the relational models.
          </p>

          <div className="space-y-3 pt-1">
            {[
              { type: "inventory", label: "Inventory Snapshot Template", file: "inventory_template.csv" },
              { type: "sales", label: "Daily Sales History Template", file: "sales_template.csv" },
              { type: "products", label: "Product Catalogue Template", file: "products_template.csv" },
            ].map((tmpl) => (
              <a
                key={tmpl.type}
                href={`http://127.0.0.1:8000/api/v1/data/template/${tmpl.type}`}
                download
                className="flex items-center justify-between p-3.5 rounded bg-surface-card hover:bg-surface-soft border border-hairline text-xs transition text-ink font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>{tmpl.label}</span>
                </div>
                <span className="font-mono text-xs text-primary flex items-center gap-1">
                  Download <Download className="w-3.5 h-3.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
