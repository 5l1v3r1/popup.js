function BaseAnimation(popup, shielding) {
  window.EventEmitter.call(this);

  this._popup = popup;
  this._shielding = shielding;
}

BaseAnimation.prototype = Object.create(window.EventEmitter.prototype);

BaseAnimation.prototype.getPopup = function() {
  return this._popup;
};

BaseAnimation.prototype.getShielding = function() {
  return this._shielding;
};

BaseAnimation.prototype.reverse = function() {
  throw new Error('your subclass must implement this');
};

BaseAnimation.prototype.start = function() {
  throw new Error('your subclass must implement this');
};

function EasingAnimation(popup, shielding) {
  BaseAnimation.call(this, popup, shielding);

  this._waitingFrame = false;
  this._startTime = null;
  this._reversed = false;
}

EasingAnimation.prototype = Object.create(BaseAnimation.prototype);

EasingAnimation.prototype.getDuration = function() {
  return 0.4;
};

EasingAnimation.prototype.showFrame = function(amountVisible) {
  throw new Error('your subclass must implement this');
};

EasingAnimation.prototype.start = function() {
  if (this._startTime !== null) {
    throw new Error('already started');
  }
  this._waitingFrame = true;
  this._startTime = new Date().getTime();
  this._tick();
  if (this.getShielding() !== null) {
    document.body.appendChild(this.getShielding());
  }
  document.body.appendChild(this.getPopup());
};

EasingAnimation.prototype.reverse = function() {
  var now = new Date().getTime();
  var sinceStart = Math.min(Math.max(now - this._startTime, 0), this.getDuration());
  var easeValue = this._ease(sinceStart / this.getDuration());
  var skipTime = this._inverseEase(1 - easeValue) * this.getDuration();

  this._reversed = true;
  this._startTime = now - skipTime;

  if (!this._waitingFrame) {
    this._tick();
  }
};

EasingAnimation.prototype._tick = function() {
  var now = new Date().getTime();

  // NOTE: if the user sets their clock backwards, we might as well correct for it.
  if (now < this._startTime) {
    this._startTime = now;
  }

  var elapsed = now - this._startTime;
  var progress = elapsed / (this.getDuration() * 1000);

  if (progress >= 1) {
    this._waitingFrame = false;
    if (this._reversed) {
      document.body.removeChild(this.getPopup());
      if (this.getShielding() !== null) {
        document.body.removeChild(this.getShielding());
      }
      this.emit('destroy');
    } else {
      this.showFrame(1);
      this.emit('show');
    }
    return;
  }

  var easedProgress = this._ease(progress);
  if (this._reversed) {
    this.showFrame(1 - easedProgress);
  } else {
    this.showFrame(easedProgress);
  }

  window.requestAnimationFrame(this._tick.bind(this));
};

EasingAnimation.prototype._ease = function(t) {
  // Code taken from https://github.com/mietek/ease
  if (t <= 0) {
    return 0;
  } else if (t >= 1) {
    return 1;
  }
  var a =  1.0042954579734844;
  var b = -6.4041738958415664;
  var c = -7.2908241330981340;
  return a * Math.exp(b * Math.exp(c * t));
};

EasingAnimation.prototype._inverseEase = function(x) {
  if (x <= 0) {
    return 0;
  } else if (x >= 1) {
    return 1;
  }
  var a =  1.0042954579734844;
  var b = -6.4041738958415664;
  var c = -7.2908241330981340;
  return Math.log(Math.log(x / a) / b) / c;
};

exports.BaseAnimation = BaseAnimation;
exports.EasingAnimation = EasingAnimation;
