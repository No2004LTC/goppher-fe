import { useRef, useState, useEffect } from 'react';
import { X, Shield, CheckCircle } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

export default function OTPModal({ email, onClose, onVerify }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const interval = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
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

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otp_code = otp.join('');
    if (otp_code.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }
    setLoading(true);
    setVerifyProgress(0);
    
    // Simulate verification progress
    const interval = setInterval(() => {
      setVerifyProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
    
    await new Promise((r) => setTimeout(r, 1000));

    const payload = { email, otp_code };
    console.log('OTP Payload:', payload);

    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      onVerify(payload);
      onClose();
    }, 1500);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    setResendTimer(60);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="py-4 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Xác thực thành công!</h3>
            <p className="text-sm text-gray-500">Mật khẩu của bạn đã được cập nhật.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
                <Shield size={26} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Xác thực OTP</h3>
              <p className="text-sm text-gray-500 mt-1">
                Mã OTP 6 chữ số đã được gửi đến
              </p>
              <p className="text-sm font-semibold text-blue-600">{email}</p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
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
                  className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition ${
                    digit
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-900 focus:border-blue-500'
                  }`}
                  style={{ height: '52px' }}
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-xs text-red-500 mb-3">{error}</p>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || otp.join('').length < 6}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
            </button>

            {loading && (
              <div className="mt-3">
                <ProgressBar 
                  progress={verifyProgress} 
                  color="blue" 
                  size="sm"
                  showPercentage={false}
                />
              </div>
            )}

            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Không nhận được mã?{' '}
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className={`font-semibold ${resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
                >
                  {resendTimer > 0 ? `Gửi lại (${resendTimer}s)` : 'Gửi lại'}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
