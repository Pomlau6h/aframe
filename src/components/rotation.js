var registerComponent = require('../core/register-component');
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('rotation', {
  update: {
    value: function () {
      var object3D = this.el.object3D;
      // Updates three.js object
      var rotationX = THREE.Math.degToRad(this.x);
      var rotationY = THREE.Math.degToRad(this.y);
      var rotationZ = THREE.Math.degToRad(this.z);
      // Updates three.js object
      object3D.rotation.set(rotationX, rotationY, rotationZ);
    }
  }
});
