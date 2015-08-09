# Example: server side react

This is a simple server side application that combines cherrytree + cherrytree-for-react + react + express.

It's a very simple static twitter like app, taken from the hello-world example, but converted to a React app.

    $ npm install
    $ npm start

Now open [http://localhost:8000](http://localhost:8000).

The way it works is:

* [app/server.js](app/server.js) starts an express app and listens to all urls via `app.get('*', render(routes))`
* [app/render.js](app/render.js) is a generic function that instantiates a cherrytree for that request and returns React.renderToString results. It also handles `router.transitionTo()` redirects.
* [app/routes.js](app/routes.js) is a cherrytree route map that describes the route tree and connects routes to React components. This file can be fully reused on the clientside.
