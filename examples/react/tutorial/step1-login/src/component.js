import * as zoid from 'zoid/dist/zoid.frameworks'

window.WrapperComponent = zoid.create({
  tag: 'wrapper-component',
  url: 'http://localhost:8080/auth-wrapper',
  dimensions: {
    width: '500px',
    height: '500px',
  },
  props: {
    oreIdOptions: {
      type: 'object',
    },
    options: {
      type: 'object'
    },
    onSuccess: {
      type: 'function'
    },
    onError: {
      type: 'function'
    }
  },
  context: 'iframe',
});
