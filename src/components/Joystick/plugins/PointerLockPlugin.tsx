import { Trig } from "../../../utils/Trig";
import { initialStates, JoystickPlugin } from "../Joystick";

/**
 * This plugin allows for mouse movement to be bound to to a locked pointer. This is best for representing a viewpoint in a 3D space and first-person games.
 */
export const PointerLockPlugin: (
  options?: Partial<PointerLockPluginOptions>,
) => JoystickPlugin =
  ({ hideOnLock = false } = {}) =>
  ({ handleProps, getRadius, setXOffset, setYOffset, onMove, baseRef }) => {
    const canvas = (
      <canvas
        style={{
          "z-index": -1,
          height: "1px",
          width: "1px",
          background: "transparent",
        }}
      />
    ) as HTMLCanvasElement;

    const handleChildrenRef = handleProps.children ?? null;
    handleProps.children = (
      <>
        {handleChildrenRef}
        {canvas}
      </>
    );

    const onLock = (locked: boolean) => {
      if (baseRef.current && hideOnLock) {
        baseRef.current.style.visibility = locked ? "hidden" : "unset";
      }
    };

    const mouseListener = () => {
      const radius = getRadius();
      const offsetMultiplier = radius * 0.1;
      let latestEvent: undefined | MouseEvent;

      const reset = () => {
        setXOffset(0);
        setYOffset(0);
        onMove(initialStates.eventState());
      };

      const onAnimationFrame = () => {
        requestAnimationFrame(() => {
          if (!document.pointerLockElement) {
            reset();
            onLock(false);
            document.removeEventListener("mousemove", onMouseMove);
          } else {
            if (latestEvent) {
              latestEvent = undefined;
            } else {
              reset();
            }
            onAnimationFrame();
          }
        });
      };

      onAnimationFrame();

      const onMouseMove = (event: MouseEvent) => {
        latestEvent = event;
        if (document.pointerLockElement) {
          setXOffset(event.movementX * offsetMultiplier);
          setYOffset(event.movementY * offsetMultiplier);
          const radians = Trig.angleRadians(event.movementX, event.movementY);
          const offsetHypotenuse = Trig.hypotenuse(
            event.movementX,
            event.movementY,
          );
          onMove({
            offset: {
              pixels: { x: event.movementX, y: event.movementY },
              percentage: {
                x: (event.movementX * offsetMultiplier) / radius,
                y: (event.movementY * offsetMultiplier) / radius,
              },
            },
            angle: {
              radians: radians,
              degrees: Trig.radiansToDegrees(radians),
            },
            pressure: {
              pixels: offsetHypotenuse,
              percentage: offsetHypotenuse * offsetMultiplier,
            },
          });
        }
      };
      document.addEventListener("mousemove", onMouseMove);
    };

    const handleClickHandlerRef = handleProps.onclick;
    handleProps.onclick = event => {
      if (typeof handleClickHandlerRef === "function") {
        handleClickHandlerRef(event);
      }
      onLock(true);
      canvas.requestPointerLock();
      setTimeout(() => mouseListener(), 100); // waiting a little bit for pointerLockElement mount
    };
  };

/**
 * The config for pointer-lock support implementation.
 **/
export type PointerLockPluginOptions = {
  /**
   * When the pointer is locked, hide the visual joystick.
   * default: false
   **/
  hideOnLock: boolean;
};
