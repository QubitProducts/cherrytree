export default function () {
  this.route('application', {path: '/'}, function () {
    this.route('index', {path: '/'})
    this.route('organisation', {path: ':org'});
    this.route('repo', {path: ':org/:repo'}, function () {
      this.route('repo.code', function () {
        this.route('repo.code.index', {path: ''});
        this.route('repo.code.path', {path: '*path'});
      });
      this.route('repo.commits');
    });
  });
}