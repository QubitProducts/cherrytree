let {assert} = require('referee')
let {suite, test} = window
let Path = require('../lib/path')

suite('Path')

test('Path.extractParamNames', () => {
  assert.equals(Path.extractParamNames('a/b/c'), [])
  assert.equals(Path.extractParamNames('/comments/:a/:b/edit'), ['a', 'b'])
  assert.equals(Path.extractParamNames('/files/*.jpg'), ['splat'])
})

test('Path.extractParams', () => {
  assert.equals(Path.extractParams('a/b/c', 'a/b/c'), {})
  assert.equals(Path.extractParams('a/b/c', 'd/e/f'), null)

  assert.equals(Path.extractParams('comments/:id.:ext/edit', 'comments/abc.js/edit'), { id: 'abc', ext: 'js'})

  assert.equals(Path.extractParams('comments/:id?/edit', 'comments/123/edit'), { id: '123' })
  assert.equals(Path.extractParams('comments/:id?/edit', 'comments//edit'), { id: undefined })
  assert.equals(Path.extractParams('comments/:id?/edit', 'users/123'), null)

  assert.equals(Path.extractParams('comments/:id?/?edit', 'comments/123/edit'), { id: '123' })
  assert.equals(Path.extractParams('comments/:id?/?edit', 'comments/edit'), { id: undefined })
  assert.equals(Path.extractParams('comments/:id?/?edit', 'users/123'), null)
  assert.equals(Path.extractParams('comments/:id?/?edit', 'comments/foo.bar/edit'), { id: 'foo.bar' })

  assert.equals(Path.extractParams('one, two', 'one, two'), {})
  assert.equals(Path.extractParams('one, two', 'one two'), null)

  assert.equals(Path.extractParams('/comments/:id/edit now', '/comments/abc/edit now'), { id: 'abc' })
  assert.equals(Path.extractParams('/comments/:id/edit now', '/users/123'), null)

  assert.equals(Path.extractParams('/files/*', '/files/my/photo.jpg'), { splat: 'my/photo.jpg' })
  assert.equals(Path.extractParams('/files/*', '/files/my/photo.jpg.zip'), { splat: 'my/photo.jpg.zip' })
  assert.equals(Path.extractParams('/files/*.jpg', '/files/my/photo.jpg'), { splat: 'my/photo' })
  assert.equals(Path.extractParams('/files/*.jpg', '/files/my/photo.png'), null)

  assert.equals(Path.extractParams('/archive/?:name?', '/archive'), { name: undefined })
  assert.equals(Path.extractParams('/archive/?:name?', '/archive/'), { name: undefined })
  assert.equals(Path.extractParams('/archive/?:name?', '/archive/foo'), { name: 'foo' })
  assert.equals(Path.extractParams('/archive/?:name?', '/archivefoo'), { name: 'foo' })
  assert.equals(Path.extractParams('/archive/?:name?', '/archiv'), null)

  assert.equals(Path.extractParams('/:query/with/:domain', '/foo/with/foo.app'), { query: 'foo', domain: 'foo.app' })
  assert.equals(Path.extractParams('/:query/with/:domain', '/foo.ap/with/foo'), { query: 'foo.ap', domain: 'foo' })
  assert.equals(Path.extractParams('/:query/with/:domain', '/foo.ap/with/foo.app'), { query: 'foo.ap', domain: 'foo.app' })
  assert.equals(Path.extractParams('/:query/with/:domain', '/foo.ap'), null)
})

test('Path.injectParams', () => {
  assert.equals(Path.injectParams('/a/b/c', {}), '/a/b/c')

  assert.exception(() => Path.injectParams('comments/:id/edit', {}))

  assert.equals(Path.injectParams('comments/:id?/edit', { id: '123' }), 'comments/123/edit')
  assert.equals(Path.injectParams('comments/:id?/edit', {}), 'comments//edit')

  assert.equals(Path.injectParams('comments/:id?/?edit', { id: '123' }), 'comments/123/edit')
  assert.equals(Path.injectParams('comments/:id?/?edit', {}), 'comments/edit')
  assert.equals(Path.injectParams('comments/:id?/?edit', { id: 'abc' }), 'comments/abc/edit')
  assert.equals(Path.injectParams('comments/:id?/?edit', { id: 0 }), 'comments/0/edit')
  assert.equals(Path.injectParams('comments/:id?/?edit', { id: 'one, two' }), 'comments/one, two/edit')
  assert.equals(Path.injectParams('comments/:id?/?edit', { id: 'the/id' }), 'comments/the/id/edit')
  assert.equals(Path.injectParams('comments/:id?/?edit', { id: 'alt.black.helicopter' }), 'comments/alt.black.helicopter/edit')

  assert.equals(Path.injectParams('/a/*/d', { splat: 'b/c' }), '/a/b/c/d')
  assert.equals(Path.injectParams('/a/*/c/*', { splat: [ 'b', 'd' ] }), '/a/b/c/d')
  assert.exception(() => Path.injectParams('/a/*/c/*', { splat: [ 'b' ] }))

  assert.equals(Path.injectParams('/foo.bar.baz'), '/foo.bar.baz')

  assert.equals(Path.injectParams('/foo/?/bar/?/baz/?'), '/foo/bar/baz/')
})

test('Path.extractQuery', () => {
  assert.equals(Path.extractQuery('/?id=def&show=true'), { id: 'def', show: 'true' })
  assert.equals(Path.extractQuery('/?id%5B%5D=a&id%5B%5D=b'), { id: [ 'a', 'b' ] })
  assert.equals(Path.extractQuery('/?id=a%26b'), { id: 'a&b' })
  assert.equals(Path.extractQuery('/a/b/c'), null)
})

test('Path.withoutQuery', () => {
  assert.equals(Path.withoutQuery('/a/b/c?id=def'), '/a/b/c')
})

test('Path.withQuery', () => {
  assert.equals(Path.withQuery('/a/b/c', { id: 'def' }), '/a/b/c?id=def')
  assert.equals(Path.withQuery('/path?a=b', { c: [ 'd', 'e' ] }), '/path?a=b&c=d&c=e')
  assert.equals(Path.withQuery('/path?a=b', { c: [ 'd#e', 'f&a=i#j+k' ] }), '/path?a=b&c=d%23e&c=f%26a%3Di%23j%2Bk')
})
