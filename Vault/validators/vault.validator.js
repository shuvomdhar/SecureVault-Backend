export const validateFolderInput = ({ name }) => {
  const errors = [];
  if (!name || name.trim().length === 0) errors.push('Folder name is required');
  return { isValid: errors.length === 0, errors };
};

export const validateSecretInput = ({ title, columns }) => {
  const errors = [];
  if (!title || title.trim().length === 0) errors.push('Secret title is required');
  if (!Array.isArray(columns)) errors.push('Columns must be an array');
  return { isValid: errors.length === 0, errors };
};
