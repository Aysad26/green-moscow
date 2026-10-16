'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
const within = (promise, ms) => Promise.race([promise, new Promise(resolve => setTimeout(resolve, ms))]);
const assetLoads = new Map();
const imagesReady = root => Promise.allSettled([
  ...$$('img', root).map(img => img.decode ? img.decode() : Promise.resolve()),
  ...$$('svg[data-asset]', root).map(svg => {
    const url = svg.dataset.asset;
    if (!assetLoads.has(url)) {
      const image = new Image(); image.src = url;
      assetLoads.set(url, image.decode ? image.decode() : new Promise(resolve => { image.onload = image.onerror = resolve; }));
    }
    return assetLoads.get(url);
  })
]);
const showEverything = () => $$('.is-waiting').forEach(node => node.classList.remove('is-waiting'));

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function restorePage() {
  document.documentElement.classList.remove('hero-pending', 'is-preloading');
  const loader = $('#page-loader');
  if (loader) { loader.hidden = true; loader.setAttribute('aria-hidden', 'true'); }
  $$('.header, main, .footer').forEach(node => { node.inert = false; });
}
async function dismissLoader() {
  const loader = $('#page-loader');
  if (loader && !loader.hidden) {
    loader.classList.add('is-leaving');
    if (!motionPreference.matches) await wait(360);
  }
  restorePage();
}

