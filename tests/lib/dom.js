export let html = selector => typeof selector === 'string'
  ? document.querySelector(selector).innerHTML
  : selector.innerHTML
