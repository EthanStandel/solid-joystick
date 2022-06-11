import { css, cx } from "@emotion/css";
import { Component, JSXElement, createSignal } from "solid-js";

export const Joystick: Component<Joystick.Props> = ({
  handleChildren,
  baseClass,
  handleClass,
  onMove,
}) => {
  const [xOffset, setXOffset] = createSignal(0);
  const [yOffset, setYOffset] = createSignal(0);
  const [shouldTransition, setShouldTransition] = createSignal(false);
  let base: HTMLDivElement | undefined;
  let state: Joystick.HandleState = {
    dragging: false,
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (state.dragging && base) {
      const radius = base.clientWidth / 2;
      const xOffset = event.screenX - state.initialOffsets.x;
      const yOffset = event.screenY - state.initialOffsets.y;
      const offsetHypotenuse = Geometry.hypotenuse(xOffset, yOffset);
      const handleXOffset =
        offsetHypotenuse < radius
          ? xOffset
          : Geometry.getMaxX(xOffset, yOffset, radius);
      const handleYOffset =
        offsetHypotenuse < radius
          ? yOffset
          : Geometry.getMaxY(xOffset, yOffset, radius);
      setXOffset(handleXOffset);
      setYOffset(handleYOffset);
      console.log(
        offsetHypotenuse > radius ? 100 : (offsetHypotenuse / radius) * 100,
      );
      onMove?.({
        offset: { x: handleXOffset, y: handleYOffset },
        angle: {
          radians: Geometry.angleRadians(handleXOffset, handleYOffset),
          degrees: Geometry.angleDegrees(handleXOffset, handleYOffset),
        },
        pressure: {
          pixels: offsetHypotenuse > radius ? radius : offsetHypotenuse,
          percentage:
            offsetHypotenuse > radius ? 100 : (offsetHypotenuse / radius) * 100,
        },
      });
    }
  };

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove);
    state = { dragging: false };
    setShouldTransition(true);
    setYOffset(0);
    setXOffset(0);
    onMove?.({
      offset: { x: 0, y: 0 },
      angle: { radians: 0, degrees: 0 },
      pressure: { pixels: 0, percentage: 0 },
    });
  };

  const handleMouseDown = (event: MouseEvent) => {
    window.addEventListener("mouseup", handleMouseUp, { once: true });
    window.addEventListener("mousemove", handleMouseMove);
    setShouldTransition(false);
    state = {
      dragging: true,
      initialOffsets: {
        x: event.screenX,
        y: event.screenY,
      },
    };
  };

  return (
    <div ref={base} class={cx(styles.base, baseClass)}>
      <button
        onmousedown={handleMouseDown}
        class={cx(styles.handle, handleClass)}
        style={{
          transform: `translate(${xOffset()}px,${yOffset()}px)`,
          ...(shouldTransition() ? { transition: "all .2s ease" } : {}),
        }}
      >
        {handleChildren}
      </button>
    </div>
  );
};

export namespace Joystick {
  export type Props = {
    onMove?: (event: MoveEvent) => void;
    handleChildren: JSXElement;
    baseClass?: string;
    handleClass?: string;
  };
  export type HandleState =
    | {
        dragging: false;
      }
    | {
        dragging: true;
        initialOffsets: {
          x: number;
          y: number;
        };
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

const styles = {
  base: css`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  handle: css`
    all: unset;
    cursor: grab;
  `,
};

namespace Geometry {
  export const hypotenuse = (x: number, y: number) => Math.hypot(x, y);
  export const angleRadians = (x: number, y: number) => {
    const inverseTan = Math.atan2(-y, x);
    return inverseTan > 0 ? inverseTan : inverseTan + 2 * Math.PI;
  };
  export const angleDegrees = (x: number, y: number) =>
    (angleRadians(x, y) * 180) / Math.PI;
  export const getMaxX = (x: number, y: number, radius: number) => {
    const angle = angleRadians(x, y);
    return Math.sin(angle + Math.PI / 2) * radius;
  };
  export const getMaxY = (x: number, y: number, radius: number) => {
    const angle = angleRadians(x, y);
    return Math.cos(angle + Math.PI / 2) * radius;
  };
}
