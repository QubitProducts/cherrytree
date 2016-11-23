import { assert } from 'referee'
import qs from '../lib/qs'
import Path from '../lib/path'

let {suite, test} = window

suite('Path')

test('Path.extractParamNames', () => {
  assert.equals(Path.extractParamNames('a/b/c'), [])
  assert.equals(Path.extractParamNames('/comments/:a/:b/edit'), ['a', 'b'])
  assert.equals(Path.extractParamNames('/files/:path*.jpg'), ['path'])
})

test('Path.extractParams', () => {
  assert.equals(Path.extractParams('a/b/c', 'a/b/c'), {})
  assert.equals(Path.extractParams('a/b/c', 'd/e/f'), null)

  assert.equals(Path.extractParams('comments/:id.:ext/edit', 'comments/abc.js/edit'), { id: 'abc', ext: 'js' })

  assert.equals(Path.extractParams('comments/:id?/edit', 'comments/123/edit'), { id: '123' })
  assert.equals(Path.extractParams('comments/:id?/edit', 'comments/the%2Fid/edit'), { id: 'the/id' })
  assert.equals(Path.extractParams('comments/:id?/edit', 'comments//edit'), null)
  assert.equals(Path.extractParams('comments/:id?/edit', 'users/123'), null)

  assert.equals(Path.extractParams('one, two', 'one, two'), {})
  assert.equals(Path.extractParams('one, two', 'one two'), null)

  assert.equals(Path.extractParams('/comments/:id/edit now', '/comments/abc/edit now'), { id: 'abc' })
  assert.equals(Path.extractParams('/comments/:id/edit now', '/users/123'), null)

  assert.equals(Path.extractParams('/files/:path*', '/files/my/photo.jpg'), { path: 'my/photo.jpg' })
  assert.equals(Path.extractParams('/files/:path*', '/files/my/photo.jpg.zip'), { path: 'my/photo.jpg.zip' })
  assert.equals(Path.extractParams('/files/:path*.jpg', '/files/my%2Fphoto.jpg'), { path: 'my/photo' })
  assert.equals(Path.extractParams('/files/:path*', '/files'), { path: undefined })
  assert.equals(Path.extractParams('/files/:path*', '/files/'), { path: undefined })
  assert.equals(Path.extractParams('/files/:path*.jpg', '/files/my/photo.png'), null)

  // splat with named
  assert.equals(Path.extractParams('/files/:path*.:ext', '/files/my/photo.jpg'), { path: 'my/photo', ext: 'jpg' })

  // multiple splats
  assert.equals(Path.extractParams('/files/:path*.:ext*', '/files/my/photo.jpg/gif'), { path: 'my/photo', ext: 'jpg/gif' })

  // one more more segments
  assert.equals(Path.extractParams('/files/:path+', '/files/my/photo.jpg'), { path: 'my/photo.jpg' })
  assert.equals(Path.extractParams('/files/:path+', '/files/my/photo.jpg.zip'), { path: 'my/photo.jpg.zip' })
  assert.equals(Path.extractParams('/files/:path+.jpg', '/files/my/photo.jpg'), { path: 'my/photo' })
  assert.equals(Path.extractParams('/files/:path+', '/files'), null)
  assert.equals(Path.extractParams('/files/:path+', '/files/'), null)
  assert.equals(Path.extractParams('/files/:path+.jpg', '/files/my/photo.png'), null)

  assert.equals(Path.extractParams('/archive/:name?', '/archive'), { name: undefined })
  assert.equals(Path.extractParams('/archive/:name?', '/archive/'), { name: undefined })
  assert.equals(Path.extractParams('/archive/:name?', '/archive/foo'), { name: 'foo' })
  assert.equals(Path.extractParams('/archive/:name?', '/archivefoo'), null)
  assert.equals(Path.extractParams('/archive/:name?', '/archiv'), null)

  assert.equals(Path.extractParams('/:query/with/:domain', '/foo/with/foo.app'), { query: 'foo', domain: 'foo.app' })
  assert.equals(Path.extractParams('/:query/with/:domain', '/foo.ap/with/foo'), { query: 'foo.ap', domain: 'foo' })
  assert.equals(Path.extractParams('/:query/with/:domain', '/foo.ap/with/foo.app'), { query: 'foo.ap', domain: 'foo.app' })
  assert.equals(Path.extractParams('/:query/with/:domain', '/foo.ap'), null)

  // advanced use case of making params in the middle of the url optional
  assert.equals(Path.extractParams('/comments/:id(.*/?edit)', '/comments/123/edit'), {id: '123/edit'})
  assert.equals(Path.extractParams('/comments/:id(.*/?edit)', '/comments/edit'), {id: 'edit'})
  assert.equals(Path.extractParams('/comments/:id(.*/?edit)', '/comments/editor'), null)
  assert.equals(Path.extractParams('/comments/:id(.*/?edit)', '/comments/123'), null)
})

