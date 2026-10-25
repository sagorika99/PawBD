'use client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { BD_CENTER, KIND_COLOR } from '@/lib/data';

function dot(color) {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:22px;height:22px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.45)"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick?.([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// posts: list of posts with latitude/longitude.
// picker: when onPick is given, tapping the map calls it, and `picked` shows a marker.
export default function MapView({ posts = [], center, zoom, onPick, picked, labels = {} }) {
  const c = center || BD_CENTER;
  return (
    <MapContainer center={c} zoom={zoom || (center ? 14 : 7)} scrollWheelZoom style={{ height: '100%', width: '100%' }} key={center ? center.join(',') : 'default'}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onPick && <ClickHandler onPick={onPick} />}
      {picked && <Marker position={picked} icon={dot('#f59e0b')} />}
      {posts.map((p) => (
        <Marker key={p.id} position={[p.latitude, p.longitude]} icon={dot(KIND_COLOR[p.kind])}>
          <Popup>
            <strong>{p.title}</strong>
            <br />
            {labels[p.kind] || p.kind} · {labels[p.species] || p.species}
            <br />
            <Link href={`/post/${p.id}`}>Details →</Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
