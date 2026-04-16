import { useRef, useState, useEffect } from 'react';
import { X, Shield, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface OTPModalProps {
  email: string;
  onClose: () => void;
  onVerify: (otpCode: string) => Promise<void>;
  onResend: () => Promise<void>;
}

export default function OTPModal({ email, onClose, onVerify, onResend }: OTPModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const interval = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // --- HÀM GỌI API THẬT QUA PROP ---
  const handleVerify = async () => {
    const otp_code = otp.join('');
    if (otp_code.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Đợi component cha gọi API Reset Password
      await onVerify(otp_code);

      setSuccess(true);
      toast.success("Đổi mật khẩu thành công!");

      // Thành công thì tự tắt modal sau 1.5s
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      // Nếu nhập sai OTP, báo lỗi đỏ
      setError(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
      setOtp(['', '', '', '', '', '']); // Xóa trắng cho nhập lại
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM GỌI LẠI OTP QUA PROP ---
  const handleResendClick = async () => {
    if (resendTimer > 0) return;

    try {
      await onResend();
      toast.success("Đã gửi lại mã mới!");
      setOtp(['', '', '', '', '', '']);
      setError('');
      setResendTimer(60);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error("Không thể gửi lại mã lúc này.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200">
        {!loading && !success && (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition">
            <X size={20} />
          </button>
        )}

        {success ? (
          <div className="py-6 flex flex-col items-center text-center animate-in zoom-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Đổi mật khẩu thành công!</h3>
            <p className="text-sm text-gray-500">Tài khoản của bạn đã an toàn.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Shield size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Xác thực Email</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Nhập mã OTP 6 chữ số vừa được gửi đến<br />
                <span className="font-bold text-gray-900">{email}</span>
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  disabled={loading}
                  className={`w-12 h-14 text-center text-2xl font-black border-2 rounded-xl focus:outline-none transition-all ${digit
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : error
                        ? 'border-red-300 bg-red-50 focus:border-red-500'
                        : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white'
                    }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-sm font-semibold text-red-500 mb-4 animate-in slide-in-from-bottom-1">{error}</p>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || otp.join('').length < 6}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Xác nhận OTP'}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500 font-medium">
                Không nhận được mã?{' '}
                <button
                  onClick={handleResendClick}
                  disabled={resendTimer > 0 || loading}
                  className={`font-bold transition ${resendTimer > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                >
                  {resendTimer > 0 ? `Gửi lại (${resendTimer}s)` : 'Gửi lại ngay'}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}