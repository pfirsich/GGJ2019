let map = {} // map[realmId] = array of arrays of tuples (color, char)

function setMap(realmId, x, y, color, char) {
    map[realmId][y][x] = [color, char];
}

function redraw(stream, realmId, camX, camY) {

}

module.export = {setMap, redraw}
