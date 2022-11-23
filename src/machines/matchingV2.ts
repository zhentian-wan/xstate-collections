import { createMachine, assign } from "xstate";

type MatchingContext = {
  topSelectedItem: any | undefined;
  bottomSelectedItem: any | undefined;
};

type MatchingEvents =
  | { type: "SELECT_TOP"; selectedItem: any }
  | { type: "SELECT_BOTTOM"; selectedItem: any }
  | { type: "CONTINUE" }
  | { type: "CHANGE_ANSWERS" }
  | { type: "SUBMIT" }
  | { type: "RESET" };

type MachingStates =
  | { value: "quiz"; context: MatchingContext }
  | { value: "quiz.answering"; context: MatchingContext }
  | { value: "quiz.verifying"; context: MatchingContext }
  | { value: "quiz.answering.topList"; context: MatchingContext }
  | { value: "quiz.answering.topList.unselected"; context: MatchingContext }
  | { value: "quiz.answering.topList.selected"; context: MatchingContext }
  | { value: "quiz.answering.bottomList"; context: MatchingContext }
  | { value: "quiz.answering,bottomList.selected"; context: MatchingContext }
  | { value: "quiz.answering,bottomList.unselected"; context: MatchingContext }
  | { value: "submitted.evaluating"; context: MatchingContext }
  | { value: "submitted.correct"; context: MatchingContext }
  | { value: "submitted.incorrect"; context: MatchingContext };

export default createMachine<MatchingContext, MatchingEvents, MachingStates>(
  {
    id: "matching",
    initial: "quiz",
    context: {
      topSelectedItem: undefined,
      bottomSelectedItem: undefined,
    },
    states: {
      quiz: {
        initial: "answering",
        states: {
          answering: {
            type: "parallel",
            on: {
              CONTINUE: {
                target: "verifying",
              },
            },
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
                    on: {
                      SELECT_TOP: {
                        target: "selected",
                        actions: ["setTopSelectedItem"],
                      },
                    },
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
                    on: {
                      SELECT_BOTTOM: {
                        target: "selected",
                        actions: ["setBottomSelectedItem"],
                      },
                    },
                    type: "final",
                  },
                },
              },
              hist: {
                type: "history",
                history: "deep",
              },
            },
          },
          verifying: {
            on: {
              CHANGE_ANSWERS: "answering.hist",
              SUBMIT: "#submitted", // using submitted id
            },
          },
        },
      },
      submitted: {
        id: "submitted",
        initial: "evaluating",
        on: {
          RESET: { target: "quiz", actions: ["clearSelection"] },
        },
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
      clearSelection: assign((ctx, event) => ({
        topSelectedItem: undefined,
        bottomSelectedItem: undefined,
      })),
    },
    guards: {
      isCorrect: (ctx) => {
        return ctx.topSelectedItem.homeworld === ctx.bottomSelectedItem.url;
      },
    },
  }
);
