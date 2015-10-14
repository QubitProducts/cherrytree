export default {
  parse (querystring) {
    return querystring.split('&').reduce((acc, pair) => {
      let parts = pair.split('=')
      acc[parts[0]] = decodeURIComponent(parts[1])
      return acc
    }, {})
  },

  stringify (params) {
    return Object.keys(params).reduce((acc, key) => {
      if (params[key] !== undefined) {
        acc.push(key + '=' + encodeURIComponent(params[key]))
      }
      return acc
    }, []).join('&')
  }
}
