
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
      const resp = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
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
