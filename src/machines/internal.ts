import { Machine } from "xstate";

export const idleMachine = Machine(
  {
    id: "idle",
    initial: "idle",
    states: {
      idle: {
        entry: ["logEntry"],
        exit: ["logExit"],
      },
    },
    on: {
      // will not leave current state by add '.'
      DO_NOTHING: ".idle",
    },
  },
  {
    actions: {
      logEntry: () => {
        console.log("entered");
      },
      logExit: () => {
        console.log("exited");
      },
    },
  }
);
