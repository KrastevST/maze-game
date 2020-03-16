const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;
const gridRows = 9;
const gridCols = 16;
const border = height / 30;
const wallWidth = border / 2;
const cellWidth = width / gridCols;
const cellHeight = height / gridRows;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
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

const outerWalls = [
  Bodies.rectangle(width / 2, 0, width, border, { isStatic: true }),    // top
  Bodies.rectangle(width / 2, height, width, border, { isStatic: true }),   //bottom
  Bodies.rectangle(0, height / 2, border, height, { isStatic: true }),    //left
  Bodies.rectangle(width, height / 2, border, height, { isStatic: true })   //right
];
World.add(world, outerWalls);

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
    [row - 1, col, 'up'],
    [row + 1, col, 'down'],
    [row, col - 1, 'left'],
    [row, col + 1, 'right']
  ]);

  for (let neighbour of neighbours) {
    const [nextRow, nextCol, direction] = neighbour;

    if (
      nextRow < 0 ||
      nextRow >= gridRows ||
      nextCol < 0 ||
      nextCol >= gridCols
    ) {
      continue;
    }

    if (grid[nextRow][nextCol]) {
      continue;
    }

    if (direction === 'left') {
      verticals[row][col - 1] = true;
    } else if (direction === 'right') {
      verticals[row][col] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][col] = true;
    } else if (direction === 'down') {
      horizontals[row][col] = true;
    }

    stepThroughCell(nextRow, nextCol);
  }
};

stepThroughCell(startRow, startCol);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, colIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      colIndex * cellWidth + cellWidth / 2,
      rowIndex * cellHeight + cellHeight,
      cellWidth + wallWidth,
      wallWidth,
      { 
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'grey'
        }
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, colIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      colIndex * cellWidth + cellWidth,
      rowIndex * cellHeight + cellHeight / 2,
      wallWidth,
      cellHeight + wallWidth,
      { 
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'grey'
        }
      }
    );
    World.add(world, wall);
  });
});

// Goal

const goalSide = Math.min(cellWidth, cellHeight) * .6;
const goalX = width - cellWidth * .525;
const goalY = height - cellHeight * .525;
const goal = Bodies.rectangle(
  goalX, goalY, goalSide, goalSide,
  {
    label: 'goal',
    isStatic: true,
    render: {
      fillStyle: 'green'
    }
  }
);
World.add(world, goal);

// Ball

const ballRadius = Math.min(cellHeight, cellWidth) / 3;
const ballX = cellWidth / 2;
const ballY = cellHeight / 2;
const ball = Bodies.circle(
  ballX, ballY, ballRadius,
  { label: 'ball' }
);
World.add(world, ball);

document.addEventListener('keydown', event => {
  const { x, y } = ball.velocity;
  const maxSpeed = 6;
  const minSpeed = -maxSpeed;
  const acceleration = 3;

  if ((event.keyCode === 87 || event.keyCode === 38) && y - acceleration > minSpeed) {
    Body.setVelocity(ball, { x, y: y - acceleration });
  }

  if ((event.keyCode === 68 || event.keyCode === 39) && x + acceleration < maxSpeed) {
    Body.setVelocity(ball, { x: x + acceleration, y });
  }

  if ((event.keyCode === 83 || event.keyCode === 40) && y + acceleration < maxSpeed) {
    Body.setVelocity(ball, { x, y: y + acceleration });
  }

  if ((event.keyCode === 65 || event.keyCode === 37) && x - acceleration > minSpeed) {
    Body.setVelocity(ball, { x: x - acceleration, y });
  }
})

// Win Condition

Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach((collision) => {
    const labels = ['ball', 'goal'];

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector('.winner').classList.remove('hidden');
      world.gravity.y = 1;
      world.bodies.forEach(body => {
        if (body.label === 'wall') {
          Body.setStatic(body, false)
        }
      });


    }
  });
});