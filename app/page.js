'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { PUBLIC_COLS, KIND_COLOR } from '@/lib/data';
import { useLang } from '@/components/LangProvider';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function HomePage() {
  const { t } = useLang();
  const [posts, setPosts] = useState([]);
  const [species, setSpecies] = useState('');
  const [kind, setKind] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('posts')
      .select(PUBLIC_COLS)
      .not('latitude', 'is', null)
      .neq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setPosts(data || []);
      });
  }, []);

  const shown = posts.filter((p) => (!species || p.species === species) && (!kind || p.kind === kind));
  const labels = { give_away: t('give_away'), adopt_request: t('adopt_request'), rescue_alert: t('rescue_alert'), cat: t('cat'), dog: t('dog') };

  return (
    <div className="page">
      <div className="filters">
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">{t('all')}</option>
          <option value="rescue_alert">{t('rescue_alert')}</option>
          <option value="give_away">{t('give_away')}</option>
          <option value="adopt_request">{t('adopt_request')}</option>
        </select>
        <select value={species} onChange={(e) => setSpecies(e.target.value)}>
          <option value="">{t('cat')} / {t('dog')}</option>
          <option value="cat">{t('cat')}</option>
          <option value="dog">{t('dog')}</option>
        </select>
      </div>
      <div className="legend">
        {['rescue_alert', 'give_away', 'adopt_request'].map((k) => (
          <span key={k}>
            <i style={{ background: KIND_COLOR[k] }} />
            {t(k)}
          </span>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="mapwrap">
        <MapView posts={shown} labels={labels} />
      </div>
    </div>
  );
}
