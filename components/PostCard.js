'use client';
import Link from 'next/link';
import { KIND_COLOR, timeAgo } from '@/lib/data';
import { useLang } from '@/components/LangProvider';

export default function PostCard({ post }) {
  const { t } = useLang();
  return (
    <Link href={`/post/${post.id}`} className="card">
      {post.photo_url ? (
        <img src={post.photo_url} alt={post.title} loading="lazy" />
      ) : (
        <div className="noimg">{post.species === 'cat' ? '🐱' : '🐶'}</div>
      )}
      <div className="card-body">
        <span className="badge" style={{ background: KIND_COLOR[post.kind] }}>
          {t(post.kind)}
        </span>
        <h3>{post.title}</h3>
        <p className="muted">
          {t(post.species)}
          {post.age_text ? ` · ${post.age_text}` : ''}
          {post.district ? ` · ${post.district}` : ''}
          {post.division ? `, ${post.division}` : ''}
        </p>
        <p className="muted small">
          {t(post.status)} · {timeAgo(post.created_at)}
        </p>
      </div>
    </Link>
  );
}
