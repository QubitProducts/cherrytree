import 'nprogress/nprogress.css';
import NProgress from 'nprogress';
import Route from 'react-route';
import when from 'when';

var loaderTimeout;
export default function loading(transition) {
  if (!loaderTimeout) {
    loaderTimeout = setTimeout(function () {
      NProgress.start();
    }, 200);
  }
  transition.then(function () {
    clearTimeout(loaderTimeout);
    loaderTimeout = null;
    NProgress.done();
  }).catch(function (err) {
    if (err.type !== 'TransitionRedirected') {
      NProgress.done();
    }
    throw err;
  });
};