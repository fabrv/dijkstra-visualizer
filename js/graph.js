/* eslint-disable no-undef */
var start = ''
var end = ''
var current = ''
var stack = []
var digraph = 0

const nodes = {}

// Reads file and once it loads send it to RENDER
const fileChooser = document.getElementById('file')
fileChooser.addEventListener('change', () => {
  const selectedFile = fileChooser.files[0]
  const fileReader = new FileReader()

  fileReader.onload = (evt) => {
    render(stringToDot(evt.target.result))
  }

  fileReader.readAsText(selectedFile)
}, false)

/**
 * Converts a string in format (node, direction, weight) to DOT notation to easily graph the relation.
 * @param {string} input - Input file text
 */
function stringToDot (input) {
  input = input.replace(/([, ()])/g, '')
  input = input.split('\n')

  const direction = ['--', '->']
  const text = ['Grafo', 'Grafo dirigido']
  const objName = ['graph', 'digraph']
  digraph = input[0][2]

  document.getElementById('description').innerHTML = text[digraph]

  len = input.length
  start = input[len - 2][2]
  end = input[len - 1][2]
  current = start

  // Borrar los elementos que el punto inicial y el punto a terminar
  input.splice(len - 2, 2)

  // Borrar el elemento que define si es digrafo
  input.splice(0, 1)

  // Crear el string en notacion _dot_
  let str = ''
  for (let i = 0; i < input.length; i++) {
    if (!nodes[input[i][0]]) {
      createNode(input[i][0])
    }
    if (!nodes[input[i][1]]) {
      createNode(input[i][1])
    }
    const obj = { vertex: input[i][1], weight: parseInt(input[i][2]) }
    nodes[input[i][0]].push(obj)
    str += `${input[i][0]} ${direction[digraph]} ${input[i][1]}[label="${input[i][2]}",weight="${input[i][2]}"];`
  }
  nodes[start].distance = 0
  return `${objName[digraph]} { node [style="filled"]; ${start} [fillcolor="#66BB6A"]; ${end} [fillcolor="#03A9F4"]; ${str} }`
}

function objectToDot (node) {
  const direction = ['--', '->']
  const objName = ['graph', 'digraph']

  let str = ''
  for (const key in nodes) {
    currentNode = nodes[key]
    if (currentNode.checked) {
      str += `${key} [label="${key}", xlabel="${currentNode.distance}", fillcolor="#E57373"];`
    }
    for (let i = 0; i < currentNode.length; i++) {
      dNode = currentNode[i]
      str += `${key} ${direction[digraph]} ${dNode.vertex}[label="${dNode.weight}",weight="${dNode.weight}"];`
    }
  }

  return `${objName[digraph]} { node [style="filled"]; ${start} [fillcolor="#66BB6A"]; ${end} [fillcolor="#03A9F4"]; ${str} }`
}

function drawPath (node) {
  n0 = end
  path = []
  while (n0 !== start) {
    path.push(n0)
    n0 = nodes[n0].path
  }

  const direction = ['--', '->']
  const objName = ['graph', 'digraph']

  let str = ''
  for (const key in nodes) {
    currentNode = nodes[key]
    if (path.includes(key)) {
      str += `${key} [label="${key}", xlabel="${currentNode.distance}", fillcolor="#66BB6A"];`
    }
    for (let i = 0; i < currentNode.length; i++) {
      dNode = currentNode[i]
      str += `${key} ${direction[digraph]} ${dNode.vertex}[label="${dNode.weight}",weight="${dNode.weight}"];`
    }
  }

  return `${objName[digraph]} { node [style="filled"]; ${start} [fillcolor="#66BB6A"]; ${end} [fillcolor="#03A9F4"]; ${str} }`
}

function createNode (name) {
  nodes[name] = []
  nodes[name].name = name
  nodes[name].checked = false
  nodes[name].distance = Infinity
  nodes[name].path = ''
}

function dijkstra () {
  console.log(current, end)
  if (current !== end) {
    nodes[current].checked = true
    for (let i = 0; i < nodes[current].length; i++) {
      const currentNode = nodes[current][i]

      if (!nodes[currentNode.vertex].checked) {
        const distanceToVertex = nodes[current].distance + currentNode.weight

        if (distanceToVertex < nodes[currentNode.vertex].distance) {
          nodes[currentNode.vertex].distance = distanceToVertex
          nodes[currentNode.vertex].path = current
        }
        stack.push(nodes[currentNode.vertex])
        stack.sort((a, b) => (a.distance < b.distance) ? 1 : ((b.distance < a.distance ? -1 : 0)))
      }
    }

    current = stack.pop().name

    return objectToDot(nodes)
  } else {
    return drawPath(nodes)
  }
}

function render (dot) {
  console.log(dot)
  const drawLoop = () => {
    graphViz
      .renderDot(dot)
      .on('end', () => {
        render(dijkstra())
      })
  }

  const graphViz = d3.select('#graph').graphviz().transition(() => {
    return d3.transition('main')
      .ease(d3.easeLinear)
      .delay(500)
      .duration(500)
  })
    .logEvents(false)
    .on('initEnd', drawLoop)
}
