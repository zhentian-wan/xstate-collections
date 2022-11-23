import { createMachine, assign } from "xstate";

type MatchingContext = {
  topSelectedItem: any | undefined;
  bottomSelectedItem: any | undefined;
};

type MatchingEvents =
  | { type: "SELECT_TOP"; selectedItem: any }
  | { type: "SELECT_BOTTOM"; selectedItem: any }
  | { type: "RESET" };

type MachingStates =
  | { value: "answering"; context: MatchingContext }
  | { value: "answering.topList"; context: MatchingContext }
  | { value: "answering.topList.unselected"; context: MatchingContext }
  | { value: "answering.topList.selected"; context: MatchingContext }
  | { value: "answering.bottomList"; context: MatchingContext }
  | { value: "answering,bottomList.selected"; context: MatchingContext }
  | { value: "answering,bottomList.unselected"; context: MatchingContext }
  | { value: "submitted.evaluating"; context: MatchingContext }
  | { value: "submitted.correct"; context: MatchingContext }
  | { value: "submitted.incorrect"; context: MatchingContext };

export default createMachine<MatchingContext, MatchingEvents, MachingStates>(
  {
    id: "matching",
    initial: "answering",
    context: {
      topSelectedItem: undefined,
      bottomSelectedItem: undefined,
    },
    states: {
      answering: {
        type: "parallel",
        onDone: "submitted",
        states: {
          topList: {
            initial: "unselected",
            states: {
              unselected: {
                on: {
                  SELECT_TOP: {
                    target: "selected",
                    actions: ["setTopSelectedItem"],
                  },
                },
              },
              selected: {
                type: "final",
              },
            },
          },
          bottomList: {
            initial: "unselected",
            states: {
              unselected: {
                on: {
                  SELECT_BOTTOM: {
                    target: "selected",
                    actions: ["setBottomSelectedItem"],
                  },
                },
              },
              selected: {
                type: "final",
              },
            },
          },
        },
      },
      submitted: {
        initial: "evaluating",
        states: {
          evaluating: {
            on: {
              "": [
                { target: "correct", cond: "isCorrect" },
                { target: "incorrect" },
              ],
            },
          },
          correct: {},
          incorrect: {},
        },
      },
    },
  },
  {
    actions: {
      setTopSelectedItem: assign((ctx, event: any) => ({
        topSelectedItem: event.selectedItem,
      })),
      setBottomSelectedItem: assign((ctx, event: any) => ({
        bottomSelectedItem: event.selectedItem,
      })),
    },
    guards: {
      isCorrect: (ctx) => {
        return ctx.topSelectedItem.homeworld === ctx.bottomSelectedItem.url;
      },
    },
  }
);
