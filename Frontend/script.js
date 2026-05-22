/* ════════════════════════════════════════════════
   AUTH SYSTEM — localStorage based
   Users stored as: studyai_users = [{email,name,college,passHash}]
   Session:         studyai_session = {email,name,college}
════════════════════════════════════════════════ */

/* Simple hash (non-cryptographic, frontend-only demo) */
function hashPass(pass){
  let h=0;
  for(let i=0;i<pass.length;i++){h=(Math.imul(31,h)+pass.charCodeAt(i))|0;}
  return h.toString(36);
}

function getUsers(){
  try{return JSON.parse(localStorage.getItem('studyai_users')||'[]');}catch(e){return [];}
}
function saveUsers(u){localStorage.setItem('studyai_users',JSON.stringify(u));}
function getSession(){
  try{return JSON.parse(localStorage.getItem('studyai_session')||'null');}catch(e){return null;}
}
function saveSession(s){localStorage.setItem('studyai_session',JSON.stringify(s));}
function clearSession(){localStorage.removeItem('studyai_session');}

/* ── Show error ── */
function showError(msg){
  const el=document.getElementById('form-error');
  el.textContent=msg;el.classList.add('show');
}
function clearError(){document.getElementById('form-error').classList.remove('show');}

/* ── Switch tab ── */
function switchTab(tab){
  clearError();
  const isSI=tab==='signin';
  document.getElementById('tab-signin').classList.toggle('active',isSI);
  document.getElementById('tab-signup').classList.toggle('active',!isSI);
  document.getElementById('signin-form').style.display=isSI?'block':'none';
  document.getElementById('signup-form').style.display=isSI?'none':'block';
  document.getElementById('form-sub').textContent=isSI
    ?'Sign in to your account to continue'
    :'Create a free account to get started';
  document.querySelector('.ftitle').textContent=isSI?'Welcome back 👋':'Create account 🚀';
}

/* ── SIGN IN ── */
function handleSignIn(){
  clearError();
  const email=document.getElementById('si-email').value.trim().toLowerCase();
  const pass=document.getElementById('si-pass').value;
  if(!email||!pass){showError('Please fill in all fields.');return;}
  if(!/\S+@\S+\.\S+/.test(email)){showError('Please enter a valid email address.');return;}
  const users=getUsers();
  const user=users.find(u=>u.email===email);
  if(!user){showError('No account found with this email. Please sign up first.');return;}
  if(user.passHash!==hashPass(pass)){showError('Incorrect password. Please try again.');return;}
  const session={email:user.email,name:user.name,college:user.college||'Student'};
  saveSession(session);
  enterApp(session);
}

/* ── SIGN UP ── */
function handleSignUp(){
  clearError();
  const name=document.getElementById('su-name').value.trim();
  const email=document.getElementById('su-email').value.trim().toLowerCase();
  const college=document.getElementById('su-college').value.trim();
  const pass=document.getElementById('su-pass').value;
  if(!name||!email||!pass){showError('Name, email, and password are required.');return;}
  if(!/\S+@\S+\.\S+/.test(email)){showError('Please enter a valid email address.');return;}
  if(pass.length<6){showError('Password must be at least 6 characters long.');return;}
  const users=getUsers();
  if(users.find(u=>u.email===email)){showError('An account with this email already exists. Please sign in.');return;}
  users.push({email,name,college:college||'Student',passHash:hashPass(pass),profile:{phone:'',linkedin:'',degree:'',year:'',cgpa:''}});
  saveUsers(users);
  const session={email,name,college:college||'Student'};
  saveSession(session);
  showToast('Account created successfully! Welcome aboard 🎉','success');
  enterApp(session);
}

/* ── ENTER APP ── */
function enterApp(session){
  document.getElementById('login-page').classList.remove('active');
  document.getElementById('app-page').classList.add('active');
  populateUI(session);
  initDate();
  buildWeekGrid();
  buildHeatmap();
  buildProblemList('all');
  initCharts();
}

