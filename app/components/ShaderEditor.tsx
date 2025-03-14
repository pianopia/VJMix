'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// デフォルトのシェーダーコード
const DEFAULT_FRAGMENT_SHADER = `
precision mediump float;
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  
  // 時間によって変化する色
  vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0, 2, 4));
  
  gl_FragColor = vec4(color, 1.0);
}
`;

const DEFAULT_VERTEX_SHADER = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

interface ShaderEditorProps {
  initialCode?: string;
  onSave?: (code: string) => void;
}

export default function ShaderEditor({ initialCode = DEFAULT_FRAGMENT_SHADER, onSave }: ShaderEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isCodeOverlayVisible, setIsCodeOverlayVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const [time, setTime] = useState(0);

  // 時間の更新
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setTime((prevTime) => prevTime + 0.01);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // シェーダーコードの変更を処理
  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
      setError(null);
    }
  };

  // シェーダーの保存
  const handleSave = () => {
    if (onSave) {
      onSave(code);
    }
  };

  // 別ウィンドウでプレビューを開く
  const openInNewWindow = () => {
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>VJMix Preview</title>
            <style>
              body { margin: 0; overflow: hidden; }
              canvas { display: block; }
            </style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
          </head>
          <body>
            <div id="canvas-container" style="width: 100vw; height: 100vh;"></div>
            <script>
              const container = document.getElementById('canvas-container');
              const renderer = new THREE.WebGLRenderer();
              renderer.setSize(window.innerWidth, window.innerHeight);
              container.appendChild(renderer.domElement);
              
              const scene = new THREE.Scene();
              const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
              camera.position.z = 1;
              
              const fragmentShader = \`${code}\`;
              const vertexShader = \`${DEFAULT_VERTEX_SHADER}\`;
              
              const uniforms = {
                time: { value: 0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
              };
              
              const material = new THREE.ShaderMaterial({
                fragmentShader,
                vertexShader,
                uniforms
              });
              
              const geometry = new THREE.PlaneGeometry(4, 4);
              const mesh = new THREE.Mesh(geometry, material);
              scene.add(mesh);
              
              function animate() {
                requestAnimationFrame(animate);
                uniforms.time.value += 0.01;
                renderer.render(scene, camera);
              }
              
              animate();
              
              window.addEventListener('resize', () => {
                renderer.setSize(window.innerWidth, window.innerHeight);
                uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
              });
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  // シェーダーマテリアル
  const ShaderMaterial = () => {
    const uniforms = {
      time: { value: time },
      resolution: { value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2) }
    };

    try {
      return (
        <shaderMaterial
          ref={shaderMaterialRef}
          fragmentShader={code}
          vertexShader={DEFAULT_VERTEX_SHADER}
          uniforms={uniforms}
        />
      );
    } catch (err) {
      setError((err as Error).message);
      return (
        <meshBasicMaterial color="red" />
      );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-2 bg-editor-bg text-white">
        <div className="flex space-x-2">
          <button
            onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            {isPreviewVisible ? 'プレビュー非表示' : 'プレビュー表示'}
          </button>
          <button
            onClick={() => setIsCodeOverlayVisible(!isCodeOverlayVisible)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            disabled={!isPreviewVisible}
          >
            {isCodeOverlayVisible ? 'コードオーバーレイ非表示' : 'コードオーバーレイ表示'}
          </button>
          <button
            onClick={openInNewWindow}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            別ウィンドウで開く
          </button>
        </div>
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-primary-600 hover:bg-primary-700 rounded"
        >
          保存
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`${isPreviewVisible ? 'w-1/2' : 'w-full'} h-full`}>
          <Editor
            height="100%"
            defaultLanguage="glsl"
            defaultValue={code}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </div>

        {isPreviewVisible && (
          <div className="w-1/2 h-full relative">
            <Canvas>
              <OrbitControls enablePan={false} />
              <mesh>
                <planeGeometry args={[2, 2]} />
                <ShaderMaterial />
              </mesh>
            </Canvas>
            
            {isCodeOverlayVisible && (
              <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 text-white p-4 overflow-auto">
                <pre className="text-xs opacity-70">{code}</pre>
              </div>
            )}
            
            {error && (
              <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white p-2">
                エラー: {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 