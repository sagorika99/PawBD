// Columns anonymous visitors may read (the `contact` column is hidden from them).
export const PUBLIC_COLS =
  'id,kind,species,title,description,age_text,photo_url,latitude,longitude,division,district,status,created_by,created_at,expires_at';

export const DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

export const BD_CENTER = [23.685, 90.3563];

export const KIND_COLOR = {
  give_away: '#16a34a',
  adopt_request: '#2563eb',
  rescue_alert: '#dc2626',
};

export function timeAgo(iso) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 3600) return `${Math.floor(s / 60) || 1}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}
