// Renders the primary navigation menu with links appropriate to the user's role.
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePublicConfig, DEFAULT_BRAND_NAME } from '../../api/publicConfig';
import {
  FaHome, FaBook, FaClipboardList, FaChartBar,
  FaUsers, FaCog, FaQuestionCircle, FaPlus, FaChild,
  FaTrophy, FaChalkboardTeacher, FaLanguage, FaFlask, FaComments, FaUserFriends, FaDoorOpen, FaGamepad,
  FaChevronDown, FaChevronRight, FaUserGraduate
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isTeacher, isParent, isStudent, isCoordinator, isDirector } = useAuth();
  const { t } = useLanguage();
  const brand = usePublicConfig();
  const [openCats, setOpenCats] = useState({});

  const isActive = (path) => location.pathname === path;
  const isWithin = (path) => location.pathname.startsWith(path);
  const toggleCat = (key) => setOpenCats((prev) => ({ ...prev, [key]: !prev[key] }));

  const dashboardPath = isAdmin()
    ? '/admin/dashboard'
    : isTeacher()
      ? '/teacher/dashboard'
      : isParent()
        ? '/parent'
        : '/dashboard';

  const navItem = (path, label, icon) => ({ path, label, icon, active: isActive(path) });

  const categories = [];
  const standalone = [navItem(dashboardPath, t('nav.dashboard'), FaHome)];

  if (isParent()) {
    categories.push({
      key: 'main',
      title: t('nav.catMain'),
      items: [navItem('/parent', t('nav.children'), FaChild)],
    });
  }

  const learningItems = [];
  learningItems.push(navItem('/lessons', t('nav.lessons'), FaBook));
  learningItems.push(navItem(
    isTeacher() ? '/teacher/exams' : '/evaluations',
    t('nav.evaluations'),
    FaClipboardList
  ));
  if (isTeacher()) {
    learningItems.push(navItem('/teacher/salones', t('nav.salones'), FaDoorOpen));
    learningItems.push(navItem('/teacher/games', t('nav.games'), FaGamepad));
  }
  if (isCoordinator() || isDirector()) {
    learningItems.push(navItem('/coordinator/salones', t('nav.salones'), FaDoorOpen));
  }
  if (isStudent()) {
    learningItems.push(navItem('/my-courses', t('nav.myCourses'), FaDoorOpen));
    learningItems.push(navItem('/games', t('nav.games'), FaGamepad));
    learningItems.push(navItem('/simulations', t('nav.simulations'), FaFlask));
  }
  if (learningItems.length > 0) {
    categories.push({ key: 'learning', title: t('nav.catLearning'), items: learningItems });
  }

  const communityItems = [];
  if (isTeacher() || isAdmin()) {
    communityItems.push(navItem('/reports', t('nav.reports'), FaChartBar));
    communityItems.push(navItem('/teacher/calendar', t('nav.calendar'), FaChalkboardTeacher));
  }
  if (isTeacher() || isCoordinator() || isDirector() || isAdmin()) {
    communityItems.push(navItem('/students-manager', t('nav.studentsManager'), FaUserGraduate));
  }
  if (isTeacher() || isStudent()) {
    communityItems.push(navItem('/messages', t('nav.messages'), FaComments));
    communityItems.push(navItem('/forum', t('nav.forum'), FaUserFriends));
  }
  if (isStudent()) {
    communityItems.push(navItem('/gamification', t('nav.gamification'), FaTrophy));
  }
  if (communityItems.length > 0) {
    categories.push({ key: 'community', title: t('nav.catCommunity'), items: communityItems });
  }

  const adminItems = [];
  if (isAdmin()) {
    adminItems.push(navItem('/admin/users', t('nav.users'), FaUsers));
    adminItems.push(navItem('/admin/config', t('nav.config'), FaCog));
    adminItems.push(navItem('/admin/translations', t('nav.translations'), FaLanguage));
  }
  if (adminItems.length > 0) {
    categories.push({ key: 'admin', title: t('nav.catAdmin'), items: adminItems });
  }

  const renderItem = (item) => (
    <Link
      key={item.path}
      to={item.path}
      aria-label={item.label}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        item.active
          ? 'bg-[var(--primary)] text-white font-bold shadow-lg'
          : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
      }`}
    >
      <item.icon className="w-5 h-5" />
      <span className="text-sm">{item.label}</span>
    </Link>
  );

  const renderCategory = (cat) => {
    const open = openCats[cat.key] ?? true;
    const hasActive = cat.items.some((i) => i.active);
    return (
      <div key={cat.key} className="space-y-1">
        <button
          onClick={() => toggleCat(cat.key)}
          aria-expanded={open}
          className={`flex items-center justify-between w-full px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${
            hasActive ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'
          }`}
        >
          <span>{cat.title}</span>
          {open ? <FaChevronDown className="w-3 h-3" /> : <FaChevronRight className="w-3 h-3" />}
        </button>
        {open && cat.items.map(renderItem)}
      </div>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--surface-container)] flex flex-col z-40 hidden md:flex border-r border-[var(--outline-variant)]/20">
      <div className="px-6 py-8 flex items-center gap-3">
        {brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.institution_name || DEFAULT_BRAND_NAME}
            className="w-10 h-10 rounded-xl object-contain"
          />
        ) : (
          <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white shrink-0">
            <span className="text-2xl font-bold">∑</span>
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[var(--primary)] leading-tight break-words">
            {brand.institution_name || DEFAULT_BRAND_NAME}
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)]">
            {user?.role?.name ? t(`topbar.role.${user.role.name}`) : t('nav.dashboard')}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto" aria-label={t('nav.sidebar') || 'Menú de navegación'}>
        <div className="space-y-1">{standalone.map(renderItem)}</div>
        {categories.map(renderCategory)}
      </nav>

      {isTeacher() && !isAdmin() && (
        <div className="px-4 pb-4">
          <button
            onClick={() => navigate('/teacher/lessons/create')}
            className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20"
          >
            <FaPlus />
            <span>{t('nav.newLesson')}</span>
          </button>
        </div>
      )}

      <div className="px-4 pb-6 border-t border-[var(--outline-variant)]/20 pt-4 space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] rounded-xl transition-all"
        >
          <FaCog className="w-5 h-5" />
          <span className="text-sm">{t('nav.settings')}</span>
        </Link>
        <Link
          to="/help"
          className="flex items-center gap-3 px-4 py-3 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] rounded-xl transition-all"
        >
          <FaQuestionCircle className="w-5 h-5" />
          <span className="text-sm">{t('nav.help')}</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
