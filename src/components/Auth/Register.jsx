// Provides account registration with form validation and Google authentication.
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { FaEnvelope, FaLock, FaUser, FaGraduationCap, FaEye, FaEyeSlash, FaUsers, FaChevronDown, FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePublicConfig, DEFAULT_BRAND_NAME } from '../../api/publicConfig';

const Register = () => {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t, lang, changeLanguage } = useLanguage();
  const brand = usePublicConfig();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validationSchema = yup.object().shape({
    full_name: yup.string().required(t('auth.register.nameRequired')),
    email: yup.string().email(t('auth.register.emailInvalid')).required(t('auth.register.emailRequired')),
    password: yup.string().min(8, t('auth.register.passwordMin')).required(t('auth.register.passwordRequired')),
    password_confirmation: yup.string()
      .oneOf([yup.ref('password'), null], t('auth.register.passwordMatch'))
      .required(t('auth.register.confirmPasswordRequired')),
    academic_level: yup.string().required(t('auth.register.levelRequired')),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await registerUser(data);
    setLoading(false);

    if (result.success) {
      toast.success(t('auth.register.successMsg'));
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    // El registro con Google usa el mismo flujo de autenticación que el inicio de sesión.
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      toast.success(t('auth.register.welcomeGoogle'));
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

  const inputClass = "w-full pl-11 pr-11 py-3 rounded-xl bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white border border-transparent transition placeholder-gray-400";

  return (
    <div className="min-h-screen flex bg-white flex-row-reverse">
      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
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

        <div className="max-w-md w-full mx-auto my-auto py-4">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            {t('auth.register.title')}
          </h2>
          <p className="text-gray-500 mt-2 font-medium">{t('auth.register.subtitle')}</p>

          <div className="mt-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error(t('auth.register.googleError'))}
              theme="outline"
              shape="pill"
              text="signup_with"
              size="large"
              width="100%"
            />

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase">{t('auth.register.orContinueWith')}</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reg-name" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.register.fullName')}</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  id="reg-name"
                  type="text"
                  {...register('full_name')}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white border border-transparent transition placeholder-gray-400"
                  placeholder={t('auth.register.fullNamePlaceholder')}
                />
              </div>
              {errors.full_name && <p className="text-sm text-red-500 font-medium">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-email" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.register.email')}</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  id="reg-email"
                  type="email"
                  {...register('email')}
                  className={inputClass}
                  placeholder="estudiante@sim.edu"
                />
              </div>
              {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-level" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.register.academicLevel')}</label>
              <div className="relative">
                <FaGraduationCap className="absolute left-4 top-3.5 text-gray-400" />
                <select
                  id="reg-level"
                  {...register('academic_level')}
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white border border-transparent transition appearance-none cursor-pointer"
                >
                  <option value="">{t('auth.register.selectLevel')}</option>
                  <option value="basic">{t('auth.register.basic')}</option>
                  <option value="intermediate">{t('auth.register.intermediate')}</option>
                </select>
                <FaChevronDown className="absolute right-4 top-3.5 text-gray-400 text-xs pointer-events-none" />
              </div>
              {errors.academic_level && <p className="text-sm text-red-500 font-medium">{errors.academic_level.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-password" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.register.password')}</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={inputClass}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-confirm" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.register.confirmPassword')}</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  {...register('password_confirmation')}
                  className={inputClass}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition"
                  aria-label="toggle confirm password visibility"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password_confirmation && <p className="text-sm text-red-500 font-medium">{errors.password_confirmation.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? t('auth.register.loading') : t('auth.register.submit')}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            {t('auth.register.haveAccount')}{' '}
            <Link to="/login" className="text-purple-600 font-bold hover:underline">
              {t('auth.register.signIn')}
            </Link>
          </p>
        </div>
      </div>

      {/* Panel izquierdo - Ilustración */}
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
            <Link to="/login" className="text-white/80 hover:text-white font-medium transition">
              {t('auth.register.signIn')}
            </Link>
            <Link
              to="/login"
              className="bg-white text-purple-900 font-bold px-5 py-2 rounded-full hover:bg-purple-100 transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 pb-12">
          <img
            src="/aulamate_register.jpg"
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

export default Register;
