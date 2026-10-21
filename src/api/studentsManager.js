// API del Gestor de Alumnos: resumen por salón, listado filtrado, carga
// masiva (CSV/Excel), plantilla, exportación y acciones por alumno.
import api from './axios';

export const studentsManagerApi = {
  getSummary: () => api.get('/students-manager/summary'),
  getStudents: (params = {}) => api.get('/students-manager', { params }),
  importStudents: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/students-manager/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getTemplate: () => api.get('/students-manager/template', { responseType: 'blob' }),
  exportCsv: (params = {}) => api.get('/students-manager/export', { params, responseType: 'blob' }),
  updateStudent: (id, data) => api.patch(`/students-manager/${id}`, data),
};

/** Descarga un blob como archivo. */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
