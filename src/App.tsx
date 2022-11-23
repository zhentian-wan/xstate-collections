import React, { useEffect } from "react";
import "./App.css";

import { useMachine } from "@xstate/react";
import { inspect } from "@xstate/inspect";

import matchingMachine from "./machines/matchingV1";
import { fetchPeople, fetchPlanets } from "./api";
import List from "./List";

inspect();

export interface Person {
  name: string;
  homeworld: string;
}

function App() {
  const [matchingState, sendToMatchingMachine] = useMachine(matchingMachine, {
    devTools: true,
  });

  return (
    <div className="App">
      {matchingState.matches("answering") ? (
        <>
          <List
            fetchData={fetchPeople}
            selectedItem={matchingMachine.context.topSelectedItem}
            onSelection={(selectedItem) =>
              sendToMatchingMachine({ type: "SELECT_TOP", selectedItem })
            }
          />
          <hr />
          <List
            fetchData={fetchPlanets}
            selectedItem={matchingState.context.bottomSelectedItem}
            onSelection={(selectedItem) => {
              sendToMatchingMachine({ type: "SELECT_BOTTOM", selectedItem });
            }}
          ></List>
        </>
      ) : null}
      {matchingState.matches("submitted.correct") ? (
        <p>The Force is strong with this one.</p>
      ) : null}
      {matchingState.matches("submitted.incorrect") ? (
        <p>Do or do not. There is no try.</p>
      ) : null}
    </div>
  );
}

export default App;
