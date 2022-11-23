/* eslint-disable jest/no-conditional-expect */
import { interpret } from "xstate";
import fetchMachine from "../machines/fetch";

afterEach(() => {
  jest.clearAllMocks();
});

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

describe("Testing async service with mockConfig", () => {
  let mockFetchMachine;
  let message = "cannot load data";
  let results = [{ name: "R2D2" }] as unknown as People;

  test('should eventually reach "successful"', (done) => {
    mockFetchMachine = fetchMachine.withConfig({
      actions: {
        fetchData: (_, event) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(results);
              fetchService.send({ type: "RESOLVE", results });
            }, 50);
          }),
      },
    });
    const fetchService = interpret(mockFetchMachine).onTransition((state) => {
      // this is where you expect the state to eventually
      // be reached
      if (state.matches("successful")) {
        expect(state.context.results.length).toBe(1);
        expect(state.context.results[0]["name"]).toBe(results[0]["name"]);
        done();
      }
    });

    fetchService.start();

    // send zero or more events to the service that should
    // cause it to eventually reach its expected state
    fetchService.send({ type: "FETCH" });
  });

  test('should eventually reach "failed"', (done) => {
    mockFetchMachine = fetchMachine.withConfig({
      services: {},
      actions: {
        fetchData: (_, event) =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              fetchService.send({ type: "REJECT", message });
              resolve(message);
            }, 50);
          }),
      },
    });
    const fetchService = interpret(mockFetchMachine).onTransition((state) => {
      // this is where you expect the state to eventually
      // be reached
      if (state.matches("failed")) {
        expect(state.context.message).toEqual(message);
        done();
      }
    });

    fetchService.start();

    // send zero or more events to the service that should
    // cause it to eventually reach its expected state
    fetchService.send({ type: "FETCH" });
  });
});
