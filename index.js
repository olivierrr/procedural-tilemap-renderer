
/**
 * infinite Tilemap renderer
 */

function Tilemap(renderer){
  if(!(this instanceof Tilemap)){
    return new Tilemap(renderer)
  }

  if(!renderer){
    throw new Error('Tilemap constructor needs an instance of a PIXI renderer as an argument')
  }

  PIXI.DisplayObjectContainer.call(this)

  this.renderer = renderer
  this.interactive = true
  this.tiles = {}
  this.tileSize = 16
  this.zoom = 1.123142
  this.zoomRate = 1.5
  this.scale.x = this.scale.y = this.zoom
}

Tilemap.prototype = PIXI.DisplayObjectContainer.prototype
Tilemap.prototype.constructor = Tilemap

var cons = Tilemap
  , proto = cons.prototype

proto.tick = function(){
  var self = this

  this.children.forEach(function(tile){
    tile.visible = false

    if(++tile.age > 100){
      delete self.tiles[tile.tileX+'.'+tile.tileY]
      self.removeChild(tile)
    }
  })

  this.tilesInViewPort().forEach(function (tile){
    tile.age = 0

    if(tile.data){
      tile.visible = true
      if(tile.needsUpdate) self.fillTile(tile)
    }else{
      self.missingTile(tile.tileX, tile.tileY)
    }
  })
}

proto.getTile = function(x, y){
  return this.tiles[x+'.'+y] || this.addTile(x, y)
}

proto.setTile = function(x, y, data){
  var tile = this.getTile(x, y)
  tile.data = data
  tile.needsUpdate = true
}

proto.addTile = function(x, y){
  var tile = new PIXI.Sprite(PIXI.TextureCache[1])
  tile.age = 0
  tile.needsUpdate = true
  tile.position.x = x * this.tileSize
  tile.position.y = y * this.tileSize
  tile.tileX = x
  tile.tileY = y
  this.tiles[x+'.'+y] = tile
  this.addChild(tile)
  return tile
}

proto.fillTile = function(tile){
  var texture = tile.data
  if(!texture) return

  tile.needsUpdate = false
  tile.setTexture(PIXI.TextureCache[texture])
}

//@todo handle negative coords
proto.tilesInViewPort = function(){
  // tile size in pixels
  var tileSizePx = this.tileSize * this.zoom

  // viewport width and height in tiles
  var horiz = Math.ceil(this.renderer.width / tileSizePx)+1
  var verti = Math.ceil(this.renderer.height / tileSizePx)+1

  // top left corner tile coordinates of viewport
  var startingX = ~~Math.abs(this.position.x / tileSizePx)
  var startingY = ~~Math.abs(this.position.y / tileSizePx)

  var tiles = []
  for(var i=0; i < horiz; i++) {
    for(var j=0; j < verti; j++) {
      tiles.push(this.getTile(i + startingX, j + startingY))
    }
  }
  return tiles
}

proto.zoomIn = function(){
  var center = this.getCenterTile()
  this.zoom = Math.min(this.zoom * this.zoomRate, 50)
  this.scale.x = this.scale.y = this.zoom

  this.goToTile(center[0], center[1])
}

proto.zoomOut = function(){
  var center = this.getCenterTile()
  this.zoom = Math.max(this.zoom / this.zoomRate, 1.0123)
  this.scale.x = this.scale.y = this.zoom

  this.goToTile(center[0], center[1])
}

proto.getCenterTile = function(){
  var tilesizePx = this.tileSize * this.zoom

  return [
    ~~((Math.abs(this.position.x)/tilesizePx) + ((this.renderer.width/2)/tilesizePx))+1,
    ~~((Math.abs(this.position.y)/tilesizePx) + ((this.renderer.height/2)/tilesizePx))+1
  ]
}

proto.goToTile = function(x, y){
  this.position.x = (this.renderer.width / 2) - (x * this.zoom * this.tileSize - this.tileSize * this.zoom / 2)
  this.position.y = (this.renderer.height / 2) - (y * this.zoom * this.tileSize - this.tileSize * this.zoom / 2)
  this.clampPosition()
}

proto.clampPosition = function(){
  this.position.x = Math.min(this.position.x, 0)
  this.position.y = Math.min(this.position.y, 0)
}

// @todo: make it an event?
proto.missingTile = function(x, y){
  console.log('overwrite this function!')
}

function clamp(num, min, max){
  return Math.min(Math.max(num, min), max)
}

module.exports = Tilemap