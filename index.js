

function createElement(type, props, ...children){
    return {
        type,

        props : {
            ...props,
            children : children.map(child => {
                return typeof child === "object" 
                    ? child
                    : createTextElement(child)
            })
        },
    }
}

function createTextElement(text) {
    return {
        type : "TEXT_ELEMENT",

        props : {
            nodeValue : text,
            children : [],
        },
    }
}

function createDom(fiber) {
    const dom = 
        fiber.type !== "TEXT_ELEMENT" 
            ? document.createElement(fiber.type)
            : document.createTextNode("")

    //assign props to dom
    const keys = fiber.props ? Object.keys(fiber.props) : [];
    for(let i = 0; i < keys.length ; i++){
        if(keys[i] !== "children"){
            dom[keys[i]] = fiber.props[keys[i]];
        }
    }


    return dom;

}

function commitRoot(){
    //TODO add nodes to dom
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber){
    if(!fiber){
        return;
    }

    const domParent = fiber.parent.dom;
    domParent.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function render(element, container) {
    wipRoot = {
        dom : container,
        props : {
            children : [element]
        },
        alternate : currentRoot
    }

    nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;

function workLoop(deadLine) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadLine.timeRemaining() < 1;
    }

    if(!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber){
    // TODO add dom node
    // Create dom if doesn't
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }
    
    // TODO create new fibers
    const elements = fiber.props.children;
    
    let index = 0;
    let prevSibling = null;

    while(index < elements.length){
        const element = elements[index];

        const newFiber = {
            type : element.type,
            props : element.props,
            parent : fiber,
            dom : null
        }

        if(index === 0){
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
        index++;
    }

    // TODO return next unit of work
    if(fiber.child){
        return fiber.child;
    }

    let nextFiber = fiber;

    while(nextFiber){
        if(nextFiber.sibling) {
            return nextFiber.sibling;
        }

        nextFiber = nextFiber.parent
    }
}

const Didact = {
    createElement,
    render
}

// const element = Didact.createElement(
//     "div",
//     { id : "foo" },
//     Didact.createElement("a", null, "bar"),
//     Didact.createElement("b")
// )


void function main() {

    /** @jsx Didact.createElement */
    const element = (
        <div id="foo">
            <a>hello worlfd!</a>
            <p>wtaer</p>
            <h1>fsdf</h1>
            <div>
                <p>df</p>
                <div>
                    sdasdf
                </div>
            </div>
            <b/>
        </div>
    )


    const container = document.getElementById("root");
    Didact.render(element, container);

}();
