import { createMachine } from "xstate";

export const historyMachine = createMachine({
  id: "spaceHeater",
  initial: "poweredOff",
  states: {
    poweredOff: {
      on: { TOGGLE_POWER: "poweredOn.hist" },
    },
    poweredOn: {
      on: { TOGGLE_POWER: "poweredOff" },
      type: "parallel",
      states: {
        heated: {
          initial: "lowHeat",
          states: {
            lowHeat: {
              on: { TOGGLE_HEAT: "highHeat" },
            },
            highHeat: {
              on: { TOGGLE_HEAT: "lowHeat" },
            },
          },
        },
        oscillation: {
          initial: "disabled",
          states: {
            disabled: {
              on: { TOGGLE_OSC: "enabled" },
            },
            enabled: {
              on: { TOGGLE_OSC: "disabled" },
            },
          },
        },
        hist: {
          type: "history",
          history: "deep",
        },
      },
    },
  },
});
