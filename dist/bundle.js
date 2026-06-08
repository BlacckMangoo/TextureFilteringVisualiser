"use strict";
(() => {
  // node_modules/lil-gui/dist/lil-gui.esm.js
  var Controller = class _Controller {
    constructor(parent, object, property, className, elementType = "div") {
      this.parent = parent;
      this.object = object;
      this.property = property;
      this._disabled = false;
      this._hidden = false;
      this.initialValue = this.getValue();
      this.domElement = document.createElement(elementType);
      this.domElement.classList.add("lil-controller");
      this.domElement.classList.add(className);
      this.$name = document.createElement("div");
      this.$name.classList.add("lil-name");
      _Controller.nextNameID = _Controller.nextNameID || 0;
      this.$name.id = `lil-gui-name-${++_Controller.nextNameID}`;
      this.$widget = document.createElement("div");
      this.$widget.classList.add("lil-widget");
      this.$disable = this.$widget;
      this.domElement.appendChild(this.$name);
      this.domElement.appendChild(this.$widget);
      this.domElement.addEventListener("keydown", (e) => e.stopPropagation());
      this.domElement.addEventListener("keyup", (e) => e.stopPropagation());
      this.parent.children.push(this);
      this.parent.controllers.push(this);
      this.parent.$children.appendChild(this.domElement);
      this._listenCallback = this._listenCallback.bind(this);
      this.name(property);
    }
    /**
     * Sets the name of the controller and its label in the GUI.
     * @param {string} name
     * @returns {this}
     */
    name(name) {
      this._name = name;
      this.$name.textContent = name;
      return this;
    }
    /**
     * Pass a function to be called whenever the value is modified by this controller.
     * The function receives the new value as its first parameter. The value of `this` will be the
     * controller.
     *
     * For function controllers, the `onChange` callback will be fired on click, after the function
     * executes.
     * @param {Function} callback
     * @returns {this}
     * @example
     * const controller = gui.add( object, 'property' );
     *
     * controller.onChange( function( v ) {
     * 	console.log( 'The value is now ' + v );
     * 	console.assert( this === controller );
     * } );
     */
    onChange(callback) {
      this._onChange = callback;
      return this;
    }
    /**
     * Calls the onChange methods of this controller and its parent GUI.
     * @protected
     */
    _callOnChange() {
      this.parent._callOnChange(this);
      if (this._onChange !== void 0) {
        this._onChange.call(this, this.getValue());
      }
      this._changed = true;
    }
    /**
     * Pass a function to be called after this controller has been modified and loses focus.
     * @param {Function} callback
     * @returns {this}
     * @example
     * const controller = gui.add( object, 'property' );
     *
     * controller.onFinishChange( function( v ) {
     * 	console.log( 'Changes complete: ' + v );
     * 	console.assert( this === controller );
     * } );
     */
    onFinishChange(callback) {
      this._onFinishChange = callback;
      return this;
    }
    /**
     * Should be called by Controller when its widgets lose focus.
     * @protected
     */
    _callOnFinishChange() {
      if (this._changed) {
        this.parent._callOnFinishChange(this);
        if (this._onFinishChange !== void 0) {
          this._onFinishChange.call(this, this.getValue());
        }
      }
      this._changed = false;
    }
    /**
     * Sets the controller back to its initial value.
     * @returns {this}
     */
    reset() {
      this.setValue(this.initialValue);
      this._callOnFinishChange();
      return this;
    }
    /**
     * Enables this controller.
     * @param {boolean} enabled
     * @returns {this}
     * @example
     * controller.enable();
     * controller.enable( false ); // disable
     * controller.enable( controller._disabled ); // toggle
     */
    enable(enabled = true) {
      return this.disable(!enabled);
    }
    /**
     * Disables this controller.
     * @param {boolean} disabled
     * @returns {this}
     * @example
     * controller.disable();
     * controller.disable( false ); // enable
     * controller.disable( !controller._disabled ); // toggle
     */
    disable(disabled = true) {
      if (disabled === this._disabled) return this;
      this._disabled = disabled;
      this.domElement.classList.toggle("lil-disabled", disabled);
      this.$disable.toggleAttribute("disabled", disabled);
      return this;
    }
    /**
     * Shows the Controller after it's been hidden.
     * @param {boolean} show
     * @returns {this}
     * @example
     * controller.show();
     * controller.show( false ); // hide
     * controller.show( controller._hidden ); // toggle
     */
    show(show = true) {
      this._hidden = !show;
      this.domElement.style.display = this._hidden ? "none" : "";
      return this;
    }
    /**
     * Hides the Controller.
     * @returns {this}
     */
    hide() {
      return this.show(false);
    }
    /**
     * Changes this controller into a dropdown of options.
     *
     * Calling this method on an option controller will simply update the options. However, if this
     * controller was not already an option controller, old references to this controller are
     * destroyed, and a new controller is added to the end of the GUI.
     * @example
     * // safe usage
     *
     * gui.add( obj, 'prop1' ).options( [ 'a', 'b', 'c' ] );
     * gui.add( obj, 'prop2' ).options( { Big: 10, Small: 1 } );
     * gui.add( obj, 'prop3' );
     *
     * // danger
     *
     * const ctrl1 = gui.add( obj, 'prop1' );
     * gui.add( obj, 'prop2' );
     *
     * // calling options out of order adds a new controller to the end...
     * const ctrl2 = ctrl1.options( [ 'a', 'b', 'c' ] );
     *
     * // ...and ctrl1 now references a controller that doesn't exist
     * assert( ctrl2 !== ctrl1 )
     * @param {object|Array} options
     * @returns {Controller}
     */
    options(options) {
      const controller = this.parent.add(this.object, this.property, options);
      controller.name(this._name);
      this.destroy();
      return controller;
    }
    /**
     * Sets the minimum value. Only works on number controllers.
     * @param {number} min
     * @returns {this}
     */
    min(min) {
      return this;
    }
    /**
     * Sets the maximum value. Only works on number controllers.
     * @param {number} max
     * @returns {this}
     */
    max(max) {
      return this;
    }
    /**
     * Values set by this controller will be rounded to multiples of `step`. Only works on number
     * controllers.
     * @param {number} step
     * @returns {this}
     */
    step(step) {
      return this;
    }
    /**
     * Rounds the displayed value to a fixed number of decimals, without affecting the actual value
     * like `step()`. Only works on number controllers.
     * @example
     * gui.add( object, 'property' ).listen().decimals( 4 );
     * @param {number} decimals
     * @returns {this}
     */
    decimals(decimals) {
      return this;
    }
    /**
     * Calls `updateDisplay()` every animation frame. Pass `false` to stop listening.
     * @param {boolean} listen
     * @returns {this}
     */
    listen(listen = true) {
      this._listening = listen;
      if (this._listenCallbackID !== void 0) {
        cancelAnimationFrame(this._listenCallbackID);
        this._listenCallbackID = void 0;
      }
      if (this._listening) {
        this._listenCallback();
      }
      return this;
    }
    _listenCallback() {
      this._listenCallbackID = requestAnimationFrame(this._listenCallback);
      const curValue = this.save();
      if (curValue !== this._listenPrevValue) {
        this.updateDisplay();
      }
      this._listenPrevValue = curValue;
    }
    /**
     * Returns `object[ property ]`.
     * @returns {any}
     */
    getValue() {
      return this.object[this.property];
    }
    /**
     * Sets the value of `object[ property ]`, invokes any `onChange` handlers and updates the display.
     * @param {any} value
     * @returns {this}
     */
    setValue(value) {
      if (this.getValue() !== value) {
        this.object[this.property] = value;
        this._callOnChange();
        this.updateDisplay();
      }
      return this;
    }
    /**
     * Updates the display to keep it in sync with the current value. Useful for updating your
     * controllers when their values have been modified outside of the GUI.
     * @returns {this}
     */
    updateDisplay() {
      return this;
    }
    load(value) {
      this.setValue(value);
      this._callOnFinishChange();
      return this;
    }
    save() {
      return this.getValue();
    }
    /**
     * Destroys this controller and removes it from the parent GUI.
     */
    destroy() {
      this.listen(false);
      this.parent.children.splice(this.parent.children.indexOf(this), 1);
      this.parent.controllers.splice(this.parent.controllers.indexOf(this), 1);
      this.parent.$children.removeChild(this.domElement);
    }
  };
  var BooleanController = class extends Controller {
    constructor(parent, object, property) {
      super(parent, object, property, "lil-boolean", "label");
      this.$input = document.createElement("input");
      this.$input.setAttribute("type", "checkbox");
      this.$input.setAttribute("aria-labelledby", this.$name.id);
      this.$widget.appendChild(this.$input);
      this.$input.addEventListener("change", () => {
        this.setValue(this.$input.checked);
        this._callOnFinishChange();
      });
      this.$disable = this.$input;
      this.updateDisplay();
    }
    updateDisplay() {
      this.$input.checked = this.getValue();
      return this;
    }
  };
  function normalizeColorString(string) {
    let match, result;
    if (match = string.match(/(#|0x)?([a-f0-9]{6})/i)) {
      result = match[2];
    } else if (match = string.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/)) {
      result = parseInt(match[1]).toString(16).padStart(2, 0) + parseInt(match[2]).toString(16).padStart(2, 0) + parseInt(match[3]).toString(16).padStart(2, 0);
    } else if (match = string.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i)) {
      result = match[1] + match[1] + match[2] + match[2] + match[3] + match[3];
    }
    if (result) {
      return "#" + result;
    }
    return false;
  }
  var STRING = {
    isPrimitive: true,
    match: (v) => typeof v === "string",
    fromHexString: normalizeColorString,
    toHexString: normalizeColorString
  };
  var INT = {
    isPrimitive: true,
    match: (v) => typeof v === "number",
    fromHexString: (string) => parseInt(string.substring(1), 16),
    toHexString: (value) => "#" + value.toString(16).padStart(6, 0)
  };
  var ARRAY = {
    isPrimitive: false,
    match: (v) => Array.isArray(v) || ArrayBuffer.isView(v),
    fromHexString(string, target, rgbScale = 1) {
      const int = INT.fromHexString(string);
      target[0] = (int >> 16 & 255) / 255 * rgbScale;
      target[1] = (int >> 8 & 255) / 255 * rgbScale;
      target[2] = (int & 255) / 255 * rgbScale;
    },
    toHexString([r, g, b], rgbScale = 1) {
      rgbScale = 255 / rgbScale;
      const int = r * rgbScale << 16 ^ g * rgbScale << 8 ^ b * rgbScale << 0;
      return INT.toHexString(int);
    }
  };
  var OBJECT = {
    isPrimitive: false,
    match: (v) => Object(v) === v,
    fromHexString(string, target, rgbScale = 1) {
      const int = INT.fromHexString(string);
      target.r = (int >> 16 & 255) / 255 * rgbScale;
      target.g = (int >> 8 & 255) / 255 * rgbScale;
      target.b = (int & 255) / 255 * rgbScale;
    },
    toHexString({ r, g, b }, rgbScale = 1) {
      rgbScale = 255 / rgbScale;
      const int = r * rgbScale << 16 ^ g * rgbScale << 8 ^ b * rgbScale << 0;
      return INT.toHexString(int);
    }
  };
  var FORMATS = [STRING, INT, ARRAY, OBJECT];
  function getColorFormat(value) {
    return FORMATS.find((format) => format.match(value));
  }
  var ColorController = class extends Controller {
    constructor(parent, object, property, rgbScale) {
      super(parent, object, property, "lil-color");
      this.$input = document.createElement("input");
      this.$input.setAttribute("type", "color");
      this.$input.setAttribute("tabindex", -1);
      this.$input.setAttribute("aria-labelledby", this.$name.id);
      this.$text = document.createElement("input");
      this.$text.setAttribute("type", "text");
      this.$text.setAttribute("spellcheck", "false");
      this.$text.setAttribute("aria-labelledby", this.$name.id);
      this.$display = document.createElement("div");
      this.$display.classList.add("lil-display");
      this.$display.appendChild(this.$input);
      this.$widget.appendChild(this.$display);
      this.$widget.appendChild(this.$text);
      this._format = getColorFormat(this.initialValue);
      this._rgbScale = rgbScale;
      this._initialValueHexString = this.save();
      this._textFocused = false;
      this.$input.addEventListener("input", () => {
        this._setValueFromHexString(this.$input.value);
      });
      this.$input.addEventListener("blur", () => {
        this._callOnFinishChange();
      });
      this.$text.addEventListener("input", () => {
        const tryParse = normalizeColorString(this.$text.value);
        if (tryParse) {
          this._setValueFromHexString(tryParse);
        }
      });
      this.$text.addEventListener("focus", () => {
        this._textFocused = true;
        this.$text.select();
      });
      this.$text.addEventListener("blur", () => {
        this._textFocused = false;
        this.updateDisplay();
        this._callOnFinishChange();
      });
      this.$disable = this.$text;
      this.updateDisplay();
    }
    reset() {
      this._setValueFromHexString(this._initialValueHexString);
      return this;
    }
    _setValueFromHexString(value) {
      if (this._format.isPrimitive) {
        const newValue = this._format.fromHexString(value);
        this.setValue(newValue);
      } else {
        this._format.fromHexString(value, this.getValue(), this._rgbScale);
        this._callOnChange();
        this.updateDisplay();
      }
    }
    save() {
      return this._format.toHexString(this.getValue(), this._rgbScale);
    }
    load(value) {
      this._setValueFromHexString(value);
      this._callOnFinishChange();
      return this;
    }
    updateDisplay() {
      this.$input.value = this._format.toHexString(this.getValue(), this._rgbScale);
      if (!this._textFocused) {
        this.$text.value = this.$input.value.substring(1);
      }
      this.$display.style.backgroundColor = this.$input.value;
      return this;
    }
  };
  var FunctionController = class extends Controller {
    constructor(parent, object, property) {
      super(parent, object, property, "lil-function");
      this.$button = document.createElement("button");
      this.$button.appendChild(this.$name);
      this.$widget.appendChild(this.$button);
      this.$button.addEventListener("click", (e) => {
        e.preventDefault();
        this.getValue().call(this.object);
        this._callOnChange();
      });
      this.$button.addEventListener("touchstart", () => {
      }, { passive: true });
      this.$disable = this.$button;
    }
  };
  var NumberController = class extends Controller {
    constructor(parent, object, property, min, max, step) {
      super(parent, object, property, "lil-number");
      this._initInput();
      this.min(min);
      this.max(max);
      const stepExplicit = step !== void 0;
      this.step(stepExplicit ? step : this._getImplicitStep(), stepExplicit);
      this.updateDisplay();
    }
    decimals(decimals) {
      this._decimals = decimals;
      this.updateDisplay();
      return this;
    }
    min(min) {
      this._min = min;
      this._onUpdateMinMax();
      return this;
    }
    max(max) {
      this._max = max;
      this._onUpdateMinMax();
      return this;
    }
    step(step, explicit = true) {
      this._step = step;
      this._stepExplicit = explicit;
      return this;
    }
    updateDisplay() {
      const value = this.getValue();
      if (this._hasSlider) {
        let percent = (value - this._min) / (this._max - this._min);
        percent = Math.max(0, Math.min(percent, 1));
        this.$fill.style.width = percent * 100 + "%";
      }
      if (!this._inputFocused) {
        this.$input.value = this._decimals === void 0 ? value : value.toFixed(this._decimals);
      }
      return this;
    }
    _initInput() {
      this.$input = document.createElement("input");
      this.$input.setAttribute("type", "text");
      this.$input.setAttribute("aria-labelledby", this.$name.id);
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      if (isTouch) {
        this.$input.setAttribute("type", "number");
        this.$input.setAttribute("step", "any");
      }
      this.$widget.appendChild(this.$input);
      this.$disable = this.$input;
      const onInput = () => {
        let value = parseFloat(this.$input.value);
        if (isNaN(value)) return;
        if (this._stepExplicit) {
          value = this._snap(value);
        }
        this.setValue(this._clamp(value));
      };
      const increment = (delta) => {
        const value = parseFloat(this.$input.value);
        if (isNaN(value)) return;
        this._snapClampSetValue(value + delta);
        this.$input.value = this.getValue();
      };
      const onKeyDown = (e) => {
        if (e.key === "Enter") {
          this.$input.blur();
        }
        if (e.code === "ArrowUp") {
          e.preventDefault();
          increment(this._step * this._arrowKeyMultiplier(e));
        }
        if (e.code === "ArrowDown") {
          e.preventDefault();
          increment(this._step * this._arrowKeyMultiplier(e) * -1);
        }
      };
      const onWheel = (e) => {
        if (this._inputFocused) {
          e.preventDefault();
          increment(this._step * this._normalizeMouseWheel(e));
        }
      };
      let testingForVerticalDrag = false, initClientX, initClientY, prevClientY, initValue, dragDelta;
      const DRAG_THRESH = 5;
      const onMouseDown = (e) => {
        initClientX = e.clientX;
        initClientY = prevClientY = e.clientY;
        testingForVerticalDrag = true;
        initValue = this.getValue();
        dragDelta = 0;
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      };
      const onMouseMove = (e) => {
        if (testingForVerticalDrag) {
          const dx = e.clientX - initClientX;
          const dy = e.clientY - initClientY;
          if (Math.abs(dy) > DRAG_THRESH) {
            e.preventDefault();
            this.$input.blur();
            testingForVerticalDrag = false;
            this._setDraggingStyle(true, "vertical");
          } else if (Math.abs(dx) > DRAG_THRESH) {
            onMouseUp();
          }
        }
        if (!testingForVerticalDrag) {
          const dy = e.clientY - prevClientY;
          dragDelta -= dy * this._step * this._arrowKeyMultiplier(e);
          if (initValue + dragDelta > this._max) {
            dragDelta = this._max - initValue;
          } else if (initValue + dragDelta < this._min) {
            dragDelta = this._min - initValue;
          }
          this._snapClampSetValue(initValue + dragDelta);
        }
        prevClientY = e.clientY;
      };
      const onMouseUp = () => {
        this._setDraggingStyle(false, "vertical");
        this._callOnFinishChange();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
      const onFocus = () => {
        this._inputFocused = true;
      };
      const onBlur = () => {
        this._inputFocused = false;
        this.updateDisplay();
        this._callOnFinishChange();
      };
      this.$input.addEventListener("input", onInput);
      this.$input.addEventListener("keydown", onKeyDown);
      this.$input.addEventListener("wheel", onWheel, { passive: false });
      this.$input.addEventListener("mousedown", onMouseDown);
      this.$input.addEventListener("focus", onFocus);
      this.$input.addEventListener("blur", onBlur);
    }
    _initSlider() {
      this._hasSlider = true;
      this.$slider = document.createElement("div");
      this.$slider.classList.add("lil-slider");
      this.$fill = document.createElement("div");
      this.$fill.classList.add("lil-fill");
      this.$slider.appendChild(this.$fill);
      this.$widget.insertBefore(this.$slider, this.$input);
      this.domElement.classList.add("lil-has-slider");
      const map = (v, a, b, c, d) => {
        return (v - a) / (b - a) * (d - c) + c;
      };
      const setValueFromX = (clientX) => {
        const rect = this.$slider.getBoundingClientRect();
        let value = map(clientX, rect.left, rect.right, this._min, this._max);
        this._snapClampSetValue(value);
      };
      const mouseDown = (e) => {
        this._setDraggingStyle(true);
        setValueFromX(e.clientX);
        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseup", mouseUp);
      };
      const mouseMove = (e) => {
        setValueFromX(e.clientX);
      };
      const mouseUp = () => {
        this._callOnFinishChange();
        this._setDraggingStyle(false);
        window.removeEventListener("mousemove", mouseMove);
        window.removeEventListener("mouseup", mouseUp);
      };
      let testingForScroll = false, prevClientX, prevClientY;
      const beginTouchDrag = (e) => {
        e.preventDefault();
        this._setDraggingStyle(true);
        setValueFromX(e.touches[0].clientX);
        testingForScroll = false;
      };
      const onTouchStart = (e) => {
        if (e.touches.length > 1) return;
        if (this._hasScrollBar) {
          prevClientX = e.touches[0].clientX;
          prevClientY = e.touches[0].clientY;
          testingForScroll = true;
        } else {
          beginTouchDrag(e);
        }
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd);
      };
      const onTouchMove = (e) => {
        if (testingForScroll) {
          const dx = e.touches[0].clientX - prevClientX;
          const dy = e.touches[0].clientY - prevClientY;
          if (Math.abs(dx) > Math.abs(dy)) {
            beginTouchDrag(e);
          } else {
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
          }
        } else {
          e.preventDefault();
          setValueFromX(e.touches[0].clientX);
        }
      };
      const onTouchEnd = () => {
        this._callOnFinishChange();
        this._setDraggingStyle(false);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
      };
      const callOnFinishChange = this._callOnFinishChange.bind(this);
      const WHEEL_DEBOUNCE_TIME = 400;
      let wheelFinishChangeTimeout;
      const onWheel = (e) => {
        const isVertical = Math.abs(e.deltaX) < Math.abs(e.deltaY);
        if (isVertical && this._hasScrollBar) return;
        e.preventDefault();
        const delta = this._normalizeMouseWheel(e) * this._step;
        this._snapClampSetValue(this.getValue() + delta);
        this.$input.value = this.getValue();
        clearTimeout(wheelFinishChangeTimeout);
        wheelFinishChangeTimeout = setTimeout(callOnFinishChange, WHEEL_DEBOUNCE_TIME);
      };
      this.$slider.addEventListener("mousedown", mouseDown);
      this.$slider.addEventListener("touchstart", onTouchStart, { passive: false });
      this.$slider.addEventListener("wheel", onWheel, { passive: false });
    }
    _setDraggingStyle(active, axis = "horizontal") {
      if (this.$slider) {
        this.$slider.classList.toggle("lil-active", active);
      }
      document.body.classList.toggle("lil-dragging", active);
      document.body.classList.toggle(`lil-${axis}`, active);
    }
    _getImplicitStep() {
      if (this._hasMin && this._hasMax) {
        return (this._max - this._min) / 1e3;
      }
      return 0.1;
    }
    _onUpdateMinMax() {
      if (!this._hasSlider && this._hasMin && this._hasMax) {
        if (!this._stepExplicit) {
          this.step(this._getImplicitStep(), false);
        }
        this._initSlider();
        this.updateDisplay();
      }
    }
    _normalizeMouseWheel(e) {
      let { deltaX, deltaY } = e;
      if (Math.floor(e.deltaY) !== e.deltaY && e.wheelDelta) {
        deltaX = 0;
        deltaY = -e.wheelDelta / 120;
        deltaY *= this._stepExplicit ? 1 : 10;
      }
      const wheel = deltaX + -deltaY;
      return wheel;
    }
    _arrowKeyMultiplier(e) {
      let mult = this._stepExplicit ? 1 : 10;
      if (e.shiftKey) {
        mult *= 10;
      } else if (e.altKey) {
        mult /= 10;
      }
      return mult;
    }
    _snap(value) {
      let offset = 0;
      if (this._hasMin) {
        offset = this._min;
      } else if (this._hasMax) {
        offset = this._max;
      }
      value -= offset;
      value = Math.round(value / this._step) * this._step;
      value += offset;
      value = parseFloat(value.toPrecision(15));
      return value;
    }
    _clamp(value) {
      if (value < this._min) value = this._min;
      if (value > this._max) value = this._max;
      return value;
    }
    _snapClampSetValue(value) {
      this.setValue(this._clamp(this._snap(value)));
    }
    get _hasScrollBar() {
      const root = this.parent.root.$children;
      return root.scrollHeight > root.clientHeight;
    }
    get _hasMin() {
      return this._min !== void 0;
    }
    get _hasMax() {
      return this._max !== void 0;
    }
  };
  var OptionController = class extends Controller {
    constructor(parent, object, property, options) {
      super(parent, object, property, "lil-option");
      this.$select = document.createElement("select");
      this.$select.setAttribute("aria-labelledby", this.$name.id);
      this.$display = document.createElement("div");
      this.$display.classList.add("lil-display");
      this.$select.addEventListener("change", () => {
        this.setValue(this._values[this.$select.selectedIndex]);
        this._callOnFinishChange();
      });
      this.$select.addEventListener("focus", () => {
        this.$display.classList.add("lil-focus");
      });
      this.$select.addEventListener("blur", () => {
        this.$display.classList.remove("lil-focus");
      });
      this.$widget.appendChild(this.$select);
      this.$widget.appendChild(this.$display);
      this.$disable = this.$select;
      this.options(options);
    }
    options(options) {
      this._values = Array.isArray(options) ? options : Object.values(options);
      this._names = Array.isArray(options) ? options : Object.keys(options);
      this.$select.replaceChildren();
      this._names.forEach((name) => {
        const $option = document.createElement("option");
        $option.textContent = name;
        this.$select.appendChild($option);
      });
      this.updateDisplay();
      return this;
    }
    updateDisplay() {
      const value = this.getValue();
      const index = this._values.indexOf(value);
      this.$select.selectedIndex = index;
      this.$display.textContent = index === -1 ? value : this._names[index];
      return this;
    }
  };
  var StringController = class extends Controller {
    constructor(parent, object, property) {
      super(parent, object, property, "lil-string");
      this.$input = document.createElement("input");
      this.$input.setAttribute("type", "text");
      this.$input.setAttribute("spellcheck", "false");
      this.$input.setAttribute("aria-labelledby", this.$name.id);
      this.$input.addEventListener("input", () => {
        this.setValue(this.$input.value);
      });
      this.$input.addEventListener("keydown", (e) => {
        if (e.code === "Enter") {
          this.$input.blur();
        }
      });
      this.$input.addEventListener("blur", () => {
        this._callOnFinishChange();
      });
      this.$widget.appendChild(this.$input);
      this.$disable = this.$input;
      this.updateDisplay();
    }
    updateDisplay() {
      this.$input.value = this.getValue();
      return this;
    }
  };
  var stylesheet = `.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.lil-root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.lil-root > .lil-children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.lil-allow-touch-styles, .lil-gui.lil-allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.lil-force-touch-styles, .lil-gui.lil-force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.lil-auto-place, .lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-controller.lil-disabled {
  opacity: 0.5;
}
.lil-controller.lil-disabled, .lil-controller.lil-disabled * {
  pointer-events: none !important;
}
.lil-controller > .lil-name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-controller .lil-widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-controller.lil-string input {
  color: var(--string-color);
}
.lil-controller.lil-boolean {
  cursor: pointer;
}
.lil-controller.lil-color .lil-display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-controller.lil-color .lil-display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-controller.lil-color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-controller.lil-color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-controller.lil-option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-controller.lil-option .lil-display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-display.lil-focus {
    background: var(--focus-color);
  }
}
.lil-controller.lil-option .lil-display.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-option .lil-display:after {
  font-family: "lil-gui";
  content: "\u2195";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-controller.lil-option .lil-widget,
.lil-controller.lil-option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-widget:hover .lil-display {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number input {
  color: var(--number-color);
}
.lil-controller.lil-number.lil-has-slider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-controller.lil-number .lil-slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-controller.lil-number .lil-slider:hover {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number .lil-slider.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-number .lil-slider.lil-active .lil-fill {
  opacity: 0.95;
}
.lil-controller.lil-number .lil-fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-dragging * {
  cursor: ew-resize !important;
}
.lil-dragging.lil-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .lil-title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  width: 100%;
  text-align: left;
  background: none;
  text-decoration-skip: objects;
}
.lil-gui .lil-title:before {
  font-family: "lil-gui";
  content: "\u25BE";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .lil-title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-dragging) .lil-gui .lil-title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .lil-title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.lil-root > .lil-title:focus {
  text-decoration: none !important;
}
.lil-gui.lil-closed > .lil-title:before {
  content: "\u25B8";
}
.lil-gui.lil-closed > .lil-children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.lil-closed:not(.lil-transition) > .lil-children {
  display: none;
}
.lil-gui.lil-transition > .lil-children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .lil-children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.lil-root > .lil-children > .lil-gui > .lil-title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.lil-root > .lil-children > .lil-gui.lil-closed > .lil-title {
  border-bottom-color: transparent;
}
.lil-gui + .lil-controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .lil-title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .lil-children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .lil-controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "\u2713";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  border: none;
}
.lil-gui .lil-controller button {
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
}
@media (hover: hover) {
  .lil-gui .lil-controller button:hover {
    background: var(--hover-color);
  }
  .lil-gui .lil-controller button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui .lil-controller button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff2;charset=utf-8;base64,d09GMgABAAAAAALkAAsAAAAABtQAAAKVAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqBBIEbATYCJAMUCwwABCAFhAoHgQQbHAbIDiUFEYVARAAAYQTVWNmz9MxhEgodq49wYRUFKE8GWNiUBxI2LBRaVnc51U83Gmhs0Q7JXWMiz5eteLwrKwuxHO8VFxUX9UpZBs6pa5ABRwHA+t3UxUnH20EvVknRerzQgX6xC/GH6ZUvTcAjAv122dF28OTqCXrPuyaDER30YBA1xnkVutDDo4oCi71Ca7rrV9xS8dZHbPHefsuwIyCpmT7j+MnjAH5X3984UZoFFuJ0yiZ4XEJFxjagEBeqs+e1iyK8Xf/nOuwF+vVK0ur765+vf7txotUi0m3N0m/84RGSrBCNrh8Ee5GjODjF4gnWP+dJrH/Lk9k4oT6d+gr6g/wssA2j64JJGP6cmx554vUZnpZfn6ZfX2bMwPPrlANsB86/DiHjhl0OP+c87+gaJo/gY084s3HoYL/ZkWHTRfBXvvoHnnkHvngKun4KBE/ede7tvq3/vQOxDXB1/fdNz6XbPdcr0Vhpojj9dG+owuSKFsslCi1tgEjirjXdwMiov2EioadxmqTHUCIwo8NgQaeIasAi0fTYSPTbSmwbMOFduyh9wvBrESGY0MtgRjtgQR8Q1bRPohn2UoCRZf9wyYANMXFeJTysqAe0I4mrherOekFdKMrYvJjLvOIUM9SuwYB5DVZUwwVjJJOaUnZCmcEkIZZrKqNvRGRMvmFZsmhP4VMKCSXBhSqUBxgMS7h0cZvEd71AWkEhGWaeMFcNnpqyJkyXgYL7PQ1MoSq0wDAkRtJIijkZSmqYTiSImfLiSWXIZwhRh3Rug2X0kk1Dgj+Iu43u5p98ghopcpSo0Uyc8SnjlYX59WUeaMoDqmVD2TOWD9a4pCRAzf2ECgwGcrHjPOWY9bNxq/OL3I/QjwEAAAA=") format("woff2");
}`;
  function _injectStyles(cssContent) {
    const injected = document.createElement("style");
    injected.innerHTML = cssContent;
    const before = document.querySelector("head link[rel=stylesheet], head style");
    if (before) {
      document.head.insertBefore(injected, before);
    } else {
      document.head.appendChild(injected);
    }
  }
  var stylesInjected = false;
  var GUI = class _GUI {
    /**
     * Creates a panel that holds controllers.
     * @example
     * new GUI();
     * new GUI( { container: document.getElementById( 'custom' ) } );
     *
     * @param {object} [options]
     * @param {boolean} [options.autoPlace=true]
     * Adds the GUI to `document.body` and fixes it to the top right of the page.
     *
     * @param {Node} [options.container]
     * Adds the GUI to this DOM element. Overrides `autoPlace`.
     *
     * @param {number} [options.width=245]
     * Width of the GUI in pixels, usually set when name labels become too long. Note that you can make
     * name labels wider in CSS with `.lil‑gui { ‑‑name‑width: 55% }`.
     *
     * @param {string} [options.title=Controls]
     * Name to display in the title bar.
     *
     * @param {boolean} [options.closeFolders=false]
     * Pass `true` to close all folders in this GUI by default.
     *
     * @param {boolean} [options.injectStyles=true]
     * Injects the default stylesheet into the page if this is the first GUI.
     * Pass `false` to use your own stylesheet.
     *
     * @param {number} [options.touchStyles=true]
     * Makes controllers larger on touch devices. Pass `false` to disable touch styles.
     *
     * @param {GUI} [options.parent]
     * Adds this GUI as a child in another GUI. Usually this is done for you by `addFolder()`.
     */
    constructor({
      parent,
      autoPlace = parent === void 0,
      container,
      width,
      title = "Controls",
      closeFolders = false,
      injectStyles = true,
      touchStyles = true
    } = {}) {
      this.parent = parent;
      this.root = parent ? parent.root : this;
      this.children = [];
      this.controllers = [];
      this.folders = [];
      this._closed = false;
      this._hidden = false;
      this.domElement = document.createElement("div");
      this.domElement.classList.add("lil-gui");
      this.$title = document.createElement("button");
      this.$title.classList.add("lil-title");
      this.$title.setAttribute("aria-expanded", true);
      this.$title.addEventListener("click", () => this.openAnimated(this._closed));
      this.$title.addEventListener("touchstart", () => {
      }, { passive: true });
      this.$children = document.createElement("div");
      this.$children.classList.add("lil-children");
      this.domElement.appendChild(this.$title);
      this.domElement.appendChild(this.$children);
      this.title(title);
      if (this.parent) {
        this.parent.children.push(this);
        this.parent.folders.push(this);
        this.parent.$children.appendChild(this.domElement);
        return;
      }
      this.domElement.classList.add("lil-root");
      if (touchStyles) {
        this.domElement.classList.add("lil-allow-touch-styles");
      }
      if (!stylesInjected && injectStyles) {
        _injectStyles(stylesheet);
        stylesInjected = true;
      }
      if (container) {
        container.appendChild(this.domElement);
      } else if (autoPlace) {
        this.domElement.classList.add("lil-auto-place", "autoPlace");
        document.body.appendChild(this.domElement);
      }
      if (width) {
        this.domElement.style.setProperty("--width", width + "px");
      }
      this._closeFolders = closeFolders;
    }
    /**
     * Adds a controller to the GUI, inferring controller type using the `typeof` operator.
     * @example
     * gui.add( object, 'property' );
     * gui.add( object, 'number', 0, 100, 1 );
     * gui.add( object, 'options', [ 1, 2, 3 ] );
     *
     * @param {object} object The object the controller will modify.
     * @param {string} property Name of the property to control.
     * @param {number|object|Array} [$1] Minimum value for number controllers, or the set of
     * selectable values for a dropdown.
     * @param {number} [max] Maximum value for number controllers.
     * @param {number} [step] Step value for number controllers.
     * @returns {Controller}
     */
    add(object, property, $1, max, step) {
      if (Object($1) === $1) {
        return new OptionController(this, object, property, $1);
      }
      const initialValue = object[property];
      switch (typeof initialValue) {
        case "number":
          return new NumberController(this, object, property, $1, max, step);
        case "boolean":
          return new BooleanController(this, object, property);
        case "string":
          return new StringController(this, object, property);
        case "function":
          return new FunctionController(this, object, property);
      }
      console.error(`gui.add failed
	property:`, property, `
	object:`, object, `
	value:`, initialValue);
    }
    /**
     * Adds a color controller to the GUI.
     * @example
     * params = {
     * 	cssColor: '#ff00ff',
     * 	rgbColor: { r: 0, g: 0.2, b: 0.4 },
     * 	customRange: [ 0, 127, 255 ],
     * };
     *
     * gui.addColor( params, 'cssColor' );
     * gui.addColor( params, 'rgbColor' );
     * gui.addColor( params, 'customRange', 255 );
     *
     * @param {object} object The object the controller will modify.
     * @param {string} property Name of the property to control.
     * @param {number} rgbScale Maximum value for a color channel when using an RGB color. You may
     * need to set this to 255 if your colors are too bright.
     * @returns {Controller}
     */
    addColor(object, property, rgbScale = 1) {
      return new ColorController(this, object, property, rgbScale);
    }
    /**
     * Adds a folder to the GUI, which is just another GUI. This method returns
     * the nested GUI so you can add controllers to it.
     * @example
     * const folder = gui.addFolder( 'Position' );
     * folder.add( position, 'x' );
     * folder.add( position, 'y' );
     * folder.add( position, 'z' );
     *
     * @param {string} title Name to display in the folder's title bar.
     * @returns {GUI}
     */
    addFolder(title) {
      const folder = new _GUI({ parent: this, title });
      if (this.root._closeFolders) folder.close();
      return folder;
    }
    /**
     * Recalls values that were saved with `gui.save()`.
     * @param {object} obj
     * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
     * @returns {this}
     */
    load(obj, recursive = true) {
      if (obj.controllers) {
        this.controllers.forEach((c) => {
          if (c instanceof FunctionController) return;
          if (c._name in obj.controllers) {
            c.load(obj.controllers[c._name]);
          }
        });
      }
      if (recursive && obj.folders) {
        this.folders.forEach((f) => {
          if (f._title in obj.folders) {
            f.load(obj.folders[f._title]);
          }
        });
      }
      return this;
    }
    /**
     * Returns an object mapping controller names to values. The object can be passed to `gui.load()` to
     * recall these values.
     * @example
     * {
     * 	controllers: {
     * 		prop1: 1,
     * 		prop2: 'value',
     * 		...
     * 	},
     * 	folders: {
     * 		folderName1: { controllers, folders },
     * 		folderName2: { controllers, folders }
     * 		...
     * 	}
     * }
     *
     * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
     * @returns {object}
     */
    save(recursive = true) {
      const obj = {
        controllers: {},
        folders: {}
      };
      this.controllers.forEach((c) => {
        if (c instanceof FunctionController) return;
        if (c._name in obj.controllers) {
          throw new Error(`Cannot save GUI with duplicate property "${c._name}"`);
        }
        obj.controllers[c._name] = c.save();
      });
      if (recursive) {
        this.folders.forEach((f) => {
          if (f._title in obj.folders) {
            throw new Error(`Cannot save GUI with duplicate folder "${f._title}"`);
          }
          obj.folders[f._title] = f.save();
        });
      }
      return obj;
    }
    /**
     * Opens a GUI or folder. GUI and folders are open by default.
     * @param {boolean} open Pass false to close.
     * @returns {this}
     * @example
     * gui.open(); // open
     * gui.open( false ); // close
     * gui.open( gui._closed ); // toggle
     */
    open(open = true) {
      this._setClosed(!open);
      this.$title.setAttribute("aria-expanded", !this._closed);
      this.domElement.classList.toggle("lil-closed", this._closed);
      return this;
    }
    /**
     * Closes the GUI.
     * @returns {this}
     */
    close() {
      return this.open(false);
    }
    _setClosed(closed) {
      if (this._closed === closed) return;
      this._closed = closed;
      this._callOnOpenClose(this);
    }
    /**
     * Shows the GUI after it's been hidden.
     * @param {boolean} show
     * @returns {this}
     * @example
     * gui.show();
     * gui.show( false ); // hide
     * gui.show( gui._hidden ); // toggle
     */
    show(show = true) {
      this._hidden = !show;
      this.domElement.style.display = this._hidden ? "none" : "";
      return this;
    }
    /**
     * Hides the GUI.
     * @returns {this}
     */
    hide() {
      return this.show(false);
    }
    openAnimated(open = true) {
      this._setClosed(!open);
      this.$title.setAttribute("aria-expanded", !this._closed);
      requestAnimationFrame(() => {
        const initialHeight = this.$children.clientHeight;
        this.$children.style.height = initialHeight + "px";
        this.domElement.classList.add("lil-transition");
        const onTransitionEnd = (e) => {
          if (e.target !== this.$children) return;
          this.$children.style.height = "";
          this.domElement.classList.remove("lil-transition");
          this.$children.removeEventListener("transitionend", onTransitionEnd);
        };
        this.$children.addEventListener("transitionend", onTransitionEnd);
        const targetHeight = !open ? 0 : this.$children.scrollHeight;
        this.domElement.classList.toggle("lil-closed", !open);
        requestAnimationFrame(() => {
          this.$children.style.height = targetHeight + "px";
        });
      });
      return this;
    }
    /**
     * Change the title of this GUI.
     * @param {string} title
     * @returns {this}
     */
    title(title) {
      this._title = title;
      this.$title.textContent = title;
      return this;
    }
    /**
     * Resets all controllers to their initial values.
     * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
     * @returns {this}
     */
    reset(recursive = true) {
      const controllers = recursive ? this.controllersRecursive() : this.controllers;
      controllers.forEach((c) => c.reset());
      return this;
    }
    /**
     * Pass a function to be called whenever a controller in this GUI changes.
     * @param {function({object:object, property:string, value:any, controller:Controller})} callback
     * @returns {this}
     * @example
     * gui.onChange( event => {
     * 	event.object     // object that was modified
     * 	event.property   // string, name of property
     * 	event.value      // new value of controller
     * 	event.controller // controller that was modified
     * } );
     */
    onChange(callback) {
      this._onChange = callback;
      return this;
    }
    _callOnChange(controller) {
      if (this.parent) {
        this.parent._callOnChange(controller);
      }
      if (this._onChange !== void 0) {
        this._onChange.call(this, {
          object: controller.object,
          property: controller.property,
          value: controller.getValue(),
          controller
        });
      }
    }
    /**
     * Pass a function to be called whenever a controller in this GUI has finished changing.
     * @param {function({object:object, property:string, value:any, controller:Controller})} callback
     * @returns {this}
     * @example
     * gui.onFinishChange( event => {
     * 	event.object     // object that was modified
     * 	event.property   // string, name of property
     * 	event.value      // new value of controller
     * 	event.controller // controller that was modified
     * } );
     */
    onFinishChange(callback) {
      this._onFinishChange = callback;
      return this;
    }
    _callOnFinishChange(controller) {
      if (this.parent) {
        this.parent._callOnFinishChange(controller);
      }
      if (this._onFinishChange !== void 0) {
        this._onFinishChange.call(this, {
          object: controller.object,
          property: controller.property,
          value: controller.getValue(),
          controller
        });
      }
    }
    /**
     * Pass a function to be called when this GUI or its descendants are opened or closed.
     * @param {function(GUI)} callback
     * @returns {this}
     * @example
     * gui.onOpenClose( changedGUI => {
     * 	console.log( changedGUI._closed );
     * } );
     */
    onOpenClose(callback) {
      this._onOpenClose = callback;
      return this;
    }
    _callOnOpenClose(changedGUI) {
      if (this.parent) {
        this.parent._callOnOpenClose(changedGUI);
      }
      if (this._onOpenClose !== void 0) {
        this._onOpenClose.call(this, changedGUI);
      }
    }
    /**
     * Destroys all DOM elements and event listeners associated with this GUI.
     */
    destroy() {
      if (this.parent) {
        this.parent.children.splice(this.parent.children.indexOf(this), 1);
        this.parent.folders.splice(this.parent.folders.indexOf(this), 1);
      }
      if (this.domElement.parentElement) {
        this.domElement.parentElement.removeChild(this.domElement);
      }
      Array.from(this.children).forEach((c) => c.destroy());
    }
    /**
     * Returns an array of controllers contained by this GUI and its descendents.
     * @returns {Controller[]}
     */
    controllersRecursive() {
      let controllers = Array.from(this.controllers);
      this.folders.forEach((f) => {
        controllers = controllers.concat(f.controllersRecursive());
      });
      return controllers;
    }
    /**
     * Returns an array of folders contained by this GUI and its descendents.
     * @returns {GUI[]}
     */
    foldersRecursive() {
      let folders = Array.from(this.folders);
      this.folders.forEach((f) => {
        folders = folders.concat(f.foldersRecursive());
      });
      return folders;
    }
  };

  // src/canvas.ts
  var Canvas = class {
    resolutionWidth;
    resolutionHeight;
    displayWidth;
    displayHeight;
    imageData;
    framebuffer;
    framebufferCtx;
    container;
    onClick;
    constructor(resW, resH, displayW, displayH, left = 0, top = 0, options) {
      this.resolutionWidth = resW;
      this.resolutionHeight = resH;
      this.displayWidth = displayW;
      this.displayHeight = displayH;
      const container = document.createElement("div");
      if (options?.parent) {
        container.style.position = "absolute";
        container.style.left = "0";
        container.style.top = "0";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.pointerEvents = "none";
      } else {
        container.style.position = "absolute";
        container.style.left = `${left}px`;
        container.style.top = `${top}px`;
        container.style.width = `${displayW}px`;
        container.style.height = `${displayH}px`;
      }
      this.container = container;
      const mountTarget = options?.parent ?? document.getElementById("canvasSpace");
      mountTarget?.appendChild(container);
      this.framebuffer = document.createElement("canvas");
      this.framebuffer.width = resW;
      this.framebuffer.height = resH;
      this.framebuffer.style.width = `${displayW}px`;
      this.framebuffer.style.height = `${displayH}px`;
      this.framebuffer.style.position = "absolute";
      this.framebuffer.style.left = "0";
      this.framebuffer.style.top = "0";
      this.framebuffer.style.imageRendering = "pixelated";
      if (options?.zIndex !== void 0) {
        this.framebuffer.style.zIndex = String(options.zIndex);
      }
      if (options?.overlay) {
        this.framebuffer.style.pointerEvents = "none";
      }
      container.appendChild(this.framebuffer);
      this.framebufferCtx = this.framebuffer.getContext("2d");
      this.framebufferCtx.imageSmoothingEnabled = false;
      this.imageData = this.framebufferCtx.createImageData(resW, resH);
      if (!options?.overlay) {
        this.framebuffer.addEventListener("click", (e) => {
          const rect = this.framebuffer.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const pixelX = Math.floor(
            mouseX * this.resolutionWidth / rect.width
          );
          const pixelY = Math.floor(
            mouseY * this.resolutionHeight / rect.height
          );
          this.onClick?.(pixelX, pixelY);
        });
      }
    }
    setPixel(x, y, col) {
      if (x < 0 || x >= this.resolutionWidth || y < 0 || y >= this.resolutionHeight)
        return;
      const i = (y * this.resolutionWidth + x) * 4;
      this.imageData.data[i + 0] = col.r;
      this.imageData.data[i + 1] = col.g;
      this.imageData.data[i + 2] = col.b;
      this.imageData.data[i + 3] = col.a;
    }
    getPixel(x, y) {
      x = Math.max(0, Math.min(x, this.resolutionWidth - 1));
      y = Math.max(0, Math.min(y, this.resolutionHeight - 1));
      const i = (y * this.resolutionWidth + x) * 4;
      return {
        r: this.imageData.data[i + 0],
        g: this.imageData.data[i + 1],
        b: this.imageData.data[i + 2],
        a: this.imageData.data[i + 3]
      };
    }
    ResizeResolution(res) {
      this.resolutionWidth = res;
      this.resolutionHeight = res;
      this.framebuffer.width = res;
      this.framebuffer.height = res;
      this.framebufferCtx = this.framebuffer.getContext("2d");
      this.framebufferCtx.imageSmoothingEnabled = false;
      this.imageData = this.framebufferCtx.createImageData(res, res);
    }
    clear(col) {
      for (let i = 0; i < this.resolutionWidth * this.resolutionHeight; i++) {
        this.imageData.data[i * 4 + 0] = col.r;
        this.imageData.data[i * 4 + 1] = col.g;
        this.imageData.data[i * 4 + 2] = col.b;
        this.imageData.data[i * 4 + 3] = col.a;
      }
    }
    Render() {
      this.framebufferCtx.putImageData(this.imageData, 0, 0);
    }
    destroy() {
      this.container.remove();
    }
  };

  // src/math.ts
  var Vec2 = class _Vec2 {
    x;
    y;
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    Add(vec) {
      return new _Vec2(this.x + vec.x, this.y + vec.y);
    }
    Dot(vec) {
      return this.x * vec.x + this.y * vec.y;
    }
    Cross(vec) {
      return new _Vec2(this.x * vec.y, this.y * vec.x);
    }
  };
  function Edge(a, b, p) {
    return (p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x);
  }

  // src/footprint.ts
  var ANISO_LEVELS = [1, 2, 4, 8, 16, 32];
  function snapSampleCount(ratio, maxAnisotropy) {
    const effective = Math.min(Math.max(ratio, 1), maxAnisotropy);
    let count = 1;
    for (const level of ANISO_LEVELS) {
      if (level <= effective) count = level;
      else break;
    }
    return count;
  }
  function computeFootprint(step, texWidth, texHeight, mipCount, maxAnisotropy = 16) {
    const dx = { u: step.dudx, v: step.dvdx };
    const dy = { u: step.dudy, v: step.dvdy };
    const dudxT = step.dudx * texWidth;
    const dvdxT = step.dvdx * texHeight;
    const dudyT = step.dudy * texWidth;
    const dvdyT = step.dvdy * texHeight;
    const footprintWidth = Math.sqrt(dudxT ** 2 + dvdxT ** 2);
    const footprintHeight = Math.sqrt(dudyT ** 2 + dvdyT ** 2);
    const majorAxisLength = Math.max(footprintWidth, footprintHeight);
    const minorAxisLength = Math.max(
      Math.min(footprintWidth, footprintHeight),
      1e-6
    );
    const anisotropyRatio = majorAxisLength / minorAxisLength;
    const computedLOD = Math.log2(Math.max(majorAxisLength, 1e-6));
    const selectedMip = Math.max(
      0,
      Math.min(Math.round(computedLOD), mipCount - 1)
    );
    const majorIsX = footprintWidth >= footprintHeight;
    const majorLen = majorAxisLength;
    const minorLen = Math.max(
      majorIsX ? footprintHeight : footprintWidth,
      1e-6
    );
    const majorAxisDirTex = {
      x: (majorIsX ? dudxT : dudyT) / majorLen,
      y: (majorIsX ? dvdxT : dvdyT) / majorLen
    };
    const minorAxisDirTex = {
      x: (majorIsX ? dudyT : dudxT) / minorLen,
      y: (majorIsX ? dvdyT : dvdxT) / minorLen
    };
    return {
      dx,
      dy,
      footprintWidth,
      footprintHeight,
      majorAxisLength,
      minorAxisLength,
      anisotropyRatio,
      computedLOD,
      selectedMip,
      majorIsX,
      majorAxisDirTex,
      minorAxisDirTex,
      sampleCount: snapSampleCount(anisotropyRatio, maxAnisotropy)
    };
  }
  function computeMipLOD(step, texWidth, texHeight) {
    const lenX = Math.sqrt((step.dudx * texWidth) ** 2 + (step.dvdx * texHeight) ** 2);
    const lenY = Math.sqrt((step.dudy * texWidth) ** 2 + (step.dvdy * texHeight) ** 2);
    return Math.log2(Math.max(Math.max(lenX, lenY), 1e-6));
  }
  function computeMipLevel(step, texWidth, texHeight, mipCount) {
    const lod = computeMipLOD(step, texWidth, texHeight);
    return Math.max(0, Math.min(Math.round(lod), mipCount - 1));
  }
  function computeAnisoMipLevel(step, texWidth, texHeight, mipCount) {
    const fp = computeFootprint(step, texWidth, texHeight, mipCount);
    const lod = Math.log2(Math.max(fp.minorAxisLength, 1e-6));
    return Math.max(0, Math.min(Math.floor(lod), mipCount - 1));
  }

  // src/color.ts
  var Black = { r: 0, g: 0, b: 0, a: 255 };
  var Yellow = { r: 255, g: 255, b: 0, a: 255 };
  var Cyan = { r: 0, g: 255, b: 255, a: 255 };
  var Magenta = { r: 255, g: 0, b: 255, a: 255 };
  var Transparent = { r: 0, g: 0, b: 0, a: 0 };
  function Lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function LerpColor(a, b, t) {
    return {
      r: Lerp(a.r, b.r, t),
      g: Lerp(a.g, b.g, t),
      b: Lerp(a.b, b.b, t),
      a: Lerp(a.a, b.a, t)
    };
  }

  // src/visualizations.ts
  var MIP_COLORS = [
    { r: 255, g: 0, b: 0, a: 200 },
    { r: 255, g: 128, b: 0, a: 200 },
    { r: 255, g: 255, b: 0, a: 200 },
    { r: 0, g: 255, b: 0, a: 200 },
    { r: 0, g: 255, b: 255, a: 200 },
    { r: 0, g: 128, b: 255, a: 200 },
    { r: 128, g: 0, b: 255, a: 200 },
    { r: 255, g: 0, b: 255, a: 200 },
    { r: 255, g: 128, b: 128, a: 200 },
    { r: 128, g: 128, b: 255, a: 200 }
  ];
  function mipColor(level) {
    return MIP_COLORS[level % MIP_COLORS.length];
  }
  function clampTexel(v, max) {
    return Math.max(0, Math.min(v, max - 1));
  }
  function setTexel2x2(canvas, tx, ty, color) {
    canvas.setPixel(tx, ty, color);
    canvas.setPixel(tx + 1, ty, color);
    canvas.setPixel(tx, ty + 1, color);
    canvas.setPixel(tx + 1, ty + 1, color);
  }
  function paintHeatmap(overlay, steps, tw, th, levelCount) {
    for (const step of steps) {
      const level = computeMipLevel(step, tw, th, levelCount);
      overlay.setPixel(step.x, step.y, mipColor(level));
    }
  }
  function paintCursor(step, ctx, tw, th, levelCount) {
    ctx.triangleOverlay.setPixel(step.x, step.y, Yellow);
    const lod = computeMipLevel(step, tw, th, levelCount);
    const overlay = ctx.mipOverlays[lod];
    if (!overlay) return;
    const mip = overlay.mipHighlight;
    const mipCanvas = overlay.selectedTexel;
    const tx = clampTexel(Math.floor(step.u * mipCanvas.resolutionWidth), mipCanvas.resolutionWidth);
    const ty = clampTexel(Math.floor(step.v * mipCanvas.resolutionHeight), mipCanvas.resolutionHeight);
    setTexel2x2(overlay.mipHighlight, tx, ty, Cyan);
  }
  function paintSelected(step, state, ctx) {
    const { texture, settings } = state;
    ctx.triangleOverlay.setPixel(step.x, step.y, Magenta);
    const fp = computeFootprint(
      step,
      texture.width,
      texture.height,
      texture.levelCount,
      settings.anisotropyLevel
    );
    const overlay = ctx.mipOverlays[fp.selectedMip];
    if (!overlay) return;
    const mipW = overlay.selectedTexel.resolutionWidth;
    const mipH = overlay.selectedTexel.resolutionHeight;
    const tx = clampTexel(Math.floor(step.u * mipW), mipW);
    const ty = clampTexel(Math.floor(step.v * mipH), mipH);
    setTexel2x2(overlay.selectedTexel, tx, ty, Magenta);
    const cx = step.u * mipW;
    const cy = step.v * mipH;
    const halfMajor = fp.majorAxisLength * 0.5;
    const halfMinor = fp.minorAxisLength * 0.5;
    for (let y = 0; y < mipH; y++) {
      for (let x = 0; x < mipW; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const major = dx * fp.majorAxisDirTex.x + dy * fp.majorAxisDirTex.y;
        const minor = dx * fp.minorAxisDirTex.x + dy * fp.minorAxisDirTex.y;
        if (Math.abs(major) <= halfMajor && Math.abs(minor) <= halfMinor) {
          overlay.footprint.setPixel(x, y, Magenta);
        }
      }
    }
  }
  function flushOverlays(ctx) {
    ctx.triangleOverlay.Render();
    ctx.textureOverlay?.Render();
    for (const overlays of ctx.mipOverlays) {
      overlays.selectedTexel.Render();
      overlays.footprint.Render();
      overlays.mipHighlight.Render();
    }
  }
  function renderVisualization(state, ctx) {
    const { stepper, texture, debugger: dbg, settings } = state;
    const { visualizationMode: mode } = settings;
    const tw = texture.width;
    const th = texture.height;
    ctx.triangleOverlay.clear(Transparent);
    ctx.textureOverlay?.clear(Transparent);
    for (const overlays of ctx.mipOverlays) {
      overlays.selectedTexel.clear(Transparent);
      overlays.footprint.clear(Transparent);
      overlays.mipHighlight.clear(Transparent);
    }
    switch (mode) {
      case "lod_heatmap":
        paintHeatmap(ctx.triangleOverlay, stepper.steps, tw, th, texture.levelCount);
        break;
      case "none":
      default:
        break;
    }
    const cursor = stepper.currentStep();
    if (cursor) {
      paintCursor(cursor, ctx, tw, th, texture.levelCount);
    }
    if (dbg.selectedStep) {
      paintSelected(dbg.selectedStep, state, ctx);
    }
    flushOverlays(ctx);
  }

  // src/debugger.ts
  var Debugger = class {
    selectedStep = null;
    inspector = {
      screenX: 0,
      screenY: 0,
      lambda1: 0,
      lambda2: 0,
      lambda3: 0,
      u: 0,
      v: 0,
      dudx: 0,
      dvdx: 0,
      dudy: 0,
      dvdy: 0,
      footprintWidth: 0,
      footprintHeight: 0,
      majorAxisLength: 0,
      minorAxisLength: 0,
      anisotropyRatio: 0,
      computedLOD: 0,
      selectedMip: 0,
      sampleCount: 0,
      finalColorR: 0,
      finalColorG: 0,
      finalColorB: 0
    };
    triangleOverlay = null;
    textureOverlay = null;
    mipOverlays = [];
    attachTriangleOverlay(triangleCanvas) {
      this.triangleOverlay?.destroy();
      this.triangleOverlay = new Canvas(
        triangleCanvas.resolutionWidth,
        triangleCanvas.resolutionHeight,
        triangleCanvas.displayWidth,
        triangleCanvas.displayHeight,
        0,
        0,
        { overlay: true, zIndex: 1, parent: triangleCanvas.container }
      );
    }
    attachTextureOverlay(texture) {
      this.textureOverlay?.destroy();
      const base = texture.baseCanvas;
      this.textureOverlay = new Canvas(
        base.resolutionWidth,
        base.resolutionHeight,
        base.displayWidth,
        base.displayHeight,
        0,
        0,
        { overlay: true, zIndex: 4, parent: base.container }
      );
    }
    attachMipOverlays(texture) {
      this.destroyMipOverlays();
      for (const mip of texture.mipLevels) {
        this.mipOverlays.push({
          selectedTexel: new Canvas(
            mip.resolutionWidth,
            mip.resolutionHeight,
            mip.displayWidth,
            mip.displayHeight,
            0,
            0,
            { overlay: true, zIndex: 1, parent: mip.container }
          ),
          footprint: new Canvas(
            mip.resolutionWidth,
            mip.resolutionHeight,
            mip.displayWidth,
            mip.displayHeight,
            0,
            0,
            { overlay: true, zIndex: 2, parent: mip.container }
          ),
          mipHighlight: new Canvas(
            mip.resolutionWidth,
            mip.resolutionHeight,
            mip.displayWidth,
            mip.displayHeight,
            0,
            0,
            { overlay: true, zIndex: 3, parent: mip.container }
          )
        });
      }
    }
    destroyMipOverlays() {
      for (const overlays of this.mipOverlays) {
        overlays.selectedTexel.destroy();
        overlays.footprint.destroy();
        overlays.mipHighlight.destroy();
      }
      this.mipOverlays = [];
    }
    updateInspector(step, state) {
      const fp = computeFootprint(
        step,
        state.texture.width,
        state.texture.height,
        state.texture.levelCount,
        state.settings.anisotropyLevel
      );
      const color = state.sampler.sample(
        step.u,
        step.v,
        step.dudx,
        step.dvdx,
        step.dudy,
        step.dvdy
      );
      Object.assign(this.inspector, {
        screenX: step.x,
        screenY: step.y,
        lambda1: step.lambda1,
        lambda2: step.lambda2,
        lambda3: step.lambda3,
        u: step.u,
        v: step.v,
        dudx: step.dudx,
        dvdx: step.dvdx,
        dudy: step.dudy,
        dvdy: step.dvdy,
        footprintWidth: fp.footprintWidth,
        footprintHeight: fp.footprintHeight,
        majorAxisLength: fp.majorAxisLength,
        minorAxisLength: fp.minorAxisLength,
        anisotropyRatio: fp.anisotropyRatio,
        computedLOD: fp.computedLOD,
        selectedMip: fp.selectedMip,
        sampleCount: fp.sampleCount,
        finalColorR: Math.round(color.r),
        finalColorG: Math.round(color.g),
        finalColorB: Math.round(color.b)
      });
    }
    selectPixel(x, y, state) {
      if (this.selectedStep && this.selectedStep.x === x && this.selectedStep.y === y) {
        this.selectedStep = null;
        return;
      }
      const match = state.stepper.steps.slice(0, state.stepper.cursor).reverse().find((s) => s.x === x && s.y === y);
      if (!match) {
        this.selectedStep = null;
        return;
      }
      this.selectedStep = match;
      this.updateInspector(match, state);
    }
    uvAtScreenPixel(px, py, triangle, interpolator, triangleCanvas) {
      const sx = triangleCanvas.resolutionWidth / triangleCanvas.displayWidth;
      const sy = triangleCanvas.resolutionHeight / triangleCanvas.displayHeight;
      const p1s = new Vec2(triangle.p1.x * sx, triangle.p1.y * sy);
      const p2s = new Vec2(triangle.p2.x * sx, triangle.p2.y * sy);
      const p3s = new Vec2(triangle.p3.x * sx, triangle.p3.y * sy);
      const area = Edge(p1s, p2s, p3s);
      const p = new Vec2(px + 0.5, py + 0.5);
      const l1 = Edge(p2s, p3s, p) / area;
      const l2 = Edge(p3s, p1s, p) / area;
      const l3 = Edge(p1s, p2s, p) / area;
      return interpolator.interpolate({
        l1,
        l2,
        l3,
        w1: triangle.p1.w,
        w2: triangle.p2.w,
        w3: triangle.p3.w,
        uv1: triangle.uv1,
        uv2: triangle.uv2,
        uv3: triangle.uv3
      });
    }
    drawOverlays(state) {
      if (!this.triangleOverlay) return;
      renderVisualization(state, {
        triangleOverlay: this.triangleOverlay,
        textureOverlay: this.textureOverlay,
        mipOverlays: this.mipOverlays
      });
    }
  };

  // src/interpolator.ts
  var LinearInterpolation = class {
    interpolate(ctx) {
      const u = ctx.uv1.x * ctx.l1 + ctx.uv2.x * ctx.l2 + ctx.uv3.x * ctx.l3;
      const v = ctx.uv1.y * ctx.l1 + ctx.uv2.y * ctx.l2 + ctx.uv3.y * ctx.l3;
      return new Vec2(u, v);
    }
  };
  var PerspectiveCorrectInterpolation = class {
    interpolate(ctx) {
      const interpolatedOneOverW = 1 / ctx.w1 * ctx.l1 + 1 / ctx.w2 * ctx.l2 + 1 / ctx.w3 * ctx.l3;
      const pixelW = 1 / interpolatedOneOverW;
      const interpolatedUOverW = ctx.uv1.x / ctx.w1 * ctx.l1 + ctx.uv2.x / ctx.w2 * ctx.l2 + ctx.uv3.x / ctx.w3 * ctx.l3;
      const interpolatedVOverW = ctx.uv1.y / ctx.w1 * ctx.l1 + ctx.uv2.y / ctx.w2 * ctx.l2 + ctx.uv3.y / ctx.w3 * ctx.l3;
      return new Vec2(interpolatedUOverW * pixelW, interpolatedVOverW * pixelW);
    }
  };
  function createInterpolator(mode) {
    return mode === "perspective" ? new PerspectiveCorrectInterpolation() : new LinearInterpolation();
  }
  var Interpolator = class {
    constructor(strategy) {
      this.strategy = strategy;
    }
    strategy;
    setStrategy(strategy) {
      this.strategy = strategy;
    }
    interpolate(ctx) {
      return this.strategy.interpolate(ctx);
    }
  };

  // src/renderer.ts
  function RenderTriangle(state) {
    const { triangleCanvas, stepper, sampler } = state;
    triangleCanvas.clear(Black);
    for (let i = 0; i < stepper.cursor; i++) {
      const s = stepper.steps[i];
      triangleCanvas.setPixel(
        s.x,
        s.y,
        sampler.sample(s.u, s.v, s.dudx, s.dvdx, s.dudy, s.dvdy)
      );
    }
    triangleCanvas.Render();
  }
  function RenderTextureView(state) {
    state.texture.baseCanvas.Render();
  }
  function RenderMipViews(state) {
    for (let i = 1; i < state.texture.levelCount; i++) {
      state.texture.getMip(i).Render();
    }
  }
  function RenderDebugOverlays(state) {
    state.debugger.drawOverlays(state);
  }
  function RedrawUpToCursor(state) {
    RenderTriangle(state);
    RenderTextureView(state);
    RenderMipViews(state);
    RenderDebugOverlays(state);
  }

  // src/sampler.ts
  function sampleMip(mip, u, v, bilinear) {
    if (bilinear) {
      const tx = u * mip.resolutionWidth - 0.5;
      const ty = v * mip.resolutionHeight - 0.5;
      const x0 = Math.floor(tx);
      const y0 = Math.floor(ty);
      const x1 = x0 + 1;
      const y1 = y0 + 1;
      const fx = tx - x0;
      const fy = ty - y0;
      const c00 = mip.getPixel(x0, y0);
      const c10 = mip.getPixel(x1, y0);
      const c01 = mip.getPixel(x0, y1);
      const c11 = mip.getPixel(x1, y1);
      const top = LerpColor(c00, c10, fx);
      const bottom = LerpColor(c01, c11, fx);
      return LerpColor(top, bottom, fy);
    } else {
      let texX = Math.floor(u * mip.resolutionWidth);
      let texY = Math.floor(v * mip.resolutionHeight);
      texX = Math.max(0, Math.min(texX, mip.resolutionWidth - 1));
      texY = Math.max(0, Math.min(texY, mip.resolutionHeight - 1));
      return mip.getPixel(texX, texY);
    }
  }
  function averageColors(colors) {
    if (colors.length === 0) return { r: 0, g: 0, b: 0, a: 0 };
    let r = 0, g = 0, b = 0, a = 0;
    for (const c of colors) {
      r += c.r;
      g += c.g;
      b += c.b;
      a += c.a;
    }
    const n = colors.length;
    return { r: r / n, g: g / n, b: b / n, a: a / n };
  }
  var NearestFilter = class {
    constructor(texture) {
      this.texture = texture;
    }
    texture;
    sample(u, v) {
      return sampleMip(this.texture.getMip(0), u, v, false);
    }
  };
  var BilinearFilter = class {
    constructor(texture) {
      this.texture = texture;
    }
    texture;
    sample(u, v) {
      return sampleMip(this.texture.getMip(0), u, v, true);
    }
  };
  var MipMapNearestFilter = class {
    constructor(texture) {
      this.texture = texture;
    }
    texture;
    sample(u, v, dudx, dvdx, dudy, dvdy) {
      const level = computeMipLevel(
        { u, v, dudx, dvdx, dudy, dvdy },
        this.texture.width,
        this.texture.height,
        this.texture.levelCount
      );
      return sampleMip(this.texture.getMip(level), u, v, false);
    }
  };
  var MipMapLinearFilter = class {
    constructor(texture) {
      this.texture = texture;
    }
    texture;
    sample(u, v, dudx, dvdx, dudy, dvdy) {
      const lod = computeMipLOD(
        { u, v, dudx, dvdx, dudy, dvdy },
        this.texture.width,
        this.texture.height
      );
      const clampedLod = Math.max(
        0,
        Math.min(lod, this.texture.levelCount - 1)
      );
      const level0 = Math.floor(clampedLod);
      const level1 = Math.min(level0 + 1, this.texture.levelCount - 1);
      const frac = clampedLod - level0;
      const c0 = sampleMip(this.texture.getMip(level0), u, v, true);
      const c1 = sampleMip(this.texture.getMip(level1), u, v, true);
      return LerpColor(c0, c1, frac);
    }
  };
  var AnisotropicFilter = class {
    constructor(texture, maxAnisotropy) {
      this.texture = texture;
      this.maxAnisotropy = maxAnisotropy;
    }
    texture;
    maxAnisotropy;
    sample(u, v, dudx, dvdx, dudy, dvdy) {
      const step = { u, v, dudx, dvdx, dudy, dvdy };
      const fp = computeFootprint(
        step,
        this.texture.width,
        this.texture.height,
        this.texture.levelCount,
        this.maxAnisotropy
      );
      const level = computeAnisoMipLevel(
        step,
        this.texture.width,
        this.texture.height,
        this.texture.levelCount
      );
      const mip = this.texture.getMip(level);
      const sampleCount = snapSampleCount(fp.anisotropyRatio, this.maxAnisotropy);
      const tw = this.texture.width;
      const th = this.texture.height;
      const colors = [];
      for (let i = 0; i < sampleCount; i++) {
        const t = sampleCount === 1 ? 0 : i / (sampleCount - 1) - 0.5;
        const offsetTex = t * fp.majorAxisLength;
        const su = u + fp.majorAxisDirTex.x * offsetTex / tw;
        const sv = v + fp.majorAxisDirTex.y * offsetTex / th;
        colors.push(sampleMip(mip, su, sv, true));
      }
      return averageColors(colors);
    }
  };
  function createFilter(mode, texture, maxAnisotropy = 16) {
    switch (mode) {
      case "bilinear":
        return new BilinearFilter(texture);
      case "mipmap_nearest":
        return new MipMapNearestFilter(texture);
      case "mipmap_linear":
        return new MipMapLinearFilter(texture);
      case "anisotropic":
        return new AnisotropicFilter(texture, maxAnisotropy);
      default:
        return new NearestFilter(texture);
    }
  }
  var Sampler = class {
    constructor(filter) {
      this.filter = filter;
    }
    filter;
    setFilter(filter) {
      this.filter = filter;
    }
    sample(u, v, dudx = 0, dvdx = 0, dudy = 0, dvdy = 0) {
      return this.filter.sample(u, v, dudx, dvdx, dudy, dvdy);
    }
  };

  // src/stepper.ts
  function BuildSteps(triangle, interpolator, targetCanvas) {
    const steps = [];
    const { p1, p2, p3, uv1, uv2, uv3 } = triangle;
    const sx = targetCanvas.resolutionWidth / targetCanvas.displayWidth;
    const sy = targetCanvas.resolutionHeight / targetCanvas.displayHeight;
    const p1s = new Vec2(p1.x * sx, p1.y * sy);
    const p2s = new Vec2(p2.x * sx, p2.y * sy);
    const p3s = new Vec2(p3.x * sx, p3.y * sy);
    const minX = Math.max(0, Math.floor(Math.min(p1s.x, p2s.x, p3s.x)));
    const maxX = Math.min(
      targetCanvas.resolutionWidth - 1,
      Math.ceil(Math.max(p1s.x, p2s.x, p3s.x))
    );
    const minY = Math.max(0, Math.floor(Math.min(p1s.y, p2s.y, p3s.y)));
    const maxY = Math.min(
      targetCanvas.resolutionHeight - 1,
      Math.ceil(Math.max(p1s.y, p2s.y, p3s.y))
    );
    const area = Edge(p1s, p2s, p3s);
    if (Math.abs(area) < 1e-5) return steps;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const p = new Vec2(x + 0.5, y + 0.5);
        const e0 = Edge(p1s, p2s, p);
        const e1 = Edge(p2s, p3s, p);
        const e2 = Edge(p3s, p1s, p);
        const insideCCW = e0 >= 0 && e1 >= 0 && e2 >= 0;
        const insideCW = e0 <= 0 && e1 <= 0 && e2 <= 0;
        if (!insideCCW && !insideCW) continue;
        const lambda1 = Edge(p2s, p3s, p) / area;
        const lambda2 = Edge(p3s, p1s, p) / area;
        const lambda3 = Edge(p1s, p2s, p) / area;
        const uv = interpolator.interpolate({
          l1: lambda1,
          l2: lambda2,
          l3: lambda3,
          w1: p1.w,
          w2: p2.w,
          w3: p3.w,
          uv1,
          uv2,
          uv3
        });
        const uvR = interpolator.interpolate({
          l1: Edge(p2s, p3s, new Vec2(x + 1.5, y + 0.5)) / area,
          l2: Edge(p3s, p1s, new Vec2(x + 1.5, y + 0.5)) / area,
          l3: Edge(p1s, p2s, new Vec2(x + 1.5, y + 0.5)) / area,
          w1: p1.w,
          w2: p2.w,
          w3: p3.w,
          uv1,
          uv2,
          uv3
        });
        const uvD = interpolator.interpolate({
          l1: Edge(p2s, p3s, new Vec2(x + 0.5, y + 1.5)) / area,
          l2: Edge(p3s, p1s, new Vec2(x + 0.5, y + 1.5)) / area,
          l3: Edge(p1s, p2s, new Vec2(x + 0.5, y + 1.5)) / area,
          w1: p1.w,
          w2: p2.w,
          w3: p3.w,
          uv1,
          uv2,
          uv3
        });
        const dudx = uvR.x - uv.x;
        const dvdx = uvR.y - uv.y;
        const dudy = uvD.x - uv.x;
        const dvdy = uvD.y - uv.y;
        steps.push({
          x,
          y,
          u: uv.x,
          v: uv.y,
          dudx,
          dvdx,
          dudy,
          dvdy,
          lambda1,
          lambda2,
          lambda3
        });
      }
    }
    return steps;
  }
  var Stepper = class {
    steps = [];
    cursor = 0;
    playing = true;
    playIntervalMs = 5;
    lastTime = 0;
    stepMode = "pixel";
    rebuildSteps(triangle, interpolator, triangleCanvas) {
      this.steps = BuildSteps(triangle, interpolator, triangleCanvas);
      this.cursor = 0;
      this.playing = true;
      this.lastTime = performance.now();
    }
    advanceBy(count) {
      this.cursor = Math.min(this.cursor + count, this.steps.length);
    }
    stepForwardPixel() {
      this.advanceBy(1);
    }
    stepForwardRow() {
      if (this.cursor >= this.steps.length) return;
      const curRow = this.steps[this.cursor].y;
      let n = 0;
      for (let i = this.cursor; i < this.steps.length; i++) {
        if (this.steps[i].y !== curRow) break;
        n++;
      }
      this.advanceBy(n);
    }
    stepBack() {
      this.cursor = Math.max(0, this.cursor - 1);
    }
    reset() {
      this.cursor = 0;
      this.playing = false;
    }
    finish() {
      this.cursor = this.steps.length;
      this.playing = false;
    }
    currentStep() {
      if (this.cursor >= this.steps.length) return null;
      return this.steps[this.cursor];
    }
  };

  // src/texture.ts
  function FillChecker(canvas, cellsize) {
    for (let y = 0; y <= canvas.resolutionHeight - 1; y++) {
      for (let x = 0; x <= canvas.resolutionWidth - 1; x++) {
        const a = Math.floor(x / cellsize);
        const b = Math.floor(y / cellsize);
        const col = {
          r: Math.floor(255 * x / canvas.resolutionWidth),
          g: Math.floor(255 * y / canvas.resolutionHeight),
          b: 0,
          a: 255
        };
        if ((a + b) % 2 == 0) canvas.setPixel(x, y, col);
      }
    }
  }
  var Texture = class {
    base;
    mips = [];
    mipChain = [];
    cellsize = 16;
    constructor(resolution, displaySize, columnLeft, top = 0) {
      this.base = new Canvas(
        resolution,
        resolution,
        displaySize,
        displaySize,
        columnLeft,
        top
      );
      this.mipChain = [this.base];
    }
    get baseCanvas() {
      return this.base;
    }
    get mipLevels() {
      return this.mipChain;
    }
    get levelCount() {
      return this.mipChain.length;
    }
    getMip(level) {
      return this.mipChain[Math.max(0, Math.min(level, this.mipChain.length - 1))];
    }
    get width() {
      return this.base.resolutionWidth;
    }
    get height() {
      return this.base.resolutionHeight;
    }
    rebuildTexture(resolution, cellsize) {
      this.cellsize = cellsize;
      this.base.ResizeResolution(resolution);
      this.base.clear(Black);
      FillChecker(this.base, cellsize);
    }
    rebuildMipChain(layout) {
      for (const mip of this.mips) mip.destroy();
      this.mips = [];
      this.mipChain = [this.base];
      let current = this.base;
      let displaySize = layout.displaySize;
      let topOffset = 0;
      while (current.resolutionWidth > 1 || current.resolutionHeight > 1) {
        const newW = Math.max(1, Math.floor(current.resolutionWidth / 2));
        const newH = Math.max(1, Math.floor(current.resolutionHeight / 2));
        displaySize = Math.max(4, Math.floor(displaySize / 2));
        const mip = new Canvas(
          newW,
          newH,
          displaySize,
          displaySize,
          layout.columnLeft,
          topOffset
        );
        topOffset += displaySize;
        for (let y = 0; y < newH; y++) {
          for (let x = 0; x < newW; x++) {
            const sx = x * 2, sy = y * 2;
            const c00 = current.getPixel(sx, sy);
            const c10 = current.getPixel(sx + 1, sy);
            const c01 = current.getPixel(sx, sy + 1);
            const c11 = current.getPixel(sx + 1, sy + 1);
            mip.setPixel(x, y, {
              r: (c00.r + c10.r + c01.r + c11.r) / 4,
              g: (c00.g + c10.g + c01.g + c11.g) / 4,
              b: (c00.b + c10.b + c01.b + c11.b) / 4,
              a: (c00.a + c10.a + c01.a + c11.a) / 4
            });
          }
        }
        mip.Render();
        this.mips.push(mip);
        this.mipChain.push(mip);
        current = mip;
      }
    }
    renderAll() {
      this.base.Render();
      for (const mip of this.mips) mip.Render();
    }
  };

  // src/app-state.ts
  var DISPLAY_SIZE = window.innerHeight / 2 + window.innerHeight / 4;
  var AppState = class {
    triangleCanvas;
    texture;
    sampler;
    interpolator;
    stepper;
    debugger;
    triangle;
    settings;
    constructor() {
      this.settings = {
        resolution: 512,
        textureRes: 1024,
        textureCellsize: 16,
        filterMode: "anisotropic",
        interpolationMode: "perspective",
        anisotropyLevel: 32,
        visualizationMode: "none"
      };
      this.triangleCanvas = new Canvas(
        256,
        256,
        DISPLAY_SIZE,
        DISPLAY_SIZE,
        0,
        0
      );
      this.texture = new Texture(256, DISPLAY_SIZE, DISPLAY_SIZE, 0);
      this.interpolator = new Interpolator(
        createInterpolator(this.settings.interpolationMode)
      );
      this.sampler = new Sampler(
        createFilter(
          this.settings.filterMode,
          this.texture,
          this.settings.anisotropyLevel
        )
      );
      this.stepper = new Stepper();
      this.debugger = new Debugger();
      this.triangle = {
        p1: { x: 400, y: 700, w: 1 },
        p2: { x: 40, y: 400, w: 3 },
        p3: { x: 600, y: 400, w: 3 },
        uv1: new Vec2(1, 0),
        uv2: new Vec2(0, 1),
        uv3: new Vec2(1, 1)
      };
      this.debugger.attachTriangleOverlay(this.triangleCanvas);
    }
    refreshSampler() {
      this.sampler.setFilter(
        createFilter(
          this.settings.filterMode,
          this.texture,
          this.settings.anisotropyLevel
        )
      );
    }
    rebuildTexture() {
      this.texture.rebuildTexture(
        this.settings.textureRes,
        this.settings.textureCellsize
      );
    }
    rebuildMipChain() {
      this.texture.rebuildMipChain({
        displaySize: DISPLAY_SIZE,
        columnLeft: DISPLAY_SIZE * 2
      });
      this.debugger.attachTextureOverlay(this.texture);
      this.debugger.attachMipOverlays(this.texture);
      this.refreshSampler();
    }
    rebuildSteps() {
      this.stepper.rebuildSteps(
        this.triangle,
        this.interpolator,
        this.triangleCanvas
      );
      this.debugger.selectedStep = null;
    }
    fullRebuild() {
      this.triangleCanvas.ResizeResolution(this.settings.resolution);
      this.debugger.attachTriangleOverlay(this.triangleCanvas);
      this.rebuildTexture();
      this.rebuildMipChain();
      this.rebuildSteps();
      RedrawUpToCursor(this);
    }
    refreshInspector() {
      if (this.debugger.selectedStep) {
        this.debugger.updateInspector(this.debugger.selectedStep, this);
      }
    }
    redraw() {
      RedrawUpToCursor(this);
    }
    setFilterMode(mode) {
      this.settings.filterMode = mode;
      this.refreshSampler();
      this.refreshInspector();
      this.redraw();
    }
    setAnisotropyLevel(level) {
      this.settings.anisotropyLevel = level;
      this.refreshSampler();
      if (this.debugger.selectedStep) {
        this.debugger.updateInspector(this.debugger.selectedStep, this);
      }
      this.redraw();
    }
    setVisualizationMode(mode) {
      this.settings.visualizationMode = mode;
      this.redraw();
    }
    setInterpolationMode(mode) {
      this.settings.interpolationMode = mode;
      this.interpolator.setStrategy(createInterpolator(mode));
      this.rebuildSteps();
      this.redraw();
    }
    setResolution(resolution) {
      this.settings.resolution = resolution;
      this.triangleCanvas.ResizeResolution(resolution);
      this.debugger.attachTriangleOverlay(this.triangleCanvas);
      this.rebuildSteps();
      this.redraw();
    }
    setTextureRes(resolution) {
      this.settings.textureRes = resolution;
      this.rebuildTexture();
      this.rebuildMipChain();
      this.rebuildSteps();
      this.redraw();
    }
    setTextureCellsize(cellsize) {
      this.settings.textureCellsize = cellsize;
      this.rebuildTexture();
      this.rebuildMipChain();
      this.rebuildSteps();
      this.redraw();
    }
    onTriangleChanged() {
      this.rebuildSteps();
      this.redraw();
    }
    selectPixel(x, y) {
      this.debugger.selectPixel(x, y, this);
      this.redraw();
    }
  };

  // src/main.ts
  var gui = new GUI({ title: "Rasterizer Controls" });
  var app = new AppState();
  var VISUALIZATION_MODES = [
    { value: "none", label: "None" },
    { value: "lod_heatmap", label: "lod_heatmap" }
  ];
  var visualizationLabels = VISUALIZATION_MODES.map((m) => m.label);
  var visualizationValues = VISUALIZATION_MODES.map((m) => m.value);
  var inspectorFolder = gui.addFolder("Pixel Inspector");
  inspectorFolder.add(app.debugger.inspector, "screenX").name("Screen X").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "screenY").name("Screen Y").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "lambda1").name("\u03BB1").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "lambda2").name("\u03BB2").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "lambda3").name("\u03BB3").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "u").name("U").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "v").name("V").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "dudx").name("dudx").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "dvdx").name("dvdx").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "dudy").name("dudy").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "dvdy").name("dvdy").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "footprintWidth").name("Footprint Width").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "footprintHeight").name("Footprint Height").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "majorAxisLength").name("Major Axis").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "minorAxisLength").name("Minor Axis").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "anisotropyRatio").name("Anisotropy Ratio").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "computedLOD").name("Computed LOD").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "selectedMip").name("Selected Mip").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "sampleCount").name("Sample Count").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "finalColorR").name("Color R").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "finalColorG").name("Color G").listen().disable();
  inspectorFolder.add(app.debugger.inspector, "finalColorB").name("Color B").listen().disable();
  var vizProxy = {
    mode: "None"
  };
  gui.add(vizProxy, "mode", visualizationLabels).name("Visualization Mode").onChange((label) => {
    const idx = visualizationLabels.indexOf(label);
    app.setVisualizationMode(visualizationValues[idx]);
  });
  gui.add(app.settings, "resolution", [16, 32, 64, 128, 256, 512]).name("Resolution").onChange((v) => app.setResolution(v));
  gui.add(app.settings, "textureRes", [16, 32, 64, 128, 256, 512, 1024]).name("Texture Resolution").onChange((v) => app.setTextureRes(v));
  gui.add(app.settings, "textureCellsize", [2, 4, 8, 16, 32, 64, 128, 256, 512]).name("Cellsize").onChange((v) => app.setTextureCellsize(v));
  gui.add(app.settings, "filterMode", [
    "nearest",
    "bilinear",
    "mipmap_nearest",
    "mipmap_linear",
    "anisotropic"
  ]).name("Filter Mode").onChange((v) => app.setFilterMode(v));
  gui.add(app.settings, "anisotropyLevel", [1, 2, 4, 8, 16]).name("Anisotropy Level").onChange((v) => app.setAnisotropyLevel(v));
  var sf = gui.addFolder("Stepper");
  var stepperProxy = {
    Reset: () => {
      app.stepper.reset();
      app.redraw();
      updateStepLabel();
    },
    Back: () => {
      app.stepper.stepBack();
      app.redraw();
      updateStepLabel();
    },
    "Play/Pause": () => {
      app.stepper.playing = !app.stepper.playing;
      if (app.stepper.playing && app.stepper.cursor >= app.stepper.steps.length) {
        app.stepper.reset();
        app.redraw();
        updateStepLabel();
      }
    },
    "Step Pixel": () => {
      app.stepper.stepForwardPixel();
      app.redraw();
      updateStepLabel();
    },
    "Step Row": () => {
      app.stepper.stepForwardRow();
      app.redraw();
      updateStepLabel();
    },
    Finish: () => {
      app.stepper.finish();
      app.redraw();
      updateStepLabel();
    },
    stepMode: "row",
    playSpeedMs: 50,
    "Step: 0 / 0": () => {
    }
  };
  sf.add(stepperProxy, "Reset");
  sf.add(stepperProxy, "Back");
  sf.add(stepperProxy, "Play/Pause");
  sf.add(stepperProxy, "Step Pixel");
  sf.add(stepperProxy, "Step Row");
  sf.add(stepperProxy, "Finish");
  sf.add(stepperProxy, "stepMode", ["pixel", "row"]).name("Auto-play steps by").onChange((v) => {
    app.stepper.stepMode = v;
  });
  sf.add(stepperProxy, "playSpeedMs", 1, 500, 1).name("Play speed (ms)").onChange((v) => {
    app.stepper.playIntervalMs = v;
  });
  var stepControl = sf.add(stepperProxy, "Step: 0 / 0");
  sf.open();
  function updateStepLabel() {
    stepControl.name(`Step: ${app.stepper.cursor} / ${app.stepper.steps.length}`);
  }
  gui.add(app.settings, "interpolationMode", ["linear", "perspective"]).name("Interpolation").onChange(
    (v) => app.setInterpolationMode(v)
  );
  var f1 = gui.addFolder("Vertex 1");
  f1.add(app.triangle.p1, "x", 0, DISPLAY_SIZE, 1).name("X").onChange(() => app.onTriangleChanged());
  f1.add(app.triangle.p1, "y", 0, DISPLAY_SIZE, 1).name("Y").onChange(() => app.onTriangleChanged());
  f1.add(app.triangle.p1, "w", 0.1, 10, 0.1).name("W (Depth)").onChange(() => app.onTriangleChanged());
  f1.add(app.triangle.uv1, "x", 0, 1, 0.01).name("U").onChange(() => app.onTriangleChanged());
  f1.add(app.triangle.uv1, "y", 0, 1, 0.01).name("V").onChange(() => app.onTriangleChanged());
  var f2 = gui.addFolder("Vertex 2");
  f2.add(app.triangle.p2, "x", 0, DISPLAY_SIZE, 1).name("X").onChange(() => app.onTriangleChanged());
  f2.add(app.triangle.p2, "y", 0, DISPLAY_SIZE, 1).name("Y").onChange(() => app.onTriangleChanged());
  f2.add(app.triangle.p2, "w", 0.1, 10, 0.1).name("W (Depth)").onChange(() => app.onTriangleChanged());
  f2.add(app.triangle.uv2, "x", 0, 1, 0.01).name("U").onChange(() => app.onTriangleChanged());
  f2.add(app.triangle.uv2, "y", 0, 1, 0.01).name("V").onChange(() => app.onTriangleChanged());
  var f3 = gui.addFolder("Vertex 3");
  f3.add(app.triangle.p3, "x", 0, DISPLAY_SIZE, 1).name("X").onChange(() => app.onTriangleChanged());
  f3.add(app.triangle.p3, "y", 0, DISPLAY_SIZE, 1).name("Y").onChange(() => app.onTriangleChanged());
  f3.add(app.triangle.p3, "w", 0.1, 10, 0.1).name("W (Depth)").onChange(() => app.onTriangleChanged());
  f3.add(app.triangle.uv3, "x", 0, 1, 0.01).name("U").onChange(() => app.onTriangleChanged());
  f3.add(app.triangle.uv3, "y", 0, 1, 0.01).name("V").onChange(() => app.onTriangleChanged());
  f1.open();
  f2.open();
  f3.open();
  inspectorFolder.open();
  app.triangleCanvas.onClick = (x, y) => app.selectPixel(x, y);
  app.fullRebuild();
  updateStepLabel();
  function loop(timestamp) {
    if (app.stepper.playing && app.stepper.cursor < app.stepper.steps.length) {
      if (timestamp - app.stepper.lastTime >= app.stepper.playIntervalMs) {
        app.stepper.lastTime = timestamp;
        if (app.stepper.stepMode === "row") app.stepper.stepForwardRow();
        else app.stepper.stepForwardPixel();
        app.redraw();
        updateStepLabel();
      }
    } else if (app.stepper.playing && app.stepper.cursor >= app.stepper.steps.length) {
      app.stepper.playing = false;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
/*! Bundled license information:

lil-gui/dist/lil-gui.esm.js:
  (**
   * lil-gui
   * https://lil-gui.georgealways.com
   * @version 0.21.0
   * @author George Michael Brower
   * @license MIT
   *)
*/
