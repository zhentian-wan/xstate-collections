import { assign, createMachine } from "xstate";

type FetchStates =
  | {
      value: "idle";
      context: FetchContext & {
        results: [];
        message: "";
      };
    }
  | { value: "pending"; context: FetchContext }
  | {
      value: "failed";
      context: FetchContext & {
        results: [];
        message: "";
      };
    }
  | SuccessfulStates;

type SuccessfulStates =
  | {
      value: "successful.withData";
      context: FetchContext & {
        results: [];
        message: "";
      };
    }
  | {
      value: "successful.withoutData";
      context: FetchContext & {
        results: [];
        message: "";
      };
    }
  | {
      value: "successful.unknown";
      context: FetchContext & {
        results: [];
        message: "";
      };
    };

type FetchMachineEvents = { type: "FETCH" };

interface FetchContext {
  results: any[];
  message: string;
}

export default createMachine<FetchContext, FetchMachineEvents, FetchStates>(
  {
    predictableActionArguments: true,
    id: "fetch",
    initial: "idle",
    context: {
      results: [],
      message: "",
    },
    states: {
      idle: {
        on: {
          FETCH: "pending",
        },
      },
      pending: {
        invoke: {
          src: "fetchData", // component defines the service
          //src: () => {}, // inline service
          onDone: {
            target: "successful",
            actions: ["setResults"],
          },
          onError: { target: "failed", actions: ["setMessage"] },
        },
      },
      failed: {
        on: {
          FETCH: "pending",
        },
      },
      successful: {
        initial: "unknown",
        on: {
          FETCH: "pending",
        },
        states: {
          unknown: {
            on: {
              // once enter 'successful' state, will start from here
              "": [
                { target: "withData", cond: "hasData" },
                { target: "withoutData" },
              ],
            },
          },
          withData: {},
          withoutData: {},
        },
      },
    },
  },
  {
    actions: {
      setResults: assign((ctx, event: any) => ({
        results: event.data,
      })),
      setMessage: assign((ctx, event: any) => ({
        message: event.data,
      })),
    },
    guards: {
      hasData: (ctx: FetchContext, event: any) => {
        return ctx.results && ctx.results.length > 0;
      },
    },
  }
);
