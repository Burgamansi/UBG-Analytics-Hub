import * as XLSX from "xlsx";

export interface ParsedRHRow {
  mes: number;
  ano: number;
  empresa: string;
  colaboradores_inicio: number;
  colaboradores_fim: number;
  admissoes: number;
  desligamentos: number;
  turnover_pct: number;
  absenteismo_pct: number;
  horas_justificadas: number;
  horas_nao_justificadas: number;
}

export interface ParsedDesligamento {
  mes: number;
  ano: number;
  empresa: string;
  nome: string;
  cargo: string;
  motivo: string;
  data_admissao: string;
  data_desligamento: string;
}

export interface ParsedAtestado {
  mes: number;
  ano: number;
  empresa: string;
  colaborador: string;
  cid: string;
  dias: number;
  tipo: "integral" | "parcial";
}

function toNumber(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0;
  const str = String(val).replace(",", ".").replace("%", "").trim();
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

function detectMes(raw: unknown): number {
  const meses: Record<string, number> = {
    jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
    jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
    janeiro: 1, fevereiro: 2, março: 3, abril: 4, maio: 5, junho: 6,
    julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  };
  const lower = String(raw || "").toLowerCase().trim();
  for (const [key, val] of Object.entries(meses)) {
    if (lower.includes(key)) return val;
  }
  const n = parseInt(lower);
  return isNaN(n) ? 0 : n;
}

export function parseRHXLS(buffer: Buffer): {
  rh: ParsedRHRow[];
  desligamentos: ParsedDesligamento[];
  errors: string[];
} {
  const rh: ParsedRHRow[] = [];
  const desligamentos: ParsedDesligamento[] = [];
  const errors: string[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: false,
      });

      if (data.length === 0) continue;

      const sheetLower = sheetName.toLowerCase();

      // Aba de consolidado RH
      if (
        sheetLower.includes("consolid") ||
        sheetLower.includes("resumo") ||
        sheetLower.includes("indicador")
      ) {
        for (const row of data) {
          const keys = Object.keys(row).map((k) => k.toLowerCase());
          const getCol = (patterns: string[]): unknown => {
            for (const p of patterns) {
              const key = keys.find((k) => k.includes(p));
              if (key) return row[Object.keys(row)[keys.indexOf(key)]];
            }
            return "";
          };

          const mes = detectMes(getCol(["mes", "mês", "month", "período"]));
          const empresa = String(getCol(["empresa", "company", "unidade"]) || "").trim();

          if (!mes || !empresa) continue;

          rh.push({
            mes,
            ano: 2026,
            empresa,
            colaboradores_inicio: toNumber(getCol(["inicio", "início", "quadro_i", "colab_i"])),
            colaboradores_fim: toNumber(getCol(["fim", "final", "quadro_f", "colab_f", "efetivo"])),
            admissoes: toNumber(getCol(["admiss", "contrat", "entrad"])),
            desligamentos: toNumber(getCol(["deslig", "saida", "saída", "demit"])),
            turnover_pct: toNumber(getCol(["turnover", "turn", "rotativ"])),
            absenteismo_pct: toNumber(getCol(["absenteis", "absenteís", "ausencia", "ausência"])),
            horas_justificadas: toNumber(getCol(["just", "atestado", "hj"])),
            horas_nao_justificadas: toNumber(getCol(["nao_just", "não_just", "hnj", "falta"])),
          });
        }
      }

      // Aba de desligamentos / turnover
      if (
        sheetLower.includes("deslig") ||
        sheetLower.includes("turnover") ||
        sheetLower.includes("saida") ||
        sheetLower.includes("saída")
      ) {
        for (const row of data) {
          const keys = Object.keys(row).map((k) => k.toLowerCase());
          const getCol = (patterns: string[]): unknown => {
            for (const p of patterns) {
              const key = keys.find((k) => k.includes(p));
              if (key) return row[Object.keys(row)[keys.indexOf(key)]];
            }
            return "";
          };

          const nome = String(getCol(["nome", "name", "funcionario", "funcionário", "colaborador"]) || "").trim();
          if (!nome || nome.length < 2) continue;

          const mes = detectMes(getCol(["mes", "mês", "month"])) || 1;
          const empresa = String(getCol(["empresa", "unidade", "filial"]) || "").trim();

          desligamentos.push({
            mes,
            ano: 2026,
            empresa: empresa || "Não informada",
            nome,
            cargo: String(getCol(["cargo", "funcao", "função", "role", "posicao"]) || "").trim(),
            motivo: String(getCol(["motivo", "reason", "causa"]) || "Não informado").trim(),
            data_admissao: String(getCol(["admiss", "entrada", "inicio"]) || "").trim(),
            data_desligamento: String(getCol(["deslig", "saida", "saída", "demiss"]) || "").trim(),
          });
        }
      }
    }
  } catch (err) {
    errors.push(`Erro ao processar RH: ${String(err)}`);
  }

  return { rh, desligamentos, errors };
}

export function parseAtestadosXLS(buffer: Buffer): {
  atestados: ParsedAtestado[];
  errors: string[];
} {
  const atestados: ParsedAtestado[] = [];
  const errors: string[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: false,
      });

      for (const row of data) {
        const keys = Object.keys(row).map((k) => k.toLowerCase());
        const getCol = (patterns: string[]): unknown => {
          for (const p of patterns) {
            const key = keys.find((k) => k.includes(p));
            if (key) return row[Object.keys(row)[keys.indexOf(key)]];
          }
          return "";
        };

        const colaborador = String(
          getCol(["nome", "colaborador", "funcionario", "funcionário"]) || ""
        ).trim();
        if (!colaborador || colaborador.length < 2) continue;

        const tipoRaw = String(getCol(["tipo", "parcial", "integral"]) || "integral").toLowerCase();
        const tipo: "integral" | "parcial" = tipoRaw.includes("parcial") ? "parcial" : "integral";

        atestados.push({
          mes: detectMes(getCol(["mes", "mês", "month"])) || 1,
          ano: 2026,
          empresa: String(getCol(["empresa", "unidade"]) || "Não informada").trim(),
          colaborador,
          cid: String(getCol(["cid", "diagnostico", "diagnóstico", "causa", "motivo"]) || "Não informado").trim(),
          dias: Math.round(toNumber(getCol(["dias", "days", "qtd_dias", "quantidade"]))),
          tipo,
        });
      }
    }
  } catch (err) {
    errors.push(`Erro ao processar atestados: ${String(err)}`);
  }

  return { atestados, errors };
}
