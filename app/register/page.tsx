"use client";
import React, { useState } from 'react';
import { useAuth } from '../../components/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

export default function RegisterPage() {
  const authSafe = useAuth() || ({} as any);
  const register = authSafe.register || (async ()=>{});
  const router = useRouter();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'', role:'student' });
  const [roleTab, setRoleTab] = useState('student');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setLoading(true);
    if (form.password !== form.confirm) { setError('Mật khẩu không khớp'); setLoading(false); return; }
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: roleTab });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Register failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex items-start lg:items-center justify-center bg-gradient-to-b from-sky-50 to-sky-100 pt-8 lg:pt-0">
      <div className="w-[92%] max-w-5xl bg-[#9fe8ff]/95 rounded-[32px] shadow-2xl border border-white/70 px-8 sm:px-10 lg:px-16 py-12 lg:py-16 min-h-[660px] lg:min-h-[780px] flex flex-col">
        <h2 className="text-4xl lg:text-5xl font-extrabold mb-10 text-center tracking-tight">Đăng Ký</h2>
        <div className="flex mb-8 w-full rounded-xl overflow-hidden border border-black/20">
          <button type="button" onClick={()=>setRoleTab('tutor')} className={`flex-1 py-3 text-base font-semibold ${roleTab==='tutor' ? 'bg-yellow-300' : 'bg-white'}`}>Gia sư</button>
          <button type="button" onClick={()=>setRoleTab('student')} className={`flex-1 py-3 text-base font-semibold ${roleTab==='student' ? 'bg-yellow-300' : 'bg-white'}`}>Học sinh</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 text-lg flex-1">
          <div>
            <label className="block mb-2 font-semibold">Họ và tên:</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full h-14 border rounded-xl px-5 focus:ring-2 focus:ring-yellow-300 outline-none bg-white" required />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Email/SDT:</label>
            <input name="email" value={form.email} onChange={handleChange} type="email" className="w-full h-14 border rounded-xl px-5 focus:ring-2 focus:ring-yellow-300 outline-none bg-white" required />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Mật khẩu:</label>
            <input name="password" value={form.password} onChange={handleChange} type="password" className="w-full h-14 border rounded-xl px-5 focus:ring-2 focus:ring-yellow-300 outline-none bg-white" required />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Nhập lại mật khẩu:</label>
            <input name="confirm" value={form.confirm} onChange={handleChange} type="password" className="w-full h-14 border rounded-xl px-5 focus:ring-2 focus:ring-yellow-300 outline-none bg-white" required />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex justify-center">
            <button disabled={loading} className="px-10 py-4 bg-yellow-400 hover:bg-yellow-300 rounded-full font-bold text-lg disabled:opacity-60 shadow-lg" type="submit">{loading? 'Đang tạo...' : 'Đăng ký'}</button>
          </div>
          <div className="my-8 border-t border-white/70" />
          <div className="space-y-3">
            <button type="button" className="w-full flex items-center justify-start gap-3 bg-white rounded-full py-3 pl-5 pr-4 text-base border whitespace-nowrap"><FcGoogle className="text-2xl" /><span>Đăng ký bằng Google</span></button>
            <button type="button" className="w-full flex items-center justify-start gap-3 bg-white rounded-full py-3 pl-5 pr-4 text-base border whitespace-nowrap"><FaFacebook className="text-2xl text-[#1877F2]" /><span>Đăng ký bằng Facebook</span></button>
          </div>
          <div className="my-8 border-t border-white/70" />
          <p className="text-center text-sm">Bạn đã có tài khoản? <a className="underline" href="/login">Đăng nhập</a></p>
        </form>
      </div>
    </div>
  );
}
