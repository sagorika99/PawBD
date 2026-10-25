'use client';
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DIVISIONS } from '@/lib/data';
import { useSession } from '@/lib/useSession';
import { useLang } from '@/components/LangProvider';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function NewPostPage() {
  const { t } = useLang();
  const router = useRouter();
  const { user, loading } = useSession();

  const [kind, setKind] = useState('give_away');
  const [species, setSpecies] = useState('cat');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [age, setAge] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [contact, setContact] = useState('');
  const [photo, setPhoto] = useState(null);
  const [pos, setPos] = useState(null); // [lat, lng]
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function useMyLocation() {
    if (!navigator.geolocation) return setError('Geolocation is not supported on this device.');
    navigator.geolocation.getCurrentPosition(
      (p) => setPos([p.coords.latitude, p.coords.longitude]),
      () => setError('Could not get your location. Tap the map instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (kind === 'rescue_alert' && !pos) return setError(t('rescueNeedsLocation'));
    setBusy(true);

    let photo_url = null;
    if (photo) {
      if (photo.size > 5 * 1024 * 1024) {
        setBusy(false);
        return setError('Photo must be under 5 MB.');
      }
      const ext = (photo.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const up = await supabase.storage.from('animal-photos').upload(path, photo, { contentType: photo.type });
      if (up.error) {
        setBusy(false);
        return setError(up.error.message);
      }
      photo_url = supabase.storage.from('animal-photos').getPublicUrl(path).data.publicUrl;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        kind,
        species,
        title,
        description: description || null,
        age_text: age || null,
        division: division || null,
        district: district || null,
        contact: contact || null,
        photo_url,
        latitude: pos ? pos[0] : null,
        longitude: pos ? pos[1] : null,
      })
      .select('id')
      .single();

    setBusy(false);
    if (error) return setError(error.message);
    router.push(`/post/${data.id}`);
  }

  if (loading) return <div className="page" />;
  if (!user)
    return (
      <div className="page">
        <p>{t('needLogin')}</p>
        <Link className="btn" href="/login">{t('login')}</Link>
      </div>
    );

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <form onSubmit={submit}>
        <label>{t('kind')}</label>
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="give_away">{t('give_away')}</option>
          <option value="adopt_request">{t('adopt_request')}</option>
          <option value="rescue_alert">{t('rescue_alert')}</option>
        </select>

        <label>{t('species')}</label>
        <select value={species} onChange={(e) => setSpecies(e.target.value)}>
          <option value="cat">{t('cat')}</option>
          <option value="dog">{t('dog')}</option>
        </select>

        <label>{t('title')}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} maxLength={120} />

        <label>{t('description')}</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />

        <label>{t('age')}</label>
        <input value={age} onChange={(e) => setAge(e.target.value)} />

        <label>{t('division')}</label>
        <select value={division} onChange={(e) => setDivision(e.target.value)}>
          <option value="">—</option>
          {DIVISIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <label>{t('district')}</label>
        <input value={district} onChange={(e) => setDistrict(e.target.value)} />

        <label>{t('contact')}</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} />

        <label>{t('photo')}</label>
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />

        <label>
          {t('pickLocation')}
          {kind === 'rescue_alert' ? ' *' : ''}
        </label>
        <button type="button" className="btn secondary" onClick={useMyLocation}>📍 {t('useMyLocation')}</button>
        <div className="mapbox">
          <MapView center={pos || undefined} picked={pos} onPick={setPos} />
        </div>

        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn" disabled={busy}>{busy ? '…' : t('submit')}</button>
        </div>
      </form>
    </div>
  );
}
