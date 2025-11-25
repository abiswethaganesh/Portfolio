
function validateForm() {
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var isValid = true;
  // Name validation
  if (!name.match(/^[a-zA-Z ]+$/)) {
    document.getElementById("nameError").innerHTML = "Please enter a valid name";
    isValid = false;
  } else {
    document.getElementById("nameError").innerHTML = "";
  }
  // Email validation
  if (!email.match(/^\S+@\S+\.\S+$/)) {
    document.getElementById("emailError").innerHTML = "Please enter a valid email address";
    isValid = false;
  } else {
    document.getElementById("emailError").innerHTML = "";
  }
  return isValid;
}

let audioCtx=null
function ensureAudio(){
  if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)()}
}
const notes={C:261.63,D:293.66,E:329.63,G:392.00,A:440.00}
function playTone(freq,duration=340){
  ensureAudio()
  const o=audioCtx.createOscillator(),g=audioCtx.createGain()
  o.type='sine';o.frequency.value=freq
  o.connect(g);g.connect(audioCtx.destination)
  g.gain.setValueAtTime(0.0001,audioCtx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.26,audioCtx.currentTime+0.01)
  o.start()
  g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+duration/1000)
  setTimeout(()=>o.stop(),duration+40)
}

const keys=document.querySelectorAll('#pianoGame .key')
let sequence=[],userSeq=[],playing=false,level=0,strict=false
const startBtn=document.getElementById('startBtn')
const resetBtn=document.getElementById('resetBtn')
const strictBtn=document.getElementById('strictBtn')
const status=document.getElementById('pianoStatus')

