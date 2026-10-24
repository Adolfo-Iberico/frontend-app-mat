// Normalizes question options from arrays and legacy JSON-encoded values.
export const normalizeQuestionOptions = (options) => {
  let parsed = options;

  for (let attempt = 0; attempt < 2 && typeof parsed === 'string'; attempt += 1) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return parsed.trim() ? [{ label: '', value: parsed }] : [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((option) => {
      if (typeof option === 'string' || typeof option === 'number') {
        return { label: '', value: String(option) };
      }
      if (!option || typeof option !== 'object') return null;

      const value = option.value ?? option.label ?? '';
      return {
        label: String(option.label ?? ''),
        value: String(value),
      };
    })
    .filter((option) => option && option.value.trim() !== '');
};
