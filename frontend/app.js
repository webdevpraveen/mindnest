// ===== NAVIGATION =====
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  event.currentTarget.classList.add('active');
}

// ===== TOAST =====
let toastTimer;
function showToast(msg, icon = '✅', type = 'success') {
  const toast = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  document.getElementById('toastIcon').textContent = icon;
  toast.className = 'toast ' + type + ' show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== MODALS =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(event, id) {
  if (event.target === document.getElementById(id)) {
    document.getElementById(id).classList.remove('open');
  }
}

// ===== MOOD =====
function selectMood(btn) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  showToast('+10 wellness points for checking in! 🌟', '🌟', 'points');
}

// ===== TAGS =====
function toggleTag(el) {
  el.classList.toggle('active');
}

// ===== API INTEGRATION =====
const API_URL = ''; // Relative path because backend serves frontend.

let userPoints = 680;

function updatePointsUI(points) {
  userPoints = points;
  document.querySelectorAll('.points-big, .points-value').forEach(el => el.textContent = points);
  document.querySelectorAll('.lb-pts').forEach(el => {
    if(el.previousElementSibling && el.previousElementSibling.textContent.includes('You')) {
      el.textContent = points + ' pts';
    }
  });
}

async function fetchPoints() {
  try {
    const res = await fetch(`${API_URL}/api/points`);
    const data = await res.json();
    if(data.points) updatePointsUI(data.points);
  } catch(e) { console.error('Failed to fetch points', e); }
}

async function updatePoints(amount) {
  try {
    const res = await fetch(`${API_URL}/api/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    if(data.newPoints) updatePointsUI(data.newPoints);
  } catch(e) { console.error('Failed to update points', e); }
}

// ===== POSTS =====
async function loadPosts() {
  try {
    const res = await fetch(`${API_URL}/api/posts`);
    const posts = await res.json();
    const feed = document.getElementById('feedPosts');
    if(feed) {
      feed.innerHTML = '';
      posts.forEach(p => {
        feed.insertAdjacentHTML('beforeend', createPostCard(p.name, p.text, p.likes, p.validations, p.id, p.anonymous));
      });
    }
  } catch(e) { console.error('Failed to load posts', e); }
}

window.addEventListener('DOMContentLoaded', () => {
  fetchPoints();
  loadPosts();
});
async function submitPost() {
  const textarea = document.querySelector('.composer-input');
  const text = textarea.value.trim();
  if (!text) { showToast('Write something first!', '✏️'); return; }
  
  const isAnon = document.querySelector('.anon-toggle .toggle').classList.contains('on');
  
  try {
    const res = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: isAnon ? 'Anonymous' : 'You', 
        text, 
        anonymous: isAnon 
      })
    });
    const data = await res.json();
    
    document.getElementById('feedPosts').insertAdjacentHTML('afterbegin', createPostCard(data.post.name, data.post.text, 0, 0, data.post.id, data.post.anonymous));
    textarea.value = '';
    
    if(data.newPoints) updatePointsUI(data.newPoints);
    showToast('Posted! +10 wellness points 🌿', '✅', 'points');
  } catch(e) {
    showToast('Failed to post', '❌');
  }
}

function createPostCard(name, text, likes = 0, validations = 0, id = '', isAnon = false) {
  const colors = ['#7C9E87','#7BAFD4','#C9A84C','#D46B6B'];
  const c = isAnon ? '#A8C5B0' : colors[Math.floor(Math.random() * colors.length)];
  const badgeHTML = isAnon ? `<span class="post-badge badge-anon">🕶️ Anonymous</span>` : '';
  
  return `<div class="post-card" style="animation:fadeIn 0.3s ease" data-id="${id}">
    <div class="post-header">
      <div class="post-avatar" style="background:${c}">${isAnon ? '👤' : name[0]}</div>
      <div class="post-user-info">
        <div class="post-username">${name}</div>
        <div class="post-meta">Just now</div>
      </div>
      ${badgeHTML}
    </div>
    <div class="post-content">${text}</div>
    <div class="post-actions">
      <button class="action-btn" onclick="toggleLike(this, '${id}')">❤️ <span>${likes}</span></button>
      <button class="action-btn" onclick="toggleValidate(this, '${id}')">✅ I feel this <span>${validations}</span></button>
      <button class="action-btn" onclick="showToast('Comment feature coming soon!','💬')">💬 Comment <span>0</span></button>
    </div>
  </div>`;
}

function submitPostFromModal() {
  document.getElementById('postModal').classList.remove('open');
  updatePoints(10);
  showToast('Posted to community! +10 pts 🌿', '✅', 'points');
}

async function toggleLike(btn, id) {
  const wasLiked = btn.classList.contains('liked');
  btn.classList.toggle('liked');
  const span = btn.querySelector('span');
  span.textContent = parseInt(span.textContent) + (!wasLiked ? 1 : -1);
  
  if(!wasLiked && id) {
    try {
      await fetch(`${API_URL}/api/posts/${id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' })
      });
    } catch(e) {}
  }
}

