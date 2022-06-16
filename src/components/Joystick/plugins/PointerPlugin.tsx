import { initialStates, JoystickPlugin } from "../Joystick";

/**
 * This plugin enables click and single-touch event handling at high-performance.
 */
export const PointerPlugin: () => JoystickPlugin =
  () =>
  ({
    disableX,
    disableY,
    handleState,
    handleHandleMove,
    disableReset,
    setShouldTransition,
    setYOffset,
    setXOffset,
    onMove,
    pluginIndex,
    handleProps,
  }) => {
    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      const xOffset = disableX
        ? 0
        : event.clientX - handleState.initialOffsets.x;
      const yOffset = disableY
        ? 0
        : event.clientY - handleState.initialOffsets.y;
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

    const originalOnPointerDown = handleProps?.onpointerdown;
    Object.assign(handleProps!, {
      onpointerdown: (event: PointerEvent) => {
        if (typeof originalOnPointerDown === "function") {
          //@ts-ignore
          originalOnPointerDown(event);
        }
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp, { once: true });
        setShouldTransition(false);
        if (!disableReset || !handleState.pluginDragging[pluginIndex]) {
          Object.assign(handleState, {
            initialOffsets: {
              x: event.clientX,
              y: event.clientY,
            },
          });
          handleState.pluginDragging[pluginIndex] = true;
        }
      },
    });
  };
