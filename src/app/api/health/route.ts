import { NextResponse } from "next/server";

// ヘルスチェック用のAPIエンドポイント
export async function GET() {
  // 常に "OK" という応答とステータスコード200を返す
  return NextResponse.json({ status: "OK" }, { status: 200 });
}
