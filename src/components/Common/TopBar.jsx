// Renders the app header with search, notifications, navigation, and account actions.
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaSearch, FaBell, FaUserCircle, FaBars } from 'react-icons/fa';
import UserAvatar from './UserAvatar';

const TopBar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/lessons?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-[var(--surface)] shadow-sm sticky top-0 z-40 flex justify-between items-center w-full px-6 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-[var(--surface-container-low)] rounded-full transition-colors"
          aria-label={t('topbar.toggleMenu') || 'Abrir menú'}
        >
          <FaBars className="w-5 h-5 text-[var(--on-surface-variant)]" />
        </button>
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-[var(--primary)]">
            {user?.role?.name === 'admin' ? t('topbar.admin') : 
             user?.role?.name === 'teacher' ? t('topbar.teacher') : 
             user?.role?.name === 'parent' ? t('topbar.parent') :
             t('topbar.student')}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--outline)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('topbar.search')}
            className="w-full bg-[var(--surface-container-low)] border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm"
          />
        </div>
      </form>

      <div className="flex items-center gap-4">
        <Link
          to="/notifications"
          className="relative p-2 hover:bg-[var(--surface-container-low)] rounded-full transition-colors"
          aria-label={t('topbar.notifications') || 'Notificaciones'}
        >
          <FaBell className="w-5 h-5 text-[var(--on-surface-variant)]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--error)] rounded-full border-2 border-[var(--surface)]"></span>
          )}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-[var(--surface-container-low)] p-1 rounded-full pr-3 transition-colors"
            aria-expanded={showDropdown}
            aria-controls="topbar-user-menu"
            aria-label={user?.full_name || 'Menú de usuario'}
          >
            <UserAvatar user={user} className="h-10 w-10" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[var(--on-surface)]">
                {user?.full_name || 'Usuario'}
              </p>
              <p className="text-[10px] text-[var(--on-surface-variant)]">
                {t(`topbar.role.${user?.role?.name}`) || 'Rol'}
              </p>
            </div>
          </button>

          {showDropdown && (
            <div id="topbar-user-menu" role="menu" className="absolute right-0 mt-2 w-56 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--outline-variant)] py-1 z-50">
              <Link
                to="/profile"
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--surface-container-low)] transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <FaUserCircle className="w-4 h-4" />
                {t('topbar.profile')}
              </Link>
              <hr className="my-1 border-[var(--outline-variant)]/30" />
              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--surface-container-low)] transition-colors w-full"
              >
                <span>🚪</span>
                {t('topbar.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
