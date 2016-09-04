import { route } from '../../lib'

export default () => [
  route({ name: 'application', path: '/' }, [
    route({ name: 'about' }),
    route({ name: 'faq' }),
    route({ name: 'posts' }, [
      route({ name: 'posts.popular' }),
      route({ name: 'posts.filter', path: 'filter/:filterId' }),
      route({ name: 'posts.show', path: ':id' })
    ])
  ]),
  route({ name: 'notFound', path: '*' })
]
