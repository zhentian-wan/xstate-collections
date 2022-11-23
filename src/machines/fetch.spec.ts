import { interpret } from "xstate";
import fetchMachine from "./fetch";

describe("transition", () => {
  test('should reach "pending" when action "FETCH"', () => {
    const expectedValue = "pending";
    // idle -> pending
    let actualState = fetchMachine.transition("idle", { type: "FETCH" });
    expect(actualState.matches(expectedValue)).toBeTruthy();
    expect(actualState.value).toBe(expectedValue);

    // failed -> pending
    actualState = fetchMachine.transition("failed", { type: "FETCH" });
    expect(actualState.matches(expectedValue)).toBeTruthy();
    expect(actualState.value).toBe(expectedValue);

    // successful -> pending
    actualState = fetchMachine.transition("successful", { type: "FETCH" });
    expect(actualState.matches(expectedValue)).toBeTruthy();
    expect(actualState.value).toBe(expectedValue);
  });

  test('should reach "failed" when action "REJECT"', () => {
    const expectedValue = "failed";
    const actualState = fetchMachine.transition("pending", { type: "REJECT" });
    expect(actualState.value).toBe(expectedValue);
    expect(actualState.matches(expectedValue)).toBeTruthy();
  });

  test('should reach "successful" when action "RESOLVE"', () => {
    const expectedValue = "successful";
    const actualState = fetchMachine.transition("pending", { type: "RESOLVE" });
    expect(actualState.value).toBe(expectedValue);
    expect(actualState.matches(expectedValue)).toBeTruthy();
  });
});

describe("Testing async service", () => {
  let mockFetchMachine;
  let message = "cannot load data";
  let results = [{ name: "R2D2" }];
  beforeEach(() => {});

  test('should eventually reach "successful"', (done) => {
    mockFetchMachine = fetchMachine.withConfig({
      actions: {
        fetchData: (_, event) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(results);
            }, 50);
          }),
      },
    });
    const fetchService = interpret(mockFetchMachine).onTransition((state) => {
      // this is where you expect the state to eventually
      // be reached
      if (state.matches("successful")) {
        done();
      }
    });

    fetchService.start();

    // send zero or more events to the service that should
    // cause it to eventually reach its expected state
    fetchService.send({ type: "FETCH" });
    fetchService.send({ type: "RESOLVE", results });
  });

  test('should eventually reach "failed"', (done) => {
    mockFetchMachine = fetchMachine.withConfig({
      services: {},
      actions: {
        fetchData: (_, event) =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(message);
            }, 50);
          }),
      },
    });
    const fetchService = interpret(mockFetchMachine).onTransition((state) => {
      // this is where you expect the state to eventually
      // be reached
      if (state.matches("failed")) {
        done();
      }
    });

    fetchService.start();

    // send zero or more events to the service that should
    // cause it to eventually reach its expected state
    fetchService.send({ type: "FETCH" });
    fetchService.send({ type: "REJECT", message });
  });
});
