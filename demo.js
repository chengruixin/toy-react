// Create elements
const element = {
    type : "h1",
    props : {
        title : "foo",
        children : "Hello"
    }
}

// Define where the react elements are going to be mounted on
const container = document.getElementById("root");

// ReactDom.render
const node = document.createElement(element.type);
node["title"] = element.props.title;

const text = document.createTextNode("");
text["nodeValue"] = element.props.children;

node.appendChild(text);
container.appendChild(node);