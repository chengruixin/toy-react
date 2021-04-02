export function createElement(type, props, ...children){
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
    updateDom(dom, {}, fiber.props);


    return dom;

}

const isEvent = key => key.startsWith("on")
const isProperty = key =>
  key !== "children" && !isEvent(key)
const isNew = (prev, next) => key =>
  prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}

function commitRoot(){
    //TODO add nodes to dom
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber){
    if(!fiber){
        return;
    }

    let domParentFiber = fiber.parent;
    while(!domParentFiber.dom){
        domParentFiber = domParentFiber.parent;
    }
    const domParent = domParentFiber.dom;

    if (
        fiber.effectTag === "PLACEMENT" &&
        fiber.dom != null
    ) {
        domParent.appendChild(fiber.dom);
    } else if (
        fiber.effectTag === "UPDATE" &&
        fiber.dom != null
    ) {
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    } else if (
        fiber.effectTag === "DELETION" 
    ) {
        commitDeletion(fiber, domParent);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);

    // Emit useEffect hooks
    if(fiber.effectHooks && fiber.effectHooks.length > 0){
        for(let i = 0; i < fiber.effectHooks.length; i++){
            const fn = fiber.effectHooks[i];
            const callbackResult = fn.call(null);

            fiber.dismountHooks.push(callbackResult);
        }
    }
}

function commitDeletion(fiber, domParent){

    let curFiber = fiber;

    while(!curFiber.dom){
        curFiber = curFiber.child;
    }

    domParent.removeChild(fiber.dom);
    // if(fiber.dom){
    //     domParent.removeChild(fiber.dom);
    // } else {
    //     commitDeletion(fiber.child, domParent);
    // }
}

export function render(element, container) {
    wipRoot = {
        dom : container,
        props : {
            children : [element]
        },
        alternate : currentRoot
    }
    deletions = [];
    nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

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
    const isFunctionComponent = 
        fiber.type instanceof Function

    if(isFunctionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
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

let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber){
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];
    wipFiber.effectHooks = [];
    wipFiber.dismountHooks = [];

    //run dismount hooks
    const oldDismountHooks =  
        wipFiber.alternate &&
        wipFiber.alternate.dismountHooks
    
    if(oldDismountHooks){
        oldDismountHooks.forEach( dismoutHook => {
            dismoutHook.call(null);
        });
    }   
    

    const chilren = [fiber.type(fiber.props)];
    reconcileChildren(fiber, chilren);
}

export function useState(initial){

    const oldHook = 
        wipFiber.alternate &&
        wipFiber.alternate.hooks &&
        wipFiber.alternate.hooks[hookIndex];

    const hook = {
        state : oldHook ? oldHook.state : initial,
        queue : []
    }

    const actions = oldHook ? oldHook.queue : []
    actions.forEach( action => {
        hook.state = action(hook.state);
    })

    const setState = action => {
        hook.queue.push(action);

        wipRoot = {
            dom : currentRoot.dom,
            props : currentRoot.props,
            alternate : currentRoot
        }

        nextUnitOfWork = wipRoot;
        deletions = []
    }
    wipFiber.hooks.push(hook);
    hookIndex++;
    return [hook.state, setState];
}

export function useEffect(callback){
    wipFiber.effectHooks.push(callback);
}

function updateHostComponent(fiber){
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    // TODO create new fibers
    const elements = fiber.props.children;
    reconcileChildren(fiber, elements);
}
function reconcileChildren(wipFiber, elements){
    let index = 0;
    let oldFiber = 
        wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null;

    while(
        index < elements.length || //this is beautiful
        oldFiber != null    
    ){
        const element = elements[index];
        let newFiber = null;
        
        //TODO compare oldFiber to element
        const sameType = oldFiber && element && element.type === oldFiber.type;

        if(sameType){
            //TODO update the node
            newFiber = {
                type : oldFiber.type,
                props : element.props,
                dom : oldFiber.dom,
                parent : wipFiber,
                alternate : oldFiber,
                effectTag : "UPDATE"
            }
        }

        if(element && !sameType){
            //TODO add this node
            newFiber = {
                type : element.type,
                props : element.props,
                dom : null,
                parent : wipFiber,
                alternate : null,
                effectTag : "PLACEMENT"
            }
        }

        if(oldFiber && !sameType){
            //TODO delete the oldFiber's node
            oldFiber.effectTag = "DELETION";
            deletions.push(oldFiber);
        }


        if(oldFiber){
            oldFiber = oldFiber.sibling;
        }

        if(index === 0){
            wipFiber.child = newFiber;
        } else if(element){
            prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
        index++;
    }
}


export default {
    createElement,
    render,
    useState
}
