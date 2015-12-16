//deps animation_base.js

function FallFadeAnimation(popup, shielding) {
  EasingAnimation.call(this, popup, shielding);
}

FallFadeAnimation.FALL_PIXELS = 50;

FallFadeAnimation.prototype.showFrame = function(fraction) {
  var transform;
  if (fraction === 1) {
    transform = 'none';
  } else {
    var translation = ((fraction - 1) * FallFadeAnimation.FALL_PIXELS).toFixed(2);
    transform = 'translateY(' + translation + 'px)';
  }
  this.getShielding().style.opacity = fraction.toFixed(3);
  this.getPopup().style.opacity = fraction.toFixed(3);
  this.getPopup().style.transform = transform;
  this.getPopup().style.webkitTransform = transform;
  this.getPopup().style.MozTransform = transform;
  this.getPopup().style.msTransform = transform;
};

exports.FallFadeAnimation = FallFadeAnimation;
