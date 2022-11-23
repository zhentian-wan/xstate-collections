import React from "react";
import "./App.css";

import { useMachine } from "@xstate/react";
import { inspect } from "@xstate/inspect";

import fetchMachine from "./machines/fetch";
import { fetchPeople } from "./api";

inspect();

export interface Person {
  name: string;
  homeworld: string;
}

function App() {
  const [fetchState, sendToFetchMachine] = useMachine(fetchMachine, {
    actions: {
      fetchData: (ctx, event) => {
        fetchPeople()
          .then((r) => {
            return r.results;
          })
          .then(
            (res) => {
              sendToFetchMachine({ type: "RESOLVE", results: res });
            },
            (message) => {
              sendToFetchMachine({ type: "REJECT", message });
            }
          );
      },
    },
    devTools: true,
  });

  return (
    <div className="App">
      <button onClick={() => sendToFetchMachine({ type: "FETCH" })}>
        Fetch
      </button>
      {fetchState.matches("pending") ? <p>Loading</p> : null}
      {fetchState.matches("successful") ? (
        <ul>
          {fetchState.context.results &&
            fetchState.context.results.map((person, index) => (
              <li key={index}>{person.name}</li>
            ))}
        </ul>
      ) : null}
      {fetchState.matches("failed") ? (
        <p>{fetchState.context.message}</p>
      ) : null}
    </div>
  );
}

export default App;