/* ── LOGOUT ── */
function handleLogout(){
  if(!confirm('Are you sure you want to sign out?'))return;
  clearSession();
  /* Reset app state */
  chartsBuilt=false;
  weekOffset=0;
  /* Clear form inputs */
  ['si-email','si-pass'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  /* Go back to login */
  document.getElementById('app-page').classList.remove('active');
  document.getElementById('login-page').classList.add('active');
  /* Reset to signin tab */
  switchTab('signin');
  goSection('dashboard',document.querySelector('.nav-item'));
  showToast('You have been signed out successfully.','info');
}

/* ── POPULATE UI with session user ── */
function populateUI(session){
  const initials=session.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('sb-avatar').textContent=initials;
  document.getElementById('sb-name').textContent=session.name;
  document.getElementById('sb-role').textContent=session.college||'Student';
  document.getElementById('tb-avatar').textContent=initials;
  document.getElementById('dash-name').textContent=session.name.split(' ')[0];
  document.getElementById('prof-avatar').textContent=initials;
  document.getElementById('prof-name-display').textContent=session.name;
  document.getElementById('prof-meta').textContent=session.college||'Student';
  /* Pre-fill profile form */
  const users=getUsers();
  const user=users.find(u=>u.email===session.email);
  if(user){
    document.getElementById('pf-name').value=user.name||'';
    document.getElementById('pf-email').value=user.email||'';
    document.getElementById('pf-phone').value=user.profile?.phone||'';
    document.getElementById('pf-linkedin').value=user.profile?.linkedin||'';
    document.getElementById('pf-college').value=user.college||'';
    document.getElementById('pf-degree').value=user.profile?.degree||'';
    document.getElementById('pf-year').value=user.profile?.year||'';
    document.getElementById('pf-cgpa').value=user.profile?.cgpa||'';
  }
}

/* ── SAVE PROFILE ── */
function saveProfile(){
  const session=getSession();
  if(!session)return;
  const users=getUsers();
  const idx=users.findIndex(u=>u.email===session.email);
  if(idx<0)return;
  const name=document.getElementById('pf-name').value.trim()||users[idx].name;
  users[idx].name=name;
  users[idx].profile=users[idx].profile||{};
  users[idx].profile.phone=document.getElementById('pf-phone').value.trim();
  users[idx].profile.linkedin=document.getElementById('pf-linkedin').value.trim();
  saveUsers(users);
  session.name=name;
  saveSession(session);
  populateUI(session);
  showToast('Profile saved successfully!','success');
}

function saveAcademic(){
  const session=getSession();
  if(!session)return;
  const users=getUsers();
  const idx=users.findIndex(u=>u.email===session.email);
  if(idx<0)return;
  users[idx].college=document.getElementById('pf-college').value.trim()||users[idx].college;
  users[idx].profile=users[idx].profile||{};
  users[idx].profile.degree=document.getElementById('pf-degree').value.trim();
  users[idx].profile.year=document.getElementById('pf-year').value.trim();
  users[idx].profile.cgpa=document.getElementById('pf-cgpa').value.trim();
  saveUsers(users);
  session.college=users[idx].college;
  saveSession(session);
  populateUI(session);
  showToast('Academic info saved!','success');
}

/* ════════════════════════════════════════════════
   STARTUP — check if already logged in
════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded',()=>{
  const session=getSession();
  if(session){
    enterApp(session);
  }
  /* Enter on input press */
  document.getElementById('si-pass').addEventListener('keydown',e=>{if(e.key==='Enter')handleSignIn();});
  document.getElementById('su-pass').addEventListener('keydown',e=>{if(e.key==='Enter')handleSignUp();});
});

/* ════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════ */
const titles={dashboard:'Dashboard',planner:'Study Planner',dsa:'DSA Practice',analytics:'Analytics',placement:'Placement Prep',interviews:'Interviews',profile:'My Profile',settings:'Settings'};

function goSection(id,btn){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById('sec-'+id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if(btn)btn.classList.add('active');
  document.getElementById('tb-title').textContent=titles[id]||id;
  document.getElementById('tb-crumb').textContent=titles[id]||id;
  document.getElementById('notif-panel').classList.remove('open');
}

function toggleNotif(){document.getElementById('notif-panel').classList.toggle('open');}

/* ════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════ */
let toastTimer=null;
function showToast(msg,type='info'){
  const t=document.getElementById('toast');
  const icons={success:'ti-circle-check',error:'ti-alert-circle',info:'ti-info-circle'};
  t.className=`toast ${type}`;
  t.innerHTML=`<i class="ti ${icons[type]||'ti-info-circle'}" style="font-size:16px;"></i>${msg}`;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),3200);
}

