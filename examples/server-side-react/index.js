require('babel/register')({
  only: [
    /server-side-react\/app/,
    /cherrytree/
  ]
})
require('./app/server')
