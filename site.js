(() => {
  document.querySelectorAll('.project-card').forEach(card => {
    const details = card.querySelector('.project-details');
    details?.addEventListener('toggle', () => card.classList.toggle('is-expanded', details.open));
  });

  const projectDialog = document.querySelector('.project-viewer');
  if (projectDialog && typeof projectDialog.showModal === 'function') {
    const projectTitle = projectDialog.querySelector('#project-viewer-title');
    const projectIntro = projectDialog.querySelector('#project-viewer-intro');
    const projectMeta = projectDialog.querySelector('.project-viewer-meta');
    const projectSections = projectDialog.querySelector('.project-viewer-sections');
    const projectTopics = projectDialog.querySelector('.project-viewer-topics');
    const projectSource = projectDialog.querySelector('.project-viewer-source');
    const projectClose = projectDialog.querySelector('.project-viewer-close');
    let projectOpener;
    let projectScroll = 0;
    let projectBackdropDown = false;

    function renderDemo(player, index = 0, play = false) {
      const links = Array.from(player.querySelectorAll('.demo-playlist [data-demo-index]'));
      const selected = links[index] || links[0] || player.querySelector('[data-demo-external]');
      const demoTitle = selected.dataset.demoName || selected.textContent;
      const stage = player.querySelector('.demo-stage');
      const url = new URL(selected.href);
      player.dataset.demoIndex = String(index);
      links.forEach(link => {
        if (link === selected) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      player.querySelector('[data-demo-title]').textContent = demoTitle;
      player.querySelector('[data-demo-external]').href = selected.href;
      stage.replaceChildren();
      if (play && url.hostname === 'www.youtube.com') {
        const frame = document.createElement('iframe');
        frame.title = `${demoTitle} video player`;
        frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(url.searchParams.get('v'))}?autoplay=1&rel=0`;
        stage.append(frame);
      } else {
        const poster = document.createElement('a');
        poster.className = 'demo-poster';
        poster.dataset.playDemo = '';
        poster.href = selected.href;
        const isDrive = url.hostname === 'drive.google.com';
        poster.setAttribute('aria-label', isDrive ? `Watch ${demoTitle} on Google Drive` : `Play ${demoTitle}`);
        if (isDrive) {
          poster.target = '_blank';
          poster.rel = 'noopener';
        }
        const img = document.createElement('img');
        img.src = selected.dataset.demoPoster || player.dataset.demoPoster;
        img.alt = demoTitle;
        const label = document.createElement('span');
        label.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z"/></svg>';
        label.append(document.createTextNode(isDrive ? 'Watch on Google Drive ↗' : `Play ${demoTitle}`));
        poster.append(img, label);
        stage.append(poster);
      }
    }

    function stopCaseMedia() {
      projectSections.querySelectorAll('.case-player').forEach(player => {
        if (player.querySelector('iframe')) renderDemo(player, Number(player.dataset.demoIndex || 0));
      });
    }

    function openProject(card, button) {
      projectOpener = button;
      const isCase = card.classList.contains('project-case');
      projectDialog.classList.toggle('is-case-study', isCase);
      projectIntro.hidden = false;
      projectMeta.hidden = false;
      projectTitle.textContent = card.dataset.projectTitle || card.querySelector('h2').textContent;
      projectIntro.textContent = card.querySelector('.project-description').textContent;
      projectMeta.textContent = card.querySelector('.project-byline > span:last-child').textContent;
      projectSections.replaceChildren(...Array.from(card.querySelectorAll('.details-body > div'), section => section.cloneNode(true)));
      projectSections.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      projectTopics.replaceChildren(card.querySelector('.project-topics').cloneNode(true));
      const cardSource = card.querySelector('.source-link');
      projectSource.href = cardSource.href;
      projectSource.replaceChildren(...Array.from(cardSource.childNodes, node => node.cloneNode(true)));
      if (isCase) {
        projectSections.querySelectorAll('.case-player').forEach(player => renderDemo(player));
      }
      projectScroll = window.scrollY;
      document.body.style.top = `-${projectScroll}px`;
      document.body.classList.add('viewer-open');
      projectDialog.showModal();
      projectDialog.scrollTop = 0;
      projectClose.focus({ preventScroll: true });
      if (isCase && button.dataset.projectDemoIndex !== undefined) {
        const player = projectSections.querySelector('.case-player');
        if (player) renderDemo(player, Number(button.dataset.projectDemoIndex), true);
      }
    }

    document.querySelectorAll('.project-card').forEach(card => {
      if (card.classList.contains('project-case')) {
        card.classList.add('has-project-viewer');
        const titleLink = card.querySelector('.project-title-link');
        card.querySelectorAll('[data-project-open]').forEach(link => {
          link.setAttribute('aria-haspopup', 'dialog');
          link.setAttribute('aria-controls', 'project-viewer');
          link.addEventListener('click', event => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            openProject(card, link);
          });
        });
        card.addEventListener('click', event => {
          if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.target.closest('a, button, summary, input, textarea, select, video') || window.getSelection()?.toString().trim()) return;
          openProject(card, titleLink);
        });
        return;
      }
      const actions = document.createElement('div');
      actions.className = 'project-actions';
      actions.append(card.querySelector('.project-topics').cloneNode(true));
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'project-read-more';
      button.textContent = 'Read more';
      button.setAttribute('aria-label', `Read more about ${card.querySelector('h2').textContent}`);
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', 'project-viewer');
      const arrow = document.createElement('span');
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden', 'true');
      button.append(arrow);
      button.addEventListener('click', () => openProject(card, button));
      actions.append(button);
      card.querySelector('.project-details').before(actions);
      card.classList.add('has-project-viewer');
      // Nested links retain their own action, and dragging to select text must
      // never open the project. The visible button is the keyboard equivalent.
      card.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.target.closest('a, button, summary, input, textarea, select, video') || window.getSelection()?.toString().trim()) return;
        openProject(card, button);
      });
    });

    projectDialog.addEventListener('click', event => {
      const demoLink = event.target.closest('[data-demo-index], [data-play-demo]');
      if (!demoLink || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (demoLink.hasAttribute('data-play-demo') && new URL(demoLink.href).hostname === 'drive.google.com') return;
      event.preventDefault();
      const player = demoLink.closest('.case-player');
      const index = Number(demoLink.dataset.demoIndex ?? player.dataset.demoIndex ?? 0);
      renderDemo(player, index, true);
      player.querySelector('iframe')?.focus({ preventScroll: true });
    });

    projectClose.addEventListener('click', () => projectDialog.close());
    projectDialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      if (event.shiftKey && event.target === projectClose) {
        event.preventDefault();
        projectSource.focus();
      } else if (!event.shiftKey && event.target === projectSource) {
        event.preventDefault();
        projectClose.focus();
      }
    });
    const isProjectBackdrop = event => {
      const bounds = projectDialog.getBoundingClientRect();
      return event.target === projectDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
    };
    projectDialog.addEventListener('pointerdown', event => { projectBackdropDown = isProjectBackdrop(event); });
    projectDialog.addEventListener('click', event => {
      if (projectBackdropDown && isProjectBackdrop(event)) projectDialog.close();
      projectBackdropDown = false;
    });
    projectDialog.addEventListener('close', () => {
      stopCaseMedia();
      document.body.classList.remove('viewer-open');
      document.body.style.top = '';
      window.scrollTo({ top: projectScroll, behavior: 'instant' });
      projectOpener?.focus({ preventScroll: true });
    });
  }

  const dialog = document.querySelector('.media-viewer');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const galleries = {
    hope: {
      title: 'Humanoid table tennis',
      items: [
        {
          type: 'image', src: '/assets/hope-cover-color.webp', landscape: true,
          caption: 'A3 concept illustration · AI-assisted color and lighting based on the HOPE model render; not an experimental frame.',
          alt: 'A3-inspired robot beside a blue table-tennis table on a warm ivory background',
        },
        {
          type: 'video',
          src: 'https://raw.githubusercontent.com/dongc1/HOPE/c2a627f26c957a079b5cc2586ab6cf49aae4a221/apps/a3_mujoco_serve/assets/validated/pr18_a3_serve_demo.mp4',
          original: 'https://github.com/dongc1/HOPE/blob/c2a627f26c957a079b5cc2586ab6cf49aae4a221/apps/a3_mujoco_serve/assets/validated/pr18_a3_serve_demo.mp4',
          poster: '/assets/hope-serve.jpg',
          caption: 'Model-based A3 serving · MuJoCo · Video from GitHub. This is the separate IK serving application.',
          alt: 'Agibot A3 performing a model-based serve in MuJoCo',
        },
      ],
    },

  };

  const stage = dialog.querySelector('.viewer-stage');
  const title = dialog.querySelector('#viewer-title');
  const caption = dialog.querySelector('#viewer-caption');
  const source = dialog.querySelector('.viewer-source');
  const count = dialog.querySelector('.viewer-count');
  const status = dialog.querySelector('.viewer-status');
  const closeButton = dialog.querySelector('.viewer-close');
  const previousButton = dialog.querySelector('.viewer-prev');
  const nextButton = dialog.querySelector('.viewer-next');
  const controls = dialog.querySelector('.viewer-controls');
  let activeGallery;
  let activeIndex = 0;
  let opener;
  let scrollPosition = 0;
  let pointerDownOnBackdrop = false;

  function clearMedia() {
    const video = stage.querySelector('video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    stage.replaceChildren();
  }

  function setStatus(message = '') {
    status.textContent = message;
    status.hidden = !message;
  }

  function renderMedia({ play = false } = {}) {
    clearMedia();
    const item = activeGallery.items[activeIndex];
    stage.classList.toggle('is-landscape', item.landscape === true);
    controls.hidden = activeGallery.items.length < 2;
    title.textContent = activeGallery.title;
    caption.textContent = item.caption;
    source.href = item.original || item.src;
    count.textContent = `${activeIndex + 1} / ${activeGallery.items.length}`;
    setStatus();

    const media = document.createElement(item.type === 'video' ? 'video' : 'img');
    const isCurrent = () => media.isConnected && dialog.open;
    if (item.type === 'video') {
      media.controls = true;
      media.playsInline = true;
      media.preload = 'none';
      media.poster = item.poster;
      media.setAttribute('aria-label', item.alt);
      media.addEventListener('waiting', () => {
        if (isCurrent()) setStatus('Loading video from GitHub…');
      });
      media.addEventListener('playing', () => {
        if (isCurrent()) setStatus();
      });
      media.addEventListener('canplay', () => {
        if (isCurrent()) setStatus();
      });
    } else {
      media.alt = item.alt;
      media.addEventListener('load', () => {
        if (isCurrent()) setStatus();
      });
    }
    media.addEventListener('error', () => {
      if (isCurrent()) setStatus('This media could not load. You can still view the original using the link above.');
    });
    media.src = item.src;
    stage.append(media);

    // Video requests begin only after a visitor deliberately opens the demo.
    if (item.type === 'video' && play) {
      setStatus('Loading video from GitHub…');
      media.play().catch(() => {
        if (isCurrent() && !media.error) setStatus('Press play to start the video.');
      });
    }
  }

  function changeMedia(step) {
    if (activeGallery.items.length < 2) return;
    activeIndex = (activeIndex + step + activeGallery.items.length) % activeGallery.items.length;
    renderMedia();
  }

  document.querySelectorAll('[data-gallery]').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      // Preserve native open-in-new-tab and no-JavaScript fallback behavior.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      activeGallery = galleries[link.dataset.gallery];
      activeIndex = Number(link.dataset.mediaIndex);
      scrollPosition = window.scrollY;
      document.body.style.top = `-${scrollPosition}px`;
      document.body.classList.add('viewer-open');
      dialog.showModal();
      renderMedia({ play: activeGallery.items[activeIndex].type === 'video' });
      closeButton.focus({ preventScroll: true });
    });
  });

  closeButton.addEventListener('click', () => dialog.close());
  previousButton.addEventListener('click', () => changeMedia(-1));
  nextButton.addEventListener('click', () => changeMedia(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const lastControl = controls.hidden ? source : nextButton;
      if (event.shiftKey && event.target === closeButton) {
        event.preventDefault();
        lastControl.focus();
      } else if (!event.shiftKey && event.target === lastControl) {
        event.preventDefault();
        closeButton.focus();
      }
    }
    // Leave video keyboard shortcuts to the native playback controls.
    if (event.target.closest('video')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      changeMedia(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  function isBackdrop(event) {
    const bounds = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
  }
  dialog.addEventListener('pointerdown', event => { pointerDownOnBackdrop = isBackdrop(event); });
  dialog.addEventListener('click', event => {
    if (pointerDownOnBackdrop && isBackdrop(event)) dialog.close();
    pointerDownOnBackdrop = false;
  });
  dialog.addEventListener('close', () => {
    clearMedia();
    setStatus();
    document.body.classList.remove('viewer-open');
    document.body.style.top = '';
    window.scrollTo({ top: scrollPosition, behavior: 'instant' });
    opener?.focus({ preventScroll: true });
  });
})();
