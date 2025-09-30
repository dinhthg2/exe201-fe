"use client";
import React, { useState } from 'react';
import { useAuth } from '../../components/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

export default function LoginPage() {
  const authSafe = useAuth() || ({} as any);
  const login = authSafe.login || (async (_e: string,_p: string)=>{});
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleTab, setRoleTab] = useState('tutor');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await login(email, password);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.role === 'admin') router.push('/admin'); else router.push('/dashboard');
      } else { router.push('/dashboard'); }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex items-start lg:items-center justify-center bg-gradient-to-b from-sky-50 to-sky-100 pt-8 lg:pt-0">
      <div className="w-[92%] max-w-5xl bg-[#9fe8ff]/95 rounded-[32px] shadow-2xl border border-white/70 px-8 sm:px-10 lg:px-16 py-12 lg:py-16 min-h-[620px] lg:min-h-[720px] flex flex-col">
        <h2 className="text-4xl lg:text-5xl font-extrabold mb-10 text-center tracking-tight">Đăng Nhập</h2>
        <form onSubmit={handleSubmit} className="space-y-6 text-lg flex-1">
          <div>
            <label className="block mb-2 font-semibold">Email/SDT:</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full h-14 border rounded-xl px-5 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white" required />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Mật khẩu:</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full h-14 border rounded-xl px-5 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white" required />
          </div>
          <div className="flex justify-between items-center text-sm lg:text-base">
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-yellow-400" /> Ghi nhớ mật khẩu</label>
            <a href="/login/forgot" className="underline">Quên mật khẩu?</a>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex justify-center">
            <button disabled={loading} className="px-10 py-4 bg-yellow-400 hover:bg-yellow-300 rounded-full font-bold text-lg disabled:opacity-60 shadow-lg" type="submit">{loading? 'Đang xử lý...' : 'Đăng nhập'}</button>
          </div>
          <div className="my-8 border-t border-white/70" />
          <div className="space-y-3">
            <button type="button" className="w-full flex items-center justify-start gap-3 bg-white rounded-full py-3 pl-5 pr-4 text-base border whitespace-nowrap"><FcGoogle className="text-2xl" /><span>Đăng nhập bằng Google</span></button>
            <button type="button" className="w-full flex items-center justify-start gap-3 bg-white rounded-full py-3 pl-5 pr-4 text-base border whitespace-nowrap"><FaFacebook className="text-2xl text-[#1877F2]" /><span>Đăng nhập bằng Facebook</span></button>
          </div>
          <div className="my-8 border-t border-white/70" />
          <p className="text-center text-sm">Bạn chưa có tài khoản? <a className="underline" href="/register">Đăng ký</a></p>
        </form>
      </div>
    </div>
  );
}
