// Mentorhood Math starter — static GitHub Pages frontend + isolated Supabase backend.
// Use only the Supabase PUBLISHABLE key in config.js. Never a service_role or secret key.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.0';

const $ = (id) => document.getElementById(id);
const cfg = window.MENTORHOOD_CONFIG || {};
const supabase = cfg.supabaseUrl && cfg.supabasePublishableKey
  ? createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } })
  : null;
let user = null;
let member = null;
let projects = [];
let selectedProjectId = null;
let activeTab = 'projects';
let authMode = 'login';
const isStaff = () => Boolean(member?.is_active !== false && (member?.role === 'owner' || member?.role === 'staff'));
const callbackUrl = () => `${window.location.origin}${window.location.pathname}#portal`;
const stages = [ ['queued','Queued'], ['in_progress','In progress'], ['review','Review'], ['done','Done'] ];
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function showOne(ids, selected) { ids.forEach(id => $(id).hidden = id !== selected); }
function route() {
  const path = (location.hash || '#home').slice(1);
  const publicRoutes = ['home','programs','classes','resources','about','team','contact'];
  const publicPage = publicRoutes.includes(path) ? path : null;
  $('public-view').hidden = !publicPage;
  $('portal-view').hidden = !!publicPage;
  for (const p of publicRoutes) $('section-' + p).hidden = p !== publicPage;
  document.querySelectorAll('[data-route]').forEach(el => el.setAttribute('aria-current', el.dataset.route === path ? 'page' : 'false'));
  if (!publicPage) renderGate();
  $('site-nav').classList.remove('open');
  document.querySelector('.mobile-menu')?.setAttribute('aria-expanded','false');
  window.scrollTo(0,0);
}
function renderGate() {
  if (!supabase) return showOne(['portal-loading','portal-unconfigured','portal-login','portal-pending','portal-app'],'portal-unconfigured');
  if (!authReady) return showOne(['portal-loading','portal-unconfigured','portal-login','portal-pending','portal-app'],'portal-loading');
  const destination = !user ? 'portal-login' : 'portal-app';
  showOne(['portal-loading','portal-unconfigured','portal-login','portal-pending','portal-app'],destination);
  if (destination === 'portal-app') {
    $('signed-in-as').textContent = `${member?.display_name || user.user_metadata?.display_name || user.email} · ${isStaff() ? member.role : 'member'}`;
    document.querySelector('[data-portal-tab="projects"]').hidden = !isStaff();
    $('member-welcome').hidden = isStaff();
    if (!isStaff()) activeTab = 'videos';
    switchTab(activeTab);
  }
}
let authReady = !supabase;
async function refreshMember() {
  if (!supabase) return;
  try {
    const { data: { user: account }, error } = await supabase.auth.getUser();
    if (error || !account) { user = null; member = null; return; }
    user = account;
    const result = await supabase.from('team_members').select('user_id,display_name,role,is_active').eq('user_id',account.id).maybeSingle();
    if (result.error) { console.error('Member lookup failed:',result.error.message); member = null; return; }
    member = result.data?.is_active ? result.data : null;
  } catch (err) { console.error('Auth check failed:',err); user = null; member = null; }
  finally { authReady = true; renderGate(); }
  if (isStaff()) await loadProjects();
  if (user) await loadVideos();
}
async function login(e) {
  e.preventDefault();
  if (!supabase) return;
  const msg = $('login-message');
  msg.textContent = 'Signing in…';
  const { error } = await supabase.auth.signInWithPassword({ email: $('login-email').value.trim(), password: $('login-password').value });
  if (error) { msg.textContent = error.message; return; }
  msg.textContent = '';
  await refreshMember();
}
function setAuthMode(mode) {
  authMode = mode === 'register' ? 'register' : 'login';
  $('login-form').hidden = authMode !== 'login';
  $('register-form').hidden = authMode !== 'register';
  $('auth-tab-login').classList.toggle('active', authMode === 'login');
  $('auth-tab-register').classList.toggle('active', authMode === 'register');
  $('auth-tab-login').setAttribute('aria-selected', String(authMode === 'login'));
  $('auth-tab-register').setAttribute('aria-selected', String(authMode === 'register'));
  $('login-message').textContent = '';
}
async function register(e) {
  e.preventDefault();
  if (!supabase) return;
  const msg = $('login-message');
  if ($('register-password').value !== $('register-confirm').value) {
    msg.textContent = 'Your passwords do not match.';
    return;
  }
  msg.textContent = 'Creating your account…';
  const { data, error } = await supabase.auth.signUp({
    email: $('register-email').value.trim(),
    password: $('register-password').value,
    options: { emailRedirectTo: callbackUrl(), data: { display_name: $('register-name').value.trim() } }
  });
  if (error) { msg.textContent = error.message; return; }
  if (!data?.session) {
    msg.textContent = 'Check your inbox for a confirmation email. Once confirmed, return to the member portal and sign in.';
    return;
  }
  msg.textContent = 'Account created successfully.';
  await refreshMember();
}
async function signInWithGoogle() {
  if (!supabase) return;
  const msg = $('login-message');
  msg.textContent = 'Opening Google sign-in…';
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callbackUrl() }
  });
  if (error) msg.textContent = `Google sign-in is not available yet: ${error.message}`;
}
async function signOut() {
  if (supabase) await supabase.auth.signOut();
  user = null; member = null; projects = []; selectedProjectId = null;
  renderGate();
}
function switchTab(tab) {
  if (tab === 'projects' && !isStaff()) tab = 'videos';
  activeTab = tab;
  $('portal-projects').hidden = tab !== 'projects';
  $('portal-videos').hidden = tab !== 'videos';
  document.querySelectorAll('[data-portal-tab]').forEach(btn => btn.classList.toggle('active',btn.dataset.portalTab === tab));
}
function message(text) { $('project-message').textContent = text || ''; }
async function loadProjects() {
  if (!supabase || !isStaff()) return;
  message('');
  const { data,error } = await supabase.from('projects').select('id,name,description').order('created_at',{ascending:false});
  if (error) { message(`Could not load projects: ${error.message}`); return; }
  projects = data || [];
  if (!projects.some(p=>p.id===selectedProjectId)) selectedProjectId = projects[0]?.id || null;
  $('project-select').innerHTML = projects.length
    ? projects.map(p=>`<option value="${esc(p.id)}" ${p.id === selectedProjectId ? 'selected':''}>${esc(p.name)}</option>`).join('')
    : '<option value="">No projects yet</option>';
  $('new-task-form').hidden = !selectedProjectId;
  await loadTasks();
}
async function addProject(e) {
  e.preventDefault();
  if (!supabase || !isStaff()) return;
  const name = $('new-project-title').value.trim();
  if (!name) return;
  const {data,error} = await supabase.from('projects').insert({name}).select('id').single();
  if (error) return message(error.message);
  $('new-project-title').value = '';
  selectedProjectId = data.id;
  await loadProjects();
}
async function loadTasks() {
  const board = $('kanban-board');
  if (!selectedProjectId) { board.innerHTML = '<div class="empty-state">Create your first project to start tracking work.</div>'; return; }
  const {data,error} = await supabase.from('tasks').select('id,title,status,priority').eq('project_id',selectedProjectId).order('created_at',{ascending:false});
  if (error) return message(`Could not load tasks: ${error.message}`);
  const tasks = data || [];
  board.innerHTML = stages.map(([key,label]) => {
    const items = tasks.filter(t=>t.status===key);
    return `<section class="kanban-col"><h3>${label}<span>${items.length}</span></h3>${items.length ? items.map(t=>`<article class="task-card"><h4>${esc(t.title)}</h4><label for="task-${esc(t.id)}">Status</label><select id="task-${esc(t.id)}" data-task-id="${esc(t.id)}" aria-label="Status for ${esc(t.title)}">${stages.map(([s,name])=>`<option value="${s}" ${s===t.status?'selected':''}>${name}</option>`).join('')}</select></article>`).join('') : '<p class="empty-col">Nothing here yet</p>'}</section>`;
  }).join('');
  board.querySelectorAll('[data-task-id]').forEach(select => select.addEventListener('change',async () => {
    const {error: err} = await supabase.from('tasks').update({status:select.value}).eq('id',select.dataset.taskId);
    if (err) message(err.message);
    await loadTasks();
  }));
}
async function addTask(e) {
  e.preventDefault();
  if (!supabase || !isStaff() || !selectedProjectId) return;
  const title = $('new-task-title').value.trim();
  if (!title) return;
  const {error} = await supabase.from('tasks').insert({project_id:selectedProjectId,title,status:'queued'});
  if (error) return message(error.message);
  $('new-task-title').value='';
  await loadTasks();
}
function safeEmbed(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return null;
    const yes = (u.hostname === 'www.youtube-nocookie.com' || u.hostname === 'www.youtube.com') && /^\/embed\/[a-zA-Z0-9_-]+$/.test(u.pathname);
    const vimeo = u.hostname === 'player.vimeo.com' && /^\/video\/[0-9]+$/.test(u.pathname);
    return yes || vimeo ? u.href : null;
  } catch { return null; }
}
async function loadVideos() {
  if (!supabase || !user) return;
  const {data,error} = await supabase.from('videos').select('id,title,description,category,embed_url').eq('is_published',true).order('sort_order',{ascending:true});
  if (error) { $('videos-grid').innerHTML = `<p class="empty-state">Could not load videos: ${esc(error.message)}</p>`; return; }
  if (!data?.length) { $('videos-grid').innerHTML = '<p class="empty-state">No videos published yet. Add the first lesson video in the Supabase dashboard.</p>'; return; }
  $('videos-grid').innerHTML = data.map(v=>{
    const url = safeEmbed(v.embed_url);
    return `<article class="video-card"><div class="video-frame">${url ? `<iframe src="${esc(url)}" title="${esc(v.title)}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : '<div class="empty-state">Invalid or unsupported embed URL</div>'}</div><div class="video-info"><small>${esc(v.category)}</small><h3>${esc(v.title)}</h3><p class="muted">${esc(v.description)}</p></div></article>`;
  }).join('');
}
function init() {
  $('year').textContent = new Date().getFullYear();
  document.querySelector('.mobile-menu').addEventListener('click', () => {const nav=$('site-nav');const open=nav.classList.toggle('open');document.querySelector('.mobile-menu').setAttribute('aria-expanded',String(open));});
  window.addEventListener('hashchange',route);
  $('login-form').addEventListener('submit',login);
  $('register-form').addEventListener('submit',register);
  $('google-auth').addEventListener('click',signInWithGoogle);
  $('auth-tab-login').addEventListener('click',()=>setAuthMode('login'));
  $('auth-tab-register').addEventListener('click',()=>setAuthMode('register'));
  $('signout-button').addEventListener('click',signOut);
  $('pending-signout').addEventListener('click',signOut);
  document.querySelectorAll('[data-portal-tab]').forEach(el=>el.addEventListener('click',()=>switchTab(el.dataset.portalTab)));
  $('new-project-form').addEventListener('submit',addProject);
  $('new-task-form').addEventListener('submit',addTask);
  $('project-select').addEventListener('change',e=>{selectedProjectId=e.target.value||null;loadTasks();});
  $('refresh-projects').addEventListener('click',loadProjects);
  $('refresh-videos').addEventListener('click',loadVideos);
  setAuthMode('login');
  route();
  if (supabase) {
    supabase.auth.onAuthStateChange((event) => {
      if (event==='SIGNED_IN' || event==='SIGNED_OUT' || event==='USER_UPDATED') {
        // Do not await Supabase network calls inside the auth event callback.
        setTimeout(()=>{refreshMember();},0);
      }
    });
    refreshMember();
  }
}
init();
