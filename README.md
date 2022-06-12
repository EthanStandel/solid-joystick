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
export namespace Joystick {
  /* props for the Joystick component */
  export type Props = {
    /* the event that fires when the joystick is moved */
    onMove?: (event: MoveEvent) => void;

    /* disable the boundaries for the joystick handle */
    disableBounding?: boolean;

    /* disable the transition animation that resets the handle location after "letting go" */
    disableResetAnimation?: boolean;

    /* disables the automatic return to center after "letting go" of the handle  */
    disableReset?: boolean;

    /* defines the animation that fires for the reset event after "letting go" of the handle */
    /* default: ".2s ease" */
    resetAnimation?: string;

    /* native props which are passed forward to the "base" element (the bounding element) */
    baseProps: Omit<JSX.HTMLAttributes<HTMLDivElement>, "style" | "ref">;

    /* native props which are passed forward to the "handle" element (the grabbable element) */
    handleProps: Omit<
      JSX.HTMLAttributes<HTMLButtonElement>,
      "onpointerdown" | "style"
    >;
  };

  /* The data which is forwarded when the handle is moved */
  export type MoveEvent = {
    /* the offset, in pixels, that the handle has been dragged from its initial position */ 
    offset: {
      x: number;
      y: number;
    };

    /* the angle that the joystick has been dragged, offered in both radians & degrees */
    angle: {
      radians: number;
      degrees: number;
    };

    /* the total distance that the handle has been dragged from the center of the base, offered in both pixels & percentage */
    pressure: {
      pixels: number;
      percentage: number;
    };
  };
}
```


onMove?: (event: MoveEvent) => void;
disableBounding?: boolean;
disableResetAnimation?: boolean;
resetAnimation?: string;
disableReset?: boolean;
baseProps: Omit<JSX.HTMLAttributes<HTMLDivElement>, "style"  "ref">;
handleProps: Omit<
JSX.HTMLAttributes<HTMLButtonElement>,
"onpointerdown" "style"

## Contributing

Storybook can be run with the following commands. Please fork and open a PR if you would like to have your changes merged. Otherwise feel free to file issues.

```sh
git clone https://github.com/EthanStandel/solid-joystick.git
cd solid-joystick
npm i
npm start
```
