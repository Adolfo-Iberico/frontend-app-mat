// Lets administrators configure institution settings, periods, and backups.
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import toast from 'react-hot-toast';
import { FaSave, FaDatabase, FaCloudUploadAlt, FaHistory, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import Loading from '../Common/Loading';
import { toArray } from '../../utils/helpers';

const SystemConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    institution_name: '',
    primary_color: '#004AC6',
    secondary_color: '#006C49',
    logo: '',
    email_notifications: {},
    backup_frequency: 'daily',
    allow_tab_switches: true,
  });
  const [periods, setPeriods] = useState([]);
  const [newPeriod, setNewPeriod] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    description: ''
  });
  const [showHistory, setShowHistory] = useState(false);
  const [backupHistory, setBackupHistory] = useState([]);
  const { t } = useLanguage();

  const cp = (key) => t(`admin.configPage.${key}`);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);

    const [configResult, periodsResult] = await Promise.allSettled([
      adminApi.getConfig(),
      adminApi.getPeriods()
    ]);

    if (configResult.status === 'fulfilled') {
      setConfig(configResult.value.data || {});
    } else {
      toast.error(cp('errorLoad'));
    }

    if (periodsResult.status === 'fulfilled') {
      setPeriods(toArray(periodsResult.value.data));
    }

    setLoading(false);
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handlePeriodChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPeriod(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      await adminApi.updateConfig(config);
      toast.success(cp('successSave'));
    } catch (error) {
      toast.error(cp('errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const createPeriod = async () => {
    try {
      await adminApi.createPeriod(newPeriod);
      toast.success(cp('successCreatePeriod'));
      setNewPeriod({
        name: '',
        start_date: '',
        end_date: '',
        is_active: false,
        description: ''
      });
      fetchConfig();
    } catch (error) {
      toast.error(cp('errorCreatePeriod'));
    }
  };

  const deletePeriod = async (id) => {
    if (!confirm(cp('confirmDeletePeriod'))) return;
    
    try {
      await adminApi.deletePeriod(id);
      toast.success(cp('successDeletePeriod'));
      fetchConfig();
    } catch (error) {
      toast.error(cp('errorDeletePeriod'));
    }
  };

  const createBackup = async () => {
    try {
      await adminApi.createBackup();
      toast.success(t('admin.createBackup') + ' ✓');
      fetchConfig();
    } catch (error) {
      toast.error(t('admin.createBackup') + ' ✗');
    }
  };

  const toggleHistory = async () => {
    if (!showHistory) {
      try {
        const result = await adminApi.getLastBackup();
        const last = result.data?.backup;
        setBackupHistory(last ? [last] : []);
        if (!last) toast(cp('noHistory'));
      } catch {
        toast.error(cp('errorLoad'));
        setBackupHistory([]);
      }
    }
    setShowHistory(!showHistory);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-[var(--on-surface)]">{cp('title')}</h2>

      <div className="bg-[var(--surface)] p-8 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6">{cp('generalConfig')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="config-institution-name" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              {cp('institutionName')}
            </label>
            <input
              id="config-institution-name"
              type="text"
              name="institution_name"
              value={config.institution_name || ''}
              onChange={handleConfigChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
          </div>

          <div>
            <label htmlFor="config-logo" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              {cp('logoUrl')}
            </label>
            <input
              id="config-logo"
              type="text"
              name="logo"
              value={config.logo || ''}
              onChange={handleConfigChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              placeholder={cp('logoPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="config-backup-frequency" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              {cp('backupFrequency')}
            </label>
            <select
              id="config-backup-frequency"
              name="backup_frequency"
              value={config.backup_frequency || 'daily'}
              onChange={handleConfigChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            >
              <option value="hourly">{cp('hourly')}</option>
              <option value="daily">{cp('daily')}</option>
              <option value="weekly">{cp('weekly')}</option>
              <option value="monthly">{cp('monthly')}</option>
            </select>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-[var(--surface-container-high)] p-4">
            <input
              type="checkbox"
              name="allow_tab_switches"
              checked={config.allow_tab_switches !== false}
              onChange={(event) => setConfig((current) => ({
                ...current,
                allow_tab_switches: event.target.checked,
              }))}
              className="mt-1 accent-[var(--primary)]"
            />
            <span>
              <span className="block text-sm font-medium text-[var(--on-surface)]">
                {cp('allowTabSwitches')}
              </span>
              <span className="block text-sm text-[var(--on-surface-variant)]">
                {cp('allowTabSwitchesDescription')}
              </span>
            </span>
          </label>
        </div>

        <div className="mt-6">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave />
            {saving ? cp('saving') : cp('save')}
          </button>
        </div>
      </div>

      <div className="bg-[var(--surface)] p-8 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6">{cp('periods')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input
            id="period-name"
            type="text"
            name="name"
            value={newPeriod.name}
            onChange={handlePeriodChange}
            placeholder={cp('periodName')}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <label htmlFor="period-start" className="sr-only">{cp('periodStart')}</label>
          <input
            id="period-start"
            type="date"
            name="start_date"
            value={newPeriod.start_date}
            onChange={handlePeriodChange}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <label htmlFor="period-end" className="sr-only">{cp('periodEnd')}</label>
          <input
            id="period-end"
            type="date"
            name="end_date"
            value={newPeriod.end_date}
            onChange={handlePeriodChange}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <button
            onClick={createPeriod}
            className="px-4 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            {cp('createPeriod')}
          </button>
        </div>

        <div className="space-y-3">
          {(Array.isArray(periods) ? periods : []).map((period) => (
            <div key={period.id} className="flex items-center justify-between p-4 bg-[var(--surface-container-low)] rounded-xl">
              <div>
                <p className="font-medium text-[var(--on-surface)]">{period.name}</p>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  period.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {period.is_active ? cp('active') : cp('inactive')}
                </span>
                <button
                  onClick={() => deletePeriod(period.id)}
                  className="text-[var(--error)] hover:bg-[var(--error)]/10 p-2 rounded-lg transition-colors"
                >
                  <FaDatabase className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--surface)] p-8 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6">{cp('backups')}</h3>
        
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={createBackup}
            className="px-6 py-3 bg-[var(--secondary)] text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
          >
            <FaCloudUploadAlt />
            {cp('createBackup')}
          </button>
          <button
            onClick={toggleHistory}
            className="px-6 py-3 bg-[var(--surface-container)] text-[var(--on-surface)] font-bold rounded-xl hover:bg-[var(--surface-container-high)] transition-all flex items-center gap-2"
          >
            {showHistory ? <FaTimes /> : <FaHistory />}
            {showHistory ? cp('closeHistory') : cp('viewHistory')}
          </button>
        </div>

        {showHistory && (
          <div className="mt-6 p-4 bg-[var(--surface-container-low)] rounded-xl">
            <h4 className="font-bold text-[var(--on-surface)] mb-3">{cp('historyTitle')}</h4>
            {backupHistory.length > 0 ? (
              <div className="space-y-2">
                {backupHistory.map((backup, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-[var(--surface)] rounded-lg">
                    <span className="text-sm text-[var(--on-surface)]">
                      {backup.filename || new Date(backup.created_at).toLocaleString()}
                    </span>
                    <span className="text-xs text-[var(--on-surface-variant)]">
                      {backup.size ? `${(backup.size / 1024).toFixed(0)} KB` : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--on-surface-variant)]">{cp('noHistory')}</p>
            )}
          </div>
        )}
        
        <p className="mt-4 text-sm text-[var(--on-surface-variant)]">
          {cp('lastBackup')}: {config.last_backup ? new Date(config.last_backup).toLocaleString() : cp('noBackup')}
        </p>
      </div>
    </div>
  );
};

export default SystemConfig;
