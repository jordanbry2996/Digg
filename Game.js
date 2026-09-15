const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const moneyText = document.getElementById("money");
const fuelText = document.getElementById("fuel");
const depthText = document.getElementById("depth");
const oreText = document.getElementById("ore");
const capacityText = document.getElementById("capacity");

const shop = document.getElementById("shop");

let keys = {};

let player = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0
};

let cameraY = 0;

let rocks = [];

let W = 800;
let H = 600;

let save =
  JSON.parse(localStorage.getItem("motherloadSave")) ||
  {
    money: 0,
    maxFuel: 100,
    fuel: 100,
    drill: 1,
    storage: 50,
    ore: 0
  };

function resizeCanvas() {

  const rect = canvas.getBoundingClientRect();

  W = rect.width;
  H = rect.height;

  canvas.width = W * devicePixelRatio;
  canvas.height = H * devicePixelRatio;

  ctx.setTransform(
    devicePixelRatio,
    0,
    0,
    devicePixelRatio,
    0,
    0
  );
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

function saveGame() {
  localStorage.setItem(
    "motherloadSave",
    JSON.stringify(save)
  );
}

function createWorld() {

  rocks = [];

  const columns = Math.ceil(W / 48);
  const rows = 100;

  for (let y = 1; y < rows; y++) {

    for (let x = 0; x < columns; x++) {

      if (Math.random() > .8) {
        continue;
      }

      const roll = Math.random();

      let type;

      if (roll < .02) {
        type = "gem";
      }
      else if (roll < .10) {
        type = "gold";
      }
      else if (roll < .30) {
        type = "iron";
      }
      else {
        type = "coal";
      }

      rocks.push({
        x: x * 48 + 5,
        y: y * 70 + 80,
        width: 38,
        height: 52,
        type: type,
        mined: false
      });
    }
  }
}

function resetPlayer() {

  player.x = W / 2;
  player.y = 60;

  player.vx = 0;
  player.vy = 0;

  cameraY = 0;

  save.fuel = save.maxFuel;
  save.ore = 0;

  saveGame();
}

createWorld();
resetPlayer();

function setKey(key, value) {
  keys[key] = value;
}

document.querySelectorAll("[data-key]").forEach(button => {

  const key = button.dataset.key;

  button.addEventListener("pointerdown", event => {

    event.preventDefault();

    setKey(key, true);
  });

  button.addEventListener("pointerup", () => {
    setKey(key, false);
  });

  button.addEventListener("pointercancel", () => {
    setKey(key, false);
  });

  button.addEventListener("pointerleave", () => {
    setKey(key, false);
  });
});

window.addEventListener("keydown", event => {

  keys[event.key] = true;

  if (
    event.key.startsWith("Arrow") ||
    event.key === " "
  ) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", event => {
  keys[event.key] = false;
});

function intersects(a, b) {

  return (
    a.x + 13 > b.x &&
    a.x - 13 < b.x + b.width &&
    a.y + 15 > b.y &&
    a.y - 15 < b.y + b.height
  );
}

function mineRock(rock) {

  if (save.ore >= save.storage) {
    return;
  }

  rock.mined = true;

  if (rock.type === "coal") {
    save.ore += 1;
  }

  if (rock.type === "iron") {
    save.ore += 2;
  }

  if (rock.type === "gold") {
    save.ore += 4;
  }

  if (rock.type === "gem") {
    save.ore += 8;
  }

  save.fuel -= .5 / save.drill;
}

function sellOre() {

  let value = 0;

  for (let i = 0; i < save.ore; i++) {

    const random = Math.random();

    if (random < .08) {
      value += 80;
    }
    else if (random < .25) {
      value += 25;
    }
    else {
      value += 10;
    }
  }

  save.money += value;
}

function returnToSurface() {

  if (player.y > 90) {

    sellOre();

    resetPlayer();

    updateUI();

    return;
  }

  shop.style.display = "flex";
}

document.getElementById("surface")
  .addEventListener("click", returnToSurface);

document.getElementById("openShop")
  .addEventListener("click", () => {

    shop.style.display = "flex";
  });

document.getElementById("closeShop")
  .addEventListener("click", () => {

    shop.style.display = "none";
  });

function buyFuel() {

  const cost =
    Math.floor(
      100 *
      Math.pow(
        1.5,
        (save.maxFuel - 100) / 25
      )
    );

  if (save.money < cost) {
    return;
  }

  save.money -= cost;
  save.maxFuel += 25;

  saveGame();
  updateShop();
  updateUI();
}

function buyDrill() {

  const cost =
    Math.floor(
      125 *
      Math.pow(
        1.55,
        save.drill - 1
      )
    );

  if (save.money < cost) {
    return;
  }

  save.money -= cost;
  save.drill++;

  saveGame();
  updateShop();
  updateUI();
}

function buyStorage() {

  const cost =
    Math.floor(
      150 *
      Math.pow(
        1.55,
        (save.storage - 50) / 25
      )
    );

  if (save.money < cost) {
    return;
  }

  save.money -= cost;
  save.storage += 25;

  saveGame();
  updateShop();
  updateUI();
}

document.getElementById("fuelUpgrade")
  .addEventListener("click", buyFuel);

document.getElementById("drillUpgrade")
  .addEventListener("click", buyDrill);

document.getElementById("storageUpgrade")
  .addEventListener("click", buyStorage);

function updateShop() {

  const fuelCost =
    Math.floor(
      100 *
      Math.pow(
        1.5,
        (save.maxFuel - 100) / 25
      )
    );

  const drillCost =
    Math.floor(
      125 *
      Math.pow(
        1.55,
        save.drill - 1
      )
    );

  const storageCost =
    Math.floor(
      150 *
      Math.pow(
        1.55,
        (save.storage - 50) / 25
      )
    );

  document.getElementById("fuelUpgrade").textContent =
    "$" + fuelCost;

  document.getElementById("drillUpgrade").textContent =
    "$" + drillCost;

  document.getElementById("storageUpgrade").textContent =
    "$" + storageCost;
}

function updateUI() {

  moneyText.textContent =
    "$" + Math.floor(save.money);

  fuelText.textContent =
    Math.floor(save.fuel) + "%";

  depthText.textContent =
    Math.floor(player.y / 2 + cameraY / 2);

  oreText.textContent =
    save.ore;

  capacityText.textContent =
    save.storage;
}

function update() {

  let left =
    keys.ArrowLeft ||
    keys.a ||
    keys.A;

  let right =
    keys.ArrowRight ||
    keys.d ||
    keys.D;

  let up =
    keys.ArrowUp ||
    keys.w ||
    keys.W;

  let down =
    keys.ArrowDown ||
    keys.s ||
    keys.S;

  let dx = 0;
  let dy = 0;

  if (left) dx--;
  if (right) dx++;
  if (up) dy--;
  if (down) dy++;

  const speed =
    .7 +
    save.drill * .15;

  player.vx +=
    (dx * speed - player.vx) * .2;

  player.vy +=
    (dy * speed - player.vy) * .2;

  player.x += player.vx;
  player.y += player.vy;

  player.x =
    Math.max(
      18,
      Math.min(W - 18, player.x)
    );

  if (player.y < 55) {
    player.y = 55;
  }

  if (player.y > H * .55) {
    cameraY =
      player.y - H * .55;
  }

  if (dx !== 0 || dy !== 0) {

    save.fuel -=
      .008 * (Math.abs(dx) + Math.abs(dy));
  }

  for (const rock of rocks) {

    if (
      !rock.mined &&
      intersects(player, rock)
    ) {
      mineRock(rock);
    }
  }

  if (save.fuel <= 0) {

    save.fuel = 0;

    returnToSurface();
  }

  saveGame();
  updateUI();
}

function draw() {

  ctx.clearRect(
    0,
    0,
    W,
    H
  );

  // Underground gradient

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );

  gradient.addColorStop(
    0,
    "#754723"
  );

  gradient.addColorStop(
    .18,
    "#452b1b"
  );

  gradient.addColorStop(
    1,
    "#120d09"
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );

  // Surface

  ctx.fillStyle = "#8a5c32";

  ctx.fillRect(
    0,
    0,
    W,
    48
  );

  // Dirt particles

  ctx.fillStyle = "#2a1b12";

  for (let i = 0; i < 70; i++) {

    const x =
      (i * 97) % W;

    const y =
      60 +
      ((i * 131) % H);

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      1 + (i % 3),
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  // Rocks

  for (const rock of rocks) {

    if (rock.mined) {
      continue;
    }

    const screenY =
      rock.y - cameraY;

    if (
      screenY < -70 ||
      screenY > H + 50
    ) {
      continue;
    }

    if (rock.type === "coal") {
      ctx.fillStyle = "#504841";
    }

    if (rock.type === "iron") {
      ctx.fillStyle = "#9b9990";
    }

    if (rock.type === "gold") {
      ctx.fillStyle = "#e0ad36";
    }

    if (rock.type === "gem") {
      ctx.fillStyle = "#7ed7e8";
    }

    ctx.fillRect(
      rock.x,
      screenY,
      rock.width,
      rock.height
    );

    ctx.strokeStyle = "#24170e";

    ctx.strokeRect(
      rock.x,
      screenY,
      rock.width,
      rock.height
    );
  }

  // Player

  ctx.save();

  ctx.translate(
    player.x,
    player.y - cameraY
  );

  // drill

  ctx.fillStyle = "#9c9c9c";

  ctx.fillRect(
    12,
    -4,
    16,
    7
  );

  // body

  ctx.fillStyle = "#d8d0bd";

  ctx.fillRect(
    -13,
    -15,
    26,
    30
  );

  // helmet

  ctx.fillStyle = "#e9b94e";

  ctx.fillRect(
    -10,
    -22,
    20,
    9
  );

  // visor

  ctx.fillStyle = "#382c22";

  ctx.fillRect(
    -8,
    -7,
    16,
    6
  );

  ctx.restore();

  // Surface line

  ctx.strokeStyle = "#d29a51";
  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.moveTo(
    0,
    48
  );

  ctx.lineTo(
    W,
    48
  );

  ctx.stroke();
}

function gameLoop() {

  update();

  draw();

  requestAnimationFrame(
    gameLoop
  );
}

updateShop();
updateUI();
gameLoop();
