import { createMachine, interpret } from "xstate";

// https://swimlanes.io/#K8ksyUm1UghPzUnOz01VKMlXKC7PzM1JzEst1svM5+LiSs7JTM0rUdC1U8hNTM7IzAMqVvfzD/F0i1Tn4oIKgWTTUkuSM/xKc5NSi5wTc3KSEpOzgSod/SLjXcNc/UKAirGoQDU2wNPPXR0A

const callback = (sendBack, receive) => {
  // once receiving event
  // after 1 second,
  // send another PING event back
  receive((event) => {
    console.log("Received", event);
    setTimeout(() => {
      sendBack({ type: "PING" });
    }, 1000);
  });
};

const machine = createMachine({
  initial: "loading",
  states: {
    loading: {
      on: {
        CANCEL: "cancelled",
        NOTIFIY: {
          actions: send("ANY_EVENT", {
            to: "fetchNumber",
          }),
        },
        PING: "success",
      },
      invoke: {
        id: "fetchNumber",
        src: (context, event) => {
          // return new Promise((resolve) => {
          //   setTimeout(() => {
          //     resolve(12);
          //   }, 5000);
          // });
          return callback;
        },
        // onDone: {
        //   target: "success",
        //   actions: (_, event) => {
        //     console.log("DONE!", event);
        //   },
        // },
      },
    },
    success: {},
    cancelled: {},
  },
});

const service = interpret(machine).start();

service.subscribe((state) => {
  console.log(state.value);
});
