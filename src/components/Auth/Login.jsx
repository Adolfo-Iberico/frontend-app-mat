// Provides the sign-in form, including Google authentication and language selection.
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { FaEnvelope, FaLock, FaUsers, FaChevronDown, FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePublicConfig, DEFAULT_BRAND_NAME } from '../../api/publicConfig';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t, lang, changeLanguage } = useLanguage();
  const brand = usePublicConfig();
  const [loading, setLoading] = useState(false);

  const validationSchema = yup.object().shape({
    email: yup.string().email(t('auth.login.emailInvalid')).required(t('auth.login.emailRequired')),
    password: yup.string().required(t('auth.login.passwordRequired')),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);

    if (result.success) {
      toast.success(t('auth.login.welcomeBack'));
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    // El proveedor de autenticación intercambia la credencial de Google por la sesión de la app.
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      toast.success(t('auth.login.welcomeGoogle'));
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const langs = [
    { code: 'es', label: 'ES' },
    { code: 'en', label: 'EN' },
    { code: 'qu', label: 'QU' },
  ];

  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white border border-transparent transition placeholder-gray-400";

  return (
    <div className="min-h-screen flex bg-white">
      {/* Panel izquierdo - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-12 py-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Aula<span className="text-purple-600">mate</span>
          </h1>
          <div className="relative">
            <FaGlobe className="absolute left-3 top-2.5 text-gray-400 text-xs" />
            <select
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {langs.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-3 text-gray-400 text-xs pointer-events-none" />
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-8">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            {t('auth.login.welcome')}!
          </h2>
          <p className="text-gray-500 mt-2 font-medium">{t('auth.login.subtitle')}</p>

          <div className="mt-8">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error(t('auth.login.googleError'))}
              theme="outline"
              shape="pill"
              text="continue_with"
              size="large"
              width="100%"
            />

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase">{t('auth.login.orContinueWith')}</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.login.email')}</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  {...register('email')}
                  className={inputClass}
                  placeholder="estudiante@sim.edu"
                  aria-required="true"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="login-password" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.login.password')}</label>
                <Link to="/forgot-password" className="text-sm text-purple-600 hover:underline font-semibold">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  id="login-password"
                  type="password"
                  {...register('password')}
                  className={inputClass}
                  placeholder="••••••••"
                  aria-required="true"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? t('auth.login.loading') : t('auth.login.submit')}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="text-purple-600 font-bold hover:underline">
              {t('auth.login.signUp')}
            </Link>
          </p>

          <p className="text-center mt-6 text-xs text-gray-400">
            {t('auth.login.termsText')}{' '}<Link to="/terms" className="underline hover:text-purple-600">{t('auth.login.terms')}</Link>{' '}{t('auth.login.and')}{' '}<Link to="/privacy" className="underline hover:text-purple-600">{t('auth.login.privacy')}</Link>
          </p>
        </div>
      </div>

      {/* Panel derecho - Ilustración */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-fuchsia-500/20 blur-3xl"></div>

        <div className="relative z-10 flex items-center justify-between px-10 py-8">
          <div className="flex items-center gap-2 text-white font-semibold">
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.institution_name || DEFAULT_BRAND_NAME}
                className="w-6 h-6 rounded-full object-contain"
              />
            ) : (
              <FaUsers className="text-purple-300" />
            )}
            <span>{brand.institution_name || DEFAULT_BRAND_NAME}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/register" className="text-white/80 hover:text-white font-medium transition">
              {t('auth.login.signUp')}
            </Link>
            <Link
              to="/register"
              className="bg-white text-purple-900 font-bold px-5 py-2 rounded-full hover:bg-purple-100 transition"
            >
              Join Us
            </Link>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 pb-12">
          <img
            src="/aulamate_login.jpg"
            alt="Aulamate"
            className="w-full max-w-md mx-auto object-contain mix-blend-screen"
          />
          <h3 className="text-white text-2xl font-bold mt-6">¡Aprende matemáticas jugando!</h3>
          <p className="text-purple-200/80 mt-2 text-center max-w-sm">
            Lecciones interactivas, evaluaciones y progreso en tiempo real.
          </p>
        </div>

        <div className="absolute bottom-8 left-10 z-10 text-white/40 text-xs font-mono">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            {brand.institution_name || DEFAULT_BRAND_NAME} v1.0
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
