// Lets users view and update their profile details and password.
import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaSave, FaGoogle } from 'react-icons/fa';
import Loading from '../Common/Loading';
import UserAvatar from './UserAvatar';
import { useLanguage } from '../../contexts/LanguageContext';

const Profile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch
  } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authApi.getProfile();
      const data = response.data?.user || response.data || null;
      setProfile(data);
      if (data) {
        resetProfile({
          full_name: data.full_name || '',
          email: data.email || '',
        });
      }
    } catch (error) {
      toast.error(t('profile.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const onSaveProfile = async (data) => {
    try {
      setSaving(true);
      await authApi.updateProfile(data);
      toast.success(t('profile.updatedSuccess'));
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    if (data.new_password !== data.new_password_confirmation) {
      toast.error(t('profile.passwordsMismatch'));
      return;
    }
    try {
      setChangingPassword(true);
      await authApi.changePassword(data);
      toast.success(t('profile.passwordSuccess'));
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || t('profile.passwordError'));
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <Loading />;

  const isGoogleAccount = profile?.provider === 'google';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[var(--on-surface)]">{t('profile.title')}</h2>
        <p className="text-[var(--on-surface-variant)]">
          {t('profile.subtitle')}
        </p>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)] flex items-center gap-6">
        <UserAvatar user={profile} className="h-20 w-20 text-3xl" />
        <div>
          <h3 className="text-xl font-bold text-[var(--on-surface)]">{profile?.full_name || t('profile.user')}</h3>
          <p className="text-[var(--on-surface-variant)]">{profile?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)]">
            {profile?.role?.name?.toUpperCase() || t('profile.noRole')}
          </span>
          {isGoogleAccount && (
            <span className="inline-flex items-center gap-1 ml-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              <FaGoogle className="w-3 h-3" /> {t('profile.googleAccount')}
            </span>
          )}
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6">{t('profile.personalInfo')}</h3>
        <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-4">
          <div>
            <label htmlFor="profile-fullname" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              <FaUser className="inline mr-2" />
              {t('profile.fullName')}
            </label>
            <input
              id="profile-fullname"
              type="text"
              {...registerProfile('full_name', { required: true })}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              <FaEnvelope className="inline mr-2" />
              {t('profile.email')}
            </label>
            <input
              id="profile-email"
              type="email"
              {...registerProfile('email', { required: true })}
              disabled={isGoogleAccount}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] disabled:opacity-60"
            />
            {isGoogleAccount && (
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                {t('profile.googleEmailEdit')}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave />
            {saving ? t('profile.saving') : t('profile.save')}
          </button>
        </form>
      </div>

      {!isGoogleAccount && (
        <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6">{t('profile.changePassword')}</h3>
          <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label htmlFor="profile-current-password" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                <FaLock className="inline mr-2" />
                {t('profile.currentPassword')}
              </label>
              <input
                id="profile-current-password"
                type="password"
                {...registerPassword('current_password', { required: true })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
            </div>
            <div>
              <label htmlFor="profile-new-password" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('profile.newPassword')}
              </label>
              <input
                id="profile-new-password"
                type="password"
                {...registerPassword('new_password', { required: true, minLength: 8 })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
            </div>
            <div>
              <label htmlFor="profile-confirm-password" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('profile.confirmPassword')}
              </label>
              <input
                id="profile-confirm-password"
                type="password"
                {...registerPassword('new_password_confirmation', { required: true })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-3 bg-[var(--secondary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <FaLock />
              {changingPassword ? t('profile.updating') : t('profile.updatePassword')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;