// 原生 JavaScript：搜索 API → 渲染卡片 → 获取并展示详情。
const API = 'https://www.themealdb.com/api/json/v1/1/';
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const results = document.getElementById('results');
const message = document.getElementById('message');
const detail = document.getElementById('detail');
const detailContent = document.getElementById('detail-content');
const backButton = document.getElementById('back-button');
let controller;
let lastMessage = '';
let selectedCard;

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
}

// 新请求开始时取消旧请求，避免较慢的旧结果覆盖新搜索。
function beginRequest() {
  if (controller) controller.abort();
  controller = new AbortController();
  return controller;
}

async function request(path, task) {
  const timer = setTimeout(() => task.abort(), 15000);
  try {
    const response = await fetch(API + path, { signal: task.signal });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    return Array.isArray(data.meals) ? data.meals : [];
  } finally {
    clearTimeout(timer);
  }
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = text;
  return element;
}

function mealImage(meal, className) {
  const img = makeElement('img', className);
  img.alt = meal.strMeal;
  // 图片失败时保留菜名和布局，避免详情入口不可用。
  img.addEventListener('error', () => { img.removeAttribute('src'); }, { once: true });
  if (typeof meal.strMealThumb === 'string' && meal.strMealThumb.startsWith('https://')) {
    img.src = meal.strMealThumb;
  }
  return img;
}

function renderCards(meals) {
  results.replaceChildren();
  const fragment = document.createDocumentFragment();
  meals.forEach(meal => {
    const card = makeElement('article', 'recipe-card');
    const button = makeElement('button', 'card-button');
    button.type = 'button';
    button.setAttribute('aria-label', '查看 ' + meal.strMeal + ' 的做法');
    const image = mealImage(meal);
    image.loading = 'lazy';
    const info = makeElement('span', 'card-info');
    info.append(makeElement('span', 'card-title', meal.strMeal));
    info.append(makeElement('span', 'card-category', meal.strCategory || '其他'));
    button.append(image, info);
    button.addEventListener('click', () => openDetail(meal.idMeal, button));
    card.append(button);
    fragment.append(card);
  });
  results.append(fragment);
}

async function searchMeals(keyword) {
  const task = beginRequest();
  detail.hidden = true;
  results.hidden = false;
  results.replaceChildren();
  results.setAttribute('aria-busy', 'true');
  showMessage('正在搜索菜谱，请稍候…');
  try {
    const meals = await request('search.php?s=' + encodeURIComponent(keyword), task);
    if (task !== controller) return;
    renderCards(meals);
    lastMessage = meals.length ? `“${keyword}” 的搜索结果 · 共 ${meals.length} 道菜谱` : `没有找到“${keyword}”相关的菜谱，请换一个英文菜名试试。`;
    showMessage(lastMessage);
  } catch (error) {
    if (task !== controller) return;
    showMessage('菜谱加载失败，请检查网络连接后重新搜索。', true);
  } finally {
    if (task === controller) results.setAttribute('aria-busy', 'false');
  }
}

async function openDetail(id, cardButton) {
  const task = beginRequest();
  selectedCard = cardButton;
  showMessage('正在加载菜谱详情…');
  try {
    const meals = await request('lookup.php?i=' + encodeURIComponent(id), task);
    if (task !== controller) return;
    if (!meals.length) throw new Error('Missing recipe');
    renderDetail(meals[0]);
    results.hidden = true;
    detail.hidden = false;
    showMessage('菜谱详情');
    backButton.focus();
  } catch (error) {
    if (task !== controller) return;
    showMessage('详情加载失败，请稍后再次点击菜谱重试。', true);
  }
}

// 接口内容通过 textContent 写入，避免将菜谱文本当成 HTML 执行。
function renderDetail(meal) {
  detailContent.replaceChildren();
  const top = makeElement('div', 'detail-top');
  const summary = makeElement('div');
  const title = makeElement('h2', '', meal.strMeal);
  title.id = 'detail-title';
  summary.append(title, makeElement('p', 'detail-meta', '分类：' + (meal.strCategory || '未知')),
    makeElement('p', 'detail-meta', '地区：' + (meal.strArea || '未知')));
  top.append(mealImage(meal, 'detail-image'), summary);
  const sections = makeElement('div', 'detail-sections');
  const ingredientSection = makeElement('section');
  ingredientSection.append(makeElement('h3', '', '食材 Ingredients'));
  const list = makeElement('ul', 'ingredients');
  for (let i = 1; i <= 20; i++) {
    const ingredient = (meal['strIngredient' + i] || '').trim();
    const measure = (meal['strMeasure' + i] || '').trim();
    if (ingredient) list.append(makeElement('li', '', `${ingredient} — ${measure || '适量'}`));
  }
  if (!list.children.length) list.append(makeElement('li', '', '暂无食材信息'));
  ingredientSection.append(list);
  const instructionSection = makeElement('section');
  instructionSection.append(makeElement('h3', '', '做法 Instructions'),
    makeElement('p', 'instructions', meal.strInstructions || '暂无做法信息'));
  sections.append(ingredientSection, instructionSection);
  detailContent.append(top, sections);
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const keyword = input.value.trim();
  if (!keyword) {
    beginRequest();
    results.setAttribute('aria-busy', 'false');
    showMessage('请先输入英文菜谱名称，例如 chicken 或 pasta。', true);
    input.focus();
    return;
  }
  searchMeals(keyword);
});

backButton.addEventListener('click', () => {
  detail.hidden = true;
  results.hidden = false;
  showMessage(lastMessage);
  if (selectedCard && selectedCard.isConnected) selectedCard.focus();
});

// 打开页面后默认展示沙拉类菜谱。
searchMeals('salad');
