import Route from 'react-route';

export default Route.extend({
  model: function (params) {
    return params;
  }
});