for (var file in window.__karma__.files) {
  window.__karma__.files[file.replace(/^\//, '')] = window.__karma__.files[file];
}

var tests = Object.keys(window.__karma__.files).filter(function (file) {
  return (/^\/base\/test\/.*_test.js$/).test(file);
});

require.config({
  baseUrl: "base",
  deps: tests,
  callback: window.__karma__.start
});