import { useState } from 'react';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react';
import OTPModal from './OTPModal';
import { useApp } from '../../../context/AppContext';
import toast from 'react-hot-toast';

export default function ChangePasswordForm() {
  const { user } = useApp();
  const [form, setForm] = useState({ newPass: '', confirm: '' });
  const [show, setShow] = useState({ newPass: false, confirm: false });
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  if (!user) return null;

  const toggleShow = (field: 'newPass' | 'confirm') => setShow((s) => ({ ...s, [field]: !s[field] }));

  // --- 1. GỌI API GỬI OTP ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.newPass || !form.confirm) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (form.newPass.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (form.newPass !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      if (res.ok) {
        toast.success("Mã OTP đã được gửi đến email của bạn!");
        setShowOTP(true); // Mở Modal OTP
      } else {
        const data = await res.json();
        setError(data.error || 'Lỗi hệ thống khi gửi mã OTP.');
      }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HÀM CHUYỂN TIẾP ĐỂ MODAL GỌI API ĐỔI MẬT KHẨU ---
  const handleOTPVerify = async (otpCode: string) => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        otp: otpCode,
        new_password: form.newPass
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Mã OTP không chính xác");
    }

    // Nếu thành công, reset lại form
    setForm({ newPass: '', confirm: '' });
  };

  // --- 3. HÀM GỬI LẠI OTP (Dành cho nút Resend trong Modal) ---
  const handleResendOTP = async () => {
    await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email })
    });
  };

  const fields = [
    { key: 'newPass', label: 'Mật khẩu mới', placeholder: 'Tối thiểu 6 ký tự' },
    { key: 'confirm', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới' },
  ];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
        <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-start gap-3 mb-4">
          <Mail className="mt-0.5 text-blue-600 flex-shrink-0" size={18} />
          <p>Vì lý do bảo mật, một mã OTP sẽ được gửi đến email <b>{user.email}</b> để xác nhận việc đổi mật khẩu này.</p>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {fields.map(({ key, label, placeholder }) => {
          const fieldKey = key as keyof typeof form;
          return (
            <div key={key}>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={show[fieldKey] ? 'text' : 'password'}
                  placeholder={placeholder}
                  value={form[fieldKey]}
                  onChange={(e) => setForm({ ...form, [fieldKey]: e.target.value })}
                  className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(fieldKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show[fieldKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Đang gửi mã OTP...' : 'Gửi mã OTP'}
        </button>
      </form>

      {showOTP && (
        <OTPModal
          email={user.email}
          onClose={() => setShowOTP(false)}
          onVerify={handleOTPVerify}
          onResend={handleResendOTP}
        />
      )}
    </>
  );
}