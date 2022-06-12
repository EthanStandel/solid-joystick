import { css } from "@emotion/css";
import { Component, createSignal } from "solid-js";

import { Joystick, JoystickMoveEvent } from "../components/Joystick";

export default {
  title: "Example/Joystick",
  argTypes: {
    boundingModel: {
      control: {
        type: "select",
        options: ["inner", "center", "outer", "none"],
      },
    },
  },
};

const parser = new DOMParser();
document.body.style.padding = "0";

type TemplateOptions = {
  boundingModel: "inner" | "center" | "outer" | "none";
  boundaryModifier: number;
  disabled: boolean;
  disableX: boolean;
  disableY: boolean;
  disableReset: boolean;
  disableBounding: boolean;
  throttleEventsBy: number;
  handleChildren: string;
  baseStyles: string;
  handleStyles: string;
  disableResetAnimation: boolean;
  resetAnimation: string;
};

const Template = ((args: TemplateOptions) => {
  const [eventState, setEventState] = createSignal<JoystickMoveEvent>();
  const handleChildren = parser.parseFromString(
    args.handleChildren,
    "text/html",
  ).body.firstChild;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
      }}
    >
      <code
        style={{
          height: "3em",
          position: "absolute",
          top: "10px",
          left: "10px",
          "z-index": 1,
        }}
        innerHTML={JSON.stringify(eventState() ?? {}, undefined, 2)
          .replace(/\n/g, "<br>")
          .replace(/ /g, "&nbsp")}
      ></code>
      <div>
        <div
          style={{
            height: "min(95vh, 95vw)",
            width: "min(95vh, 95vw)",
          }}
        >
          <Joystick
            {...args}
            onMove={event => {
              event.angle.degrees;
              setEventState(event);
            }}
            handleProps={{
              children: handleChildren,
              class: css`
                ${args.handleStyles}
              `,
            }}
            baseProps={{
              class: css`
                ${args.baseStyles}
              `,
            }}
          />
        </div>
      </div>
    </div>
  );
}) as Component<TemplateOptions> & { args?: TemplateOptions };

export const Styled = Template.bind({});
Styled.args = {
  boundingModel: "center",
  boundaryModifier: 0,
  disabled: false,
  disableX: false,
  disableY: false,
  disableReset: false,
  disableBounding: false,
  throttleEventsBy: 0,
  resetAnimation: ".2s ease /* default */",
  disableResetAnimation: false,
  baseStyles: `
    border-radius: 50%;
    background: gray;
  `,
  handleStyles: `
    all: unset;
    background: red;
    width: 25%;
    height: 25%;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: box-shadow 0.3s ease;
    cursor: grab;
    &:active {
      cursor: grabbing;
    }
    &:not([disabled]) {
      &:active,
      &:focus-visible
      &:focus:active {
        box-shadow: 0px 0px 10px black;
      }
    }
    &[disabled] {
      background: lightgray;
      cursor: not-allowed;
    }
  `,
  handleChildren: ((
    <span
      style={{
        color: "white",
        "font-weight": "bold",
        "font-family": "arial",
        "user-select": "none",
        "text-align": "center",
      }}
    >
      Drag 🕹 me!
    </span>
  ) as HTMLSpanElement)!.outerHTML,
};

export const Unstyled = Template.bind({});
Unstyled.args = {
  boundingModel: "center",
  boundaryModifier: 0,
  disabled: false,
  disableX: false,
  disableY: false,
  disableReset: false,
  disableBounding: false,
  throttleEventsBy: 0,
  resetAnimation: ".2s ease /* default */",
  disableResetAnimation: false,
  baseStyles: "",
  handleStyles: "",
  handleChildren: "Drag 🕹 me",
};