async function toggleValidate(btn, id) {
  const wasValidated = btn.classList.contains('validated');
  btn.classList.toggle('validated');
  const span = btn.querySelector('span');
  span.textContent = parseInt(span.textContent) + (!wasValidated ? 1 : -1);
  
  if (!wasValidated) {
    showToast('+5 pts for validating! 🫂', '✅', 'points');
    if(id) {
      try {
        const res = await fetch(`${API_URL}/api/posts/${id}/interact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'validate' })
        });
        const data = await res.json();
        if(data.newPoints) updatePointsUI(data.newPoints);
      } catch(e) {}
    } else {
      updatePoints(5);
    }
  }
}

// ===== VENT =====
function validateVent(btn) {
  btn.classList.toggle('done');
  const span = btn.querySelector('span');
  if (btn.classList.contains('done')) {
    span.textContent = parseInt(span.textContent) + 1;
    showToast('+10 pts for supporting! 🫂', '💛', 'points');
    updatePoints(10);
  } else {
    span.textContent = parseInt(span.textContent) - 1;
  }
}

function submitVent() {
  document.getElementById('ventModal').classList.remove('open');
  updatePoints(10);
  showToast('Vent posted! You\'re brave for sharing. +10 pts 🕊️', '🕊️', 'success');
}

// ===== BREATHE =====
let breatheInterval = null;
let breathePhase = 0;
let breatheCount = 0;
let currentTechnique = '4-7-8';

const techniques = {
  '4-7-8': [
    { phase: 'Inhale', dur: 4 },
    { phase: 'Hold', dur: 7 },
    { phase: 'Exhale', dur: 8 }
  ],
  'box': [
    { phase: 'Inhale', dur: 4 },
    { phase: 'Hold', dur: 4 },
    { phase: 'Exhale', dur: 4 },
    { phase: 'Hold', dur: 4 }
  ],
  'calm': [
    { phase: 'Inhale', dur: 3 },
    { phase: 'Exhale', dur: 6 }
  ]
};

function selectTechnique(el, name) {
  document.querySelectorAll('.technique-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentTechnique = name;
  stopBreathe();
}

function startBreathe() {
  if (breatheInterval) return;
  breathePhase = 0;
  runBreathePhase();
}

function runBreathePhase() {
  const steps = techniques[currentTechnique];
  const step = steps[breathePhase % steps.length];
  const inner = document.getElementById('breatheInner');
  const textEl = document.getElementById('breatheText');
  const countEl = document.getElementById('breatheCount');

  textEl.textContent = step.phase;
  inner.className = 'breathe-inner ' + (step.phase === 'Inhale' ? 'expanding' : step.phase === 'Exhale' ? 'shrinking' : 'holding');

  let sec = step.dur;
  countEl.textContent = sec;

  breatheInterval = setInterval(() => {
    sec--;
    countEl.textContent = sec;
    if (sec <= 0) {
      clearInterval(breatheInterval);
      breatheInterval = null;
      breathePhase++;
      if (breathePhase > 0 && breathePhase % steps.length === 0) {
        showToast('+20 pts for completing breathing session! 🌿', '🌿', 'points');
      }
      setTimeout(runBreathePhase, 300);
    }
  }, 1000);
}

function stopBreathe() {
  clearInterval(breatheInterval);
  breatheInterval = null;
  document.getElementById('breatheText').textContent = 'Ready';
  document.getElementById('breatheCount').textContent = '—';
  document.getElementById('breatheInner').className = 'breathe-inner';
  breathePhase = 0;
}

// ===== JOURNAL =====
document.getElementById('journalText')?.addEventListener('input', function() {
  const words = this.value.trim() ? this.value.trim().split(/\s+/).length : 0;
  document.getElementById('wordCount').textContent = words + ' words';
});

function saveEntry() {
  const text = document.getElementById('journalText').value.trim();
  if (!text) { showToast('Write something first!', '✏️'); return; }
  showToast('Entry saved! +15 pts for journaling ✍️', '📓', 'points');
}

function formatText(cmd) {
  document.execCommand(cmd, false);
}

function selectJMood(btn) {
  document.querySelectorAll('.journal-mood-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
}

const entries = {
  apr11: { title: 'Rough day but I survived', text: "Didn't do well in the mock test but talked to Ananya and felt better after. She reminded me that one test doesn't define my journey. I need to remember that more often." },
  apr9: { title: 'Something clicked today', text: "Finally understood Dynamic Programming after 3 days of struggle. The feeling is indescribable — like a fog lifting. I celebrated with chai and some music. These small wins matter." },
  apr7: { title: 'Why do I compare myself so much', text: "Saw Riya's internship offer on LinkedIn and felt that familiar pang again. Need to work on this. I know my path is different and that's okay, but it's hard to believe it in the moment." },
  apr5: { title: 'Week 1 check-in', text: "Started using MindNest. It's actually helping to write things down. The community feels genuine, unlike Instagram where everything is filtered. Going to try to post daily." }
};

function loadEntry(id) {
  const e = entries[id];
  document.querySelector('.journal-heading').value = e.title;
  document.getElementById('journalText').value = e.text;
  const words = e.text.trim().split(/\s+/).length;
  document.getElementById('wordCount').textContent = words + ' words';
}

// ===== CHAT =====
function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const msgs = document.getElementById('chatMessages');
  const now = new Date();
  const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0');

  const msg = `<div class="msg-group me">
    <div class="avatar" style="width:30px;height:30px;font-size:12px;background:var(--cream); color:var(--charcoal); border: 1px solid var(--border); font-weight:600;">P</div>
    <div>
      <div class="msg-time">${time}</div>
      <div class="msg-bubble">${text}</div>
    </div>
  </div>`;

  msgs.insertAdjacentHTML('beforeend', msg);
  msgs.scrollTop = msgs.scrollHeight;
  input.value = '';

  // Auto reply
  setTimeout(() => {
    const replies = [
      'That makes total sense! 💙',
      'Haan yaar, I totally get you 😅',
      'Agreed! Community support really helps ✨',
      'You\'re doing great, keep going! 💪',
      'Pata nahi yaar, exam pressure is real 😮‍💨'
    ];
    const reply = `<div class="msg-group them">
      <div class="avatar" style="width:30px;height:30px;font-size:12px;background:var(--cream); color:var(--charcoal); border: 1px solid var(--border); font-weight:600;">S</div>
      <div>
        <div class="msg-time">${time}</div>
        <div class="msg-bubble">${replies[Math.floor(Math.random() * replies.length)]}</div>
      </div>
    </div>`;
    msgs.insertAdjacentHTML('beforeend', reply);
    msgs.scrollTop = msgs.scrollHeight;
  }, 1200);
}

function switchChat(user) {
  document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

// ===== REWARDS =====
function redeemVoucher(btn, cost) {
  if (userPoints >= cost) {
    userPoints -= cost;
    btn.textContent = '✅ Done!';
    btn.className = 'redeem-btn locked';
    showToast(`Redeemed! Check your email for the voucher 🎁`, '🎁', 'success');
  } else {
    showToast('Not enough points yet! Keep going 💪', '🔒');
  }
}

// ===== FADE IN ANIMATION =====
const style = document.createElement('style');
style.textContent = '@keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }';
document.head.appendChild(style);