import { Metadata } from 'next';
import NewShaderClient from './client';

export const metadata: Metadata = {
  title: '新規シェーダー作成 - VJMix',
  description: '新しいGLSLシェーダーを作成します',
};

// @ts-ignore - Next.js 15の型定義の問題を回避
export default function NewShaderPage() {
  return <NewShaderClient />;
} 