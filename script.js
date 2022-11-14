'use strict';
///////////////////////////////////////
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const navLinks = document.querySelector('.nav__links');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContent = document.querySelectorAll('.operations__content');
const nav = document.querySelector('.nav');
const header = document.querySelector('.header');
const allSection = document.querySelectorAll('.section');
const dotsContainer = document.querySelector('.dots');
const slides = document.querySelectorAll('.slide');
const btnRight = document.querySelector('.slider__btn--right');
const btnLeft = document.querySelector('.slider__btn--left');
///////////////////////////////////////
// Modal window

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});
///////////////////////////////////////
//Button Scroll(按下scroll後可滑到section1)
btnScrollTo.addEventListener('click', function (e) {
  e.preventDefault();
  section1.scrollIntoView({ behavior: 'smooth' });
});
///////////////////////////////////////
//Page navigation
//不錯，但不夠好的方法（要是nav__link裡東西超多，會導致執行得較慢）
// document.querySelectorAll('.nav__link').forEach(function (el) {
//   el.addEventListener('click', function (e) {
//     e.preventDefault();
//     const id = this.getAttribute('href');
//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   });
// });
//利用event degrading（1. 添加eventListener至parent element 2. 搞懂要觸發event的target是啥）
navLinks.addEventListener('click', function (e) {
  e.preventDefault(); //防止網頁利用id直接跳轉的動作
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    if (id !== '#') {
      document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
    }
  }
});
///////////////////////////////////////
//Tab component(三個按鈕，按下去後按鈕active，顯示內容)
tabsContainer.addEventListener('click', function (e) {
  //使點擊皆會選取到btn(closest)
  const clicked = e.target.closest('.operations__tab');
  if (!clicked) return;
  //先使active皆消失
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(c => c.classList.remove('operations__content--active'));
  //再加active
  clicked.classList.add('operations__tab--active');
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});
///////////////////////////////////////
//header fade 效果（事件擴散應用）
const headerHover = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link'); //除了被hover目標外的其他
    const logo = link.closest('.nav').querySelector('img');
    siblings.forEach(s => {
      if (s !== link) s.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};
nav.addEventListener('mouseover', headerHover.bind(0.5));
nav.addEventListener('mouseout', headerHover.bind(1));
///////////////////////////////////////
//當下滑至section1時(畫面離開header時)，使導覽列固定於頁面最上方
//舊法，會吃較多效能(getBoundingClientRect)
// const distance = section1.getBoundingClientRect();
// window.addEventListener('scroll', function () {
//   if (this.scrollY > distance.top) nav.classList.add('sticky');
//   else nav.classList.remove('sticky');
// });
//新法，效能節省不少(IntersectionObserver)
const stickyHead = function (e) {
  const [entry] = e;
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};
const headObserver = new IntersectionObserver(stickyHead, {
  root: null,
  threshold: 0,
  rootMargin: '-90px',
});
headObserver.observe(header);
///////////////////////////////////////
//顯示section(滑到該處時才顯示，隨後就一直顯示)
const sectionReveal = function (e, o) {
  const [entry] = e;
  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  o.unobserve(entry.target);
};
const sectionObserver = new IntersectionObserver(sectionReveal, {
  root: null,
  threshold: 0.15,
});
allSection.forEach(s => {
  sectionObserver.observe(s);
  s.classList.add('section--hidden');
});
///////////////////////////////////////
//lazy-loaded pic
const lazyImg = document.querySelectorAll('.features__img');
const loadImg = function (e, o) {
  const [entry] = e;
  if (!entry.isIntersecting) return;
  entry.target.src = entry.target.dataset.src;
  entry.target.addEventListener('load', () =>
    entry.target.classList.remove('lazy-img')
  );
  o.unobserve(entry.target);
};
const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0.15,
  rootMargin: '-200px',
});
lazyImg.forEach(i => imgObserver.observe(i));
///////////////////////////////////////
//slides
let curSlide = 0;
const maxSlide = slides.length;
//functions
const slidesMove = function (curS) {
  slides.forEach(
    (s, i) => (s.style.transform = `translateX(${100 * (i - curS)}%)`)
  );
};
const creatDots = function () {
  slides.forEach((_, i) =>
    dotsContainer.insertAdjacentHTML(
      'beforeend',
      `<button class="dots__dot" data-slide="${i}"></button>`
    )
  );
};
const activeDot = function (curS) {
  document
    .querySelectorAll('.dots__dot')
    .forEach(d => d.classList.remove('dots__dot--active'));
  document
    .querySelector(`.dots__dot[data-slide="${curS}"]`)
    .classList.add('dots__dot--active');
};
const nextSlide = function () {
  if (curSlide >= maxSlide - 1) {
    curSlide = 0;
  } else {
    curSlide++;
  }
  slidesMove(curSlide);
  activeDot(curSlide);
};
const preSlide = function () {
  if (curSlide <= 0) {
    curSlide = maxSlide - 1;
  } else {
    curSlide--;
  }
  slidesMove(curSlide);
  activeDot(curSlide);
};
const init = function () {
  slidesMove(0);
  creatDots();
  activeDot(0);
};
init();
//events
btnRight.addEventListener('click', nextSlide);
btnLeft.addEventListener('click', preSlide);
dotsContainer.addEventListener('click', function (e) {
  if (e.target.classList.contains('dots__dot')) {
    const { slide } = e.target.dataset;
    slidesMove(slide);
    activeDot(slide);
    curSlide = slide;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') nextSlide();
  e.key === 'ArrowLeft' && preSlide();
});
///////////////////////////////////////
///////////////////////////////////////
