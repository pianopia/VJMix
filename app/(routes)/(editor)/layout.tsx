import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-editor-bg text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-primary-400">
            VJMix
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-300 hover:text-white">
              ダッシュボード
            </Link>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
} 