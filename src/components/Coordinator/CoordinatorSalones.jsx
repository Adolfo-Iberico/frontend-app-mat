// Lets coordinators manage classrooms, teachers, and student assignments.
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FaDoorOpen, FaPlus, FaTrash, FaEdit, FaArrowLeft, FaUsers, FaBook,
  FaChalkboardTeacher, FaUserPlus, FaTimes, FaUserGraduate, FaKey, FaFileImport,
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { salonesApi } from '../../api/salones';
import Loading from '../Common/Loading';
import { toArray } from '../../utils/helpers';

const CoordinatorSalones = () => {
  const { t } = useLanguage();
  const cp = (key) => t(`coordinatorSalones.${key}`);
  const [loading, setLoading] = useState(true);
  const [salones, setSalones] = useState([]);
  const [showCreateSalon, setShowCreateSalon] = useState(false);
  const [salonForm, setSalonForm] = useState({ grade: '', section: '' });
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({ name: '', description: '', teacher_id: '' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [showEnroll, setShowEnroll] = useState(false);
  const [selectedEnroll, setSelectedEnroll] = useState([]);
  const [salonStudents, setSalonStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);
const [showAddStudent, setShowAddStudent] = useState(false);
const [studentSearch, setStudentSearch] = useState('');
const [importing, setImporting] = useState(false);
  const [studentForm, setStudentForm] = useState({ dni: '', full_name: '', email: '', password: '', grade: '' });

  const loadTeachers = async () => {
    try {
      const res = await salonesApi.getTeachers();
      setTeachers(toArray(res.data));
    } catch (e) {
      toast.error(cp('loadError'));
    }
  };

  const loadStudents = async () => {
    try {
      const res = await salonesApi.getStudents();
      setStudents(toArray(res.data));
    } catch (e) {
      toast.error(cp('loadError'));
    }
  };

  useEffect(() => {
    salonesApi
      .getSalones()
      .then((res) => setSalones(toArray(res.data)))
      .catch(() => toast.error(cp('loadError')))
      .finally(() => setLoading(false));
    loadTeachers();
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSalon = async () => {
    if (!salonForm.grade.trim() || !salonForm.section.trim()) return;
    try {
      const res = await salonesApi.createSalon(salonForm);
      setSalones((prev) => [...prev, res.data]);
      setShowCreateSalon(false);
      setSalonForm({ grade: '', section: '' });
      toast.success(cp('createSalonSuccess'));
    } catch (e) {
      toast.error(cp('createError'));
    }
  };

  const deleteSalon = async (id) => {
    if (!window.confirm(cp('confirmDeleteSalon'))) return;
    try {
      await salonesApi.deleteSalon(id);
      setSalones((prev) => prev.filter((s) => s.id !== id));
      toast.success(cp('deleteSalonSuccess'));
    } catch (e) {
      toast.error(cp('deleteError'));
    }
  };

  const openSalon = async (salon) => {
    setSelectedSalon(salon);
    setSelectedCourse(null);
    setLoadingCourses(true);
    try {
      const res = await salonesApi.getSalonCourses(salon.id);
      setCourses(toArray(res.data));
    } catch (e) {
      toast.error(cp('loadError'));
    } finally {
      setLoadingCourses(false);
    }
  };

  const addCourse = async () => {
    if (!courseForm.name.trim() || !courseForm.teacher_id) return;
    try {
      const res = await salonesApi.createCourse(selectedSalon.id, courseForm);
      setCourses((prev) => [...prev, res.data]);
      setShowAddCourse(false);
      setCourseForm({ name: '', description: '', teacher_id: '' });
      toast.success(cp('createCourseSuccess'));
    } catch (e) {
      toast.error(cp('createError'));
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm(cp('confirmDeleteCourse'))) return;
    try {
      await salonesApi.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success(cp('deleteCourseSuccess'));
    } catch (e) {
      toast.error(cp('deleteError'));
    }
  };

  const openEnroll = async (course) => {
    setSelectedCourse(course);
    setShowEnroll(true);
    setSelectedEnroll([]);
    try {
      const res = await salonesApi.getCourseStudents(course.id);
      setEnrolledStudents(toArray(res.data));
    } catch (e) {
      toast.error(cp('loadError'));
    }
  };

  const doEnroll = async () => {
    if (selectedEnroll.length === 0) return;
    try {
      await salonesApi.enrollStudents(selectedCourse.id, selectedEnroll);
      toast.success(cp('enrollSuccess'));
      const res = await salonesApi.getCourseStudents(selectedCourse.id);
      setEnrolledStudents(toArray(res.data));
      setSelectedEnroll([]);
    } catch (e) {
      toast.error(cp('enrollError'));
    }
  };

  const toggleEnroll = (id) => {
    setSelectedEnroll((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const unenroll = async (studentId) => {
    try {
      await salonesApi.unenrollStudent(selectedCourse.id, studentId);
      setEnrolledStudents((prev) => prev.filter((s) => s.id !== studentId));
      toast.success(cp('unenrollSuccess'));
    } catch (e) {
      toast.error(cp('enrollError'));
    }
  };

  const loadSalonStudents = async () => {
    try {
      const res = await salonesApi.getSalonStudents(selectedSalon.id, studentSearch);
      setSalonStudents(toArray(res.data));
    } catch (e) {
      toast.error(cp('loadError'));
    }
  };

  useEffect(() => {
    if (selectedSalon && showStudents) {
      const timer = setTimeout(loadSalonStudents, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentSearch, showStudents, selectedSalon]);

  const registerStudent = async () => {
    if (!studentForm.dni.trim() || !studentForm.full_name.trim() || !studentForm.email.trim() || !studentForm.password.trim()) return;
    try {
      await salonesApi.registerSalonStudent(selectedSalon.id, studentForm);
      setShowAddStudent(false);
      setStudentForm({ dni: '', full_name: '', email: '', password: '', grade: '' });
      toast.success(cp('studentCreateSuccess'));
      await loadSalonStudents();
    } catch (e) {
      toast.error(e.response?.data?.errors?.email?.[0] || e.response?.data?.errors?.dni?.[0] || cp('studentCreateError'));
    }
  };

  const importStudents = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowed.includes(file.type) && !/\.(csv|xlsx|xls)$/i.test(file.name)) {
      toast.error(cp('importInvalidFormat'));
      return;
    }
    setImporting(true);
    try {
      const res = await salonesApi.importSalonStudents(selectedSalon.id, file);
      toast.success(`${res.data.imported} ${cp('importedCount')}`);
      if (res.data.errors?.length) {
        res.data.errors.slice(0, 5).forEach((er) => toast.error(er));
      }
      await loadSalonStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || cp('importError'));
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  if (loading) return <Loading />;

  // ---- Panel de matrícula ----
  if (showEnroll && selectedCourse) {
    const alreadyEnrolled = new Set(enrolledStudents.map((s) => s.id));
    return (
      <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEnroll(false)}
              className="p-2 rounded-lg bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)]"
              aria-label={cp('back')}
            >
              <FaArrowLeft />
            </button>
            <h3 className="font-bold text-xl text-[var(--on-surface)]">
              {cp('enrollTitle')}: {selectedCourse.name}
            </h3>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-[var(--on-surface)]">
            {cp('enrolledStudents')} ({enrolledStudents.length})
          </h4>
          {enrolledStudents.length === 0 ? (
            <p className="text-sm text-[var(--on-surface-variant)]">{cp('noEnrolled')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {enrolledStudents.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-2 bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-sm"
                >
                  <FaUsers className="text-xs" /> {s.full_name}
                  <button onClick={() => unenroll(s.id)} aria-label={cp('unenroll')} className="hover:text-[var(--error)]">
                    <FaTimes />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--surface-container)] pt-4">
          <h4 className="font-semibold mb-2 text-[var(--on-surface)]">{cp('selectStudents')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
            {students
              .filter((s) => !alreadyEnrolled.has(s.id))
              .map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedEnroll.includes(s.id)
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--surface-container-high)] hover:bg-[var(--surface-container-low)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEnroll.includes(s.id)}
                    onChange={() => toggleEnroll(s.id)}
                    className="accent-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--on-surface)]">{s.full_name}</span>
                </label>
              ))}
          </div>
          <button
            onClick={doEnroll}
            disabled={selectedEnroll.length === 0}
            className="mt-4 px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 font-bold flex items-center gap-2"
          >
            <FaUserPlus /> {cp('enrollBtn')} ({selectedEnroll.length})
          </button>
        </div>
      </div>
    );
  }

  // ---- Panel de alumnos del salón ----
  if (showStudents && selectedSalon) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStudents(false)}
            className="p-2 rounded-lg bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
            aria-label={cp('back')}
          >
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white">
              <FaUserGraduate />
            </div>
            <h2 className="text-2xl font-bold text-[var(--on-surface)]">
              {cp('students')}: {selectedSalon.grade} "{selectedSalon.section}"
            </h2>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <label
              className="px-4 py-2 bg-[var(--surface-container-high)] text-[var(--on-surface)] rounded-xl hover:opacity-90 flex items-center gap-2 font-bold cursor-pointer"
            >
              <FaFileImport /> {importing ? cp('importing') : cp('importStudents')}
              <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={importStudents} disabled={importing} />
            </label>
            <button
              onClick={() => setShowAddStudent((v) => !v)}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 flex items-center gap-2 font-bold"
            >
              <FaUserPlus /> {cp('addStudent')}
            </button>
          </div>
        </div>

        {showAddStudent && (
          <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--surface-container)] space-y-3">
            <h3 className="font-semibold text-[var(--on-surface)]">{cp('studentFormTitle')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={studentForm.dni}
                onChange={(e) => setStudentForm((f) => ({ ...f, dni: e.target.value }))}
                placeholder={cp('dni')}
                maxLength={8}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
              <input
                type="text"
                value={studentForm.full_name}
                onChange={(e) => setStudentForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder={cp('fullName')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
              <input
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm((f) => ({ ...f, email: e.target.value }))}
                placeholder={cp('email')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
              <input
                type="text"
                value={studentForm.password}
                onChange={(e) => setStudentForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={cp('password')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
            </div>
            <button
              onClick={registerStudent}
              disabled={!studentForm.dni.trim() || !studentForm.full_name.trim() || !studentForm.email.trim() || !studentForm.password.trim()}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
            >
              {cp('addStudent')}
            </button>
          </div>
        )}

        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--surface-container)]">
          <input
            type="text"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder={cp('searchStudents')}
            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] mb-4"
          />

          {salonStudents.length === 0 ? (
            <p className="text-sm text-[var(--on-surface-variant)]">{cp('noStudents')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--on-surface-variant)] border-b border-[var(--surface-container)]">
                    <th className="py-2 pr-4">{cp('dni')}</th>
                    <th className="py-2 pr-4">{cp('fullName')}</th>
                    <th className="py-2">{cp('email')}</th>
                  </tr>
                </thead>
                <tbody>
                  {salonStudents.map((s) => (
                    <tr key={s.id} className="border-b border-[var(--surface-container-low)]">
                      <td className="py-3 pr-4 text-[var(--on-surface)]">{s.dni || '—'}</td>
                      <td className="py-3 pr-4 text-[var(--on-surface)]">{s.full_name}</td>
                      <td className="py-3 text-[var(--on-surface-variant)]">{s.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- Detalle de salón: cursos ----
  if (selectedSalon) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedSalon(null)}
            className="p-2 rounded-lg bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
            aria-label={cp('back')}
          >
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white">
              <FaDoorOpen />
            </div>
            <h2 className="text-2xl font-bold text-[var(--on-surface)]">
              {selectedSalon.grade} "{selectedSalon.section}"
            </h2>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowStudents(true)}
              className="px-4 py-2 bg-[var(--surface-container-low)] text-[var(--primary)] rounded-xl hover:bg-[var(--surface-container-high)] flex items-center gap-2 font-bold"
            >
              <FaUserGraduate /> {cp('students')}
            </button>
            <button
              onClick={() => setShowAddCourse((v) => !v)}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 flex items-center gap-2 font-bold"
            >
              <FaPlus /> {cp('addCourse')}
            </button>
          </div>
        </div>

        {showAddCourse && (
          <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--surface-container)] space-y-3">
            <input
              type="text"
              value={courseForm.name}
              onChange={(e) => setCourseForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={cp('courseNamePlaceholder')}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
            <input
              type="text"
              value={courseForm.description}
              onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={cp('courseDescPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
            <select
              value={courseForm.teacher_id}
              onChange={(e) => setCourseForm((f) => ({ ...f, teacher_id: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            >
              <option value="">{cp('selectTeacher')}</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
            <button
              onClick={addCourse}
              disabled={!courseForm.name.trim() || !courseForm.teacher_id}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
            >
              {cp('createCourse')}
            </button>
          </div>
        )}

        {loadingCourses ? (
          <Loading />
        ) : courses.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-2xl p-10 text-center shadow-sm border border-[var(--surface-container)]">
            <FaBook className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
            <p className="text-[var(--on-surface-variant)]">{cp('noCourses')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-3 text-[var(--primary)]">
                  <FaBook />
                </div>
                <h3 className="font-bold text-lg text-[var(--on-surface)]">{course.name}</h3>
                {course.code && (
                  <p className="text-xs text-[var(--on-surface-variant)] mt-1 flex items-center gap-1">
                    <FaKey className="text-[var(--primary)]" /> {cp('courseCode')}: <span className="font-mono font-bold text-[var(--primary)]">{course.code}</span>
                  </p>
                )}
                <p className="text-sm text-[var(--on-surface-variant)] mt-1 flex items-center gap-1">
                  <FaChalkboardTeacher className="text-xs" /> {course.teacher?.full_name || '—'}
                </p>
                <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                  {course.enrollments_count ?? 0} {cp('enrolledCount')}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEnroll(course)}
                    className="flex-1 px-3 py-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-sm font-bold hover:bg-[var(--primary)]/20 flex items-center justify-center gap-1"
                  >
                    <FaUsers /> {cp('enroll')}
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="p-2 bg-[var(--surface-container-low)] text-[var(--error)] rounded-lg hover:bg-[var(--surface-container-high)]"
                    aria-label={cp('delete')}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- Vista principal: salones ----
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowCreateSalon((v) => !v)}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 flex items-center gap-2 font-bold"
        >
          <FaPlus /> {cp('createSalon')}
        </button>
      </div>

      {showCreateSalon && (
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--surface-container)] flex gap-3 flex-wrap">
          <input
            type="text"
            value={salonForm.grade}
            onChange={(e) => setSalonForm((f) => ({ ...f, grade: e.target.value }))}
            placeholder={cp('gradePlaceholder')}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <input
            type="text"
            value={salonForm.section}
            onChange={(e) => setSalonForm((f) => ({ ...f, section: e.target.value }))}
            placeholder={cp('sectionPlaceholder')}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <button
            onClick={createSalon}
            disabled={!salonForm.grade.trim() || !salonForm.section.trim()}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
          >
            {cp('createSalon')}
          </button>
        </div>
      )}

      {salones.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl p-10 text-center shadow-sm border border-[var(--surface-container)]">
          <FaDoorOpen className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
          <p className="text-[var(--on-surface-variant)]">{cp('noSalones')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {salones.map((salon) => (
            <div
              key={salon.id}
              className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all"
            >
              <button onClick={() => openSalon(salon)} className="text-left w-full">
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-3 text-[var(--primary)]">
                  <FaDoorOpen />
                </div>
                <h3 className="font-bold text-xl text-[var(--on-surface)]">
                  {salon.grade} "{salon.section}"
                </h3>
                <p className="text-sm text-[var(--on-surface-variant)] mt-1">
                  {toArray(salon.courses).length} {cp('courseCount')}
                </p>
              </button>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => deleteSalon(salon.id)}
                  className="p-2 bg-[var(--surface-container-low)] text-[var(--error)] rounded-lg hover:bg-[var(--surface-container-high)]"
                  aria-label={cp('delete')}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoordinatorSalones;