import { initialStates, JoystickPlugin } from "../Joystick";

/**
 * This plugin enables multitouch. It should be used with the `MousePlugin` in situations where multitouch is required. Otherwise, the PointerPlugin should be used as it as higher performance with single-touch events.
 */
export const MultiTouchPlugin: () => JoystickPlugin =
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
    handleRef,
  }) => {
    const handlePointerMove = (event: TouchEvent) => {
      event.preventDefault();
      const xOffset = disableX
        ? 0
        : event.targetTouches[0].clientX - handleState.initialOffsets.x;
      const yOffset = disableY
        ? 0
        : event.targetTouches[0].clientY - handleState.initialOffsets.y;
      handleHandleMove(xOffset, yOffset);
    };

    const handlePointerUp = () => {
      handleRef.current!.removeEventListener("touchmove", handlePointerMove);
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
      ontouchstart: (event: TouchEvent) => {
        if (typeof originalOnPointerDown === "function") {
          //@ts-ignore
          originalOnPointerDown(event);
        }
        handleRef.current!.addEventListener("touchmove", handlePointerMove);
        handleRef.current!.addEventListener("touchend", handlePointerUp, {
          once: true,
        });
        setShouldTransition(false);
        if (!disableReset || !handleState.pluginDragging[pluginIndex]) {
          Object.assign(handleState, {
            initialOffsets: {
              x: event.targetTouches[0].clientX,
              y: event.targetTouches[0].clientY,
            },
          });
          handleState.pluginDragging[pluginIndex] = true;
        }
      },
    });
  };
