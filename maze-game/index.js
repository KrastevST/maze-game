const {Engine, Render, Runner, World, Bodies} = Matter;

const width = 600;
const height = 600;
const thickness = 40;
const gridRows = 3;
const gridCols = 3;

const engine = Engine.create();
const {world} = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width: width,
    height: height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, thickness, {isStatic: true}),
  Bodies.rectangle(width / 2, height, width, thickness, {isStatic: true}),
  Bodies.rectangle(0, height / 2, thickness, height, {isStatic: true}),
  Bodies.rectangle(width, height / 2, thickness, height, {isStatic: true})
];
World.add(world, walls);

// Maze Generation

const shuffle = (arr) => {
  let shuffledArr = [];

  while (arr.length > 0) {
    const index = Math.floor(Math.random() * arr.length);
    shuffledArr.push(
      ...arr.splice(index, 1));
  }

  return shuffledArr;
}

const grid = Array(gridRows)
  .fill(null)
  .map(() => Array(gridCols).fill(false));

const verticals = Array(gridRows)
  .fill(null)
  .map(() => Array(gridCols - 1).fill(false));

const horizontals = Array(gridRows - 1)
  .fill(null)
  .map(() => Array(gridCols).fill(false));

const startRow = Math.floor(Math.random() * gridRows);
const startCol = Math.floor(Math.random() * gridCols);

const stepThroughCell = (row, col) => {
  if (grid[row][col]) {
    return;
  }

  grid[row][col] = true;

  const neighbours = shuffle([
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1]
  ]);
  console.log(neighbours);
};

stepThroughCell(startRow, startCol);