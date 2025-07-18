const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let data = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateData() {
  console.log("Generate button clicked ✅");

  const size = parseInt(document.getElementById("size").value);
  const min = parseInt(document.getElementById("min").value);
  const max = parseInt(document.getElementById("max").value);

  if (size <= 0 || min > max) {
    alert("Enter valid input values.");
    return;
  }

  data = Array.from({ length: size }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );

  drawData(data);
}

function drawData(data, highlights = []) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const width = canvas.width / data.length;
  const maxVal = Math.max(...data);

  data.forEach((value, i) => {
    const height = (value / maxVal) * canvas.height;
    const x = i * width;
    const y = canvas.height - height;

    ctx.fillStyle = highlights.includes(i) ? "yellow" : "red";
    ctx.fillRect(x, y, width - 2, height);

    ctx.fillStyle = "orange";
    ctx.font = "12px Arial";
    ctx.fillText(value, x + 2, y - 5);
  });
}

async function startSort(username) {
  const algorithm = document.getElementById("algorithm").value;
  const speed = +document.getElementById("speed").value;
  const start = performance.now();

  if (algorithm === "Bubble Sort") await bubbleSort(data, speed);
  if (algorithm === "Merge Sort") await mergeSort(data, 0, data.length - 1, speed);
  if (algorithm === "Quick Sort") await quickSort(data, 0, data.length - 1, speed);

  const end = performance.now();
  const timeTaken = Math.floor(end - start);

  await fetch("/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, algorithm, timeMs: timeTaken })
  });

  alert(`Sorted in ${timeTaken} ms`);
}

async function bubbleSort(arr, delay) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      drawData(arr, [j, j + 1]);
      await sleep(delay);
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  drawData(arr);
}

async function mergeSort(arr, l, r, delay) {
  if (l >= r) return;

  const mid = Math.floor((l + r) / 2);
  await mergeSort(arr, l, mid, delay);
  await mergeSort(arr, mid + 1, r, delay);
  await merge(arr, l, mid, r, delay);
}

async function merge(arr, l, m, r, delay) {
  const left = arr.slice(l, m + 1);
  const right = arr.slice(m + 1, r + 1);

  let i = 0, j = 0, k = l;

  while (i < left.length && j < right.length) {
    arr[k] = left[i] <= right[j] ? left[i++] : right[j++];
    drawData(arr, [k]);
    await sleep(delay);
    k++;
  }

  while (i < left.length) {
    arr[k++] = left[i++];
    drawData(arr, [k - 1]);
    await sleep(delay);
  }

  while (j < right.length) {
    arr[k++] = right[j++];
    drawData(arr, [k - 1]);
    await sleep(delay);
  }
}

async function quickSort(arr, low, high, delay) {
  if (low < high) {
    const pi = await partition(arr, low, high, delay);
    await quickSort(arr, low, pi - 1, delay);
    await quickSort(arr, pi + 1, high, delay);
  }
}

async function partition(arr, low, high, delay) {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    drawData(arr, [j, high]);
    await sleep(delay);
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      drawData(arr, [i, j]);
      await sleep(delay);
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  drawData(arr, [i + 1, high]);
  await sleep(delay);
  return i + 1;
}