// The short loader resolves before the city grows. Scrolling stays native.
async function initializeMotion() {
  const started = Date.now();
  const city = $('.city');
  const heroParts = $$('.hero-part');
  const animate = !motionPreference.matches;
  $$('.header, main, .footer').forEach(node => { node.inert = true; });
  if (animate) {
    city.classList.add('is-waiting');
    heroParts.forEach(node => node.classList.add('is-waiting'));
  }
  document.documentElement.classList.remove('hero-pending');
  if (animate) {
    $$('.section-copy, .rules, .atlas-heading, .age-title').forEach(group => {
      $$('.reveal', group).forEach((node, index) => node.style.setProperty('--delay', `${Math.min(index * 65, 240)}ms`));
    });
  }
  if (animate && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (entry.target.matches('[data-scene]')) {
          within(imagesReady(entry.target), 1800).then(nextFrame).then(() => entry.target.classList.remove('is-waiting'));
        } else {
          entry.target.classList.remove('is-waiting');
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    $$('.reveal, [data-scene]').forEach(node => {
      node.classList.add('is-waiting');
      observer.observe(node);
    });
    motionPreference.addEventListener('change', event => {
      if (event.matches) { observer.disconnect(); restorePage(); showEverything(); }
    });
  }
  const fallback = setTimeout(() => { restorePage(); showEverything(); }, 4500);
  await within(Promise.allSettled([imagesReady(city), document.fonts?.ready || Promise.resolve()]), 2600);
  if (animate) await wait(Math.max(0, 900 - (Date.now() - started)));
  await dismissLoader();
  clearTimeout(fallback);
  if (window.gmBootFallback) clearTimeout(window.gmBootFallback);
  if (animate && !motionPreference.matches) {
    await nextFrame();
    city.classList.add('animate');
  }
  city.classList.remove('is-waiting');
  heroParts.forEach(node => node.classList.remove('is-waiting'));
}

const menuToggle = $('.menu-toggle');
const mobileNav = $('#mobile-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  mobileNav.hidden = true;
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  mobileNav.hidden = !open;
});
$$('a', mobileNav).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuToggle.focus(); }
});
window.matchMedia('(min-width: 681px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Illustrative points inside the supplied Sokolniki map; no live participant data.
const places = [
  { id: 'sokolniki', name: 'Сокольники', type: 'park', season: ['spring', 'summer', 'autumn', 'winter'], age: ['7-13', '14-25'], left: 49, top: 37, count: 12, photos: 8,
    stories: [
      { title: '«Здесь я впервые заметила дятла»', author: 'Маша, 12 лет • пример рассказа', text: 'В парке можно каждый раз замечать что-то новое. В этот раз я услышала стук, подняла голову и увидела дятла на дереве.' },
      { title: '«Наш маршрут после школы»', author: 'Артём, 16 лет • пример рассказа', text: 'Мы любим идти домой через парк. Здесь можно замедлиться, поговорить и немного отдохнуть от городского шума.' }
    ] },
  { id: 'prospek', name: 'Майский просек', type: 'park', season: ['spring', 'summer'], age: ['7-13'], left: 63, top: 59, count: 8, photos: 5,
    stories: [
      { title: '«Место для маленьких открытий»', author: 'Пример рассказа • 11 лет', text: 'Мы приходим сюда гулять и наблюдать, как меняется парк. Весной и осенью это словно два разных места.' },
      { title: '«Прогулка без спешки»', author: 'Пример рассказа • 13 лет', text: 'Самое интересное на прогулке — замечать небольшие детали: листья, следы на тропинке и голоса птиц.' }
    ] },
  { id: 'garden', name: 'Сад пионов', type: 'park', season: ['spring', 'summer'], age: ['14-25'], left: 43, top: 72, count: 4, photos: 6,
    stories: [
      { title: '«Цветы в середине большого города»', author: 'Пример рассказа • 18 лет', text: 'Мне нравится, что в городе есть такие спокойные места. Здесь хочется остановиться и просто посмотреть вокруг.' },
      { title: '«Увидеть знакомое заново»', author: 'Пример рассказа • 21 год', text: 'Кажется, что уже знаешь свой любимый парк. Но стоит выбрать другую тропинку — и появляется новый маршрут.' }
    ] },
  { id: 'pond', name: 'Пруд в Сокольниках', type: 'water', season: ['summer', 'autumn'], age: ['7-13', '14-25'], left: 70, top: 32, count: 9, photos: 7,
    stories: [
      { title: '«Наблюдать за водой»', author: 'Пример рассказа • 14 лет', text: 'Здесь хорошо смотреть на воду и отражения деревьев. Это моё любимое место для тихой прогулки.' },
      { title: '«Место, куда хочется вернуться»', author: 'Пример рассказа • 12 лет', text: 'Мы гуляем здесь с семьёй. Мне нравится замечать, как меняются деревья и небо в отражении.' }
    ] }
];
let selectedPlace = places[0];
let selectedTab = 'stories';
let expandedStories = false;
let filteredPlaces = places;
const mobilePlaceView = window.matchMedia('(max-width: 680px)');
const placeCard = $('#place-card');
const placeTabs = $('.tabs');
function syncPlaceCardMode() {
  const dialog = $('#place-dialog');
  if (mobilePlaceView.matches) {
    $('#mobile-place-slot').append(placeCard);
    $('#mobile-place-tabs').append(placeTabs);
    document.documentElement.classList.add('mobile-place-dialog');
  } else {
    if (dialog.open) dialog.close();
    $('#place-card-slot').append(placeCard);
    $('#map-tabs-slot').append(placeTabs);
    document.documentElement.classList.remove('mobile-place-dialog');
  }
}
mobilePlaceView.addEventListener('change', syncPlaceCardMode);

function paragraph(text, className) {
  const node = document.createElement('p');
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function renderPlace() {
  const place = selectedPlace;
  $('#place-name').textContent = place.name;
  $('#place-type').textContent = place.type === 'water' ? 'ВОДОЁМ' : 'ПАРК';
  $('#place-count').textContent = `${place.count} историй / ${place.photos} фотографий`;
  const content = $('#place-content');
  content.replaceChildren();
  content.setAttribute('aria-labelledby', `tab-${selectedTab}`);
  const more = $('#place-more');
  more.hidden = selectedTab !== 'stories';
  more.setAttribute('aria-expanded', String(expandedStories));
  more.textContent = expandedStories ? 'Свернуть истории' : 'Читать истории';
  if (selectedTab === 'stories') {
    place.stories.forEach(story => {
      const article = document.createElement('article');
      article.className = 'story';
      const heading = document.createElement('h4');
      heading.textContent = story.title;
      article.append(heading, paragraph(story.author));
      if (expandedStories) article.append(paragraph(story.text, 'story-expanded'));
      content.append(article);
    });
  } else if (selectedTab === 'gallery') {
    const gallery = document.createElement('div');
    gallery.className = 'gallery-preview';
    const image = document.createElement('img');
    image.src = 'assets/watercolor/wc_left_trees.webp';
    image.alt = 'Иллюстрация природы для примера';
    image.width = 578; image.height = 600;
    gallery.append(image, paragraph('Иллюстрация для примера. Здесь появятся фотографии и рисунки участников.'));
    content.append(gallery);
  } else {
    ['Бережно относиться к деревьям и растениям', 'Сохранять чистоту после прогулки'].forEach(title => {
      const article = document.createElement('article');
      article.className = 'story';
      const heading = document.createElement('h4');
      heading.textContent = title;
      article.append(heading, paragraph('Пример идеи заботы о любимом месте'));
      content.append(article);
    });
  }
  $$('.map-pin').forEach(pin => pin.setAttribute('aria-pressed', String(pin.dataset.place === place.id)));
}

function renderMarkers() {
  const fragment = document.createDocumentFragment();
  filteredPlaces.forEach(place => {
    const pin = document.createElement('button');
    pin.type = 'button'; pin.className = 'map-pin'; pin.dataset.place = place.id;
    pin.style.setProperty('--left', `${place.left}%`);
    pin.style.setProperty('--top', `${place.top}%`);
    pin.setAttribute('aria-label', `${place.name}, ${place.count} историй. Пример данных`);
    pin.setAttribute('aria-pressed', String(place.id === selectedPlace.id));
    const image = document.createElement('img');
    image.src = 'assets/pin-engraving.svg'; image.alt = ''; image.width = 42; image.height = 51;
    const count = document.createElement('span'); count.textContent = place.count;
    pin.append(image, count);
    pin.addEventListener('click', () => {
      selectedPlace = place; expandedStories = false; renderPlace();
      if (mobilePlaceView.matches) openDialog($('#place-dialog'), pin);
      $('#map-status').textContent = `Выбрано место: ${place.name}.`;
    });
    fragment.append(pin);
  });
  $('#map-markers').replaceChildren(fragment);
}

const filterControls = [$('#territory-filter'), $('#age-filter'), $('#period-filter')];
const filterFields = $('#filter-fields');
const filtersDialog = $('#filters-dialog');
let filterSnapshot = null;
let filtersApplied = false;

function updateActiveFilters() {
  const active = filterControls.filter(control => control.value !== 'all');
  const region = $('#active-filters');
  region.replaceChildren();
  active.forEach((control, index) => {
    const label = $$('option', control).find(option => option.value === control.value)?.textContent || control.value;
    const chip = document.createElement('button');
    chip.type = 'button'; chip.className = 'filter-chip';
    chip.setAttribute('aria-label', `Убрать фильтр: ${label}`);
    chip.append(document.createTextNode(label));
    const close = document.createElement('span');
    close.textContent = '×'; close.setAttribute('aria-hidden', 'true'); chip.append(close);
    chip.addEventListener('click', () => {
      control.value = 'all'; filterMap();
      const remaining = $$('.filter-chip', region);
      (remaining[index] || remaining.at(-1) || (mobilePlaceView.matches ? $('#filter-trigger') : control)).focus();
    });
    region.append(chip);
  });
  if (active.length) {
    const reset = document.createElement('button');
    reset.type = 'button'; reset.className = 'filter-reset'; reset.textContent = 'Сбросить';
    reset.addEventListener('click', () => {
      resetFilterValues(); filterMap();
      (mobilePlaceView.matches ? $('#filter-trigger') : filterControls[0]).focus();
    });
    region.append(reset);
  }
  region.hidden = active.length === 0;
  $('#filter-count').textContent = String(active.length);
  $('#filter-count').hidden = active.length === 0;
  $('#filter-trigger').setAttribute('aria-label', active.length ? `Фильтры, выбрано: ${active.length}` : 'Фильтры');
}

function resetFilterValues() {
  filterControls.forEach(control => { control.value = 'all'; });
}

function syncCompactTools() {
  if (mobilePlaceView.matches) {
    $('#mobile-filter-slot').append(filterFields);
    $('#place-search').setAttribute('placeholder', 'Найти место');
  } else {
    if (filtersDialog.open) { dialogTrigger = $('#place-search'); filtersDialog.close(); }
    $('#filter-fields-slot').append(filterFields);
    $('#place-search').setAttribute('placeholder', 'Найти место на карте');
  }
  $$('.contact-role').forEach(details => { details.open = !mobilePlaceView.matches; });
}
mobilePlaceView.addEventListener('change', syncCompactTools);

$('#filter-trigger').addEventListener('click', () => {
  filterSnapshot = filterControls.map(control => control.value);
  filtersApplied = false;
  $('#filter-trigger').setAttribute('aria-expanded', 'true');
  openDialog(filtersDialog, $('#filter-trigger'));
});
$('#filter-apply').addEventListener('click', () => {
  filtersApplied = true; filterMap(); filtersDialog.close();
});
$('#filter-dialog-reset').addEventListener('click', resetFilterValues);
filtersDialog.addEventListener('close', () => {
  if (!filtersApplied && filterSnapshot) filterControls.forEach((control, index) => { control.value = filterSnapshot[index]; });
  filterSnapshot = null;
  $('#filter-trigger').setAttribute('aria-expanded', 'false');
});

function filterMap() {
  const query = $('#place-search').value.trim().toLocaleLowerCase('ru').replaceAll('ё', 'е');
  const type = $('#territory-filter').value;
  const age = $('#age-filter').value;
  const season = $('#period-filter').value;
  filteredPlaces = places.filter(place =>
    (`${place.name} сокольники`.toLocaleLowerCase('ru').replaceAll('ё', 'е').includes(query)) &&
    (type === 'all' || type === place.type) && (age === 'all' || place.age.includes(age)) && (season === 'all' || place.season.includes(season))
  );
  $('#map-empty').hidden = filteredPlaces.length !== 0;
  $('#map-status').textContent = `Найдено мест: ${filteredPlaces.length}. Все данные демонстрационные.`;
  if (filteredPlaces.length && !filteredPlaces.some(place => place.id === selectedPlace.id)) selectedPlace = filteredPlaces[0];
  expandedStories = false;
  renderMarkers();
  if (filteredPlaces.length) renderPlace();
  updateActiveFilters();
}
$('#place-search').addEventListener('input', filterMap);
filterControls.forEach(control => control.addEventListener('change', () => {
  if (!(mobilePlaceView.matches && filtersDialog.open)) filterMap();
}));
$('#reset-filters').addEventListener('click', () => {
  $('#place-search').value = '';
  resetFilterValues();
  filterMap();
  $('#place-search').focus();
});

const tabButtons = $$('[data-tab]');
function selectTab(button) {
  selectedTab = button.dataset.tab;
  tabButtons.forEach(tab => {
    const selected = tab === button;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  renderPlace();
}
tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectTab(button));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabButtons.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabButtons.length) % tabButtons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabButtons.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(tabButtons[next]); tabButtons[next].focus(); }
  });
});
$('#place-more').addEventListener('click', () => { expandedStories = !expandedStories; renderPlace(); });

