'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || '로그인 실패');
      }
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm mx-4 p-8">
        <h1 className="text-xl font-bold text-black mb-1 uppercase tracking-[0.12em]">dodl</h1>
        <p className="text-sm text-[#888] mb-8">계속하려면 로그인하세요.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#888] mb-1.5 uppercase tracking-[0.08em]">
              아이디
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username"
              required
              className="w-full px-3 py-2 border border-[#e0e0e0] rounded-[10px] text-sm text-black placeholder:text-[#cccccc] focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#888] mb-1.5 uppercase tracking-[0.08em]">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 border border-[#e0e0e0] rounded-[10px] text-sm text-black focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-black text-white text-sm hover:bg-[#333] rounded-[10px] disabled:opacity-50 transition-colors mt-2 uppercase tracking-[0.06em]"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
