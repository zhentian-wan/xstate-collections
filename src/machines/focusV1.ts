import { assign, createMachine } from "xstate";

export const focusMachine = ({
  maxRetry = 5,
  timeout = 1000,
}: {
  maxRetry: number;
  timeout: number;
}) =>
  createMachine(
    {
      id: "focus",
      initial: "idle",
      context: {
        count: 0,
      },
      states: {
        idle: {
          entry: ["resetCount"],
          on: {
            SEND: {
              target: "focusSend",
            },
          },
        },
        focusSend: {
          entry: ["sendMessage"],
          exit: ["incCount"],
          on: {
            ACK: "focusAck",
          },
          after: {
            [timeout]: {
              target: "focusPending",
            },
          },
        },
        focusPending: {
          on: {
            "": [
              { target: "focusSend", cond: "maxRetry" },
              { target: "focusFailed" },
            ],
          },
        },
        focusAck: {
          entry: ["logAck"],
          exit: ["resetCount"],
          on: {
            SEND: {
              target: "focusSend",
            },
          },
        },
        focusFailed: {
          entry: ["logEnd"],
          exit: ["resetCount"],
          on: {
            SEND: {
              target: "focusSend",
            },
          },
        },
      },
    },
    {
      actions: {
        sendMessage: assign((ctx) => {
          console.log(`${ctx.count}: sending out message`);
          return ctx;
        }),
        logEnd: () => {
          console.log("End");
        },
        logAck: () => {
          console.log("ACK");
        },
        resetCount: assign(() => {
          console.log("Reset");
          return { count: 0 };
        }),
        incCount: assign((ctx) => {
          console.log("inc Count");
          return { count: ctx.count + 1 };
        }),
      },
      guards: {
        maxRetry: (ctx) => {
          return ctx.count < maxRetry;
        },
      },
    }
  );