let zoom = 1;
function updateZoom() {
  $('#map-surface').style.transform = `scale(${zoom})`;
  $('#zoom-in').disabled = zoom >= 1.75;
  $('#zoom-out').disabled = zoom <= 1;
}
$('#zoom-in').addEventListener('click', () => { zoom = Math.min(1.75, zoom + 0.25); updateZoom(); });
$('#zoom-out').addEventListener('click', () => { zoom = Math.max(1, zoom - 0.25); updateZoom(); });

const questionnaire = $('#questionnaire');
const documentDialog = $('#document-dialog');
let dialogTrigger;
function openDialog(dialog, trigger) {
  closeMenu(); dialogTrigger = trigger; dialog.showModal(); document.body.classList.add('modal-open');
}
$$('[data-questionnaire]').forEach(button => button.addEventListener('click', () => {
  $('#form-body').hidden = false; $('#form-success').hidden = true;
  questionnaire.setAttribute('aria-labelledby', 'form-title');
  openDialog(questionnaire, button);
}));
$$('[data-document]').forEach(button => button.addEventListener('click', () => {
  $('#document-title').textContent = button.dataset.document;
  const conditions = button.dataset.document === 'Условия участия';
  $('#participation-terms').hidden = !conditions;
  $('#document-unavailable').hidden = conditions;
  openDialog(documentDialog, button);
}));
$$('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$$('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); dialogTrigger?.focus(); });
});
$('#island-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  $('#draft-place').textContent = String(data.get('place')).trim();
  $('#draft-author').textContent = `${String(data.get('name')).trim()}, ${data.get('age')} лет • твой черновик`;
  $('#draft-story').textContent = String(data.get('story')).trim();
  $('#form-body').hidden = true; $('#form-success').hidden = false;
  questionnaire.setAttribute('aria-labelledby', 'draft-place');
  questionnaire.scrollTop = 0;
  const title = $('#draft-place'); title.tabIndex = -1; title.focus();
});

