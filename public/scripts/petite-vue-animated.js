function registerAutoAnimateDirective(app) {
  app.directive('auto-animate', function (ctx) {
    const el = ctx.el;
    const get = ctx.get;

    // Guard: only initialize once per element
    if (el.__autoAnimated) return;
    el.__autoAnimated = true;

    let config = {};
    
    try {
      config = get() || {};
    } catch (e) {
      console.warn('auto-animate: bad config', e);
    }
    console.log('config of auto animate is : ' , config);

    if (typeof autoAnimate === 'undefined') {
      console.error('auto-animate library not loaded');
      return;
    }

    if(typeof config === 'boolean'){
      config ? autoAnimate(el) : null;
      console.log('auto animate value is : ' , config);
      
    }else if (isPlainObject(config) && (config.disrespectUserMotionPreference || config.duration || config.easing)) {
      autoAnimate(el, config);
    } else if (isPlainObject(config)) {
      autoAnimate(el, (element, action, oldCoords, newCoords) => {
        let keyframes;
        const duration = config.duration || 300;
        const easing = config.easing || 'ease-out';
  
        if (action === 'add') {
          keyframes = config.add || [
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ];
        }
  
        if (action === 'remove') {
          keyframes = config.remove || [
            { opacity: 1 },
            { opacity: 0, transform: 'translateX(40px)' }
          ];
        }
  
        if (action === 'remain') {
          if (config.remain) {
            keyframes = config.remain;
          } else if (oldCoords && newCoords) {
            const deltaX = oldCoords.left - newCoords.left;
            const deltaY = oldCoords.top - newCoords.top;
            keyframes = [
              { transform: `translate(${deltaX}px, ${deltaY}px)` },
              { transform: 'translate(0, 0)' }
            ];
          } else {
            keyframes = [{ opacity: 1 }];
          }
        }
  
        return new KeyframeEffect(element, keyframes, { duration, easing });
      });
    }
  });
}

window.PetiteVueAutoAnimate = { registerDirective: registerAutoAnimateDirective };