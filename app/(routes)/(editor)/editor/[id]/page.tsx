import { Metadata } from 'next';
import ShaderEditorClient from './client';

export const metadata: Metadata = {
  title: 'シェーダーエディタ - VJMix',
  description: 'GLSLシェーダーをリアルタイムに編集・プレビューできるエディタ',
};

// @ts-ignore - Next.js 15の型定義の問題を回避
export default function EditorPage({ params }: any) {
  return <ShaderEditorClient id={params.id} />;
} 