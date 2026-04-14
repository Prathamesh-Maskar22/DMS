import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || 'Login failed');

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));

      // onLogin(data.user.role);
      navigate('/dashboard'); // ← uncomment if you want auto-redirect
    } catch (err) {
      console.log(err);
      
      setError("Something Went Wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 overflow-hidden relative font-sans">

      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 py-2 sm:px-10 sm:py-3 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm">
        <img
          src="/VGS-Logo.png"
          alt="VGS Logo"
          className="h-10 sm:h-12 w-auto transition-transform hover:scale-105 duration-300"
        />
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-8 py-10 md:py-0">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 items-center">

          {/* Illustration side – hidden on mobile */}
          <div className="hidden lg:flex lg:items-center lg:justify-center relative">
            <div className="absolute w-[420px] h-[420px] bg-gradient-to-br from-blue-300/20 to-cyan-200/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
            <img
              src="/Login_Illustrator.svg"
              alt="Login Illustration"
              className="w-90 xl:w-110 drop-shadow-2xl transition-all duration-700 hover:scale-105 hover:rotate-2"
            />
          </div>

          {/* Form Card – Glassmorphism */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-blue-50/30 rounded-3xl blur-xl -z-10"></div>

            <div className="bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-black/10 rounded-3xl p-8 sm:p-10 animate-fade-in-up">
              <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-4.5xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-[#003566]">
                  Welcome Back
                </h1>
                <p className="mt-3 text-slate-600 text-base">
                  Sign in to continue your journey
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7">

                {error && (
                  <div className="bg-red-50/80 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-medium animate-shake">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="peer w-full px-5 py-4 rounded-2xl border border-slate-300/70 bg-white/60 backdrop-blur-sm focus:border-[#003566] focus:ring-4 focus:ring-[#003566]/20 outline-none transition-all duration-300 placeholder-transparent"
                    placeholder=" "
                  />
                  <label className="absolute left-5 -top-2.5 px-2 bg-white/80 text-sm font-medium text-slate-600 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#003566] peer-focus:bg-white/90 rounded-md group-hover:text-[#003566]/80">
                    Email address
                  </label>
                </div>

                {/* Password */}
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="peer w-full px-5 py-4 pr-12 rounded-2xl border border-slate-300/70 bg-white/60 backdrop-blur-sm focus:border-[#003566] focus:ring-4 focus:ring-[#003566]/20 outline-none transition-all duration-300 placeholder-transparent"
                    placeholder=" "
                  />
                  <label className="absolute left-5 -top-2.5 px-2 bg-white/80 text-sm font-medium text-slate-600 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#003566] peer-focus:bg-white/90 rounded-md group-hover:text-[#003566]/80">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#003566] transition-colors p-1 rounded-full hover:bg-white/50"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#003566] to-[#004b8d] text-white font-semibold text-lg rounded-2xl shadow-lg shadow-[#003566]/30 hover:shadow-xl hover:shadow-[#003566]/40 hover:scale-[1.02] focus:ring-4 focus:ring-[#003566]/30 disabled:opacity-60 disabled:scale-100 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Optional extras – uncomment if wanted */}
              {/* <div className="mt-6 text-center text-sm text-slate-600">
                <a href="#" className="text-[#003566] hover:underline font-medium">Forgot password?</a>
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;