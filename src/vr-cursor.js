require('./vr-register-element');

var THREE = require('../lib/three');

var VRObject = require('./core/vr-object');

module.exports = document.registerElement(
  'vr-cursor',
  {
    prototype: Object.create(
      VRObject.prototype, {
        createdCallback: {
          value: function() {
            var material = this.getMaterial();
            var geometry = this.getGeometry();
            this.object3D = new THREE.Mesh( geometry, material );
            this.raycaster = new THREE.Raycaster();
            this.attachEventListeners();
            this.load();
          }
        },

        attachEventListeners: {
          value: function() {
            document.addEventListener('mousedown', this.onMouseDown.bind(this), false);
            this.addEventListener('click', this.handleClick.bind(this));
          }
        },

        onMouseDown: {
          value: function() {
            this.click();
          }
        },

        attributeChangedCallback: {
          value: function() {
            var material = this.getMaterial();
            var geometry = this.getGeometry();
            this.object3D.geometry = geometry;
            this.object3D.material = material;
          }
        },

        getGeometry: {
          value: function() {
            var radius = parseFloat(this.getAttribute('radius')) || 10;
            var geometryId = this.getAttribute('geometry');
            var geometryEl = geometryId? document.querySelector('#' + geometryId) : undefined;
            return (geometryEl && geometryEl.geometry) || new THREE.SphereGeometry( radius, 64, 40 );
          }
        },

        getMaterial: {
          value: function() {
            var materialId = this.getAttribute('material');
            var materialEl = materialId? document.querySelector('#' + materialId) : undefined;
            return (materialEl && materialEl.material) || new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
          }
        },

        intersect: {
          value: function(objects) {
            var camera = this.sceneEl.camera;
            var raycaster = this.raycaster;
            var cursor = this.object3D;
            var cursorPosition = cursor.position.clone();
            var cursorPositionWorld = cursor.localToWorld( cursorPosition );
            var direction = cursorPositionWorld.sub(camera.position).normalize();
            raycaster.set( camera.position, direction );
            return raycaster.intersectObjects( objects, true );
          }
        },

        handleClick: {
          value: function() {
            var scene = this.sceneEl.object3D;
            var intersectedObjects = this.intersect(scene.children);
            intersectedObjects.forEach(function(obj) {
              obj.object.el.click();
            });
          }
        }
    })
  }
);