function flashKey(keyEl,ms=320){
  keyEl.style.opacity=0.5
  setTimeout(()=>keyEl.style.opacity=1,ms)
}
function nextRound(){
  level++
  status.textContent='Level '+level+' — Listen...'
  const keysArr=Object.keys(notes)
  sequence.push(keysArr[Math.floor(Math.random()*keysArr.length)])
  playSequence()
}
function playSequence(){
  playing=true
  let i=0
  const interval=setInterval(()=>{
    const n=sequence[i]
    const el=[...keys].find(k=>k.dataset.note===n)
    playTone(notes[n])
    flashKey(el,300)
    i++
    if(i>=sequence.length){
      clearInterval(interval)
      playing=false
      status.textContent='Your turn — Repeat the sequence'
    }
  },520)
}
keys.forEach(k=>{
  k.addEventListener('click',()=>{
    if(playing)return
    const note=k.dataset.note
    playTone(notes[note])
    flashKey(k,200)
    userSeq.push(note)
    checkUser()
  })
})
function checkUser(){
  const cur=userSeq.length-1
  if(userSeq[cur]!==sequence[cur]){
    status.textContent='Wrong!'
    playTone(120,200)
    if(strict){
      setTimeout(()=>{resetGame();startGame()},1000)
    }else{
      userSeq=[]
      setTimeout(()=>{status.textContent='Try again — listening';playSequence()},800)
    }
    return
  }
  if(userSeq.length===sequence.length){
    userSeq=[]
    setTimeout(()=>nextRound(),700)
  }else{
    status.textContent='Keep going...'
  }
}
function startGame(){
  ensureAudio()
  sequence=[];userSeq=[];level=0
  nextRound()
}
function resetGame(){
  sequence=[];userSeq=[];level=0
  status.textContent='Reset. Press Start'
}
startBtn.addEventListener('click',()=>{ensureAudio();startGame()})
resetBtn.addEventListener('click',()=>resetGame())
strictBtn.addEventListener('click',()=>{strict=!strict;strictBtn.textContent='Strict: '+(strict?'On':'Off')})
// Formspree contact form
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    // run validation
    if (!validateForm()) return;

    const data = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      message: document.getElementById('message').value.trim()
    };

    formStatus.textContent = 'Sending...';
    formStatus.style.color = '#00d5ff';

    try {
      const resp = await fetch('https://formspree.io/f/mldznrzz', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (resp.ok) {
        formStatus.textContent = 'Message sent — thank you!';
        formStatus.style.color = '#7CFC00';
        contactForm.reset();
        document.getElementById('nameError').textContent = '';
        document.getElementById('emailError').textContent = '';
      } else {
        const json = await resp.json();
        formStatus.textContent = json.error || 'Send failed — try again later.';
        formStatus.style.color = '#ff6b6b';
      }
    } catch (err) {
      formStatus.textContent = 'Network error — try again later.';
      formStatus.style.color = '#ff6b6b';
    }
  });
}
// infinite looping carousel for piano videos (clone-edge approach)
(function(){
  const wrap = document.querySelector('.pv-track-wrap');
  const track = document.querySelector('.pv-track');
  let tiles = Array.from(document.querySelectorAll('.pv-tile'));
  const prevBtn = document.querySelector('.pv-prev');
  const nextBtn = document.querySelector('.pv-next');

  if (!track || tiles.length === 0) return;

  // settings
  const gap = parseInt(getComputedStyle(track).gap || 16); // tile gap
  const transitionMs = 360;
  let tileWidth = tiles[0].offsetWidth + gap;

  // create clones (clone all tiles to start and end)
  const originalCount = tiles.length;
  const clonesBefore = [];
  const clonesAfter = [];

  tiles.forEach(t => {
    const before = t.cloneNode(true);
    before.classList.add('clone');
    clonesBefore.push(before);

    const after = t.cloneNode(true);
    after.classList.add('clone');
    clonesAfter.push(after);
  });

  // prepend clonesBefore (in reverse so order matches)
  clonesBefore.reverse().forEach(c => track.prepend(c));
  // append clonesAfter
  clonesAfter.forEach(c => track.appendChild(c));

  // update tiles list to include clones
  tiles = Array.from(document.querySelectorAll('.pv-tile'));
  const total = tiles.length;

  // compute start index (first real tile index after the prepended clones)
  const startIndex = clonesBefore.length;
  let index = startIndex; // current center index (refers to tiles array)

  // set initial transform so first visible shows real first tile
  function setTransformNoAnim(idx) {
    const x = -idx * (tiles[0].offsetWidth + gap);
    track.style.transition = 'none';
    track.style.transform = `translateX(${x}px)`;
    // force reflow to make sure browser applies no-transition
    // eslint-disable-next-line no-unused-expressions
    track.offsetHeight;
    track.style.transition = `transform ${transitionMs}ms ease`;
  }

  // helper: play visible videos only
  function updatePlayback() {
    // decide visible window around index
    const visibleRange = 3; // tweak if you want more/less
    tiles.forEach((t, i) => {
      const v = t.querySelector('video');
      const dist = Math.abs(i - index);
      if (dist <= visibleRange) {
        if (v && v.paused) v.play().catch(() => {});
      } else {
        if (v && !v.paused) v.pause();
      }
    });
  }

  // highlight active tile
  function updateActiveClass() {
    tiles.forEach((t, i) => t.classList.toggle('active', i === index));
  }

  // go to index with wrapping logic handled after transition
  function goTo(i) {
    index = i;
    const x = -index * (tiles[0].offsetWidth + gap);
    track.style.transform = `translateX(${x}px)`;
    updateActiveClass();
    updatePlayback();
  }

  // handle transitionend to snap when crossing clones
  track.addEventListener('transitionend', () => {
    const realStart = startIndex;
    const realEnd = startIndex + originalCount - 1;

    // crossed to the right clones (index > realEnd)
    if (index > realEnd) {
      // jump back to corresponding real tile
      const offset = index - originalCount;
      index = offset;
      setTransformNoAnim(index);
      updateActiveClass();
      updatePlayback();
    }

    // crossed to the left clones (index < realStart)
    if (index < realStart) {
      const offset = index + originalCount;
      index = offset;
      setTransformNoAnim(index);
      updateActiveClass();
      updatePlayback();
    }
  });

  // Prev / Next handlers
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }
  nextBtn && nextBtn.addEventListener('click', next);
  prevBtn && prevBtn.addEventListener('click', prev);

  // tile click -> go there or toggle popped if already active
  tiles.forEach((t, i) => {
    t.addEventListener('click', () => {
      if (i === index) {
        t.classList.toggle('popped');
      } else {
        goTo(i);
      }
    });
  });

  // initialize: ensure videos muted/loop/playsInline
  window.addEventListener('load', () => {
    // re-measure width in case responsive
    tileWidth = tiles[0].offsetWidth + gap;

    tiles.forEach(tv => {
      const vid = tv.querySelector('video');
      if (vid) {
        vid.muted = true;
        vid.loop = true;
        vid.playsInline = true;
      }
    });

    // set start transform to the first real tile (no animation)
    setTransformNoAnim(startIndex);
    updateActiveClass();
    updatePlayback();
  });

  // support arrow navigation via keyboard (optional)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // simple touch swipe support
  let startX = null;
  wrap.addEventListener('touchstart', e => startX = e.touches[0].clientX);
  wrap.addEventListener('touchend', e => {
    if (startX == null) return;
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    if (dx > 40) prev();
    else if (dx < -40) next();
    startX = null;
  });

  // on resize, recompute tile width and snap to current index without animation
  window.addEventListener('resize', () => {
    tileWidth = tiles[0].offsetWidth + gap;
    setTransformNoAnim(index);
  });
})();
// ---------- Piano videos carousel (clone-edge + tap-vs-swipe + play toggle) ----------
(function () {
  const wrap = document.querySelector('.pv-track-wrap');
  const track = document.querySelector('.pv-track');
  const prevBtn = document.querySelector('.pv-prev');
  const nextBtn = document.querySelector('.pv-next');
  if (!wrap || !track) return;

  let tiles = Array.from(track.children);
  const originalCount = tiles.length;
  const gap = parseInt(getComputedStyle(track).gap || 16);
  const transitionMs = 360;

  // Clone before and after for infinite loop
  const clonesBefore = tiles.map(t => { const c = t.cloneNode(true); c.classList.add('clone'); return c; }).reverse();
  const clonesAfter = tiles.map(t => { const c = t.cloneNode(true); c.classList.add('clone'); return c; });

  clonesBefore.forEach(c => track.prepend(c));
  clonesAfter.forEach(c => track.appendChild(c));

  // refresh tiles list
  tiles = Array.from(track.querySelectorAll('.pv-tile'));
  const startIndex = clonesBefore.length; // index of first real tile
  let index = startIndex;

  // remove transition and set transform instantly
  function setTransformNoAnim(idx) {
    const x = -idx * (tiles[0].offsetWidth + gap);
    track.style.transition = 'none';
    track.style.transform = `translateX(${x}px)`;
    track.offsetHeight; // force reflow
    track.style.transition = `transform ${transitionMs}ms ease`;
  }

  function updateActive() {
    tiles.forEach((t, i) => t.classList.toggle('active', i === index));
  }

  // play only nearby videos
  function updatePlayback() {
    const visible = 2; // play tiles within +/- visible
    tiles.forEach((t, i) => {
      const v = t.querySelector('video');
      const dist = Math.abs(i - index);
      if (v) {
        if (dist <= visible) {
          // don't force playing sound; keep muted default
          v.play().catch(()=>{});
        } else {
          v.pause();
        }
      }
    });
  }

  function goTo(i) {
    index = i;
    const x = -index * (tiles[0].offsetWidth + gap);
    track.style.transform = `translateX(${x}px)`;
    updateActive();
    updatePlayback();
  }

  track.addEventListener('transitionend', () => {
    const realStart = startIndex;
    const realEnd = startIndex + originalCount - 1;
    if (index > realEnd) {
      index = index - originalCount;
      setTransformNoAnim(index);
      updateActive();
      updatePlayback();
    }
    if (index < realStart) {
      index = index + originalCount;
      setTransformNoAnim(index);
      updateActive();
      updatePlayback();
    }
  });

  // Prev / Next
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }
  nextBtn && nextBtn.addEventListener('click', next);
  prevBtn && prevBtn.addEventListener('click', prev);
  
function pauseAllExcept(exceptVid) {
  document.querySelectorAll('.pv-tile').forEach(tile => {
    const v = tile.querySelector('video');
    if (v !== exceptVid && !v.paused) {
      v.pause();
      tile.classList.remove('playing'); // Remove playing class from all others
    }
  });
}
  // add handlers for each tile (delegated-like)
  function setupTileHandlers() {
    tiles.forEach((tile, i) => {
      const vid = tile.querySelector('video');
      const btn = tile.querySelector('.pv-play');

      // UI update helper
      function updateBtn() {
        if (vid && !vid.paused) btn.textContent = '▌▌';
        else btn.textContent = '►';
      }
      if (vid) {
        vid.muted = true;
        vid.loop = true;
        vid.playsInline = true;
        // keep button state updated
        vid.addEventListener('play', updateBtn);
        vid.addEventListener('pause', updateBtn);
      }

      // main toggle function
      function togglePlayForTile() {
        if (!vid) return;
        pauseAllExcept(vid);
        if (vid.paused) {
          // explicit user action -> try unmute (so user can hear). If you prefer keep muted remove next line.
          vid.muted = false;
          vid.play().catch(err => {
            // some browsers still block; fallback to muted autoplay attempt
            vid.muted = true;
            vid.play().catch(()=>{});
          });
          tile.classList.add('playing');
        } else {
          vid.pause();
          tile.classList.remove('playing');
        }
      }

      // click on tile toggles (but we only want to treat clicks that are taps, not swipes)
      tile.addEventListener('click', (e) => {
        // If user clicked the arrow or any other control, ignore
        if (e.target.closest('.pv-arrow')) return;
        // If the click is on the tile and it's not a swipe, toggle play
        togglePlayForTile();
      });

      // play button inside tile
      if (btn) {
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          togglePlayForTile();
        });
      }

      // small keyboard accessibility (Enter toggles)
      tile.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          togglePlayForTile();
        }
      });
    });
  }

  // TAP vs SWIPE: handle on wrapper to decide
  (function addTouchTapSwipe() {
    let startX = 0, startY = 0, startT = 0, moved = false;
    const SWIPE_MIN = 30;
    const TAP_MAX_MOVE = 12;
    const TAP_MAX_TIME = 350;

    wrap.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length > 1) return;
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; startT = Date.now();
      moved = false;
    }, {passive: true});

    wrap.addEventListener('touchmove', (e) => {
      if (!e.touches || e.touches.length > 1) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) > TAP_MAX_MOVE || Math.abs(dy) > TAP_MAX_MOVE) moved = true;
    }, {passive: true});

    wrap.addEventListener('touchend', (e) => {
      const dt = Date.now() - startT;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      // TAP detection
      if (!moved && Math.abs(dx) <= TAP_MAX_MOVE && Math.abs(dy) <= TAP_MAX_MOVE && dt <= TAP_MAX_TIME) {
        // figure out which tile was tapped
        let el = document.elementFromPoint(touch.clientX, touch.clientY);
        while (el && !el.classList.contains('pv-tile')) el = el.parentElement;
        if (el) {
          // emulate click on tile (this triggers tile click handler)
          el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return;
        }
      }

      // SWIPE detection
      if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next(); else prev();
      }
    }, {passive: true});
  })();

  // keyboard arrows for accessibility
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // initialize on load
  window.addEventListener('load', () => {
    // recompute tiles & sizes in case of responsive
    const tileWidth = tiles[0].offsetWidth + gap;
    setTransformNoAnim(startIndex);
    updateActive();
    setupTileHandlers();
    updatePlayback();
  });

  // adjust on resize
  window.addEventListener('resize', () => {
    setTransformNoAnim(index);
  });

})();

// Education reveal animations (IntersectionObserver)
(function() {
  const reveals = document.querySelectorAll('.education .reveal');
  if (!('IntersectionObserver' in window) || reveals.length === 0) {
    reveals.forEach(r => r.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // if you want one-time reveal, unobserve:
        io.unobserve(e.target);
      }
    });
  }, { root: null, threshold: 0.18 });
  reveals.forEach(r => io.observe(r));
})();
