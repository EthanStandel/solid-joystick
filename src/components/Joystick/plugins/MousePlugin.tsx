import { initialStates, JoystickPlugin } from "../Joystick";

/**
 * This plugin enables click handling for a mouse. This plugin is best used with the `TouchPlugin` if multitouch will be a requirement. If multitouch is not a concern then it would be best to just use the `PointerPlugin` which handles single-touch and click events.
 */
export const MousePlugin: () => JoystickPlugin =
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
    const handlePointerMove = (event: MouseEvent) => {
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
      window.removeEventListener("mousemove", handlePointerMove);
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
      onmousedown: (event: MouseEvent) => {
        if (typeof originalOnPointerDown === "function") {
          //@ts-ignore
          originalOnPointerDown(event);
        }
        window.addEventListener("mousemove", handlePointerMove);
        window.addEventListener("mouseup", handlePointerUp, { once: true });
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
