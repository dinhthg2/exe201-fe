"use client";
import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function ResetPage(){
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    // Read token from query string
    if (typeof window !== 'undefined'){
      const params = new URLSearchParams(window.location.search);
      const t = params.get('token') || '';
      setToken(t);
    }
  },[]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setMessage(null);
    if (!password || password.length < 6) return setError('Mật khẩu ít nhất 6 ký tự');
    if (password !== confirm) return setError('Mật khẩu xác nhận không khớp');
    setLoading(true);
    try{
      const res = await api.post('/auth/reset', { token, password });
      setMessage(res.data.message || 'Mật khẩu đã được cập nhật');
    }catch(err){
      setError(err.response?.data?.message || 'Lỗi khi đặt lại mật khẩu');
    }finally{ setLoading(false); }
  };

  return (
    <div className="surface-light max-w-lg mx-auto mt-8 bg-[#b9edff] rounded-xl p-10 shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6">Đặt lại mật khẩu</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block mb-1 font-medium">Mật khẩu mới:</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Xác nhận mật khẩu:</label>
          <input value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" required />
        </div>
        {error && <p className="text-red-600 text-xs">{error}</p>}
        {message && <p className="text-green-700 text-xs">{message}</p>}
        <button disabled={loading} className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 rounded font-medium text-sm disabled:opacity-60" type="submit">{loading? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</button>
        <div className="my-6 border-t" />
        <p className="text-center text-xs">Quay lại <a className="underline" href="/login">Đăng nhập</a></p>
      </form>
    </div>
  );
}
