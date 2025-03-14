import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/app/db';
import { shaders } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

// @ts-ignore - Next.js 15の型定義の問題を回避
export default async function DashboardPage() {
  const authData = await auth();
  const userId = authData.userId;
  
  if (!userId) {
    redirect('/sign-in');
  }

  // ユーザーのシェーダーを取得
  const userShaders = await db.select().from(shaders).where(eq(shaders.userId, userId));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">マイシェーダー</h1>
        <Link href="/editor/new" className="btn-primary">
          新規作成
        </Link>
      </div>

      {userShaders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-600 dark:text-gray-400">
            シェーダーがまだありません
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-500">
            「新規作成」ボタンをクリックして最初のシェーダーを作成しましょう
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userShaders.map((shader) => (
            <div key={shader.id} className="card">
              <div className="p-4">
                <h2 className="text-xl font-semibold">{shader.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {new Date(shader.updatedAt).toLocaleDateString('ja-JP')}
                </p>
                {shader.description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
                    {shader.description}
                  </p>
                )}
                <div className="mt-4 flex justify-end space-x-2">
                  <Link
                    href={`/editor/${shader.id}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    編集
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 