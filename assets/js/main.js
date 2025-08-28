(function () {
  console.log('[pira] boot');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /** State */
  let students = [];
  const usedIds = new Set();

  /** Elements */
  const startBtn = document.getElementById('start-btn');
  const resetBtn = document.getElementById('reset-btn');
  const statusEl = document.getElementById('status');

  const seqClass = document.getElementById('seq-class');
  const seqGrade = document.getElementById('seq-grade');
  const seqName = document.getElementById('seq-name');

  const card = document.getElementById('winner-card');
  const cardGrade = document.getElementById('card-grade');
  const cardClass = document.getElementById('card-class');
  const cardName = document.getElementById('card-name');

  /** Utils */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function randInt(max) {
    return Math.floor(Math.random() * max);
  }

  function persistUsed() {
    try {
      const arr = Array.from(usedIds);
      localStorage.setItem('pira:used', JSON.stringify(arr));
    } catch (e) {}
  }

  function loadUsed() {
    try {
      const raw = localStorage.getItem('pira:used');
      if (!raw) return;
      const arr = JSON.parse(raw);
      for (const id of arr) usedIds.add(id);
    } catch (e) {}
  }

  function computeId(s) {
    return `${s.grade}-${s.class}-${s.name}`;
  }

  async function fetchStudents() {
    try {
      const listUrl = new URL('./list.json', window.location.href).toString();
      const res = await fetch(listUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('list.json load failed');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid list.json');
      students = data.filter(Boolean);
      if (!students.length) throw new Error('Empty list.json');
    } catch (err) {
      console.error(err);
      statusEl && (statusEl.textContent = '데이터를 불러오지 못했습니다. list.json을 확인해주세요.');
      throw err;
    }
  }

  function pickRandomCandidate() {
    const available = students.filter(s => !usedIds.has(computeId(s)));
    if (available.length === 0) return null;
    const idx = randInt(available.length);
    return available[idx];
  }

  async function runSequence(student) {
    statusEl && (statusEl.textContent = '');

    // 순서: 학년 -> 반 -> 이름
    seqGrade.textContent = `${student.grade}학년`;
    seqClass.textContent = `${student.class}반`;
    seqName.textContent = `${student.name}`;

    seqClass.classList.remove('step-reveal', 'step-reveal-delay', 'step-reveal-delay-2', 'fade-pop');
    seqGrade.classList.remove('step-reveal', 'step-reveal-delay', 'step-reveal-delay-2', 'fade-pop');
    seqName.classList.remove('step-reveal', 'step-reveal-delay', 'step-reveal-delay-2', 'fade-pop');
    card.classList.remove('reveal-card');

    card.setAttribute('aria-hidden', 'true');
    seqClass.style.opacity = '0';
    seqGrade.style.opacity = '0';
    seqName.style.opacity = '0';

    await wait(180);
    flashStage();
    seqGrade.classList.add('step-reveal');
    await wait(800);
    flashStage();
    seqClass.classList.add('step-reveal');
    await wait(800);
    flashStage();
    seqName.classList.add('step-reveal');

    await wait(400);
    cardGrade.textContent = `${student.grade}`;
    cardClass.textContent = `${student.class}`;
    cardName.textContent = `${student.name}`;
    card.setAttribute('aria-hidden', 'false');
    card.classList.add('reveal-card', 'glow');
  }

  function flashStage() {
    const stage = document.querySelector('.pack .pulse');
    if (!stage) return;
    stage.style.boxShadow = '0 0 60px rgba(252,211,77,.45), inset 0 0 40px rgba(167,139,250,.35)';
    setTimeout(() => { stage.style.boxShadow = 'none'; }, 180);
  }

  async function onStart() {
    if (!startBtn) return;
    startBtn.disabled = true;
    try {
      if (!students.length) await fetchStudents();
      const candidate = pickRandomCandidate();
      if (!candidate) {
        statusEl && (statusEl.textContent = '모든 인원이 이미 추첨되었습니다. RESET으로 초기화하세요.');
        return;
      }
      await runSequence(candidate);
      usedIds.add(computeId(candidate));
      persistUsed();
    } catch (e) {
      statusEl && (statusEl.textContent = '오류가 발생했습니다. 콘솔을 확인해 주세요.');
    } finally {
      startBtn.disabled = false;
    }
  }

  function onReset() {
    usedIds.clear();
    persistUsed();
    statusEl && (statusEl.textContent = '초기화되었습니다.');
  }

  loadUsed();
  // 선로드 후 상태 표시
  fetchStudents().then(() => {
    console.log('[pira] list.json loaded', students.length);
    statusEl && (statusEl.textContent = '준비되었습니다. START를 눌러주세요.');
  }).catch((e) => {
    console.log('[pira] list.json load failed', e);
    // 메시지는 fetchStudents 내부에서 설정됨
  });

  if (startBtn) startBtn.addEventListener('click', onStart);
  if (resetBtn) resetBtn.addEventListener('click', onReset);
})();


