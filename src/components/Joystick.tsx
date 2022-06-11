import { Component, JSXElement, createSignal } from "solid-js";
import type { JSX } from "solid-js/types";

import { Trig } from "../utils/Trig";

export const Joystick: Component<Joystick.Props> = ({
  onMove,
  disableReset,
  disableResetAnimation,
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

  const handlePointerMove = (event: PointerEvent) => {
    event.preventDefault();
    if (handleState.dragging && baseRef) {
      const radius = baseRef.clientWidth / 2;
      const xOffset = event.clientX - handleState.initialOffsets.x;
      const yOffset = event.clientY - handleState.initialOffsets.y;
      const offsetHypotenuse = Trig.hypotenuse(xOffset, yOffset);
      const radians = Trig.angleRadians(xOffset, yOffset);
      const handleXOffset =
        offsetHypotenuse < radius || disableBounding
          ? xOffset
          : Trig.getMaxX(radians, radius);
      const handleYOffset =
        offsetHypotenuse < radius || disableBounding
          ? yOffset
          : Trig.getMaxY(radians, radius);
      setXOffset(handleXOffset);
      setYOffset(handleYOffset);
      onMove?.({
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
    <div style={styles.base} ref={baseRef} {...baseProps}>
      <button
        onpointerdown={handlePointerDown}
        style={styles.handle(
          xOffset(),
          yOffset(),
          shouldTransition() && !disableResetAnimation,
          resetAnimation,
        )}
        {...handleProps}
      />
    </div>
  );
};

export namespace Joystick {
  export type Props = {
    disableBounding?: boolean;
    onMove?: (event: MoveEvent) => void;
    disableResetAnimation?: boolean;
    resetAnimation?: string;
    disableReset?: boolean;
    baseProps: Omit<JSX.HTMLAttributes<HTMLDivElement>, "style" | "ref">;
    handleProps: Omit<
      JSX.HTMLAttributes<HTMLButtonElement>,
      "onpointerdown" | "style"
    >;
  };
  export type MoveEvent = {
    offset: {
      x: number;
      y: number;
    };
    angle: {
      radians: number;
      degrees: number;
    };
    pressure: {
      pixels: number;
      percentage: number;
    };
  };
}

export const initialStates = {
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

export const styles = {
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
  ): JSX.CSSProperties => ({
    "touch-action": "none",
    transform: `translate(${x}px,${y}px)`,
    ...(shouldTransition ? { transition: `all ${resetAnimation}` } : {}),
  }),
};
