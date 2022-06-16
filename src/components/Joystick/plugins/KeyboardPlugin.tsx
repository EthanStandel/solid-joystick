import { onCleanup, createSignal, createEffect } from "solid-js";

import { initialStates, JoystickPlugin } from "../Joystick";

/**
 * This plugin enables click and single-touch event handling at high-performance.
 */
export const KeyboardPlugin: (
  options?: KeyboardPluginOptions,
) => JoystickPlugin =
  (
    {
      up,
      down,
      left,
      right,
    }: KeyboardPluginOptions = initialKeyboardPluginOptions(),
  ) =>
  ({
    handleHandleMove,
    getRadius,
    handleState,
    pluginIndex,
    setXOffset,
    setYOffset,
    setShouldTransition,
    onMove,
  }) => {
    const [activeKeys, setActiveKeys] = createSignal<{
      up?: boolean;
      down?: boolean;
      left?: boolean;
      right?: boolean;
    }>({});

    createEffect(() => {
      const keys = activeKeys();
      try {
        const radius = getRadius();
        setShouldTransition(true);
        let xOffset = 0;
        let yOffset = 0;
        if (keys.up) {
          yOffset -= radius;
        }
        if (keys.down) {
          yOffset += radius;
        }
        if (keys.left) {
          xOffset -= radius;
        }
        if (keys.right) {
          xOffset += radius;
        }
        if (xOffset === 0 && yOffset === 0) {
          handleState.pluginDragging[pluginIndex] = false;
          setXOffset(0);
          setYOffset(0);
          onMove?.(initialStates.eventState());
        } else {
          handleState.pluginDragging[pluginIndex] = true;
        }
        handleHandleMove(xOffset, yOffset);
      } catch {
        // ignore
      }
    });

    const onKeydown = (event: KeyboardEvent) => {
      if (event.code === up) {
        setActiveKeys({ ...activeKeys(), up: true });
      } else if (event.code === down) {
        setActiveKeys({ ...activeKeys(), down: true });
      } else if (event.code === left) {
        setActiveKeys({ ...activeKeys(), left: true });
      } else if (event.code === right) {
        setActiveKeys({ ...activeKeys(), right: true });
      }
    };

    const onKeyup = (event: KeyboardEvent) => {
      if (event.code === up) {
        setActiveKeys({ ...activeKeys(), up: false });
      } else if (event.code === down) {
        setActiveKeys({ ...activeKeys(), down: false });
      } else if (event.code === left) {
        setActiveKeys({ ...activeKeys(), left: false });
      } else if (event.code === right) {
        setActiveKeys({ ...activeKeys(), right: false });
      }
    };

    window.addEventListener("keydown", onKeydown);
    window.addEventListener("keyup", onKeyup);

    onCleanup(() => {
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("keyup", onKeyup);
    });
  };

export type KeyboardPluginOptions = {
  up: string;
  down: string;
  left: string;
  right: string;
};

export const initialKeyboardPluginOptions = (
  init: "wasd" | "arrows" = "wasd",
): KeyboardPluginOptions =>
  init === "wasd"
    ? { up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD" }
    : {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
      };
