import React, {useEffect, useState} from 'react';
import ReactDom from 'react-dom';
function App(){
    const [state, setState] = useState(1);
    useEffect(()=>{
        console.log("jell");
        console.log(document.querySelector("#b").childNodes);
        setState(2);
        return ()=>{
            console.log('fdf');
        }
    })
    return (
        <div id="b">
            Hello
        </div>
    )
}

const container = document.querySelector("#root");
ReactDom.render(<App/>, container);