// SVG filter timelines follow visibility, the common pause control and OS settings.
function syncAmbientMotion() {
  const effects = $('#ambient-filters');
  const paused = motionPreference.matches || document.hidden || document.documentElement.classList.contains('motion-paused') || !$$('[data-ripple]').some(node => node.classList.contains('loop-visible'));
  if (effects) {
    if (paused) effects.pauseAnimations?.(); else effects.unpauseAnimations?.();
  }
  document.documentElement.classList[document.hidden ? 'add' : 'remove']('motion-hidden');
}
document.addEventListener('visibilitychange', syncAmbientMotion);
motionPreference.addEventListener('change', syncAmbientMotion);
const motionToggle = $('#motion-toggle');
motionToggle.addEventListener('click', () => {
  const paused = motionToggle.getAttribute('aria-pressed') !== 'true';
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.setAttribute('aria-label', paused ? 'Возобновить фоновые анимации' : 'Остановить фоновые анимации');
  $('#motion-label').textContent = paused ? 'Продолжить' : 'Пауза';
  document.documentElement.classList[paused ? 'add' : 'remove']('motion-paused');
  syncAmbientMotion();
});
if ('IntersectionObserver' in window) {
  const loopObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList[entry.isIntersecting ? 'add' : 'remove']('loop-visible'));
    syncAmbientMotion();
  }, { threshold: 0 });
  $$('[data-loop]').forEach(node => loopObserver.observe(node));
} else {
  $$('[data-loop]').forEach(node => node.classList.add('loop-visible'));
}

syncAmbientMotion();
syncPlaceCardMode();
syncCompactTools();
renderMarkers(); renderPlace(); updateZoom(); updateActiveFilters();
initializeMotion().catch(() => { restorePage(); showEverything(); });

if (new URLSearchParams(location.search).has('design-export')) { document.documentElement.classList.add('design-export'); restorePage(); showEverything(); }
