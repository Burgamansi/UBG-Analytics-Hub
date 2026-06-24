"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Clock, FileSpreadsheet, Loader2, Search } from "lucide-react";

type ImportVisualStatus = "processado" | "processado_com_alertas" | "falhou" | "processando";

interface ImportHistoryRow {
  id: number;
  nomeArquivo: string;
  modulo: string;
  moduloLabel: string;
  tipoDocumento: string;
  parser: string;
  parserVersion: string;
  usuarioImportacao: string;
  statusVisual: ImportVisualStatus;
  dataImportacao: string;
  registrosProcessados: number;
  quantidadeErros: number;
}

const STATUS_LABELS: Record<ImportVisualStatus, { label: string; marker: string; badge: string }> = {
  processado: {
    label: "Processado",
    marker: "🟢",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  processado_com_alertas: {
    label: "Processado com alertas",
    marker: "🟡",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  falhou: {
    label: "Falhou",
    marker: "🔴",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
  processando: {
    label: "Em processamento",
    marker: "⚪",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
  },
};

function formatDate(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ImportacoesHistoricoPage() {
  const [rows, setRows] = useState<ImportHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/importacoes", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Nao foi possivel carregar o historico.");
        }

        if (active) setRows(Array.isArray(payload.data) ? payload.data : []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erro inesperado ao carregar historico.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      [row.nomeArquivo, row.moduloLabel, row.tipoDocumento, row.parser, row.usuarioImportacao]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query, rows]);

  const processedCount = rows.filter((row) => row.statusVisual === "processado").length;
  const warningCount = rows.filter((row) => row.statusVisual === "processado_com_alertas").length;
  const failedCount = rows.filter((row) => row.statusVisual === "falhou").length;

  return (
    <div className="p-6 space-y-6 bg-slate-50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-title mb-1">Governanca das Importacoes</div>
          <h1 className="page-title">Historico de Importacoes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Trilha auditavel de arquivos, usuarios, status e parsers utilizados.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 text-slate-600">
            🟢 {processedCount} processados
          </span>
          <span className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 text-slate-600">
            🟡 {warningCount} com alertas
          </span>
          <span className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 text-slate-600">
            🔴 {failedCount} falhas
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="section-title mb-1">Auditoria</div>
            <div className="text-sm font-semibold text-slate-700">Metadados corporativos por importacao</div>
          </div>
          <label className="relative block w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none focus:border-sky-400"
              placeholder="Buscar arquivo, modulo, parser ou usuario"
            />
          </label>
        </div>

        <div className="mt-5 overflow-x-auto">
          {loading ? (
            <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
              Carregando historico de importacoes...
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
              <div>
                <div className="font-black">Nao foi possivel carregar o historico.</div>
                <div className="mt-1 text-red-600">{error}</div>
              </div>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="border border-slate-200 bg-slate-50 p-8 text-center">
              <FileSpreadsheet className="mx-auto h-8 w-8 text-slate-400" />
              <div className="mt-3 text-lg font-black text-slate-900">Nenhum registro encontrado</div>
              <p className="mx-auto mt-1 max-w-xl text-sm text-slate-500">
                O historico sera preenchido automaticamente a partir da tabela uploads.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-3 py-3 text-left">Arquivo</th>
                  <th className="px-3 py-3 text-left">Modulo</th>
                  <th className="px-3 py-3 text-left">Data</th>
                  <th className="px-3 py-3 text-left">Usuario</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Parser utilizado</th>
                  <th className="px-3 py-3 text-right">Registros</th>
                  <th className="px-3 py-3 text-right">Erros</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const status = STATUS_LABELS[row.statusVisual];
                  return (
                    <tr key={row.id} className="table-row-hover border-b border-slate-100 last:border-b-0">
                      <td className="px-3 py-3 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-sky-600" />
                          {row.nomeArquivo}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{row.moduloLabel}</td>
                      <td className="px-3 py-3 text-slate-600">{formatDate(row.dataImportacao)}</td>
                      <td className="px-3 py-3 text-slate-600">{row.usuarioImportacao}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-2 border px-2 py-1 text-xs font-bold ${status.badge}`}>
                          <span>{status.marker}</span>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        <div className="font-semibold text-slate-800">{row.parser}</div>
                        <div className="text-xs text-slate-400">{row.parserVersion} · {row.tipoDocumento}</div>
                      </td>
                      <td className="px-3 py-3 text-right font-black text-slate-900">
                        {row.registrosProcessados.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-3 py-3 text-right font-black text-slate-900">
                        {row.quantidadeErros.toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5">
          <div className="section-title mb-1">Log de processamento</div>
          <div className="text-sm text-slate-600">Eventos preparados: iniciada, concluida e falhou.</div>
        </div>
        <div className="bg-white border border-slate-200 p-5">
          <div className="section-title mb-1">Multimodulo</div>
          <div className="text-sm text-slate-600">DRE, Comercial, RH, Compras, Qualidade e Operacoes mapeados.</div>
        </div>
        <div className="bg-white border border-slate-200 p-5">
          <div className="section-title mb-1">Auditoria</div>
          <div className="text-sm text-slate-600">Parser, versao, usuario e contadores padronizados.</div>
        </div>
      </div>
    </div>
  );
}
