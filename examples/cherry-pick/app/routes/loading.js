import 'nprogress/nprogress.css';
import NProgress from 'nprogress';
import Route from 'react-route';

export default Route.extend({
  activate: function () {
    this.loader = setTimeout(function () {
      NProgress.start();
    }, 400);
  },
  deactivate: function () {
    clearTimeout(this.loader);
    NProgress.done();
  }
});