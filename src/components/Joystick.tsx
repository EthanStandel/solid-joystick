import { Component, createSignal } from "solid-js";
import type { JSX } from "solid-js/types";

import { Trig } from "../utils/Trig";

export const Joystick: Component<JoystickProps> = ({
  onMove,
  disableReset,
  disableResetAnimation,
  disabled,
  disableX,
  disableY,
  throttleEventsBy = 0,
  resetAnimation = ".2s ease",
  disableBounding = false,
  baseProps = {},
  handleProps = {},
}) => {
  const [xOffset, setXOffset] = createSignal(0);
  const [yOffset, setYOffset] = createSignal(0);
  const [shouldTransition, setShouldTransition] = createSignal(false);
  let handleState = initialStates.handleState();
  let baseRef: HTMLDivElement | undefined;

  const onMoveThrottled = (() => {
    if (onMove && throttleEventsBy !== 0) {
      let lastTime = 0;
      return (event: JoystickMoveEvent) => {
        const now = new Date().getTime();
        if (now - lastTime >= throttleEventsBy) {
          lastTime = now;
          onMove(event);
        }
      };
    } else {
      return onMove;
    }
  })();

  const handlePointerMove = (event: PointerEvent) => {
    event.preventDefault();
    if (handleState.dragging && baseRef && !disabled) {
      const radius = baseRef!.clientWidth / 2;
      const xOffset = disableX
        ? 0
        : event.clientX - handleState.initialOffsets.x;
      const yOffset = disableY
        ? 0
        : event.clientY - handleState.initialOffsets.y;
      const offsetHypotenuse = Trig.hypotenuse(xOffset, yOffset);
      const radians = Trig.angleRadians(xOffset, yOffset);
      const handleXOffset = disableX
        ? 0
        : offsetHypotenuse < radius || disableBounding
        ? xOffset
        : Trig.getMaxX(radians, radius);
      const handleYOffset = disableY
        ? 0
        : offsetHypotenuse < radius || disableBounding
        ? yOffset
        : Trig.getMaxY(radians, radius);
      setXOffset(handleXOffset);
      setYOffset(handleYOffset);
      onMoveThrottled?.({
        offset: { x: handleXOffset, y: handleYOffset },
        angle: {
          radians: radians,
          degrees: Trig.radiansToDegrees(radians),
        },
        pressure: {
          pixels:
            offsetHypotenuse > radius && !disableBounding
              ? radius
              : offsetHypotenuse,
          percentage:
            offsetHypotenuse > radius && !disableBounding
              ? 100
              : Math.abs((offsetHypotenuse / radius) * 100),
        },
      });
    }
  };

  const handlePointerUp = () => {
    window.removeEventListener("pointermove", handlePointerMove);
    setShouldTransition(true);
    if (!disableReset) {
      handleState = initialStates.handleState();
      setYOffset(0);
      setXOffset(0);
      onMove?.(initialStates.eventState());
    }
  };

  const handlePointerDown = (event: PointerEvent) => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    setShouldTransition(false);
    if (!disableReset || !handleState.dragging) {
      handleState = {
        dragging: true,
        initialOffsets: {
          x: event.clientX,
          y: event.clientY,
        },
      };
    }
  };

  onMove?.(initialStates.eventState());

  return (
    <div
      {...baseProps}
      ref={baseRef}
      style={{ ...styles.base, ...(baseProps.style ?? {}) }}
    >
      <button
        onpointerdown={handlePointerDown}
        disabled={disabled || (disableX && disableY)}
        {...handleProps}
        style={styles.handle(
          xOffset(),
          yOffset(),
          shouldTransition() && !disableResetAnimation,
          resetAnimation,
          handleProps.style,
        )}
      />
    </div>
  );
};

/* props for the Joystick component */
export type JoystickProps = {
  /* the event that fires when the joystick is moved */
  onMove?: (event: JoystickMoveEvent) => void;

  /* disables the handle from all movement */
  disabled?: boolean;

  /* disables the x axis, limiting use to the y axis, if enabled */
  disableX?: boolean;

  /* disables the y axis, limiting use to the x axis, if enabled */
  disableY?: boolean;

  /* disable the boundaries for the joystick handle */
  disableBounding?: boolean;

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
    "onpointerdown" | "style"
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

const initialStates = {
  handleState: () => ({
    dragging: false,
    initialOffsets: { x: 0, y: 0 },
  }),
  eventState: () => ({
    offset: { x: 0, y: 0 },
    angle: { radians: 0, degrees: 0 },
    pressure: { pixels: 0, percentage: 0 },
  }),
};

const styles = {
  base: {
    width: "100%",
    height: "100%",
    display: "flex",
    "justify-content": "center",
    "align-items": "center",
  } as JSX.CSSProperties,
  handle: (
    x: number,
    y: number,
    shouldTransition: boolean,
    resetAnimation?: string,
    otherStyles: JSX.CSSProperties = {},
  ): JSX.CSSProperties => ({
    "touch-action": "none",
    transform: `translate(${x}px,${y}px)`,
    ...(shouldTransition ? { transition: `all ${resetAnimation}` } : {}),
    ...otherStyles,
  }),
};
