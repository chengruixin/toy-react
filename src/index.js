import Didact, {useState, useEffect} from './didact';

/** @jsx Didact.createElement */
function Counter() {
    
    const [state, setState] = useState(1)

    useEffect(()=>{
        console.log("hello", " and is mounted");

        return ()=>{
            console.log("dismounted");
        }
    })

    return (
      <h1 onClick={() => setState(c => c + 1)}>
        Count: {state}
      </h1>
    )
}


const element = <Counter />
const container = document.querySelector("#root");
Didact.render(element, container);