import { Accessor, Component, createSignal, Setter } from "solid-js";
import type { JSX } from "solid-js/types";

import { Trig } from "../../utils/Trig";

export const Joystick: Component<Partial<JoystickProps>> = ({
  onMove = () => undefined,
  disableReset = false,
  disableResetAnimation = false,
  disabled = false,
  disableX = false,
  disableY = false,
  boundingModel = "center",
  boundaryModifier = 0,
  throttleEventsBy = 0,
  resetAnimation = ".2s ease",
  baseProps = {},
  handleProps = {},
  plugins = [],
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
      handleState.pluginDragging.some(dragging => dragging) &&
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
        offset: {
          pixels: { x: handleXOffset, y: handleYOffset },
          percentage: { x: handleXOffset / radius, y: handleYOffset / radius },
        },
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

  onMove?.(initialStates.eventState());

  plugins.forEach((plugin, pluginIndex) =>
    // props MUST be de- and re-structured like this to get the reference out of the proxy
    plugin({
      // props
      onMove,
      disableReset,
      disableResetAnimation,
      disabled,
      disableX,
      disableY,
      boundingModel,
      boundaryModifier,
      throttleEventsBy,
      resetAnimation,
      baseProps,
      handleProps,
      plugins,
      // state
      handleHandleMove,
      getRadius,
      xOffset,
      setXOffset,
      yOffset,
      setYOffset,
      shouldTransition,
      setShouldTransition,
      pluginIndex,
      handleState,
    }),
  );

  return (
    <div
      {...baseProps}
      ref={baseRef}
      style={{ ...styles.base, ...(baseProps.style ?? {}) }}
    >
      <button
        {...handleProps}
        ref={handleRef}
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

export const initialStates = {
  handleState: () => ({
    pluginDragging: [] as Array<boolean>,
    initialOffsets: { x: 0, y: 0 },
  }),
  eventState: () => ({
    offset: {
      pixels: { x: 0, y: 0 },
      percentage: { x: 0, y: 0 },
    },
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
