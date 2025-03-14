'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ShaderEditor from '@/app/components/ShaderEditor';

export default function NewShaderClient() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (code: string) => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/shaders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '新しいシェーダー',
          code,
          isPublic: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error('シェーダーの保存に失敗しました');
      }
      
      const data = await response.json();
      router.push(`/editor/${data.id}`);
    } catch (error) {
      console.error('保存エラー:', error);
      alert('シェーダーの保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen">
      <ShaderEditor onSave={handleSave} />
    </div>
  );
} 