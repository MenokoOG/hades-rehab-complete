import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient';

type Capture = { _id?: string, ts?: string, request?: any, response?: any, meta?: any, tags?: string[] };

export default function App(){
  const [items, setItems] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(()=>{
    async function load(){
      try {
        const api = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const r = await axios.get(api + '/forensics');
        setItems(r.data);
      } catch(e){
        console.error(e);
      } finally { setLoading(false); }
    }
    load();
    (async ()=>{
      const s = await supabase.auth.getSession();
      setUser(s.data.session?.user || null);
    })();
  },[]);

  async function signIn(){
    const r = await supabase.auth.signInWithPassword({ email, password });
    if (r.error) { alert('Sign-in error: ' + r.error.message); return; }
    setUser(r.data.user);
    alert('Signed in');
  }

  async function signOut(){
    await supabase.auth.signOut();
    setUser(null);
    alert('Signed out');
  }

  async function saveTriage(forensicId: string, tags: string[], comment: string){
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) { alert('Not authenticated'); return; }
      const api = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const r = await axios.post(api + '/triage', { forensicId, tags, comment }, { headers: { Authorization: 'Bearer ' + token } });
      if (r.data?.ok) alert('Triage saved');
      else alert('Error: ' + JSON.stringify(r.data));
    } catch (e:any) { console.error(e); alert('Save error'); }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>HADES Triage UI — Forensic Captures (Supabase + Mongo)</h2>
      <div style={{ marginBottom: 12 }}>
        {user ? (
          <div>Signed in as <strong>{user.email}</strong> <button onClick={signOut}>Sign out</button></div>
        ) : (
          <div>
            <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />{' '}
            <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />{' '}
            <button onClick={signIn}>Sign in</button>
          </div>
        )}
        <div style={{ fontSize:12, color:'#666', marginTop:6 }}>
          Note: To persist triage, your Supabase project must contain a <code>triage_events</code> table and a <code>user_roles</code> table (user_id->role).
        </div>
      </div>
      {loading && <div>Loading...</div>}
      {!loading && items.length===0 && <div>No captures yet. Send a POST to /api/proxy to create one.</div>}
      <ul>
        {items.map(it=>(
          <li key={it._id || JSON.stringify(it.ts)} style={{ marginBottom: 12, borderBottom: '1px solid #ddd', paddingBottom:8 }}>
            <strong>{it._id}</strong> <span style={{ fontSize:12, color:'#666', marginLeft:8 }}>{it.ts}</span>
            <div style={{ fontSize:12, color:'#444', marginTop:6 }}>{JSON.stringify(it.request?.body?.slice?.(0,200) || it.request || '')}</div>
            <details>
              <summary>Show full JSON</summary>
              <pre style={{ maxHeight: 240, overflow: 'auto' }}>{JSON.stringify(it, null, 2)}</pre>
            </details>
            <div style={{ marginTop:8 }}>
              <button onClick={()=>{ const tag = prompt('Comma-separated tags'); if(tag) saveTriage(it._id, tag.split(',').map(s=>s.trim()), prompt('Optional comment')||''); }}>Add tags / triage</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
