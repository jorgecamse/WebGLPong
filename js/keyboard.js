
window.addEventListener("keydown", function(event) { Key.onKeydown(event); }, false);
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);

var Key = {
   _pressed: {},

  LEFT: 37,
  RIGHT: 39,
  A: 65,
  D: 68,

  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },

  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },

  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};
