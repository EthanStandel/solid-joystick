import { Trig } from "../../../utils/Trig";
import { initialStates, JoystickPlugin } from "../Joystick";

/**
 * This plugin enables multitouch. It should be used with the `MousePlugin` in situations where multitouch is required. Otherwise, the PointerPlugin should be used as it as higher performance with single-touch events.
 */
export const PointerLockPlugin: () => JoystickPlugin =
  () =>
  ({ handleProps, getRadius, setXOffset, setYOffset, onMove }) => {
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

    const otherHandleChildren = handleProps.children ?? null;
    handleProps.children = (
      <>
        {otherHandleChildren}
        {canvas}
      </>
    );

    const mouseListener = () => {
      const radius = getRadius();
      const offsetMultiplier = radius * 0.1;
      const onMouseMove = (event: MouseEvent) => {
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
        } else {
          setXOffset(event.movementX * offsetMultiplier);
          setYOffset(event.movementY * offsetMultiplier);
          onMove(initialStates.eventState());
          document.removeEventListener("mousemove", onMouseMove);
        }
      };
      document.addEventListener("mousemove", onMouseMove);
    };

    const otherHandleClickHandler = handleProps.onclick;
    handleProps.onclick = event => {
      if (typeof otherHandleClickHandler === "function") {
        otherHandleClickHandler(event);
      }
      canvas.requestPointerLock();
      mouseListener();
    };
  };