/* ════════════════════════════════════════════════
   DATE
════════════════════════════════════════════════ */
function initDate(){
  const d=new Date();
  document.getElementById('current-date').textContent=d.toLocaleDateString('en-IN',{weekday:'long',month:'short',day:'numeric',year:'numeric'});
}

/* ════════════════════════════════════════════════
   WEEK PLANNER
════════════════════════════════════════════════ */
let weekOffset=0;
const DAY_NAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const PLAN_TASKS={
  0:[{t:'Arrays Quiz',type:'dsa'}],
  1:[{t:'Flask API Lab',type:'ml'},{t:'Aptitude Mock',type:'apt',done:true}],
  2:[{t:'Mock Interview',type:'int'},{t:'DP Problems',type:'dsa'}],
  3:[{t:'ML Theory',type:'ml',done:true}],
  4:[{t:'System Design',type:'dsa'},{t:'Verbal Reasoning',type:'apt'}],
  5:[{t:'Resume Polish',type:'int',done:true},{t:'Binary Trees',type:'dsa'}],
  6:[{t:'SQL Practice',type:'ml'}]
};

function changeWeek(dir){weekOffset+=dir;buildWeekGrid();}

function buildWeekGrid(){
  const now=new Date();
  const start=new Date(now);
  start.setDate(now.getDate()-now.getDay()+weekOffset*7);
  const end=new Date(start);end.setDate(end.getDate()+6);
  const fmt=d=>d.toLocaleDateString('en-IN',{month:'short',day:'numeric'});
  document.getElementById('wk-label').textContent=
    `${weekOffset===0?'This Week':weekOffset<0?'Previous Week':'Next Week'} · ${fmt(start)} – ${fmt(end)}`;
  document.getElementById('week-grid').innerHTML=Array.from({length:7},(_,i)=>{
    const d=new Date(start);d.setDate(d.getDate()+i);
    const isToday=d.toDateString()===now.toDateString();
    const tasks=(PLAN_TASKS[i]||[]).map(t=>`<div class="task-chip ${t.type}${t.done?' done':''}">${t.t}</div>`).join('');
    return `<div class="day-col${isToday?' today':''}">
      <div class="day-head"><div class="day-name">${DAY_NAMES[d.getDay()]}</div><div class="day-num">${d.getDate()}</div></div>
      <div class="day-tasks">${tasks}</div>
    </div>`;
  }).join('');
}

function addPlanTask(){
  const name=prompt('Enter task name:');
  if(!name)return;
  showToast(`Task "${name}" added to planner!`,'success');
}

/* ════════════════════════════════════════════════
   HEATMAP
════════════════════════════════════════════════ */
function buildHeatmap(){
  const el=document.getElementById('heatmap');
  const lvls=['','l1','l2','l3','l4'];
  el.innerHTML=Array.from({length:112},()=>{
    const r=Math.random();
    const l=r>.88?'l4':r>.72?'l3':r>.5?'l2':r>.3?'l1':'';
    return `<div class="hc ${l}"></div>`;
  }).join('');
}

/* ════════════════════════════════════════════════
   PROBLEM LIST
════════════════════════════════════════════════ */
const PROBLEMS=[
  {done:true, name:'Two Sum',topic:'Arrays',diff:'Easy',company:'Google'},
  {done:true, name:'LRU Cache',topic:'Design',diff:'Medium',company:'Amazon'},
  {done:false,name:'Serialize Binary Tree',topic:'Trees',diff:'Hard',company:'Meta'},
  {done:true, name:'Merge Intervals',topic:'Arrays',diff:'Medium',company:'Google'},
  {done:false,name:'Word Ladder',topic:'Graphs',diff:'Hard',company:'Microsoft'},
  {done:true, name:'Climbing Stairs',topic:'DP',diff:'Easy',company:'Amazon'},
  {done:false,name:'Longest Palindromic Substring',topic:'DP',diff:'Medium',company:'Apple'},
  {done:true, name:'Valid Parentheses',topic:'Stack',diff:'Easy',company:'Flipkart'},
  {done:false,name:'Binary Tree Diameter',topic:'Trees',diff:'Easy',company:'Google'},
  {done:false,name:'Course Schedule',topic:'Graphs',diff:'Medium',company:'Nvidia'},
];

