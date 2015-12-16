# popup.js

This is an API for displaying popups on the web. It supports animations and other pretty things.

# Dependencies

For normal operation, popup.js uses the `window.requestAnimationFrame()` API. If you do not use animations, then this is not required.

For building, you will need [jsbuild](https://github.com/unixpickle/jsbuild) and a shell like `sh`.

# Building

If you wish to build the source code, you can run `sh build.sh`. You must have bash and jsbuild installed to run this. For more, see [Dependencies](#Dependencies).

# Usage

First, you must build and import the compiled source code. After following the [build instructions](#Building), the relevant file will be located at `build/popup.js`. You can import it like this:

  <script src="popup.js" type="text/javascript"></script>

The `Popup` class is the most basic way to present a popup. A `Popup` takes an element and presents it as a popup, modifying its CSS attributes in the process:

  var p = new window.popupjs.Popup(element, options);
  p.show();

You may provide the following options to the constructor:

 * *bool* draggable - `true` if the user can move the popup around with the mouse.
 * *number* draggableHeight - if *draggable* is true, then the user can drag part of the popup (namely the drag area) to move it. This property determines how many pixels tall the drag area is, starting from the top of the popup.
 * *number* width - the width of the popup, in pixels.
 * *number* height - the height of the popup, in pixels.
 * *string* position - the CSS positioning mode to use for the popup.
 * *bool* affectBodyScroll - the first popup with this set to `true` will automatically enable/disable scrolling on the `<body>` when it is shown/hidden.
 * *bool* shield - if this is `true`, then an element will fill the page behind the popup to block the other content.
 * *string* shieldColor - the color of the shield, if there is one. This is a CSS value, so you can use a hex color code, a color name, or something like `rgba(x,y,z,w)`.
 * *number* startX - the initial X offset of the center of the popup, in relative coordinates (i.e. between 0 and 1).
 * *number* startY - the initial Y offset of the center of the popup, in relative coordinates (i.e. between 0 and 1).
 * [Animation](#The-Animation-type) - the animation to use for showing and hiding the popup. If you do not specify an animation, a default one will be used. If you specify a `null` animation, no animation will be used.

The `Popup` class is an event emitter and will emit the following events:

 * close - emitted when the popup is closed by anything besides `close()`.
 * show - emitted after the presentation animation is complete, or in `show()` if no animation was used.
 * destroy - emitted after the destruction animation is complete, or immediately upon the popup being closed if no animation was used.

# The Animation type

It is possible to use your custom animations for showing and hiding popups. All you have to do is subclass `BaseAnimation`. You must override the following methods:

 * constructor(popup, shielding) - you must, in the very least, call the super constructor.
 * *void* start() - called to begin the animation. This will only be called once. In this method, you must add the popup and its shielding to the DOM. You can access them using `this.getPopup()` and `this.getShielding()`, respectively.
 * *void* reverse() - called to reverse the animation. This will only be called once, and is guaranteed to be called after `start()`.

In addition, `BaseAnimation` is an event emitter. You must emit the following events:

 * show - emitted when the animation has finished showing the popup. You should never emit this if `reverse()` is called before the show animation finished.
 * destroy - the reversed animation has finished. By the time you emit this, the popup and shielding must be out of the DOM.

`EasingAnimation` is a subclass of `BaseAnimation` which you may find helpful. It takes care of start/stop behavior for you, giving you less to implement:

 * constructor(popup, shielding) - you must, in the very least, call the super constructor.
 * *void* showFrame(amountVisible) - set style attributes on the popup and shielding (which will automatically be added/removed from the DOM) for the `amountVisible` argument. `amountVisible` will be 0 when the popup is fully hidden, and 1 when it is fully visible.

The API comes with one `EasingAnimation` implementation, namely `FallFadeAnimation`. It "drops" and "fades" the popup in a pretty way.
