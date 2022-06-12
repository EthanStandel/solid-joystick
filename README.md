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
/* props for the Joystick component */
export type JoystickProps = {
  /* the event that fires when the joystick is moved */
  onMove?: (event: JoystickMoveEvent) => void;

  /**
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
   **/
  /* default: "center" */
  boundingModel?: "inner" | "center" | "outer" | "none";

  /* a number of pixels to modify the boundary, negative shrinks, positive grows */
  /* default: 0 */
  boundaryModifier?: number;

  /* disables the handle from all movement */
  disabled?: boolean;

  /* disables the x axis, limiting use to the y axis, if enabled */
  disableX?: boolean;

  /* disables the y axis, limiting use to the x axis, if enabled */
  disableY?: boolean;

  /* disable the transition animation that resets the handle location after "letting go" */
  disableResetAnimation?: boolean;

  /* disables the automatic return to center after "letting go" of the handle  */
  disableReset?: boolean;

  /* defines the animation that fires for the reset event after "letting go" of the handle */
  /* default: ".2s ease" */
  resetAnimation?: string;

  /* a time in milliseconds that incoming events should be throttled by, recommended if connected to a websocket */
  /* default: 0 */
  throttleEventsBy?: number;

  /* native props which are passed forward to the "base" element (the bounding element) */
  baseProps?: Omit<JSX.HTMLAttributes<HTMLDivElement>, "style" | "ref"> & {
    style?: JSX.CSSProperties;
  };

  /* native props which are passed forward to the "handle" element (the grabbable element) */
  handleProps?: Omit<
    JSX.HTMLAttributes<HTMLButtonElement>,
    "onpointerdown" | "style" | "ref"
  > & { style?: JSX.CSSProperties };
};

/* The data which is forwarded when the handle is moved */
export type JoystickMoveEvent = {
  /* the offset, in pixels, that the handle has been dragged from its initial position */
  offset: { x: number; y: number };

  /* the angle that the joystick has been dragged, offered in both radians & degrees */
  angle: { radians: number; degrees: number };

  /* the total distance that the handle has been dragged from the center of the base, offered in both pixels & percentage */
  pressure: { pixels: number; percentage: number };
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
