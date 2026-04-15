import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Zap, AlertCircle, Mail } from 'lucide-react'; // Đã dùng lại Mail
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  // Sửa state thành email để khớp với DTO Backend
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form), // form giờ là { email, password } -> Chuẩn bài!
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Tài khoản hoặc mật khẩu không đúng');
      }

      const token = data.data?.access_token || data.access_token;
      const userData = data.data?.user || data.user;

      if (!token) {
        console.error("Dữ liệu trả về thiếu access_token:", data);
        throw new Error('Server không trả về access_token.');
      }

      if (!userData || !userData.id) {
        console.error("Backend không trả về thông tin user hoặc thiếu ID!", data);
        throw new Error('Dữ liệu user bị lỗi.');
      }

      // Nhét thẳng dữ liệu thật vào Context
      login({ token, user: userData });
      console.log("Đăng nhập thành công, token đã lưu!");

    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-200">
            <Zap size={28} className="text-white fill-current" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ConnectVN</h1>
          <p className="text-gray-500 mt-2">Chào mừng Gopher quay trở lại!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Đăng nhập</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3 text-red-700 text-sm animate-pulse">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                Địa chỉ Email
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email" // Bật validate email của HTML5
                  required
                  placeholder="gopher@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Mật khẩu</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Đăng nhập ngay'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-500">
              Chưa có tài khoản?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Tạo tài khoản mới
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}