//deps fall_fade_animation.js

function Popup(contents, options) {
  EventEmitter.call(this);

  this._state = Popup.STATE_INITIAL;

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
    this._shielding = document.createElement('div');
    this._shielding.className = 'popupjs-shielding';
    this._shielding.style.backgroundColor = this._opts.shieldColor;
    this._shielding.style.position = 'fixed';
    this._shielding.style.left = '0';
    this._shielding.style.top = '0';
    this._shielding.style.width = '100%';
    this._shielding.style.height = '100%';

    // NOTE: this fixes some lag in Chrome and Safari.
    this._shielding.style.webkitBackfaceVisibility = 'hidden';

    this._shielding.addEventListener('click', this.close.bind(this));
  } else {
    this._shielding = null;
  }

  this._x = this._opts.startX;
  this._y = this._opts.startY;

  if (this._opts.draggable && this._opts.draggableHeight > 0) {
    this._configureDragging();
  }

  this._animation = null;
}

Popup.DEFAULTS = {
  draggable: false,
  draggableHeight: 0,
  width: 0,
  height: 0,
  position: 'fixed',
  affectBodyScroll: false,
  shield: true,
  shieldColor: 'rgba(0, 0, 0, 0.5)',
  startX: 0.5,
  startY: 0.45,
  animation: FallFadeAnimation
};

Popup.OPTION_KEYS = Object.keys(Popup.DEFAULTS);

Popup.STATE_INITIAL = 0;
Popup.STATE_SHOWN = 1;
Popup.STATE_CLOSED = 2;

Popup._bodyScrollingPopupCount = 0;
Popup._PRIVATE_CLOSE_EVENT = '_close';

Popup.prototype = Object.create(EventEmitter.prototype);

Popup.prototype.show = function() {
  if (this._state !== Popup.STATE_INITIAL) {
    return;
  }
  this._state = Popup.STATE_SHOWN;

  if (this._opts.affectBodyScroll) {
    if (0 === Popup._bodyScrollingPopupCount++) {
      this.once('show', function() {
        document.body.style.overflow = 'auto';
      });
    }
  }

  this._layout();

  var boundLayout = this._layout.bind(this);
  window.addEventListener('resize', boundLayout);
  this.once('destroy', window.removeEventListener.bind(window, 'resize', boundLayout));

  if (this._opts.animation === null) {
    if (this._shielding !== null) {
      document.body.appendChild(this._shielding);
    }
    document.body.appendChild(this._element);
    this.emit('show');
  } else {
    this._animation = new this._opts.animation(this._element, this._shielding);
    this._animation.once('show', this.emit.bind(this, 'show'));
    this._animation.once('destroy', this.emit.bind(this, 'destroy'));
    this._animation.start();
  }
};

Popup.prototype.close = function() {
  if (this._state !== Popup.STATE_SHOWN) {
    return;
  }
  this._state = Popup.STATE_CLOSED;

  this.emit(Popup._PRIVATE_CLOSE_EVENT);

  if (this._opts.affectBodyScroll) {
    if (0 === --Popup._bodyScrollingPopupCount) {
      document.body.style.overflow = 'hidden';
    }
  }

  if (this._opts.animation === null) {
    if (this._shielding !== null) {
      document.body.removeChild(this._shielding);
    }
    document.body.removeChild(this._element);
    this.emit('destroy');
  } else {
    this._animation.once('destroy', function() {
      window.removeEventListener('resize', this._resizeListener);
    }.bind(this));
    this._animation.reverse();
  }
};

Popup.prototype._layout = function() {
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;

  var left = windowWidth*this._x - this._opts.width/2;
  var top = windowHeight*this._y - this._opts.height/2;

  // NOTE: if the window is too small, the popup should never go over the left
  // side but it may go over the right side.
  if (left+this._opts.width > windowWidth) {
    left = windowWidth - this._opts.width;
  }
  if (top+this._opts.height > windowHeight) {
    top = windowHeight - this._opts.height;
  }

  left = Math.max(Math.round(left), 0);
  top = Math.max(Math.round(top), 0);

  this._element.style.left = Math.round(left) + 'px';
  this._element.style.top = Math.round(top) + 'px';
};

Popup.prototype._configureDragging = function() {
  var handler = this._handleMouseDown.bind(this);
  this.once('show', this._element.addEventListener.bind(this._element, 'mousedown', handler));
  this.once(Popup._PRIVATE_CLOSE_EVENT,
    this._element.removeEventListener.bind(this._element, 'mousedown', handler));
};

Popup.prototype._handleMouseDown = function(e) {
  var clientRect = this._element.getBoundingClientRect();
  if (e.clientY-clientRect.top > this._opts.draggableHeight) {
    return;
  }

  // NOTE: this prevents the cursor from turning into an ibeam on drag.
  e.preventDefault();

  var moveHandler = function(moveEvent) {
    var offsetX = moveEvent.clientX - e.clientX;
    var offsetY = moveEvent.clientY - e.clientY;
    var newPopupCenterX = offsetX + clientRect.left + this._opts.width/2;
    var newPopupCenterY = offsetY + clientRect.top + this._opts.height/2;
    var relX = newPopupCenterX / window.innerWidth;
    var relY = newPopupCenterY / window.innerHeight;
    this._x = Math.max(Math.min(relX, 1), 0);
    this._y = Math.max(Math.min(relY, 1), 0);
    this._layout();
  }.bind(this);

  var endHandler;
  endHandler = function() {
    this.removeListener(Popup._PRIVATE_CLOSE_EVENT, endHandler);
    window.removeEventListener('mouseup', endHandler);
    window.removeEventListener('mousemove', moveHandler);
  }.bind(this);

  this.once(Popup._PRIVATE_CLOSE_EVENT, endHandler);
  window.addEventListener('mouseup', endHandler);
  window.addEventListener('mousemove', moveHandler);
};

exports.Popup = Popup;
