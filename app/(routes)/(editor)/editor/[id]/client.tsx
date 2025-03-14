'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ShaderEditor from '@/app/components/ShaderEditor';

interface ShaderEditorClientProps {
  id: string;
}

export default function ShaderEditorClient({ id }: ShaderEditorClientProps) {
  const router = useRouter();
  const [shader, setShader] = useState<{ id: string; code: string; title: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShader = async () => {
      try {
        const response = await fetch(`/api/shaders/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('シェーダーが見つかりませんでした');
          }
          throw new Error('シェーダーの取得に失敗しました');
        }
        
        const data = await response.json();
        setShader(data);
      } catch (err) {
        setError((err as Error).message);
        console.error('読み込みエラー:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShader();
  }, [id]);

  const handleSave = async (code: string) => {
    try {
      const response = await fetch(`/api/shaders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
        }),
      });
      
      if (!response.ok) {
        throw new Error('シェーダーの更新に失敗しました');
      }
      
      // 成功メッセージを表示するなどの処理
    } catch (error) {
      console.error('更新エラー:', error);
      alert('シェーダーの更新に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-editor-bg text-white">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error || !shader) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-editor-bg text-white">
        <p className="text-red-400">{error || 'シェーダーの読み込みに失敗しました'}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded"
        >
          ダッシュボードに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ShaderEditor initialCode={shader.code} onSave={handleSave} />
    </div>
  );
} 