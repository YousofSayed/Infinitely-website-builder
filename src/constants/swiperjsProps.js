export const swiperJsProps = {
  // Core
  init: false,
  direction: ["horizontal", "vertical"],
  "initial-slide": 0,
  speed: 300,
  loop: false,
  "looped-slides": undefined,
  "loop-prevents-sliding": true,
  rewind: false,
  "allow-slide-prev": true,
  "allow-slide-next": true,
  "allow-touch-move": true,
  "set-wrapper-size": false,
  "virtual-translate": false,
  width: undefined,
  height: undefined,
  "auto-height": false,
  "round-lengths": false,
  nested: false,
  resistance: true,
  "resistance-ratio": 0.85,
  "watch-overflow": false,
  "watch-slides-progress": false,
  "watch-slides-visibility": false,
  "grab-cursor": false,
  "simulate-touch": true,
  "short-swipes": true,
  "long-swipes": true,
  "long-swipes-ratio": 0.5,
  "long-swipes-ms": 300,
  "follow-finger": true,
  "slide-to-clicked-slide": false,
  "preload-images": true,
  "update-on-images-ready": true,
  "no-swiping": false,
  "no-swiping-class": "swiper-no-swiping",
  "no-swiping-selector": undefined,
  "passive-listeners": true,
  threshold: 5,
  "touch-start-prevent-default": true,
  "touch-start-force-prevent-default": false,
  "touch-ratio": 1,
  "touch-angle": 45,

  // Breakpoints
  breakpoints: {},
  "breakpoints-base": ["window", "container"],

  // Layout
  "slides-per-view": [1, "auto"],
  "slides-per-group": 1,
  "slides-offset-before": 0,
  "slides-offset-after": 0,
  "space-between": 0,

  // Grid
  grid: {
    rows: 1,
    fill: ["row", "column"],
  },

  // Effects
  effect: ["slide", "fade", "cube", "coverflow", "flip", "cards", "creative"],
  "fade-effect": {
    crossFade: false,
  },
  "cube-effect": {
    shadow: true,
    slideShadows: true,
    shadowOffset: 20,
    shadowScale: 0.94,
  },
  "coverflow-effect": {
    rotate: 50,
    stretch: 0,
    depth: 100,
    scale: 1,
    slideShadows: true,
  },
  "flip-effect": {
    slideShadows: true,
    limitRotation: true,
  },
  "creative-effect": {
    perspective: true,
    shadowPerProgress: false,
    progressMultiplier: 1,
    limitProgress: 1,
    prev: undefined,
    next: undefined,
  },
  "cards-effect": {
    perSlideOffset: 8,
    perSlideRotate: 2,
    rotate: true,
    slideShadows: true,
  },

  // Autoplay
  autoplay: {
    // _default: false,
    // _value: false,
    delay: 3000,
    disableOnInteraction: true,
    pauseOnMouseEnter: false,
    reverseDirection: false,
    waitForTransition: true,
    stopOnLastSlide: false,
  },

  // Navigation
  navigation: {
    // _default: true,
    // _value: true,
    nextEl: null,
    prevEl: null,
    hideOnClick: false,
    disabledClass: "swiper-button-disabled",
    hiddenClass: "swiper-button-hidden",
    lockClass: "swiper-button-lock",
    navigationDisabledClass: "swiper-navigation-disabled",
  },

  // Pagination
  pagination: {
    // _default:true,
    // _value:true,
    el: null,
    type: ["bullets", "fraction", "progressbar", "custom"],
    bulletElement: "span",
    clickable: false,
    hideOnClick: false,
    dynamicBullets: false,
    dynamicMainBullets: 1,
    bulletClass: "swiper-pagination-bullet",
    bulletActiveClass: "swiper-pagination-bullet-active",
    clickableClass: "swiper-pagination-clickable",
    currentClass: "swiper-pagination-current",
    hiddenClass: "swiper-pagination-hidden",
    progressbarFillClass: "swiper-pagination-progressbar-fill",
    lockClass: "swiper-pagination-lock",
    modifierClass: "swiper-pagination-",
    paginationDisabledClass: "swiper-pagination-disabled",
    progressbarOpposite: false,
  },

  // Keyboard
  keyboard: {
    enabled: false,
    onlyInViewport: true,
    pageUpDown: true,
  },

  // Mousewheel
  mousewheel: {
    forceToAxis: false,
    releaseOnEdges: false,
    invert: false,
    sensitivity: 1,
    eventsTarget: "container",
  },

  // Scrollbar
  scrollbar: {
    el: null,
    draggable: false,
    hide: false,
    snapOnRelease: true,
    dragSize: "auto",
    lockClass: "swiper-scrollbar-lock",
    scrollbarDisabledClass: "swiper-scrollbar-disabled",
    scrollbarHorizontalClass: "swiper-scrollbar-horizontal",
  },

  // Zoom
  zoom: {
    maxRatio: 5,
    minRatio: 1,
    containerClass: "swiper-zoom-container",
    zoomedSlideClass: "swiper-slide-zoomed",
    toggle: true,
    panOnMouseMove: false,
    limitToOriginalSize: false,
  },

  // Lazy
  lazy: {
    loadPrevNext: false,
    loadPrevNextAmount: 1,
    loadOnTransitionStart: false,
    elementClass: "swiper-lazy",
    loadingClass: "swiper-lazy-loading",
    loadedClass: "swiper-lazy-loaded",
    preloaderClass: "swiper-lazy-preloader",
  },

  // Hash Navigation
  "hash-navigation": {
    enabled: false,
    replaceState: false,
    watchState: false,
  },

  // History
  history: {
    enabled: false,
    replaceState: false,
    key: "slides",
  },

  // Controller
  controller: {
    control: undefined,
    inverse: false,
    by: "slide",
  },

  // Thumbs
  thumbs: {
    swiper: null,
    multipleActiveThumbs: true,
    autoScrollOffset: 0,
    slideThumbActiveClass: "swiper-slide-thumb-active",
    thumbsContainerClass: "swiper-thumbs",
  },

  // Parallax
  parallax: {
    enabled: false,
  },

  // A11y
  a11y: {
    enabled: true,
    prevSlideMessage: "Previous slide",
    nextSlideMessage: "Next slide",
    firstSlideMessage: "This is the first slide",
    lastSlideMessage: "This is the last slide",
    paginationBulletMessage: "Go to slide {{index}}",
    notificationClass: "swiper-notification",
  },

  // Virtual
  virtual: {
    slides: [],
    cache: true,
    addSlidesBefore: 0,
    addSlidesAfter: 0,
    removeSlidesBefore: 0,
    removeSlidesAfter: 0,
  },

  // Observers
  observer: false,
  "observe-parents": false,
  "observe-slide-children": false,
  "resize-observer": true,

  //   // Events
  //   'on': {},
  //   'on-any': null,

  //   // Misc
  //   'modules': [],
  //   'inject-styles': undefined,
  //   'inject-styles-urls': undefined,
  //   'events-prefix': 'swiper',
  //   'swiper-element-node-name': 'SWIPER-CONTAINER'
};
