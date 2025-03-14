import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/db';
import { shaders } from '@/app/db/schema';
import { shaderSchema } from '@/app/lib/validations/shader';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const authData = await auth();
    const userId = authData.userId;

    if (!userId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    const validatedData = shaderSchema.parse(body);

    const [newShader] = await db
      .insert(shaders)
      .values({
        userId,
        title: validatedData.title,
        description: validatedData.description || null,
        code: validatedData.code,
        isPublic: validatedData.isPublic,
      })
      .returning();

    return NextResponse.json(newShader, { status: 201 });
  } catch (error) {
    console.error('シェーダー作成エラー:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '入力データが無効です', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'シェーダーの作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authData = await auth();
    const userId = authData.userId;

    if (!userId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const userShaders = await db
      .select()
      .from(shaders)
      .where(eq(shaders.userId, userId));

    return NextResponse.json(userShaders);
  } catch (error) {
    console.error('シェーダー取得エラー:', error);
    return NextResponse.json(
      { error: 'シェーダーの取得に失敗しました' },
      { status: 500 }
    );
  }
} 