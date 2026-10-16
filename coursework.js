(() => {
  const filters = document.querySelector('.course-filters');
  const terms = Array.from(document.querySelectorAll('[data-course-status]'));
  const count = document.querySelector('#course-count');
  if (!filters || !count) return;

  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-course-filter]');
    if (!button) return;
    const selected = button.dataset.courseFilter;
    let courseCount = 0;
    let termCount = 0;
    terms.forEach(term => {
      term.hidden = selected !== 'all' && term.dataset.courseStatus !== selected;
      if (!term.hidden) {
        termCount += 1;
        courseCount += term.querySelectorAll('.course-list > li').length;
      }
    });
    filters.querySelectorAll('button').forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    count.textContent = `${courseCount} courses · ${termCount} ${termCount === 1 ? 'term' : 'terms'}`;
  });
})();
