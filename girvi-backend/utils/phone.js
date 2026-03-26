const normalizePhone = (phone) => {
  if (!phone) return "";
  const trimmed = phone.toString().trim();
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("91") && trimmed.length === 12) return `+${trimmed}`;
  if (trimmed.length === 10) return `+91${trimmed}`;
  return trimmed;
};

module.exports = { normalizePhone };
