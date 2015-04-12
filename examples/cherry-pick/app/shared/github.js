import rest from 'rest';
import mime from 'rest/interceptor/mime';

var client = rest.wrap(mime);

function get(path) {
  return client({
    path: 'https://api.github.com/' + path
    // headers: {
    //   'Authorization': 'token ' + token
    // }
  }).then(function(response) {
    return response.entity;
  });
}

export function commits(repo) {
  return get(`repos/${repo}/commits`);
}

export function code(repo, path, sha) {
  sha = sha || 'master';
  path = path || '';
  if (path[0] === '/') {
    path = path.slice(1);
  }
  // return get('repos/' + repo + '/git/trees/' + sha);
  return get(`repos/${repo}/contents/${path}`);
}