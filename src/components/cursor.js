var registerComponent = require('../core/register-component').registerComponent;

module.exports.Component = registerComponent('cursor', {
  defaults: {
    value: {
      timeout: 0,
      maxDistance: 5,
      fuse: false
    }
  },

  dependencies: {
    value: { raycaster: '' }
  },

  init: {
    value: function () {
      this.raycaster = this.el.components.raycaster;
      this.attachEventListeners();
    }
  },

  attachEventListeners: {
    value: function () {
      var el = this.el;
      var canvas = el.sceneEl.canvas;

      canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
      canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

      el.addEventListener('intersection', this.onIntersection.bind(this));
      el.addEventListener('intersectioncleared', this.onIntersectionCleared.bind(this));
    }
  },

  onMouseDown: {
    value: function (evt) {
      this.emit('mousedown');
      this.mouseDownEl = this.intersectedEl;
    }
  },

  onMouseUp: {
    value: function () {
      this.emit('mouseup');
      if (this.data.fuse) { return; }
      if (this.mouseDownEl === this.intersectedEl) {
        this.emit('click');
        this.intersectedEl.emit('click');
      }
    }
  },

  emit: {
    value: function (evt) {
      var intersectedEl = this.intersectedEl;
      this.el.emit(evt);
      if (intersectedEl) { intersectedEl.emit(evt); }
    }
  },

  emitter: {
    value: function (evt) {
      return function () {
        this.emit(evt);
      }.bind(this);
    }
  },

  onIntersection: {
    value: function (evt) {
      var data = this.data;
      var el = evt.detail.el;
      var distance = evt.detail.distance;
      if (this.intersectedEl === el) { return; }
      if (distance >= this.data.maxDistance) { return; }
      this.intersectedEl = el;
      el.addState('hovered');
      el.emit('mouseenter');
      this.el.addState('hovering');
      if (data.timeout === 0) { return; }
      if (!data.fuse) { return; }
      this.fuseTimeout = setTimeout(this.emitter('click'), data.timeout);
    }
  },

  onIntersectionCleared: {
    value: function (evt) {
      var el = evt.detail.el;
      if (!el || !this.intersectedEl) { return; }
      this.intersectedEl = null;
      el.removeState('hovered');
      el.emit('mouseleave');
      this.el.removeState('hovering');
      clearTimeout(this.fuseTimeout);
    }
  }
});
