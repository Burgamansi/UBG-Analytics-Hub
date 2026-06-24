"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Modulo = "comercial" | "rh" | "turnover" | "atestados" | "financeiro" | "compras";

interface UploadResult {
  success: boolean;
  arquivo: string;
  tamanho_kb: number;
  modulo: string;
  registros: number;
  erros: string[];
  preview?: unknown[];
  error?: string;
}

const MODULOS: Array<{
  id: Modulo;
  label: string;
  descricao: string;
  planilha: string;
  color: string;
  aba?: string;
}> = [
  {
    id: "comercial",
    label: "Comercial",
    descricao: "Faturamento, vendedores, empresas e produtos",
    planilha: "IndicadoresComercial2026.xls",
    aba: "Aba: MESES",
    color: "#29ABE2",
  },
  {
    id: "rh",
    label: "RH — Indicadores",
    descricao: "Turnover, absenteísmo, admissões e desligamentos",
    planilha: "IndicadoresRH2026.xlsm",
    color: "#EF4444",
  },
  {
    id: "turnover",
    label: "Turnover — Detalhado",
    descricao: "Registros individuais de desligamentos e motivos",
    planilha: "TURNOVER2026.xlsx",
    color: "#F59E0B",
  },
  {
    id: "atestados",
    label: "Atestados",
    descricao: "Controle de atestados médicos e CIDs",
    planilha: "CONTROLEDEATESTADOS-2026.xlsx",
    color: "#8B5CF6",
  },
  {
    id: "compras",
    label: "Compras",
    descricao: "Controle de fornecedores, homologações e pedidos de compras",
    planilha: "IndicadoresCompras2026.xlsx",
    color: "#3B82F6",
  },
  {
    id: "financeiro",
    label: "Financeiro / DRE",
    descricao: "Custos, receitas e DRE gerencial",
    planilha: "Custo-DRE2026.xlsx",
    color: "#10B981",
  },
];

export default function UploadPage() {
  const [moduloSelecionado, setModuloSelecionado] = useState<Modulo>("comercial");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel.sheet.macroEnabled.12": [".xlsm"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("modulo", moduloSelecionado);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        arquivo: file.name,
        tamanho_kb: 0,
        modulo: moduloSelecionado,
        registros: 0,
        erros: [],
        error: String(err),
      });
    } finally {
      setUploading(false);
    }
  };

  const moduloInfo = MODULOS.find((m) => m.id === moduloSelecionado)!;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="section-title mb-1">Gestão de Dados</div>
        <h1 className="page-title">Upload de Planilhas</h1>
        <p className="text-sm text-slate-500 mt-1">
          Importe as planilhas mestras para atualizar os dashboards automaticamente.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-sky-50 border border-sky-200 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-sky-800">
          <strong>Como funciona:</strong> Selecione o módulo correspondente à planilha,
          arraste o arquivo e clique em Processar. Os dados serão extraídos automaticamente
          e os dashboards serão atualizados.
        </div>
      </div>

      {/* Módulo selector */}
      <div>
        <div className="section-title mb-3">1. Selecione o Módulo</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULOS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setModuloSelecionado(m.id);
                setFile(null);
                setResult(null);
              }}
              className={cn(
                "text-left p-4 border-2 transition-all duration-150",
                moduloSelecionado === m.id
                  ? "border-brand-cyan bg-sky-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div
                className="text-sm font-bold mb-1"
                style={{
                  color: moduloSelecionado === m.id ? m.color : "#0F172A",
                }}
              >
                {m.label}
              </div>
              <div className="text-xs text-slate-500 mb-2">{m.descricao}</div>
              <div className="text-xs font-mono text-slate-400 truncate">
                {m.planilha}
              </div>
              {m.aba && (
                <div
                  className="text-xs font-semibold mt-1"
                  style={{ color: m.color }}
                >
                  {m.aba}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dropzone */}
      <div>
        <div className="section-title mb-3">2. Selecione o Arquivo</div>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-150",
            isDragActive
              ? "border-brand-cyan bg-sky-50"
              : file
              ? "border-emerald-400 bg-emerald-50"
              : "border-slate-300 bg-white hover:border-brand-cyan hover:bg-sky-50/50"
          )}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <FileSpreadsheet className="w-12 h-12 text-emerald-500" />
              <div>
                <div className="font-semibold text-slate-800">{file.name}</div>
                <div className="text-sm text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setResult(null);
                }}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" /> Remover arquivo
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload
                className={cn(
                  "w-12 h-12",
                  isDragActive ? "text-brand-cyan" : "text-slate-300"
                )}
              />
              <div>
                <div className="font-semibold text-slate-700">
                  {isDragActive
                    ? "Solte o arquivo aqui"
                    : "Arraste o arquivo ou clique para selecionar"}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  Formatos aceitos: XLS, XLSX, XLSM, CSV · Máximo 50MB
                </div>
              </div>
              <div className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 border border-slate-200">
                Planilha esperada:{" "}
                <span className="font-mono font-semibold text-slate-600">
                  {moduloInfo.planilha}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload button */}
      {file && !result && (
        <div>
          <div className="section-title mb-3">3. Processar</div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={cn(
              "btn-primary flex items-center gap-2 text-base px-6 py-3",
              uploading && "opacity-70 cursor-not-allowed"
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando planilha...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Processar e Importar Dados
              </>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={cn(
            "border p-5",
            result.success
              ? "bg-emerald-50 border-emerald-200 border-l-4 border-l-emerald-500"
              : "bg-red-50 border-red-200 border-l-4 border-l-red-500"
          )}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div
                className={cn(
                  "font-bold text-base",
                  result.success ? "text-emerald-800" : "text-red-800"
                )}
              >
                {result.success
                  ? `✅ Planilha processada com sucesso!`
                  : `❌ Erro ao processar planilha`}
              </div>
              <div className="text-sm mt-2 space-y-1">
                <div>
                  <span className="font-semibold">Arquivo:</span> {result.arquivo}
                </div>
                {result.success && (
                  <>
                    <div>
                      <span className="font-semibold">Registros importados:</span>{" "}
                      <span className="font-bold text-emerald-700">
                        {result.registros.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Módulo:</span>{" "}
                      {result.modulo}
                    </div>
                    <div>
                      <span className="font-semibold">Tamanho:</span>{" "}
                      {result.tamanho_kb} KB
                    </div>
                  </>
                )}
                {result.error && (
                  <div className="text-red-700 font-mono text-xs mt-2 bg-red-100 p-2">
                    {result.error}
                  </div>
                )}
                {result.erros?.length > 0 && (
                  <div className="mt-2">
                    <div className="font-semibold text-amber-700">
                      Avisos ({result.erros.length}):
                    </div>
                    <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
                      {result.erros.slice(0, 5).map((e, i) => (
                        <li key={i}>• {e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {result.success && (
                <div className="mt-3">
                  <a
                    href="/dashboard"
                    className="btn-primary inline-flex items-center gap-2 text-sm"
                  >
                    Ver Dashboard Atualizado →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
