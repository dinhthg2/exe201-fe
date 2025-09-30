"use client";
import React, { useState } from 'react';
import api from '../../../lib/api';

export default function ForgotPage(){
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setMessage(null);
    try{
      const res = await api.post('/auth/forgot', { email });
      setMessage(res.data.message || 'Đã gửi email');
      if (res.data.previewUrl) setMessage(prev => prev + '\n(Preview: ' + res.data.previewUrl + ')');
    }catch(err){
      setError(err.response?.data?.message || 'Lỗi khi gửi email');
    }finally{ setLoading(false); }
  };

  return (
    <div className="surface-light max-w-lg mx-auto mt-8 bg-[#b9edff] rounded-xl p-10 shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6">Quên mật khẩu</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block mb-1 font-medium">Email:</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300" required />
        </div>
        {error && <p className="text-red-600 text-xs whitespace-pre-line">{error}</p>}
        {message && <p className="text-green-700 text-xs whitespace-pre-line">{message}</p>}
        <button disabled={loading} className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 rounded font-medium text-sm disabled:opacity-60" type="submit">{loading? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}</button>
        <div className="my-6 border-t" />
        <p className="text-center text-xs">Quay lại <a className="underline" href="/login">Đăng nhập</a></p>
      </form>
    </div>
  );
}
