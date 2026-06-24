import { NextResponse } from "next/server";
import { getComprasDashboardData } from "@/src/lib/data/compras-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getComprasDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/compras:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados do modulo Compras" },
      { status: 500 }
    );
  }
}
