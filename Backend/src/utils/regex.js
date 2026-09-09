/**
 * Utility to escape special characters from user input strings
 * before creating dynamic RegExp patterns, preventing ReDoS vulnerabilities.
 *
 * @param {string} str - Raw user input string
 * @returns {string} - Escaped regex-safe string
 */
export const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default escapeRegex;
