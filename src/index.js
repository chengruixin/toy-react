import Didact, {useState} from './didact';

/** @jsx Didact.createElement */
function Counter() {
    console.log("ff");
    const [state, setState] = useState(1)
    return (
      <h1 onClick={() => setState(c => c + 1)}>
        Count: {state}
      </h1>
    )
  }
const element = <Counter />

const container = document.querySelector("#root");
Didact.render(element, container);