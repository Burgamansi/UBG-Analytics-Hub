import { NextResponse } from "next/server";
import { listUploadsReadOnly } from "@/lib/data/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listUploadsReadOnly();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Importacoes read error:", error);
    return NextResponse.json(
      { error: "Nao foi possivel carregar as importacoes agora." },
      { status: 500 }
    );
  }
}
