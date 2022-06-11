export namespace Trig {
  export const hypotenuse = (x: number, y: number) => Math.hypot(x, y);

  export const angleRadians = (x: number, y: number) => {
    const inverseTan = Math.atan2(-y, x);
    return inverseTan > 0 ? inverseTan : inverseTan + 2 * Math.PI;
  };

  export const radiansToDegrees = (radians: number) =>
    (radians * 180) / Math.PI;

  export const getMaxX = (angleRadians: number, radius: number) =>
    Math.sin(angleRadians + Math.PI / 2) * radius;

  export const getMaxY = (angleRadians: number, radius: number) =>
    Math.cos(angleRadians + Math.PI / 2) * radius;
}
