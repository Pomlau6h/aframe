var styleParser = require('style-attr');
var utils = require('../utils/');

/**
 * Component class definition.
 *
 * Components configure appearance, modify behavior, or add functionality to
 * entities. The behavior and appearance of an entity can be changed at runtime
 * by adding, removing, or updating components. Entities do not share instances
 * of components.
 *
 * @namespace Component
 * @property {object} data - Stores component data, populated by parsing the
 *           attribute name of the component plus applying defaults and mixins.
 * @property {object} el - Reference to the entity element.
 * @property {string} name - Name of the attribute the component is connected
 *           to.
 * @member {Element} el
 * @member {object} data
 * @member {function} getData
 * @member {function} init
 * @member {function} update
 * @member {function} remove
 * @member {function} parse
 * @member {function} stringify
 */
var Component = function (el) {
  var attrs = el.getAttribute(this.name);
  this.el = el;
  this.data = {};
  this.parseAttributes(attrs);
  this.init();
  this.update();
};

Component.prototype = {
  /**
   * Contains default data values.
   * Data is coerced into the types of the values of the defaults.
   */
  defaults: {},

  /**
   * Init handler. Similar to attachedCallback.
   * Called during component initialization and is only run once.
   * Components can use this to set initial state.
   */
  init: function () { /* no-op */ },

  /**
   * Update handler. Similar to attributeChangedCallback.
   * Called whenever component's data changes.
   * Also called on component initialization when the component receives initial data.
   */
  update: function () { /* no-op */ },

  /**
   * Remove handler. Similar to detachedCallback.
   * Called whenever component is removed from the entity (i.e., removeAttribute).
   * Components can use this to reset behavior on the entity.
   */
  remove: function () { /* no-op */ },

  /**
   * Describes how the component should deserialize HTML attribute into data.
   * Can be overridden by the component.
   *
   * The default parsing is parsing style-like strings, camelCasing keys for
   * error-tolerance (`max-value` ~= `maxValue`).
   *
   * @param {string} value - HTML attribute.
   * @returns {object} Data.
   */
  parse: function (value) {
    if (typeof value !== 'string') { return value; }
    return transformKeysToCamelCase(styleParser.parse(value));
  },

  /**
   * Describes how the component should serialize data to a string to update the DOM.
   * Can be overridden by the component.
   *
   * The default stringify is to a style-like string.
   *
   * @param {object} data
   * @returns {string}
   */
  stringify: function (data) {
    if (typeof data !== 'object') { return data; }
    return styleParser.stringify(data);
  },

  /**
   * Returns a copy of data such that we don't expose the private this.data.
   *
   * @returns {object} data
   */
  getData: function () {
    var data = this.data;
    if (typeof data !== 'object') { return data; }
    return utils.extend({}, data);
  },

  /**
   * Called when new data is coming from the entity (e.g., attributeChangedCb)
   * or from its mixins. Does some parsing and applying before updating the
   * component.
   * Does not update if data has not changed.
   */
  updateAttributes: function (newData) {
    var previousData = utils.extend({}, this.data);
    this.parseAttributes(newData);
    // Don't update if properties haven't changed
    if (utils.deepEqual(previousData, this.data)) { return; }
    this.update();
  },

  /**
   * Builds component data from the current state of the entity, ultimately
   * updating this.data.
   *
   * If the component was detached completely, set data to null.
   *
   * Precedence:
   * 1. Defaults data
   * 2. Mixin data.
   * 3. Attribute data.
   * Finally coerce the data to the types of the defaults.
   */
  parseAttributes: function (newData) {
    var self = this;
    var data = {};
    var defaults = self.defaults;
    var el = self.el;
    var mixinEls = el.mixinEls;
    var name = self.name;

    // 1. Default values (lowest precendence).
    data = utils.extend(data, defaults);

    // 2. Mixin values.
    mixinEls.forEach(applyMixin);
    function applyMixin (mixinEl) {
      var mixinData = mixinEl.getAttribute(name);
      data = utils.extend(data, mixinData);
    }

    // 3. Attribute values (highest precendence).
    data = utils.extend(data, newData);

    // Coerce to the type of the defaults.
    this.data = utils.coerce(data, defaults);
  }
};

/**
 * Converts string from hyphen to camelCase.
 *
 * @param {string} str - String to camelCase.
 * @return {string} CamelCased string.
 */
function toCamelCase (str) {
  return str.replace(/-([a-z])/g, camelCase);
  function camelCase (g) { return g[1].toUpperCase(); }
}

/**
 * Converts object's keys from hyphens to camelCase (e.g., `max-value` to
 * `maxValue`).
 *
 * @param {object} obj - The object to camelCase keys.
 * @return {object} The object with keys camelCased.
 */
function transformKeysToCamelCase (obj) {
  var keys = Object.keys(obj);
  var camelCaseObj = {};
  keys.forEach(function (key) {
    var camelCaseKey = toCamelCase(key);
    camelCaseObj[camelCaseKey] = obj[key];
  });
  return camelCaseObj;
}

module.exports = Component;
