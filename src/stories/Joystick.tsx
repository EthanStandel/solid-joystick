import { css, cx } from "@emotion/css";
import { Component, JSXElement, createSignal } from "solid-js";

export const Joystick: Component<Joystick.Props> = ({
  handleChildren,
  baseClass,
  handleClass,
}) => {
  const [xOffset, setXOffset] = createSignal(0);
  const [yOffset, setYOffset] = createSignal(0);
  const [shouldTransition, setShouldTransition] = createSignal(false);
  let base: HTMLDivElement | undefined;
  let state: Joystick.HandleState = {
    dragging: false,
  };

  const handleOnMouseMove = (event: MouseEvent) => {
    if (state.dragging) {
      setXOffset(event.screenX - state.initialOffsets.x);
      setYOffset(event.screenY - state.initialOffsets.y);
    }
  };

  const handleOnMouseUp = () => {
    state = { dragging: false };
    setShouldTransition(true);
    setYOffset(0);
    setXOffset(0);
  };

  const handleOnMouseDown = (event: MouseEvent) => {
    window.addEventListener("mouseup", handleOnMouseUp, { once: true });
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
        onmousedown={handleOnMouseDown}
        onmousemove={handleOnMouseMove}
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
    cursor: pointer;
  `,
};
