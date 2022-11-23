import React from "react";
import "./App.css";

import { useMachine } from "@xstate/react";
import { inspect } from "@xstate/inspect";

import fetchMachine from "./machines/fetchV3";
import { fetchPeople } from "./api";

inspect();

export interface Person {
  name: string;
  homeworld: string;
}

function App() {
  const [fetchState, sendToFetchMachine] = useMachine(fetchMachine, {
    services: {
      fetchData: (ctx, event) => {
        return fetchPeople().then((r) => r.results);
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
      {fetchState.matches("successful.withData") ? (
        <ul>
          {fetchState.context.results &&
            fetchState.context.results.map((person, index) => (
              <li key={index}>{person.name}</li>
            ))}
        </ul>
      ) : null}
      {fetchState.matches("successful.withoutData") ? (
        <p>No data available</p>
      ) : null}
      {fetchState.matches("failed") ? (
        <p>{fetchState.context.message}</p>
      ) : null}
    </div>
  );
}

export default App;
