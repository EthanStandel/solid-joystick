import { Component, createSignal, onMount } from "solid-js";
import type { JSX } from "solid-js/types";

import { Trig } from "../utils/Trig";

export const Joystick: Component<JoystickProps> = ({
  onMove,
  disableReset,
  disableResetAnimation,
  disabled,
  disableX,
  disableY,
  boundingModel = "center",
  boundaryModifier = 0,
  throttleEventsBy = 0,
  resetAnimation = ".2s ease",
  enableGamepadSupport,
  baseProps = {},
  handleProps = {},
}) => {
  const [xOffset, setXOffset] = createSignal(0);
  const [yOffset, setYOffset] = createSignal(0);
  const [shouldTransition, setShouldTransition] = createSignal(false);
  const handleState = initialStates.handleState();
  let baseRef: HTMLDivElement | undefined;
  let handleRef: HTMLButtonElement | undefined;

  const getRadius = () => {
    if (baseRef && handleRef) {
      const edgeBoundingModifier =
        boundingModel === "inner" || boundingModel === "outer"
          ? Math.max(handleRef.clientWidth, handleRef.clientHeight) / 2
          : 0;
      return (
        baseRef.clientWidth / 2 +
        (boundingModel === "outer"
          ? edgeBoundingModifier
          : -edgeBoundingModifier) +
        boundaryModifier
      );
    } else {
      throw new Error("Trying to get radius before baseRef rendered");
    }
  };

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

  const handleHandleMove = (xOffset: number, yOffset: number) => {
    const radius = getRadius();
    if (
      (handleState.pointerDragging || handleState.gamepadDragging) &&
      baseRef &&
      handleRef &&
      !disabled
    ) {
      const offsetHypotenuse = Trig.hypotenuse(xOffset, yOffset);
      const radians = Trig.angleRadians(xOffset, yOffset);
      const handleXOffset = disableX
        ? 0
        : offsetHypotenuse < radius || boundingModel === "none"
        ? xOffset
        : Trig.getMaxX(radians, radius);
      const handleYOffset = disableY
        ? 0
        : offsetHypotenuse < radius || boundingModel === "none"
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
            offsetHypotenuse > radius && boundingModel !== "none"
              ? radius
              : offsetHypotenuse,
          percentage:
            offsetHypotenuse > radius && boundingModel !== "none"
              ? 100
              : Math.abs((offsetHypotenuse / radius) * 100),
        },
      });
    }
  };

  if (enableGamepadSupport) {
    onMount(() => {
      const gamepadConfig = initialStates.gamepadConfig(enableGamepadSupport);

      const getGamepad = () =>
        window.navigator.getGamepads()?.[gamepadConfig.index];
      window.addEventListener("gamepadconnected", (event: GamepadEvent) => {
        if (event.gamepad.index === gamepadConfig.index) {
          checkGamepad();
        }
      });

      const onGamepadUpdate = () => {
        const gamepad = getGamepad();
        if (gamepad) {
          const radius = getRadius();
          const x = gamepad.axes[gamepadConfig.xIndex];
          const y = gamepad.axes[gamepadConfig.yIndex];
          const deadX = Math.abs(x) < gamepadConfig.deadzonePercent;
          const deadY = Math.abs(y) < gamepadConfig.deadzonePercent;
          if (!deadX || !deadY) {
            const xMoved = x !== handleState.initialOffsets.x;
            const yMoved = y !== handleState.initialOffsets.y;
            if (xMoved || yMoved) {
              Object.assign(handleState, {
                gamepadDragging: true,
                initialOffsets: { x, y },
              });
              setShouldTransition(false);
              handleHandleMove(x * radius, y * radius);
            }
          } else if (deadX && deadY && handleState.gamepadDragging) {
            Object.assign(handleState, {
              gamepadDragging: false,
              initialOffsets: { x: 0, y: 0 },
            });
            setShouldTransition(true);
            setXOffset(0);
            setYOffset(0);
            onMove?.(initialStates.eventState());
          }
          checkGamepad();
        }
      };

      const checkGamepad = () => {
        if (gamepadConfig.pollingModel === "requestAnimationFrame") {
          requestAnimationFrame(onGamepadUpdate);
        } else if (typeof gamepadConfig.pollingModel === "number") {
          setTimeout(onGamepadUpdate, gamepadConfig.pollingModel);
        }
      };

      checkGamepad();
    });
  }

  const handlePointerMove = (event: PointerEvent) => {
    event.preventDefault();
    const xOffset = disableX ? 0 : event.clientX - handleState.initialOffsets.x;
    const yOffset = disableY ? 0 : event.clientY - handleState.initialOffsets.y;
    handleHandleMove(xOffset, yOffset);
  };

  const handlePointerUp = () => {
    window.removeEventListener("pointermove", handlePointerMove);
    setShouldTransition(true);
    if (!disableReset) {
      Object.assign(handleState, initialStates.handleState());
      setYOffset(0);
      setXOffset(0);
      onMove?.(initialStates.eventState());
    }
  };

  const handlePointerDown = (event: PointerEvent) => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    setShouldTransition(false);
    if (!disableReset || !handleState.pointerDragging) {
      Object.assign(handleState, {
        pointerDragging: true,
        initialOffsets: {
          x: event.clientX,
          y: event.clientY,
        },
      });
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
        {...handleProps}
        ref={handleRef}
        onpointerdown={handlePointerDown}
        disabled={disabled || (disableX && disableY)}
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

  /**
   * enables gamepad support, great for if you want your application to support a virtual joystick and a hardware joystick
   *
   * WARNING: the Gamepad API requires polling which can severely limit performance of the surrounding application
   *
   * default: undefined (which disables the feature)
   **/
  enableGamepadSupport?: boolean | Partial<GamepadSupportOptions>;

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

/* data which is forwarded when the handle is moved */
export type JoystickMoveEvent = {
  /* offset, in pixels, that the handle has been dragged from its initial position */
  offset: { x: number; y: number };

  /* angle that the joystick has been dragged, offered in both radians & degrees */
  angle: { radians: number; degrees: number };

  /* total distance that the handle has been dragged from the center of the base, offered in both pixels & percentage */
  pressure: { pixels: number; percentage: number };
};

/* config for gamepad support implementation */
export type GamepadSupportOptions = {
  /* which axis would you like to forward to events from; 0 is usually left and 2 is usually right */
  /* default: 0 */
  xIndex: number;

  /* which axis would you like to forward to events from; 1 is usually left and 3 is usually right */
  /* default: 1 */
  yIndex: number;

  /* the gamepad in the array you'd like to use, very likely to be 0 */
  /* default: 0 */
  index: number;

  /* either check the gamepad on every available animation frame or check it on recursive setTimeouts */
  /* default: "requestAnimationFrame" */
  pollingModel: "requestAnimationFrame" | number;

  /* The percentage from the base you'd like to ignore, to avoid physical innaccuracies */
  /* default: 0.05 (5%) */
  deadzonePercent: number;
};

export const initialStates = {
  handleState: () => ({
    pointerDragging: false,
    gamepadDragging: false,
    initialOffsets: { x: 0, y: 0 },
  }),
  eventState: () => ({
    offset: { x: 0, y: 0 },
    angle: { radians: 0, degrees: 0 },
    pressure: { pixels: 0, percentage: 0 },
  }),
  gamepadConfig: (
    gamepadSupportProp: Partial<GamepadSupportOptions> | true,
  ): GamepadSupportOptions => ({
    xIndex: 0,
    yIndex: 1,
    index: 0,
    deadzonePercent: 0.05,
    pollingModel: "requestAnimationFrame",
    ...(gamepadSupportProp !== true ? gamepadSupportProp : {}),
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
