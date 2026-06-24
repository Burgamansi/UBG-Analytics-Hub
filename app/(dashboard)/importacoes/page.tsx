"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, FileSpreadsheet, History, Loader2, XCircle } from "lucide-react";

type ImportacaoStatus = "sucesso" | "processando" | "erro";

interface ImportacaoRow {
  id: number;
  nomeArquivo: string;
  modulo: string;
  status: ImportacaoStatus;
  dataUpload: string;
  registrosProcessados: number;
  erros: string[];
}

const STATUS_STYLES: Record<ImportacaoStatus, { label: string; badge: string; icon: typeof CheckCircle2 }> = {
  sucesso: {
    label: "Sucesso",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  processando: {
    label: "Processando",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    icon: Loader2,
  },
  erro: {
    label: "Erro",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

const MODULE_LABELS: Record<string, string> = {
  financeiro: "Financeiro / DRE",
  comercial: "Comercial",
  rh: "RH",
  turnover: "Turnover",
  atestados: "Atestados",
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

export default function ImportacoesPage() {
  const [rows, setRows] = useState<ImportacaoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadImportacoes() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/importacoes", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Nao foi possivel carregar as importacoes.");
        }

        if (active) setRows(Array.isArray(payload.data) ? payload.data : []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erro inesperado ao carregar importacoes.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadImportacoes();

    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    return {
      registros: rows.reduce((sum, row) => sum + row.registrosProcessados, 0),
      sucessos: rows.filter((row) => row.status === "sucesso").length,
      processando: rows.filter((row) => row.status === "processando").length,
    };
  }, [rows]);

  return (
    <div className="p-6 space-y-6 bg-slate-50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-title mb-1">Gestao de Dados</div>
          <h1 className="page-title">Status das Importacoes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Acompanhamento executivo dos arquivos, status e registros processados.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {totals.sucessos} importacoes concluidas
          </span>
          <span className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 text-slate-600">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            {totals.processando} em processamento
          </span>
          <a href="/importacoes/historico" className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 text-slate-600 hover:border-sky-300 hover:text-sky-700">
            <History className="h-3.5 w-3.5" />
            Historico
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5">
          <div className="section-title mb-1">Arquivos reais</div>
          <div className="text-3xl font-black text-slate-900">{rows.length}</div>
        </div>
        <div className="bg-white border border-slate-200 p-5">
          <div className="section-title mb-1">Registros processados</div>
          <div className="text-3xl font-black text-slate-900">{totals.registros.toLocaleString("pt-BR")}</div>
        </div>
        <div className="bg-white border border-slate-200 p-5">
          <div className="section-title mb-1">Fonte</div>
          <div className="text-3xl font-black text-slate-900">Uploads</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5">
        <div className="section-title mb-4">Fila de importacoes</div>

        {loading ? (
          <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
            Carregando importacoes reais...
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
            <div>
              <div className="font-black">Nao foi possivel carregar os uploads.</div>
              <div className="mt-1 text-red-600">{error}</div>
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="border border-slate-200 bg-slate-50 p-8 text-center">
            <FileSpreadsheet className="mx-auto h-8 w-8 text-slate-400" />
            <div className="mt-3 text-lg font-black text-slate-900">Nenhuma importacao real encontrada</div>
            <p className="mx-auto mt-1 max-w-xl text-sm text-slate-500">
              Quando houver registros na tabela uploads, eles aparecerao aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-3 py-3 text-left">Arquivo</th>
                  <th className="px-3 py-3 text-left">Modulo</th>
                  <th className="px-3 py-3 text-left">Data Upload</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-right">Registros</th>
                  <th className="px-3 py-3 text-left">Erros</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const StatusIcon = STATUS_STYLES[row.status].icon;
                  return (
                    <tr key={row.id} className="table-row-hover border-b border-slate-100 last:border-b-0">
                      <td className="px-3 py-3 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-sky-600" />
                          {row.nomeArquivo}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{MODULE_LABELS[row.modulo] ?? row.modulo}</td>
                      <td className="px-3 py-3 text-slate-600">{formatDate(row.dataUpload)}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-2 border px-2 py-1 text-xs font-bold ${STATUS_STYLES[row.status].badge}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {STATUS_STYLES[row.status].label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-black text-slate-900">
                        {row.registrosProcessados.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {row.erros.length > 0 ? row.erros.join("; ") : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
