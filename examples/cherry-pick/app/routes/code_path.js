import Route from 'react-route';
import github from '../github';
import Code from '../pages/code';

export default Route.extend({
  componentClass: Code,
  model: function (params) {
    var repoUid = this.get('org') + '/' + this.get('repo');
    var path = params.path || '';
    return {
      code: github.code(repoUid, path),
      path: path,
      repo: this.get('repo')
    };
  }
});