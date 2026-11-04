const chapters = [...document.querySelectorAll('.chapter')];
const railProgress = document.querySelector('#railProgress');
const railCount = document.querySelector('#railCount');
const revealButton = document.querySelector('#revealButton');
const musicStatus = document.querySelector('#musicStatus');
const musicStatusText = document.querySelector('#musicStatusText');
const audio = document.querySelector('#birthdaySong');
const wishButton = document.querySelector('#wishButton');
const wishHint = document.querySelector('#wishHint');
const wishProgressText = document.querySelector('#wishProgressText');
const wishComplete = document.querySelector('#wishComplete');

let currentChapter = 0;
let holdFrame = null;
let holdStartedAt = 0;
let isHolding = false;
let wishCompleteState = false;
const holdDuration = 2600;

function updateRail(index) {
  const visibleChapter = Math.min(index + 1, 4);
  const progress = `${(visibleChapter / 4) * 100}%`;
  railProgress.style.height = progress;
  railProgress.style.setProperty('--rail-progress-width', progress);
  railCount.textContent = `${String(visibleChapter).padStart(2, '0')} / 04`;
}

function showChapter(index) {
  const nextIndex = Math.max(0, Math.min(index, chapters.length - 1));
  if (nextIndex === currentChapter && chapters[nextIndex].classList.contains('is-active')) return;

  chapters[currentChapter].classList.remove('is-active');
  chapters[currentChapter].setAttribute('hidden', '');
  chapters[nextIndex].removeAttribute('hidden');
  requestAnimationFrame(() => chapters[nextIndex].classList.add('is-active'));
  currentChapter = nextIndex;
  updateRail(nextIndex);
}

function setMusicStatus(message, playing = false) {
  musicStatusText.textContent = message;
  musicStatus.classList.toggle('is-playing', playing);
}

async function startSong() {
  try {
    await audio.play();
    setMusicStatus('your song is playing', true);
  } catch {
    setMusicStatus('add your song at /song.mp3');
  }
}

audio.addEventListener('ended', () => setMusicStatus('a little birthday soundtrack', false));
audio.addEventListener('error', () => setMusicStatus('add your song at /song.mp3'));

revealButton.addEventListener('click', async () => {
  await startSong();
  showChapter(1);
});

document.querySelectorAll('[data-next]').forEach((button) => {
  button.addEventListener('click', () => showChapter(currentChapter + 1));
});

function resetWish() {
  isHolding = false;
  cancelAnimationFrame(holdFrame);
  wishButton.style.setProperty('--wish-progress', '0%');
  wishProgressText.textContent = '0%';
  wishHint.textContent = 'press and hold';
  wishButton.classList.remove('is-holding');
}

function finishWish() {
  wishCompleteState = true;
  isHolding = false;
  cancelAnimationFrame(holdFrame);
  wishButton.style.setProperty('--wish-progress', '100%');
  wishProgressText.textContent = '100%';
  wishHint.textContent = 'the wish is on its way';
  wishButton.classList.remove('is-holding');
  wishButton.classList.add('is-complete');
  wishComplete.classList.add('is-visible');
  document.body.classList.add('wish-made');
  launchCelebration();
}

function updateWish(now) {
  if (!isHolding || wishCompleteState) return;
  const progress = Math.min((now - holdStartedAt) / holdDuration, 1);
  const percentage = Math.round(progress * 100);
  wishButton.style.setProperty('--wish-progress', `${percentage}%`);
  wishProgressText.textContent = `${percentage}%`;
  wishHint.textContent = percentage > 60 ? 'almost there' : 'keep holding';

  if (progress >= 1) {
    finishWish();
    return;
  }
  holdFrame = requestAnimationFrame(updateWish);
}

function beginHold(event) {
  if (wishCompleteState || isHolding) return;
  if (event?.pointerType === 'mouse' && event.button !== 0) return;
  event?.preventDefault();
  isHolding = true;
  holdStartedAt = performance.now();
  wishButton.classList.add('is-holding');
  wishHint.textContent = 'keep holding';
  holdFrame = requestAnimationFrame(updateWish);
}

function endHold(event) {
  if (!isHolding || wishCompleteState) return;
  event?.preventDefault();
  const progress = Number.parseInt(wishProgressText.textContent, 10) || 0;
  if (progress < 100) resetWish();
}

wishButton.addEventListener('pointerdown', beginHold);
wishButton.addEventListener('pointerup', endHold);
wishButton.addEventListener('pointerleave', endHold);
wishButton.addEventListener('pointercancel', endHold);
wishButton.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    beginHold(event);
  }
});
wishButton.addEventListener('keyup', (event) => {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    endHold(event);
  }
});

function launchCelebration() {
  const colors = ['#b62d4d', '#e5a5aa', '#6a7d69', '#c79869', '#271b1b'];
  for (let index = 0; index < 18; index += 1) {
    const piece = document.createElement('span');
    piece.className = 'celebration-piece';
    piece.style.setProperty('--piece-color', colors[index % colors.length]);
    piece.style.setProperty('--piece-x', `${(Math.random() - 0.5) * 260}px`);
    piece.style.setProperty('--piece-y', `${-80 - Math.random() * 160}px`);
    piece.style.setProperty('--piece-delay', `${Math.random() * 220}ms`);
    piece.style.setProperty('--piece-rotate', `${Math.random() * 220 - 110}deg`);
    wishButton.append(piece);
    window.setTimeout(() => piece.remove(), 1900);
  }
}

updateRail(0);

import './styles.css';
