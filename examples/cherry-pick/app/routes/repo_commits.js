import Route from 'react-route';
import Commits from '../pages/commits';
import github from '../github';

export default Route.extend({
  componentClass: Commits,
  model: function () {
    return {
      commits: github.commits(this.get('org') + '/' + this.get('repo'))
    };
  }
});