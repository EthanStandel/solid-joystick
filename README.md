# solid-joystick

A joystick component built in and for use in SolidJS applications with zero runtime dependencies.

The development-time flow utilizes Storybook using the @storybook/html flow as Solid lacks official Storybook support and the project is built with Vite.

## Demos 

[Storybook demos](https://ethanstandel.github.io/solid-joystick/)  
[Applied example code](https://github.com/EthanStandel/solid-joystick-applied)  
[Applied example demo](https://ethanstandel.github.io/solid-joystick-applied/)

## Usage

### Install

```sh
npm i solid-joystick
```

### Basic use

```tsx
import {
  Joystick,
  PointerPlugin,
  GamepadPlugin
} from "solid-joystick";

const Example = () => (
  <div style={{ width: "250px", height: "250" }}>
    <Joystick 
      plugins={[PointerPlugin(), GamepadPlugin()]}
      handleProps={{ style: { background: "red", width: "25%", height: "25%" } }}
      handleProps={{ style: { background: "black" } }}
    />
  </div>
);
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
  onMove: (event: JoystickMoveEvent) => void;

  /**
   * The model that defines the way the handle will be contained inside of the base.
   *
   * "inner" will ensure that the handle is always contained by baseing the handle's distance from center by it's own far edge
   *
   * "center" will base the handle's distance from center by the center of the handle, allowing it to partially overflow
   *
   * "outer" will base the handle's distance from center by the outer edge of the handle, allowing it to fully overflow
   *
   * "none" will make it so that there is no boundy
   *
   * default: "center"
   **/
  boundingModel: "inner" | "center" | "outer" | "none";

  /**
   * A number of pixels to modify the boundary. Negative shrinks, positive grows.
   * default: 0
   **/
  boundaryModifier: number;

  /**
   * Disables the handle from all movement
   **/
  disabled: boolean;

  /**
   * Disables the x axis, limiting use to the y axis, if enabled
   **/
  disableX: boolean;

  /**
   * Disables the y axis, limiting use to the x axis, if enabled.
   **/
  disableY: boolean;

  /**
   * Disable the transition animation that resets the handle location after "letting go."
   **/
  disableResetAnimation: boolean;

  /**
   * Disables the automatic return to center after "letting go" of the handle.
   **/
  disableReset: boolean;

  /**
   * Defines the animation that fires for the reset event after "letting go" of the handle.
   * default: ".2s ease"
   **/
  resetAnimation: string;

  /**
   * A time in milliseconds that incoming events should be throttled by, recommended if connected to a websocket.
   * default: 0
   **/
  throttleEventsBy: number;

  /**
   * The native props which are passed forward to the "base" element (the bounding element).
   **/
  baseProps: Omit<JSX.HTMLAttributes<HTMLDivElement>, "style" | "ref"> & {
    style?: JSX.CSSProperties;
  };

  /**
   * The native props which are passed forward to the "handle" element (the grabbable element).
   **/
  handleProps: Omit<JSX.HTMLAttributes<HTMLButtonElement>, "style" | "ref"> & {
    style?: JSX.CSSProperties;
  };

  /**
   * An array of plugins that can be used to modify props and state of the Joystick. This is how controls are provided to the Joystick component.
   *
   * **WARNING** All standard Joystick plugins will be tested on their own, but not against each other. Mix and match at your own risk (feel free to file bugs, but they may be marked `wontfix`).
   */
  plugins: Array<JoystickPlugin>;
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
 * A function which may be used to modify the props and state of the Joystick.
 */
export type JoystickPlugin = (
  pluginProps: {
    /**
     * The function that should be called when a controlling event wants the handle to move and fire off an `JoystickMoveEvent`.
     */
    handleHandleMove: (xOffset: number, yOffset: number) => void;
    /**
     * A getter for the radius of the "base" element.
     */
    getRadius: () => number;
    /**
     * A signal accessor for the currently rendered true xOffset of the handle.
     */
    xOffset: Accessor<number>;
    /**
     * A signal setter for the true xOffset. Use with caution, as this will break the bounding model.
     */
    setXOffset: Setter<number>;
    /**
     * A signal accessor for the currently rendered true yOffset of the handle.
     */
    yOffset: Accessor<number>;
    /**
     * A signal setter for the true yOffset. Use with caution, as this will break the bounding model.
     */
    setYOffset: Setter<number>;
    /**
     * A signal accessor for the enabling boolean for the return-to-center transition.
     */
    shouldTransition: Accessor<boolean>;
    /**
     * A signal setter for the enabling boolean for the return-to-center transition. Should be run before "letting go" of the handle, or if you ever manually set xOffset & yOffset each to zero.
     */
    setShouldTransition: Setter<boolean>;
    /**
     * The indexed order this plugin is being added to the array.
     */
    pluginIndex: number;
    /**
     * A non-observed state container. When dragging the handle, you should set `handleState.pluginDragging[pluginIndex] = true` and when the handle is "let go of," you should set that to false. When done dragging, always set `handleState.initialOffsets = { x: 0, y: 0 }` if it was modified.
     */
    handleState: {
      pluginDragging: Array<boolean>;
      initialOffsets: { x: number; y: number };
    };
  } & JoystickProps,
) => void;
```

## Contributing

Storybook can be run with the following commands. Please fork and open a PR if you would like to have your changes merged. Otherwise feel free to file issues.

```sh
git clone https://github.com/EthanStandel/solid-joystick.git
cd solid-joystick
npm i
npm start
```
