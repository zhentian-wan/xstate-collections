import { Machine } from "xstate";
import { send } from "xstate/lib/actions";

export const echoMachine = Machine({
  id: "echo",
  initial: "listening",
  states: {
    listening: {
      on: {
        SPEAK: {
          // from SPEAK action to ECHO action
          actions: send("ECHO"),
        },
        ECHO: {
          actions: () => {
            console.log("echo, echo");
          },
        },
      },
    },
  },
});
