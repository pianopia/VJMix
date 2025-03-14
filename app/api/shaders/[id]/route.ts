import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/db';
import { shaders } from '@/app/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// シェーダー更新用のスキーマ
const updateShaderSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  code: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
});

// @ts-ignore - Next.js 15の型定義の問題を回避
export async function GET(req: NextRequest, context: any) {
  const { params } = context;
  try {
    const authData = await auth();
    const userId = authData.userId;

    if (!userId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const shader = await db.query.shaders.findFirst({
      where: and(
        eq(shaders.id, params.id),
        eq(shaders.userId, userId)
      ),
    });

    if (!shader) {
      return NextResponse.json(
        { error: 'シェーダーが見つかりませんでした' },
        { status: 404 }
      );
    }

    return NextResponse.json(shader);
  } catch (error) {
    console.error('シェーダー取得エラー:', error);
    return NextResponse.json(
      { error: 'シェーダーの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// @ts-ignore - Next.js 15の型定義の問題を回避
export async function PATCH(req: NextRequest, context: any) {
  const { params } = context;
  try {
    const authData = await auth();
    const userId = authData.userId;

    if (!userId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // シェーダーの所有者を確認
    const existingShader = await db.query.shaders.findFirst({
      where: and(
        eq(shaders.id, params.id),
        eq(shaders.userId, userId)
      ),
    });

    if (!existingShader) {
      return NextResponse.json(
        { error: 'シェーダーが見つかりませんでした' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = updateShaderSchema.parse(body);

    const [updatedShader] = await db
      .update(shaders)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(shaders.id, params.id))
      .returning();

    return NextResponse.json(updatedShader);
  } catch (error) {
    console.error('シェーダー更新エラー:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '入力データが無効です', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'シェーダーの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// @ts-ignore - Next.js 15の型定義の問題を回避
export async function DELETE(req: NextRequest, context: any) {
  const { params } = context;
  try {
    const authData = await auth();
    const userId = authData.userId;

    if (!userId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // シェーダーの所有者を確認
    const existingShader = await db.query.shaders.findFirst({
      where: and(
        eq(shaders.id, params.id),
        eq(shaders.userId, userId)
      ),
    });

    if (!existingShader) {
      return NextResponse.json(
        { error: 'シェーダーが見つかりませんでした' },
        { status: 404 }
      );
    }

    await db
      .delete(shaders)
      .where(eq(shaders.id, params.id));

    return NextResponse.json(
      { message: 'シェーダーが削除されました' },
      { status: 200 }
    );
  } catch (error) {
    console.error('シェーダー削除エラー:', error);
    return NextResponse.json(
      { error: 'シェーダーの削除に失敗しました' },
      { status: 500 }
    );
  }
} 