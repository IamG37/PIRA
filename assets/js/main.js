(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const cta = document.getElementById('cta-button');
  const result = document.getElementById('cta-result');
  if (cta && result) {
    cta.addEventListener('click', function () {
      result.textContent = '정상 작동 중입니다 ✅';
    });
  }
})();


