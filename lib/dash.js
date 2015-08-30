// helpers
let keys = Object.keys
let apply = (fn, args) => fn.apply(null, args)
let identity = x => x
let append = (item, list) => { list.push(item); return list }
let assoc = (obj, attr, val) => { obj[attr] = val; return obj }

// exports
export let reduce = (list = [], iterator = identity, ...rest) => {
  let i = rest.length ? 0 : 1
  let acc = rest.length ? rest[0] : list[0]
  let keyList = keys(list)
  for (let len = keyList.length; i < len; i++) {
    let key = keyList[i]
    acc = apply(iterator, [acc, list[key], key, list])
  }
  return acc
}

export let map = (list, iterator) =>
  reduce(list, (acc, value, i) =>
    append(apply(iterator, [value, i]), acc), [])

export let each = (...args) => { apply(map, args) }

export let pluck = (list, attr) => map(list, item => item[attr])

export let toArray = args => Array.prototype.slice.call(args)

export let isArray = obj => Object.prototype.toString.call(obj) === '[object Array]'

export let clone = obj => isArray(obj) ? obj.slice(0) : extend({}, obj)

export let pick = (obj, attrs) =>
  reduce(attrs, (acc, attr) =>
    assoc(acc, attr, obj[attr]), {})

export let extend = (obj1, obj2) =>
  reduce(obj2 || {}, (__, value, key) => assoc(obj1, key, value), obj1 || {})

export let isEqual = (obj1, obj2) =>
  keys(obj1).length === keys(obj2).length &&
    reduce(obj1, (acc, value, key) => acc && obj2[key] === value, true)
