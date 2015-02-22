export default function () {
  this.route('application', {path: '/'}, function () {
    this.route('index', {path: '/'});
    this.route('organisation', {path: ':org'});
    this.route('repo', {path: ':org/:repo'}, function () {
      this.route('repo.code', {path: 'code/*?'});
      this.route('repo.commits');
    });
  });
}