function buildProblemList(filter){
  const list=filter==='all'?PROBLEMS:PROBLEMS.filter(p=>p.topic===filter);
  document.getElementById('prob-list').innerHTML=list.map(p=>`
    <tr>
      <td><div class="solved-dot ${p.done?'yes':'no'}">${p.done?'<i class="ti ti-check" style="font-size:11px;"></i>':''}</div></td>
      <td style="${p.done?'color:var(--text2);text-decoration:line-through;':''}">${p.name}</td>
      <td style="color:var(--text2);font-size:12px;">${p.topic}</td>
      <td class="diff-${p.diff[0].toLowerCase()}">${p.diff}</td>
      <td style="color:var(--text2);font-size:12px;">${p.company}</td>
      <td><button onclick="showToast('Opening problem…','info')" style="background:none;border:1px solid var(--border);color:var(--text2);padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;">Solve</button></td>
    </tr>`).join('');
}

function dsaFilter(f,btn){
  document.querySelectorAll('.dsa-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  buildProblemList(f);
}

/* ════════════════════════════════════════════════
   CHARTS
════════════════════════════════════════════════ */
let chartsBuilt=false;
function initCharts(){
  if(chartsBuilt)return;
  chartsBuilt=true;

  const gridColor='rgba(255,255,255,.05)';
  const tickColor='#9aa3c2';
  const tickFont={size:11};
  const axes=()=>({
    x:{grid:{color:gridColor},ticks:{color:tickColor,font:tickFont}},
    y:{grid:{color:gridColor},ticks:{color:tickColor,font:tickFont}}
  });

  /* Productivity */
  new Chart(document.getElementById('chartProd'),{
    type:'line',
    data:{
      labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets:[
        {label:'Study Hrs',data:[5.5,7,4,8,6.5,9,5],borderColor:'#6373ff',backgroundColor:'rgba(99,115,255,.08)',fill:true,tension:.4,pointRadius:4,pointBackgroundColor:'#6373ff'},
        {label:'Coding Hrs',data:[2,3,2.5,4,3,5,2.5],borderColor:'#06d6a0',backgroundColor:'rgba(6,214,160,.05)',fill:true,tension:.4,pointRadius:4,pointBackgroundColor:'#06d6a0',borderDash:[4,4]}
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:tickColor,font:tickFont,boxWidth:10}}},scales:axes()}
  });

  /* Study hours */
  new Chart(document.getElementById('chartStudy'),{
    type:'bar',
    data:{
      labels:['Jan','Feb','Mar','Apr','May','Jun','Jul'],
      datasets:[{label:'Hours',data:[80,95,72,110,96,88,102],backgroundColor:'rgba(99,115,255,.6)',borderRadius:6,hoverBackgroundColor:'#6373ff'}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:axes()}
  });

  /* Topic doughnut */
  new Chart(document.getElementById('chartTopic'),{
    type:'doughnut',
    data:{
      labels:['DSA','Aptitude','ML/AI','OS/DBMS','System Design'],
      datasets:[{data:[35,20,18,15,12],backgroundColor:['#6373ff','#06d6a0','#f59e0b','#8b5cf6','#f43f5e'],borderWidth:0,hoverOffset:6}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{color:tickColor,font:tickFont,boxWidth:10,padding:12}}},cutout:'65%'}
  });

  /* Coding progress */
  new Chart(document.getElementById('chartCode'),{
    type:'line',
    data:{
      labels:['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6','Wk7','Wk8'],
      datasets:[
        {label:'Easy', data:[8,14,18,24,30,36,42,52],borderColor:'#06d6a0',fill:false,tension:.4,pointRadius:3},
        {label:'Medium',data:[3,7,12,20,28,38,52,71],borderColor:'#f59e0b',fill:false,tension:.4,pointRadius:3},
        {label:'Hard', data:[0,1,2,5,9,14,18,25],borderColor:'#f43f5e',fill:false,tension:.4,pointRadius:3}
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:tickColor,font:tickFont,boxWidth:10}}},scales:axes()}
  });
}

/* Close notif panel on outside click */
document.addEventListener('click',e=>{
  const panel=document.getElementById('notif-panel');
  const bellBtn=e.target.closest('.tb-btn');
  if(!panel.contains(e.target)&&!(bellBtn&&bellBtn.querySelector('.ti-bell'))){
    panel.classList.remove('open');
  }
});