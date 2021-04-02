import React, {useEffect, useState} from 'react';
import ReactDom from 'react-dom';


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
ReactDom.render(element, container);
