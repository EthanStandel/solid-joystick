import { onMount } from "solid-js";

import { initialStates, JoystickPlugin } from "../Joystick";

/**
 * This plugin enables gamepad support, which can be great for application which support a virtual joystick _and_ a hardware joystick.
 *
 * **WARNING**: The Gamepad API requires polling which can severely limit performance of the surrounding application, use with caution.
 **/
export const GamepadPlugin: (
  gamepadOptions?: Partial<GamepadPluginOptions>,
) => JoystickPlugin =
  (gamepadOptions = {}) =>
  ({
    getRadius,
    handleState,
    setShouldTransition,
    handleHandleMove,
    pluginIndex,
    setXOffset,
    setYOffset,
    onMove,
  }) => {
    onMount(() => {
      const gamepadConfig = initialGamepadConfig(gamepadOptions);

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
                initialOffsets: { x, y },
              });
              handleState.pluginDragging[pluginIndex] = true;
              setShouldTransition(false);
              handleHandleMove(x * radius, y * radius);
            }
          } else if (
            deadX &&
            deadY &&
            handleState.pluginDragging[pluginIndex]
          ) {
            Object.assign(handleState, {
              initialOffsets: { x: 0, y: 0 },
            });
            handleState.pluginDragging[pluginIndex] = false;
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
  };

/**
 * The config for gamepad support implementation.
 **/
export type GamepadPluginOptions = {
  /**
   * Which axis index would you like to forward to events as the X index. 0 is usually left stick and 2 is usually right stick.
   * default: 0
   **/
  xIndex: number;

  /**
   * Which axis index would you like to forward to events as the Y index. 1 is usually left stick and 3 is usually right stick.
   * default: 1
   **/
  yIndex: number;

  /**
   * The gamepad index in window.navigator.getGamepads() you'd like to use. Very likely to be 0.
   * default: 0
   **/
  index: number;

  /**
   * One may either check the gamepad on every available animation frame or check it on recursive setTimeouts.
   * default: "requestAnimationFrame"
   **/
  pollingModel: "requestAnimationFrame" | number;

  /**
   * The percentage from the base you'd like to ignore, to avoid physical innaccuracies.
   * default: 0.05 (5%)
   **/
  deadzonePercent: number;
};

export const initialGamepadConfig = (
  gamepadSupportProp: Partial<GamepadPluginOptions> = {},
): GamepadPluginOptions => ({
  xIndex: 0,
  yIndex: 1,
  index: 0,
  deadzonePercent: 0.05,
  pollingModel: "requestAnimationFrame",
  ...(gamepadSupportProp !== true ? gamepadSupportProp : {}),
});
