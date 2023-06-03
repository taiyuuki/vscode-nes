function fillFalse(len) {
  return Array.from({ length: len }).fill(false)
}

/*为数字不足位数补0 */
function zeroFill(num, len) {
  return num.toString().padStart(len, '0')
}

function getCurrentTime() {
  let date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()
  return `${year}年${month}月${day}日 ${zeroFill(hour, 2)}:${zeroFill(minute, 2)}:${zeroFill(second, 2)}`
}

function get_fill_arr(len, val) {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(val)
  }
  return arr
}

function getVramMirrorTable() {
  return get_fill_arr(0x8000, 0).map((_, i) => i)
}

function compressArray(arr) {
  const compressed = []
  let current = arr[0]
  let count = 1
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] == current) {
      count++
    }
    else {
      if (count > 1) {
        compressed.push(count)
        compressed.push(current)
      }
      else {
        compressed.push(-current - 1)
      }
      current = arr[i]
      count = 1
    }
  }
  compressed.push(count)
  compressed.push(current)
  return compressed
}

function decompressArray(compressed) {
  const decompressed = []
  for (let i = 0; i < compressed.length;) {
    if (compressed[i] < 0) {
      decompressed.push(-compressed[i] - 1)
      i++
    }
    else {
      const count = compressed[i]
      const value = compressed[i + 1]
      for (let j = 0; j < count; j++) {
        decompressed.push(value)
      }
      i += 2
    }
  }
  return decompressed
}

function compressPtTile(ptTile) {
  const opaques = []
  const pixs = []
  for (let i = 0; i < ptTile.length; i++) {
    for (let j = 0; j < ptTile[i].opaque.length; j++) {
      if (ptTile[i].opaque[j] === false) {
        opaques.push(0)
      }
      else {
        opaques.push(1)
      }
    }
    pixs.push(...ptTile[i].pix)
  }
  return [compressArray(opaques), compressArray(pixs)]
}

function decompressPtTile(compressed) {
  const ptTile = []
  let opaque = Array(8)
  let pix = []
  const opaques = decompressArray(compressed[0])
  const pixs = decompressArray(compressed[1])
  for (let i = 0; i < 512; i += 1) {
    for (let j = 0; j < 8; j += 1) {
      if (opaques[i * 8 + j] === 0) {
        opaque[j] = false
      }
    }
    for (let j = 0; j < 64; j += 1) {
      pix[j] = pixs[i * 64 + j]
    }
    ptTile.push({
      opaque,
      pix,
    })
    opaque = Array(8)
    pix = []
  }
  return ptTile
}

function compressNameTable(nameTable) {
  const tile = []
  const attrib = []
  nameTable.reduce((prev, curr) => {
    tile.push(...curr.tile)
    attrib.push(...curr.attrib)
    return prev
  }, tile)
  return [compressArray(tile), compressArray(attrib)]
}

function decompressNameTable(compressed) {
  const nameTable = []
  let tile = []
  let attrib = []
  const tiles = decompressArray(compressed[0])
  const attrs = decompressArray(compressed[1])
  for (let i = 0; i < 1024 * 4; i += 1) {
    tile.push(tiles[i])
    attrib.push(attrs[i])
    if ((i + 1) % 1024 === 0) {
      nameTable.push({ tile, attrib })
      tile = []
      attrib = []
    }
  }
  return nameTable
}