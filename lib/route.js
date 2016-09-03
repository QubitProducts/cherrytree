/**
 * A small helper for creating route maps.
 * This is useful mostly to workaround the standard linting
 * that no longer allows multiline objects.
 *
 * This helper converts this:
 * [
 *   route({ name: 'foo', path: ':foo' }, [
 *     route({ name: 'bar', path: ':bar' })
 *   ])
 * ]
 *
 * to this:
 *
 * [
 *   { name: 'foo', path: ':foo', children: [
 *     { name: 'bar', path: ':bar' }
 *   ]}
 * ]
 */

import { extend } from './dash'

let route = (options, children) => extend({ children }, options)

export default route
