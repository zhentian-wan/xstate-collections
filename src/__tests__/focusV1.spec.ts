import { interpret } from "xstate";
import { focusMachine as machine } from "../machines/focusV1";
// Total timeout would be 300ms
const focusMachine = machine({ maxRetry: 3, timeout: 100 });

const waitThen = (time: number, action: Function) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve("ok");
      action();
    }, time);
  });

describe("focus transition", () => {
  test('should reach "focusSend" when action "SEND"', () => {
    const expectedValue = "focusSend";
    let actualState;
    // idle -> focusSend
    actualState = focusMachine.transition("idle", { type: "SEND" });
    expect(actualState.value).toBe(expectedValue);
    expect(actualState.matches(expectedValue)).toBeTruthy();

    // focusAck -> focusSend
    actualState = focusMachine.transition("focusAck", { type: "SEND" });
    expect(actualState.value).toBe(expectedValue);
    expect(actualState.matches(expectedValue)).toBeTruthy();

    // focusFailed -> focusSend
    actualState = focusMachine.transition("focusFailed", { type: "SEND" });
    expect(actualState.value).toBe(expectedValue);
    expect(actualState.matches(expectedValue)).toBeTruthy();

    // Impossible cases
    const impossibleCasesForIdleAfterSend = {
      from: "idle",
      to: ["idle", "focusAck", "focusFailed", "focusPending"],
    };

    impossibleCasesForIdleAfterSend.to.forEach((state) => {
      actualState = focusMachine.transition(
        impossibleCasesForIdleAfterSend.from,
        { type: "SEND" }
      );
      expect(actualState.value).not.toBe(state);
    });
  });

  test('should reach "focusAck" when action "ACK"', () => {
    const expectedValue = "focusAck";
    const actualState = focusMachine.transition("focusSend", { type: "ACK" });
    expect(actualState.value).toBe(expectedValue);
    expect(actualState.matches(expectedValue)).toBeTruthy();
  });

  test('should eventually reach "focusFailed" without ACK', (done) => {
    const service = interpret(focusMachine).onTransition((state) => {
      if (state.matches("focusFailed")) {
        done();
      }
    });

    service.start();
    service.send({ type: "SEND" });
  });

  test('should eventually reach "focusFailed" with ACK above time limit', (done) => {
    const service = interpret(focusMachine).onTransition((state) => {
      if (state.matches("focusFailed")) {
        done();
      }
    });

    service.start();
    service.send({ type: "SEND" });
    waitThen(500, () => service.send({ type: "ACK" }));
  });

  it('should eventually reach "focusAck" with ACK in time limit', (done) => {
    const service = interpret(focusMachine).onTransition((state) => {
      if (state.matches("focusAck")) {
        done();
      }
    });

    service.start();
    service.send({ type: "SEND" });
    waitThen(200, () => service.send({ type: "ACK" }));
  });

  test('should eventually reach "focusAck" with ACK after a second SEND action', (done) => {
    const service = interpret(focusMachine).onTransition((state) => {
      if (state.matches("focusAck")) {
        done();
      }
    });

    service.start();
    service.send({ type: "SEND" });
    waitThen(500, () => service.send({ type: "SEND" })).then(() => {
      waitThen(100, () => service.send({ type: "ACK" }));
    });
  });
});
