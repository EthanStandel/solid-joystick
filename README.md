# solid-joystick

A joystick component built in and for use in SolidJS applications with zero runtime dependencies.

The development-time flow utilizes Storybook using the @storybook/html flow as Solid lacks official Storybook support and the project is built with Vite.

## [Demo example](https://ethanstandel.github.io/solid-joystick/)

## Usage

### Install

```sh
npm i solid-joystick
```

### Import

```ts
import { Joystick } from "solid-joystick";
```

### Important types

```ts
/**
 * Props for the Joystick component.
 **/
export type JoystickProps = {
  /**
   * The event that fires when the joystick is moved.
   **/
  onMove?: (event: JoystickMoveEvent) => void;

  /**
   * The model that defines the way the handle will be contained inside of the base.
   *
   * "inner" will ensure that the handle is always contained
   * by baseing the handle's distance from center by it's own
   * far edge
   *
   * "center" will base the handle's distance from center by the
   * center of the handle, allowing it to partially overflow
   *
   * "outer" will base the handle's distance from center by the
   * outer edge of the handle, allowing it to fully overflow
   *
   * "none" will make it so that there is no boundy
   *
   * default: "center"
   **/
  boundingModel?: "inner" | "center" | "outer" | "none";

  /**
   * A number of pixels to modify the boundary. Negative shrinks, positive grows.
   * default: 0
   **/
  boundaryModifier?: number;

  /**
   * Disables the handle from all movement
   **/
  disabled?: boolean;

  /**
   * Disables the x axis, limiting use to the y axis, if enabled
   **/
  disableX?: boolean;

  /**
   * Disables the y axis, limiting use to the x axis, if enabled.
   **/
  disableY?: boolean;

  /**
   * Disable the transition animation that resets the handle location after "letting go."
   **/
  disableResetAnimation?: boolean;

  /**
   * Disables the automatic return to center after "letting go" of the handle.
   **/
  disableReset?: boolean;

  /**
   * Defines the animation that fires for the reset event after "letting go" of the handle.
   * default: ".2s ease"
   **/
  resetAnimation?: string;

  /**
   * A time in milliseconds that incoming events should be throttled by, recommended if connected to a websocket.
   * default: 0
   **/
  throttleEventsBy?: number;

  /**
   * **WARNING**: The Gamepad API requires polling which can severely limit performance of the surrounding application, use with caution.
   *
   * This enables gamepad support, which can be great for application which support a virtual joystick _and_ a hardware joystick.
   * default: undefined (which disables the feature)
   **/
  enableGamepadSupport?: boolean | Partial<GamepadSupportOptions>;

  /**
   * The native props which are passed forward to the "base" element (the bounding element).
   **/
  baseProps?: Omit<JSX.HTMLAttributes<HTMLDivElement>, "style" | "ref"> & {
    style?: JSX.CSSProperties;
  };

  /**
   * The native props which are passed forward to the "handle" element (the grabbable element).
   **/
  handleProps?: Omit<
    JSX.HTMLAttributes<HTMLButtonElement>,
    "onpointerdown" | "style" | "ref"
  > & { style?: JSX.CSSProperties };
};

/**
 * The data which is forwarded when the handle is moved.
 **/
export type JoystickMoveEvent = {
  /**
   * The offset that the handle has been dragged from its initial position, offered in both pixels & percentage.
   **/
  offset: {
    pixels: { x: number; y: number };
    percentage: { x: number; y: number };
  };

  /**
   * The angle that the joystick has been dragged, offered in both radians & degrees.
   **/
  angle: { radians: number; degrees: number };

  /**
   * The total distance that the handle has been dragged from the center of the base, offered in both pixels & percentage.
   **/
  pressure: { pixels: number; percentage: number };
};

/**
 * The config for gamepad support implementation.
 **/
export type GamepadSupportOptions = {
  /**
   * Which axis index would you like to forward to events as the X index. 0 is usually left stick and 2 is usually right stick.
   * default: 0
   **/
  xIndex: number;

  /**
   * Which axis index would you like to forward to events as the Y index. 1 is usually left stick and 3 is usually right stick.
   * default: 1
   **/
  yIndex: number;

  /**
   * The gamepad index in window.navigator.getGamepads() you'd like to use. Very likely to be 0.
   * default: 0
   **/
  index: number;

  /**
   * One may either check the gamepad on every available animation frame or check it on recursive setTimeouts.
   * default: "requestAnimationFrame"
   **/
  pollingModel: "requestAnimationFrame" | number;

  /**
   * The percentage from the base you'd like to ignore, to avoid physical innaccuracies.
   * default: 0.05 (5%)
   **/
  deadzonePercent: number;
};
```

## Contributing

Storybook can be run with the following commands. Please fork and open a PR if you would like to have your changes merged. Otherwise feel free to file issues.

```sh
git clone https://github.com/EthanStandel/solid-joystick.git
cd solid-joystick
npm i
npm start
```