test('Path.injectParams', () => {
  assert.equals(Path.injectParams('/a/b/c', {}), '/a/b/c')

  assert.exception(() => Path.injectParams('comments/:id/edit', {}))

  assert.equals(Path.injectParams('comments/:id?/edit', { id: '123' }), 'comments/123/edit')
  assert.equals(Path.injectParams('comments/:id?/edit', {}), 'comments//edit')
  assert.equals(Path.injectParams('comments/:id?/edit', { id: 'abc' }), 'comments/abc/edit')
  assert.equals(Path.injectParams('comments/:id?/edit', { id: 0 }), 'comments/0/edit')
  assert.equals(Path.injectParams('comments/:id?/edit', { id: 'one, two' }), 'comments/one%2C%20two/edit')
  assert.equals(Path.injectParams('comments/:id?/edit', { id: 'the/id' }), 'comments/the%2Fid/edit')
  assert.equals(Path.injectParams('comments/:id?/edit', { id: 'alt.black.helicopter' }), 'comments/alt.black.helicopter/edit')

  assert.equals(Path.injectParams('/a/:foo*/d', { foo: 'b/c' }), '/a/b/c/d')
  assert.equals(Path.injectParams('/a/:foo*/c/:bar*', { foo: 'b', bar: 'd' }), '/a/b/c/d')
  assert.equals(Path.injectParams('/a/:foo*/c/:bar*', { foo: 'b' }), '/a/b/c/')

  assert.equals(Path.injectParams('/a/:foo+/d', { foo: 'b/c' }), '/a/b/c/d')
  assert.equals(Path.injectParams('/a/:foo+/c/:bar+', { foo: 'b?', bar: 'd ' }), '/a/b%3F/c/d%20')
  assert.exception(() => Path.injectParams('/a/:foo+/c/:bar+', { foo: 'b' }))

  assert.equals(Path.injectParams('/foo.bar.baz'), '/foo.bar.baz')
})

test('Path.extractQuery', () => {
  assert.equals(Path.extractQuery(qs, '/?id=def&show=true'), { id: 'def', show: 'true' })
  assert.equals(Path.extractQuery(qs, '/?id=a%26b'), { id: 'a&b' })
  assert.equals(Path.extractQuery(qs, '/a/b/c'), null)
})

test('Path.withoutQuery', () => {
  assert.equals(Path.withoutQuery('/a/b/c?id=def'), '/a/b/c')
})

test('Path.withQuery', () => {
  assert.equals(Path.withQuery(qs, '/a/b/c', { id: 'def' }), '/a/b/c?id=def')
  assert.equals(Path.withQuery(qs, '/a/b/c', { id: 'def', foo: 'bar', baz: undefined }), '/a/b/c?id=def&foo=bar')
  assert.equals(Path.withQuery(qs, '/path?a=b', { c: 'f&a=i#j+k' }), '/path?c=f%26a%3Di%23j%2Bk')
})
