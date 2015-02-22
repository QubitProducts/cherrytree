import Route from 'react-route';
import RepoHeader from '../components/repo_header';

export default Route.extend({
  componentClass: RepoHeader,
  model(params) {
    return params;
  }
});