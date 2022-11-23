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
  | {
      value: "successful";
      context: FetchContext & {
        results: [];
        message: "";
      };
    };

type FetchMachineEvents =
  | { type: "FETCH" }
  | { type: "RESOLVE"; results: any[] }
  | { type: "REJECT"; message: string };

interface FetchContext {
  results: any[];
  message: string;
}

export default createMachine<FetchContext, FetchMachineEvents, FetchStates>(
  {
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
        entry: ["fetchData"],
        on: {
          RESOLVE: { target: "successful", actions: ["setResults"] },
          REJECT: { target: "failed", actions: ["setMessage"] },
        },
      },
      failed: {
        on: {
          FETCH: "pending",
        },
      },
      successful: {
        on: {
          FETCH: "pending",
        },
      },
    },
  },
  {
    actions: {
      setResults: assign((ctx, event: any) => ({
        results: event.results,
      })),
      setMessage: assign((ctx, event: any) => ({
        message: event.message,
      })),
    },
  }
);
