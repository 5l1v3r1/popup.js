//deps fall_fade_animation.js

function Popup(contents, options) {
  EventEmitter.call(this);

  this._opts = {};
  for (var i = 0, len = Popup.OPTION_KEYS.length; i < len; ++i) {
    var key = Popup.OPTION_KEYS[i];
    if (options.hasOwnProperty(key)) {
      this._opts[key] = options[key];
    } else {
      this._opts[key] = Popup.DEFAULTS[key];
    }
  }

  this._element = contents;
  this._element.style.width = this._opts.width + 'px';
  this._element.style.height = this._opts.height + 'px';
  this._element.style.position = this._opts.position;

  if (this._opts.shield) {
    this._shield = document.createElement('div');
    this._shield.className = 'popupjs-shielding';
    this._shield.style.backgroundColor = this._opts.shieldColor;
    this._shield.style.position = 'fixed';
    this._shield.style.left = '0';
    this._shield.style.top = '0';
    this._shield.style.width = '100%';
    this._shield.style.height = '100%';
  } else {
    this._shield = null;
  }

  this._x = this._opts.startX;
  this._y = this._opts.startY;

  if (this._opts.draggable && this._opts.draggableHeight > 0) {
    this._configureDragging();
  }
}

Popup.DEFAULTS = {
  draggable: false,
  draggableHeight: 0,
  width: 0,
  height: 0,
  position: 'fixed',
  affectBodyScroll: false,
  shield: true,
  shieldColor: 'rgba(0, 0, 0, 0.4)',
  startX: 0.5,
  startY: 0.45,
  animation: FallFadeAnimation
};

Popup.OPTION_KEYS = Object.keys(Popup.DEFAULTS);

Popup._bodyScrollingPopupCount = 0;
Popup._PRIVATE_CLOSE_EVENT = '_close';

Popup.prototype = Object.create(EventEmitter.prototype);

Popup.prototype.show = function() {
  // TODO: add the popup to the DOM and play an opening animation.
};

Popup.prototype.close = function() {
  // TODO: play a closing animation or destroy the popup.
};

Popup.prototype._layout = function() {
  // TODO: position the element correctly.
};

Popup.prototype._configureDragging = function() {
  var handler = this._handleMouseDown.bind(this);
  this.once('show', this._element.addEventListener.bind(this._element, 'mousedown', handler));
  this.once(Popup._PRIVATE_CLOSE_EVENT,
    this._element.removeEventListener.bind(this._element, 'mousedown', handler));
};

Popup.prototype._handleMouseDown = function(e) {
  var clientRect = this._element.getBoundingClientRect();
  if (e.clientX-clientRect.top > this._opts.draggableHeight) {
    return;
  }

  var moveHandler = function(moveEvent) {
    var offsetX = moveEvent.clientX - initialMousePosition.left;
    var offsetY = moveEvent.clientY - initialMousePosition.top;
    var newPopupCenterX = offsetX + clientRect.left + this._opts.width/2;
    var newPopupCenterY = offsetY + clientRect.top + this._opts.height/2;
    var relX = newPopupCenterX / window.innerWidth;
    var relY = newPopupCenterY / window.innerHeight;
    this._x = Math.max(Math.min(x, 1), 0);
    this._y = Math.max(Math.min(y, 1), 0);
    this._layout();
  }.bind(this);

  var endHandler;
  endHandler = function() {
    this.removeListener(Popup._PRIVATE_CLOSE_EVENT, endHandler);
    document.body.removeEventListener('mouseup', endHandler);
    document.body.removeEventListener('mousemove', moveHandler);
  }.bind(this);

  this.on(Popup._PRIVATE_CLOSE_EVENT, endHandler);
  document.body.addEventListener('mouseup', endHandler);
  document.body.addEventListener('mousemove', moveHandler);
};
