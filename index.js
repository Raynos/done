require("live-reload")(8081)

var treehtml = require("./tree.html")
    , Element = require("fragment").Element
    , walk = require("dom-walk")
    , events = require("events-stream")
    , filter = require("lazy-filter-stream")
    , map = require("lazy-map-stream")
    , after = require("insert").after
    , to = require("write-stream")

var ENTER = 13
    , LEFT = 37
    , RIGHT = 39
    , root = document.getElementsByClassName("root-ul")[0]
    , counter = 0
    , tree = Tree()

root.appendChild(tree.element)
console.log(tree.element)

function Tree() {
    var li = Element(treehtml)
        , elements = unpack(li)
        , keys = events(elements.item, "keypress")
        , keydowns = events(elements.item, "keyup")

    //elements.item.setAttribute("id",counter++)
    //console.log(elements)

    var enters = filter(keys,function (event) {
        // console.log(event)
        return event.keyCode === ENTER
    })

    var trees = map(enters, Tree)
    
    forEach(trees, function(tree) {
        console.log(tree)
        after(li, tree.element)
        tree.focus()
    })


    var ctrlLefts = filter(keydowns, function (event) {
        // console.log(event)
        return event.keyCode === LEFT && event.ctrlKey
    })

    forEach(ctrlLefts, function() {})

    var ctrlRights = filter(keydowns, function (event) {
        // console.log(event)
        return event.keyCode === RIGHT && event.ctrlKey
    })

    forEach(ctrlRights, function() {})


    // Here is another way to do it:
    // elements.item.addEventListener("keypress", function (event) {
    //     if (event.keyCode !== ENTER) {
    //         return
    //     }

    //     var tree = Tree()
    //     after(li, tree.element)
    //     tree.focus()
    // })

    return {
        element: li,
        focus: function() { elements.item.focus()}
    }
}

function unpack(elem) {
    var struct = {}
    walk([elem], function (node) {
        if (node.id) {
            var id = node.id
            node.removeAttribute("id")
            struct[id] = node
        }
    })
    return struct
}

function pluck(stream, propName) {
    return map(stream, prop(propName))
}

// function expand(stream, iterator) {
//     return flatten(map(stream, iterator))
// }

function forEach(stream, iterator) {
    return stream.pipe(to(iterator))
}

function prop(name) {
    return function (item) { return item[name] }
}

function method(name) {
    return function (item) { return item[name]() }
}

function isTruthy(v) {
    return !!v
}