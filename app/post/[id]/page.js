'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PUBLIC_COLS, KIND_COLOR, timeAgo } from '@/lib/data';
import { useSession } from '@/lib/useSession';
import { useLang } from '@/components/LangProvider';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLang();
  const { user, loading: authLoading } = useSession();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    // Only signed-in users may read the `contact` column.
    const cols = user ? `${PUBLIC_COLS},contact` : PUBLIC_COLS;
    const { data, error } = await supabase.from('posts').select(cols).eq('id', id).maybeSingle();
    if (error) setError(error.message);
    else if (!data) setNotFound(true);
    else setPost(data);
  }, [id, user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const isOwner = user && post && post.created_by === user.id;

  async function imHelping() {
    const { error } = await supabase.rpc('mark_helping', { p_id: post.id });
    if (error) setError(error.message);
    else load();
  }

  async function markClosed() {
    const { error } = await supabase.from('posts').update({ status: 'closed' }).eq('id', post.id);
    if (error) setError(error.message);
    else load();
  }

  async function remove() {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) setError(error.message);
    else router.push('/board');
  }

  async function report() {
    const reason = prompt('Why are you reporting this post?');
    if (!reason) return;
    const { error } = await supabase.from('post_reports').insert({ post_id: post.id, reason });
    if (error) setError(error.code === '23505' ? 'You already reported this post.' : error.message);
    else setMsg(t('reported'));
  }

  if (notFound) return <div className="page"><p>Post not found or expired.</p></div>;
  if (!post) return <div className="page">{error && <p className="error">{error}</p>}</div>;

  const hasLoc = post.latitude != null && post.longitude != null;

  return (
    <div className="page detail" style={{ maxWidth: 720 }}>
      {post.photo_url && <img src={post.photo_url} alt={post.title} />}
      <span className="badge" style={{ background: KIND_COLOR[post.kind], marginTop: 12 }}>{t(post.kind)}</span>
      <h1>{post.title}</h1>
      <p className="muted">
        {t(post.species)}
        {post.age_text ? ` · ${post.age_text}` : ''}
        {post.district ? ` · ${post.district}` : ''}
        {post.division ? `, ${post.division}` : ''}
      </p>
      <p className="muted small">{t(post.status)} · {timeAgo(post.created_at)}</p>

      {post.description && <p style={{ whiteSpace: 'pre-wrap' }}>{post.description}</p>}

      <div className="box">
        {user ? (
          <strong>{post.contact || '—'}</strong>
        ) : (
          <Link href="/login">{t('loginToSee')}</Link>
        )}
      </div>

      {hasLoc && (
        <div className="mapbox">
          <MapView posts={[post]} center={[post.latitude, post.longitude]} />
        </div>
      )}

      <div className="row">
        {user && post.kind === 'rescue_alert' && post.status === 'open' && (
          <button className="btn" onClick={imHelping}>🙋 {t('imHelping')}</button>
        )}
        {isOwner && post.status !== 'closed' && (
          <button className="btn secondary" onClick={markClosed}>✔ {t('markClosed')}</button>
        )}
        {isOwner && <button className="btn danger" onClick={remove}>{t('delete')}</button>}
        {user && !isOwner && <button className="btn secondary" onClick={report}>⚑ {t('report')}</button>}
      </div>
      {msg && <p className="ok">{msg}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
