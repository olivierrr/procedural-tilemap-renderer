
;(function(root, factory) {

  // AMD   
  if (typeof define === 'function' && define.amd){
    define('progressbar', [], function(){
      return factory()
    })
  }

  // browserify    
  else if (typeof module !== 'undefined' && module.exports){
    module.exports = factory()
  }

  // Browser globals
  else{
    root.Tilemap = factory()
  }

})(this, function(){

  function Tilemap(renderer, options){
    if(!(this instanceof Tilemap)){
      return new Tilemap(renderer)
    }
    if(!renderer){
      throw new Error('Tilemap constructor needs an instance of PIXI renderer as an argument')
    }

    PIXI.DisplayObjectContainer.call(this)
    this.renderer = renderer
    this.tiles = {}
    this.tileSize = 16
    this.scale.x = this.scale.y = this.zoom = 14.123142
  }

  Tilemap.prototype = PIXI.DisplayObjectContainer.prototype
  Tilemap.prototype.constructor = Tilemap

  var proto = Tilemap.prototype

  proto.tick = function(){
    var self = this

    this.children.forEach(function(tile){
      tile.visible = false

      if(++tile.age > 100){
        delete self.tiles[tile.tileX+'-'+tile.tileY]
        self.removeChild(tile)
      }
    })

    this.tilesInViewPort().forEach(function(tile){
      tile.age = 0

      if(tile.data){
        tile.visible = true
        if(tile.needsUpdate){
          self.fillTile(tile)
        }
      }else{
        self.missingTile(tile.tileX, tile.tileY)
      }
    })
  }

  proto.getTile = function(x, y){
    return this.tiles[x+'-'+y] || this.addTile(x, y)
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
    this.tiles[x+'-'+y] = tile
    this.addChild(tile)
    return tile
  }

  proto.fillTile = function(tile){
    var texture = tile.data
    if(!texture) return

    tile.needsUpdate = false
    tile.setTexture(PIXI.TextureCache[texture])
  }

  proto.tilesInViewPort = function(){
    var tileSizePx = this.tileSize * this.zoom

    // viewport width and height in tiles
    var horiz = Math.ceil(this.renderer.width / tileSizePx)+2
    var verti = Math.ceil(this.renderer.height / tileSizePx)+2

    // top left corner tile coordinates of viewport
    var startingX = ~~(this.position.x / tileSizePx)+1
    var startingY = ~~(this.position.y / tileSizePx)+1

    var tiles = []
    for(var i=0; i < horiz; i++) {
      for(var j=0; j < verti; j++) {
        tiles.push(this.getTile(i - startingX, j - startingY))
      }
    }
    return tiles
  }

  proto.zoomIn = function(){
    var center = this.getCenterTile()
    this.zoom = Math.min(this.zoom * 1.5, 50)
    this.scale.x = this.scale.y = this.zoom
    this.goToTile(center[0], center[1])
  }

  proto.zoomOut = function(){
    var center = this.getCenterTile()
    this.zoom = Math.max(this.zoom / 1.5, 1.0123)
    this.scale.x = this.scale.y = this.zoom
    this.goToTile(center[0], center[1])
  }

  proto.getCenterTile = function(){
    var tileSizePx = this.tileSize * this.zoom
    return [
      Math.round(((this.position.x/tileSizePx)*-1) + ((this.renderer.width/2)/tileSizePx)),
      Math.round(((this.position.y/tileSizePx)*-1) + ((this.renderer.height/2)/tileSizePx))
    ]
  }

  proto.goToTile = function(x, y){
    var tileSizePx = this.tileSize * this.zoom
    this.position.x = (this.renderer.width / 2) - (x * tileSizePx - tileSizePx / 2)
    this.position.y = (this.renderer.height / 2) - (y * tileSizePx - tileSizePx / 2)
  }

  // @todo: make it an event?
  proto.missingTile = function(x, y){
    console.log('overwrite this function!')
  }

  return Tilemap
})