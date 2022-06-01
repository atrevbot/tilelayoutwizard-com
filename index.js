const getRange = (size, start = 0) =>
  [...Array(size).keys()].map(i => i + start)
const toBaseUnits = (value, units, scale) => ({
  feet: value * scale * 12
}[units] || value * scale) // Inches
const fromBaseUnits = (value, units, scale) => ({
  feet: value / scale / 12
}[units] || value / scale) // Inches
const getCountInSpan = (span, col, gap) => Math.floor(span / (col + gap))
const getRemainingLength = (span, col, gap) => (span % (col + gap)) - gap

function handleDOMContentLoaded () {
  const form = document.querySelector('form')
  const {
    roomUnits,
    roomWidth,
    roomLength,
    tileUnits,
    groutThickness,
    tileWidth,
    tileLength,
    alignment,
    startX,
    startY
  } = form
  const results = document.querySelector('ul')
  const [
    count,
    lengthCut,
    widthCut
  ] = [...results.children].map(c => c.querySelector('em'))
  const canvasCont = document.querySelector('aside')
  const canvas = canvasCont.querySelector('canvas')
  const ctx = canvas.getContext('2d')

  function handleChange () {
    const [contX, contY] = [canvasCont.offsetWidth, canvasCont.offsetHeight]
    const [roomX, roomY] = [roomLength.valueAsNumber, roomWidth.valueAsNumber]
    const [tileX, tileY] = [tileLength.valueAsNumber, tileWidth.valueAsNumber]
    const xBricked = alignment.value === 'x-brick'
    const yBricked = alignment.value === 'y-brick'
    const [xPos, yPos] = [startX.value, startY.value]
    const scale = roomX / roomY > canvasCont.offsetWidth / contY
      ? fromBaseUnits(contX, roomUnits.value, roomX) // Landscape
      : fromBaseUnits(contY, roomUnits.value, roomY) // Portrait
    const rl = toBaseUnits(roomX, roomUnits.value, scale)
    const rw = toBaseUnits(roomY, roomUnits.value, scale)
    const tl = toBaseUnits(tileX, tileUnits.value, scale)
    const tw = toBaseUnits(tileY, tileUnits.value, scale)
    const gt = toBaseUnits(parseFloat(groutThickness.value, 10), 'inches', scale)
    const tilesInLength = getCountInSpan(rl, tl, gt)
    const tilesInWidth = getCountInSpan(rw, tw, gt)
    const xRem = getRemainingLength(rl, tl, gt)
    const yRem = getRemainingLength(rw, tw, gt)
    const xOffset = {
      2: (tl - xRem) * -1, // Right
      1: gt + xRem / 2 // Center
    }[xPos] || gt
    const yOffset = {
      2: (tw - yRem) * -1, // Bottom
      1: gt + yRem / 2 // Center
    }[yPos] || gt
    const tiles = getRange(tilesInLength + 2, -1).flatMap(i =>
      getRange(tilesInWidth + 2, -1).map(j => {
        const xShift = xBricked && j % 2 !== 0 ? (tl / 2) + gt : 0
        const yShift = yBricked && i % 2 !== 0 ? (tw / 2) + gt : 0

        return [
          [i * (tl + gt) + xOffset + xShift, j * (tw + gt) + yOffset + yShift],
          [tl, tw]
        ]
      }))
    const leftOverLength = fromBaseUnits(xRem, tileUnits.value, scale) / (xPos === '1' ? 2 : 1)
    const leftOverWidth = fromBaseUnits(yRem, tileUnits.value, scale) / (yPos === '1' ? 2 : 1)

    count.textContent = `${(tilesInLength + 1) * (tilesInWidth + 1)}`
    lengthCut.textContent = `${leftOverLength.toFixed(3)} ${tileUnits.value}`
    widthCut.textContent = `${leftOverWidth.toFixed(3)} ${tileUnits.value}`
    canvas.width = rl
    canvas.height = rw
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    tiles.forEach(([coords, dims]) => { ctx.fillRect(...coords, ...dims) })
  }

  window.addEventListener('resize', handleChange);
  [roomUnits, roomWidth, roomLength, tileUnits, groutThickness, tileWidth, tileLength, ...alignment]
    .forEach(input => input.addEventListener('change', handleChange));
  [startX, startY]
    .forEach(input => input.addEventListener('input', handleChange))

  handleChange()
}

window.addEventListener('DOMContentLoaded', handleDOMContentLoaded)
