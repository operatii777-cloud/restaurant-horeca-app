import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/api/experience';

const ExperiencePage: React.FC = () => {
  const [scenes, setScenes] = useState<any>({});
  const [genres, setGenres] = useState<string[]>([]);
  const [signage, setSignage] = useState<any[]>([]);
  const [selectedLoc, setSelectedLoc] = useState('LocationA');
  const [msg, setMsg] = useState('');

  const load = () => {
    axios.get(`${API}/scenes`).then(r => setScenes(r.data)).catch(() => {});
    axios.get(`${API}/music/genres`).then(r => setGenres(r.data.genres || [])).catch(() => {});
    axios.get(`${API}/signage`).then(r => setSignage(r.data.content || [])).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const setMood = async (mood: string) => {
    await axios.post(`${API}/scenes/${selectedLoc}/mood`, { mood });
    setMsg(`✅ Mood set to ${mood} for ${selectedLoc}`);
    load();
  };

  const setPeak = async () => {
    await axios.post(`${API}/scenes/${selectedLoc}/peak`);
    setMsg(`✅ Peak hour mode activated for ${selectedLoc}`);
    load();
  };

  const updateMusic = async (genre: string) => {
    await axios.put(`${API}/scenes/${selectedLoc}/music`, { genre });
    setMsg(`🎵 Music genre set to ${genre} for ${selectedLoc}`);
    load();
  };

  const scene = scenes[selectedLoc];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">✨ Experience Engine</h1>
        <p className="page-subtitle">Mood-based music automation · Smart lighting IoT · Ambient control · Peak hour acoustics · Smart signage</p>
      </div>

      {msg && <div className="alert alert-blue">{msg}</div>}

      <div style={{ marginBottom: 16 }}>
        <label>Select Location:</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {Object.keys(scenes).map(loc => (
            <button key={loc} className={`btn ${selectedLoc === loc ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSelectedLoc(loc)}>
              📍 {loc}
            </button>
          ))}
        </div>
      </div>

      {scene && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-title">🎭 Current Ambient Scene — {selectedLoc}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: 4 }}>🎵 Music</div>
                <div style={{ fontWeight: 600 }}>{scene.music?.genre}</div>
                <div style={{ fontSize: '0.82rem', color: '#a0aec0' }}>
                  {scene.music?.bpm} BPM · Vol {scene.music?.volume}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: 4 }}>💡 Lighting</div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: scene.lighting?.color || '#fff' }} />
                  {scene.lighting?.brightness}% brightness
                </div>
                <div style={{ fontSize: '0.82rem', color: '#a0aec0' }}>{scene.lighting?.colorTemp}K</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: 4 }}>🌡️ Temperature</div>
                <div style={{ fontWeight: 600 }}>{scene.temperature}°C</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: 4 }}>📺 Mode</div>
                <span className="badge badge-blue">{scene.mode || 'NORMAL'}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">🎭 Set Mood</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {['ROMANTIC', 'ENERGETIC', 'CALM', 'CLOSING'].map(m => (
                <button key={m} className="btn btn-outline" onClick={() => setMood(m)}>{m}</button>
              ))}
              <button className="btn btn-primary" onClick={setPeak}>⚡ PEAK HOUR</button>
            </div>
            <div className="card-title" style={{ fontSize: '0.85rem' }}>🎵 Change Music Genre</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {genres.map(g => (
                <button key={g}
                  className={`btn btn-sm ${scene.music?.genre === g ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => updateMusic(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">📺 Smart Signage Engine</div>
        {signage.length === 0
          ? <p style={{ color: '#718096' }}>No signage content. Content is managed automatically based on time and events.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Location</th><th>Type</th><th>Content</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>
                  {signage.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontSize: '0.72rem' }}>{s.id}</td>
                      <td>{s.location || 'All'}</td>
                      <td>{s.type}</td>
                      <td>{s.content}</td>
                      <td>{s.priority}</td>
                      <td><span className={`badge ${s.active ? 'badge-green' : 'badge-gray'}`}>{s.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      <div className="card">
        <div className="card-title">📍 All Locations Overview</div>
        <div className="grid grid-3">
          {Object.entries(scenes).map(([loc, sc]: any) => (
            <div key={loc} style={{ padding: '12px', background: '#1e2a40', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{loc}</div>
              <div style={{ fontSize: '0.82rem', color: '#a0aec0' }}>
                🎵 {sc.music?.genre} · 💡 {sc.lighting?.brightness}% · 🌡️ {sc.temperature}°C
              </div>
              <span className="badge badge-blue" style={{ marginTop: 6 }}>{sc.mode}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperiencePage;
