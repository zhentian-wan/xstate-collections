/* eslint-disable jest/no-conditional-expect */
import { interpret } from "xstate";
import { People } from "../api/mock-data";
import fetchMachine from "../machines/fetchV3";

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
});

describe("Testing services", () => {
  let mockFetchMachine;
  let message = "cannot load data";
  let results = [{ name: "R2D2" }] as unknown as People[];

  test('should eventually reach "successful.withData"', (done) => {
    mockFetchMachine = fetchMachine.withConfig({
      services: {
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
      if (state.matches("successful.withData")) {
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

  test('should eventually reach "successful.withoutData"', (done) => {
    mockFetchMachine = fetchMachine.withConfig({
      services: {
        fetchData: (_, event) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve([]);
            }, 50);
          }),
      },
    });
    const fetchService = interpret(mockFetchMachine).onTransition((state) => {
      // this is where you expect the state to eventually
      // be reached
      if (state.matches("successful.withoutData")) {
        expect(state.context.results.length).toBe(0);
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
      services: {
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
