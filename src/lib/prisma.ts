import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

// この関数は、Neonアダプタを持つ新しいPrisma Clientインスタンスを作成します。
// 初期化ロジックを関数でラップすることで、モジュールのトップレベルで実行されるのを防ぎます。
// これはビルドプロセス中の問題を回避するのに役立ちます。
const prismaClientSingleton = () => {
  const connectionString = `${process.env.DATABASE_URL}`;
  const pool = new Pool({ connectionString });
  // この行のためにESLintルールも無効化しています。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeon(pool as any);

  return new PrismaClient({
    // Vercelのビルド環境で繰り返し発生する型不整合の問題を回避するため、
    // adapterを`any`型としてキャストしています。
    // この行のためにESLintルールも無効化しています。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: adapter as any,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

// グローバルなprismaインスタンスの型を定義します。
// `ReturnType`を使用することで、シングルトン関数への変更に強くなります。
declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// グローバルオブジェクトにアクセスするための標準的な方法である`globalThis`を使用します。
// `globalThis.prisma`が既に存在する場合はそれを再利用し、なければ新しいインスタンスを作成します。
// これがシングルトンパターンの核となります。
const prisma = globalThis.prisma ?? prismaClientSingleton();

// アプリケーション全体で使用するために、単一のインスタンスをエクスポートします。
export default prisma;

// 本番環境以外では、クライアントをグローバルオブジェクトに割り当てます。
// これにより、ホットリロードによってPrisma Clientの新しいインスタンスが作成されるのを防ぎます。
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
