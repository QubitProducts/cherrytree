/**
 * This is a middleware for cherrytree.
 * It renders a global loading animation for async transitions.
 */

import 'nprogress/nprogress.css';
import NProgress from 'nprogress';

let loaderTimeout;

export default function loading(transition) {
  if (!loaderTimeout) {
    loaderTimeout = setTimeout(startAnimation, 200);
  }

  transition.then(stopAnimation).catch(function (err) {
    if (err.type !== 'TransitionRedirected') {
      stopAnimation();
    }
    // don't swallow the error
    throw err;
  });
};

function startAnimation() {
  NProgress.start();
}

function stopAnimation() {
  clearTimeout(loaderTimeout);
  loaderTimeout = null;
  NProgress.done();
}