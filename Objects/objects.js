/* Bullet Object */
function Bullet(posX, posY, destX, destY, damage){
	var x = posX;
	var y = posY;
	var velX = 0;
	var velY = 0;
	var speed = 2.5;
	var hit = false;
	
	setDirection();
	var collisionInterval = setInterval(bulletCollision, 10);
	

	
	this.draw = draw;
    function draw(){
		if(!hit){
			fctx.drawImage(projectile, x, y)
		}
	}
	

	function setDirection(){
		diffX = destX-x;
		diffY = destY-y;
		
		lineLength = Math.sqrt((diffX * diffX) + (diffY * diffY));
		
		velX = diffX/lineLength;
		velY = diffY/lineLength;		
	}
	
	this.move = move;
	function move(){
		x += velX * speed;
		y += velY * speed;
		
		if(x > CANVAS_WIDTH){
			destroy();
		}
		if(x < 0){
			destroy();
		}
		if(y > CANVAS_HEIGHT){
			destroy();
		}
		if(y < 0){
			destroy();
		}
	}
	
	this.getX = getX;
    function getX(){
        return x;
    }

    this.getY = getY;
    function getY(){
        return y;
    }
	
	this.setX = setX;
    function setX(newX){
        x = newX;
    }

    this.setY = setY;
    function setY(newY){
        y = newY;
    }
	
	this.getHit = getHit;
    function getHit(){
        return hit;
    }
	
	
	this.destroy = destroy;
    function destroy(){
		clearInterval(collisionInterval);
		hit = true;
    }
	
	function bulletCollision(){
		for(i = 1; i < characters.length; i++){
			if(getX() > characters[i].getX() && getX() < (characters[i].getX()+characters[i].getWidth()) && 
			   getY() > characters[i].getY() && getY() < (characters[i].getY()+characters[i].getHeight())){
				characters[i].applyDamage(damage);
				destroy();
				i = characters.length;
			}
		}
	}
}

/* Weapon Object */
function Weapon(fireRate, damage, bulletspershot, spread, automatic, soundPath){
	// fireRate
	// 1.00: Semi-automatic (shot and stop)
	// 0.05: Minigun like  
	// Values are between 0 and 1
	var fireRate = fireRate;
	var damage = damage;
	var automatic = automatic;
	var BPS = bulletspershot;
	var spread = spread;
	var bullets = [];
	
	var sounds = [];
	var index = 0;
	
	for (var i = 0; i < 4; i++){
		sounds.push(new Audio(soundPath));
	} 
	
	this.getfireRate = getfireRate;
    function getfireRate(){
        return fireRate;
    }
	
	this.getAutomatic = getAutomatic;
    function getAutomatic(){
        return automatic;
    }

	this.fire = fire;
	function fire(originX, originY, destX, destY){
		playSoundEvent();
		for(i = 0; i < BPS; i++){
			// For weapons that have spread
			if(spread != 0){
				rand = Math.floor(Math.random() * 20 + 2);
				
				dir = Math.floor(Math.random() * 2);
				if(dir == 0){
					dir = -1;
				}
			}
			else{
				dir = 0;
				rand = 1;
			}
			
			bullet = new Bullet(originX, originY, destX + (dir*rand), destY + (dir*rand), damage/BPS);
			projectiles.push(bullet);
		}
	}
	
	function playSoundEvent() {
		if (window.chrome) sounds[index].load()
		sounds[index].play()
		index = (index + 1) % sounds.length
	}
}

/* Player Object */
function Player(xPos, yPos, pWidth, pHeight)
{
    /* private member variables */
    var x = (xPos)*tileSize;
    var y = (yPos)*tileSize;
	var width = pWidth;
	var height = pHeight;
	var playerImage = 5;
	var weapon = pistol;
	var health = 100;
	var dead = false;
	
	var acc = .2;
	
	var velY = 0;
    var velX = 0;
	
    var speed = 1; // max speed
    var friction = .97; // friction
	

    /* public methods */
    this.move = move;
    function move()
    {	
		if(map[37] && map[38]){ 	// left && up
			if (velX > -speed && velY > -speed) {
				velX -= acc;
				velY -= acc;
			}
		}
		if(map[38] && map[39]){ 	// right && up
			if (velX < speed && velY > -speed) {
				velX += acc;
				velY -= acc;
			}
		}
		if(map[37] && map[40]){ 	// left && down
			if (velX > -speed && velY < speed) {
				velX -= acc;
				velY += acc;
			}
		}
		if(map[39] && map[40]){ 	// right && down
			if (velX < speed && velY < speed) {
				velX += acc;
				velY += acc;
			}
		}
		
		if(map[37]){ 					// left
			if (velX > -speed) {
				velX -= acc;
			}
		}
		if(map[39]){ 				// right
			if (velX < speed) {
				velX += acc;
			}
		}
		if(map[38]){ 				// up
			if (velY > -speed) {
				velY -= acc;
			}
		}
		if(map[40]){ 				// down
			if (velY < speed) {
				velY += acc;
			}
		}
		updatePlayer();
    }
	
	this.checkShoot = checkShoot;
    function checkShoot(){
		// If the left mouse button is clicked
		if(mouseMap[1]){
			// Single fire
			if(weapon.getAutomatic() == false){
				if(typeof singlefireInterval == 'undefined' || singlefireInterval == null){
					shoot();
					singlefireInterval = setInterval(singleFireInterval, weapon.getfireRate() * 1000);
				}
			}
			
			// Allows rapid firing of non semi-automatic weapons
			if(weapon.getAutomatic() == true){
				if(typeof singlefireInterval == 'undefined' || singlefireInterval == null){
					shoot();
					automaticInterval = setInterval(shoot, weapon.getfireRate() * 1000);
					// parameters can be passed in setInterval with bind
					// http://stackoverflow.com/questions/457826/pass-parameters-in-setinterval-function
				}
			}
		}
		// If the left mouse button is not clicked, rapid firing stops
		else{
			if(automaticInterval != null){
				clearInterval(automaticInterval);
				automaticInterval = null;
				
				// Stops automatic weapons being able to fire straight away after you let go of the mouse button
				singlefireInterval = setInterval(singleFireInterval, weapon.getfireRate() * 1000);
			}
		}
	}
	
	this.singleFireInterval = singleFireInterval;
	function singleFireInterval(){
		clearInterval(singlefireInterval);
		singlefireInterval = null;
	}
	
	this.shoot = shoot;
	function shoot(){
		weapon.fire(x+(width/2), y+(height/2), mouseX, mouseY);
	}
	
    this.draw = draw;
    function draw(){
		var tile = 4;
		var tileRow = (tile / imageNumTiles) | 0; // Bitwise OR operation
		var tileCol = (tile % imageNumTiles) | 0;
				
		
		fctx.drawImage(tileset, 
					  (tileCol * tileSize), 
					  (tileRow * tileSize), 
					  tileSize, 
					  tileSize, 
					  (x), 
					  (y), 
					  width, 
					  height);
        
    }

    this.setX = setX;
    function setX(newX){
        x = newX;
    }

	this.setY = setY;
    function setY(newY){
        y = newY;
    }
	
    this.getX = getX;
    function getX(){
        return x;
    }

    this.getY = getY;
    function getY(){
        return y;
    }
	
	this.getWidth = getWidth;
    function getWidth(){
        return width;
    }

    this.getHeight = getHeight;
    function getHeight(){
        return height;
    }
	
	this.setWeapon = setWeapon;
	function setWeapon(newWeapon){
		weapon = newWeapon;
	}
	
	this.setHealth = setHealth;
    function setHealth(newHealth){
        health = newHealth;
    }
	
	this.getHealth = getHealth;
    function getHealth(){
        return health;
    }
	
	// Updates players position
	this.updatePlayer = updatePlayer;
	function updatePlayer(){
		// Make movement
		if(velX != 0 || velY != 0){
			var nextX = x + velX;
			var nextY = y + velY;
			
			if(collisionTest(nextX,nextY)){
				y += velY;
				x += velX;
				
				velY *= friction;
				velX *= friction;
				
				// Since velocity gets infinitely smaller to 0, need to reset it at some point
				if(velX > 0){
					if(velX < .1){
						velX = 0;
					}
				}
				else{
					if((-1* velX) < .1){
						velX = 0;
					}
				}
				if(velY > 0){
					if(velY < .1){
						velY = 0;
					}
				}
				else{
					if((-1* velY) < .1){
						velY = 0;
					}
				}
			}	
		}
	}
	
	this.getDead = getDead;
    function getDead(){
		if(health <= 0){
			dead = true;
		}
        return dead;
    }
	
	this.destroy = destroy;
    function destroy(){
		dead = true;
    }
	
	
	
	// Called whenever we want to stop movement
	function resetVelocity(){
		resetXVelocity();
		resetYVelocity();
		
	}
	
	function resetXVelocity(){
		velX = 0;
	}
	
	function resetYVelocity(){
		velY = 0;
	}
	
	function realToTile(realCoordX, realCoordY){
		var tileCoordX = parseInt(realCoordX/tileSize);
		var tileCoordY = parseInt(realCoordY/tileSize);
		
		var coords = [tileCoordX, tileCoordY];
		return coords;
	}

	function tileToReal(tileCoordX, tileCoordY){
		var realCoordX = tileCoordX * tileSize;
		var realCoordY = tileCoordY * tileSize;
		
		var coords = [realCoordX, realCoordY];
		return coords;
	}

	// Pass through the players next position before it updates for collision test
	function collisionTest(xPos, yPos){
		// All coordinates in this function are real coordinates - converted from tile coordinates/passed as parameter
		
		// Player info
		playerX = getX();
		playerY = getY();
		playerWidth = width;
		playerHeight = height;
		
		// Next position info
		tileX = xPos;
		tileY = yPos;
		tileWidth = tileSize;
		tileHeight = tileSize;
		
		
		//var up; //38
		//var down; //40
		//var left; //37
		//var right; // 39
		
		// Next position tile coordinates
		mapCoordX = parseInt(xPos/tileSize);
		mapCoordY = parseInt(yPos/tileSize);
		
		
		var bottomLeft = realToTile(tileX, tileY+playerHeight);
		var bottomRight = realToTile(tileX+playerWidth, tileY+playerHeight);
		var topRight = realToTile(tileX+playerWidth, tileY);
		var topLeft = realToTile(tileX, tileY);
		
		
		// Collision for bottom left corner
		if(mapData[bottomLeft[0]][bottomLeft[1]] == 1){
			
			xCoord = bottomLeft[0] * tileSize;	// These coordinates represent the top-left corner of the tile the player is colliding with
			yCoord = bottomLeft[1] * tileSize;
			
			// Collision below player
			if(playerY+playerHeight < yCoord && playerX > xCoord && playerX < xCoord+tileSize){
				resetYVelocity();
			}
			
			// Collision left of player
			else{
				resetXVelocity();
			}
		}
		
		// Collision for bottom right corner
		if(mapData[bottomRight[0]][bottomRight[1]] == 1){
			
			
			xCoord = bottomRight[0] * tileSize;	// These coordinates represent the top-left corner of the tile the player is colliding with
			yCoord = bottomRight[1] * tileSize;
			
			// Collision below player
			if(playerY+playerHeight < yCoord && playerX+playerWidth > xCoord && playerX+playerWidth < xCoord+tileSize){
				resetYVelocity();
			}
			
			// Collision right of player
			else{
				resetXVelocity();
			}
		}
		
		// Collision for top right corner
		if(mapData[topRight[0]][topRight[1]] == 1){
				
			xCoord = topRight[0] * tileSize;	// These coordinates represent the top-left corner of the tile the player is colliding with
			yCoord = topRight[1] * tileSize;
			
			// Collision above player
			if(playerX+playerWidth > xCoord && playerY > yCoord && playerX+playerWidth < xCoord+tileSize){
				resetYVelocity();
			}
		
			// Collision right of player
			else{
				resetXVelocity();
			}
		}
		
		// Collision for top left corner
		if(mapData[topLeft[0]][topLeft[1]] == 1){
			
			xCoord = topLeft[0] * tileSize;	// These coordinates represent the top-left corner of the tile the player is colliding with
			yCoord = topLeft[1] * tileSize;
			// Collision above player
			if(playerY > yCoord && playerX > xCoord && playerX < xCoord + tileSize && playerY+playerHeight > yCoord + tileSize){
				resetYVelocity();
			}
			// Collision left of player
			else{
				resetXVelocity();
			}
			
		}
		return true;
	}
	
}


function Ghost(xPos, yPos, zWidth, zHeight, tile, id){
	/* private member variables */
    var x = (xPos)*tileSize;
    var y = (yPos)*tileSize;
	var width = zWidth;
	var height = zHeight;
	var ghostImage = tile;
	var health = 100;
	var dead = false;
	var damage = 2;
	var id;
	var attackInterval = null;
	
	var acc = .05;
	
	var velY = 0;
    var velX = 0;
	
    var speed = .5; // max speed
    var friction = .95; // friction
	
	    /* public methods */
    this.move = move;
    function move()
    {	
		// down
		if(y < characters[0].getY()){
			if (velY < speed) {
				velY += acc;
			}
		}
		//up
		else if(y > characters[0].getY()){
			if (velY > -speed) {
				velY -= acc;
			}
		}
		// right
		if(x < characters[0].getX()){
			if (velX < speed) {
				velX += acc;
			}
		}
		// left
		else if(x > characters[0].getX()){
			if (velX > -speed) {
				velX -= acc;
			}
		}
		updateGhost();
    }

    this.destroy = destroy;
    function destroy(){
		
    }
	
    this.draw = draw;
    function draw(){
		var tile = ghostImage;
		var tileRow = (tile / imageNumTiles) | 0; // Bitwise OR operation
		var tileCol = (tile % imageNumTiles) | 0;
				
		
		fctx.drawImage(tileset, 
							 (tileCol * tileSize), 
							 (tileRow * tileSize), 
							 tileSize, 
							 tileSize, 
							 (x), 
							 (y), 
							 width, 
							 height);
        //fctx.fillRect(x, y, width, height);
		//console.log("X: "+x+"\nY: "+y);
        
    }

    this.setX = setX;
    function setX(newX){
        x = newX;
    }

	this.setY = setY;
    function setY(newY){
        y = newY;
    }
	
    this.getX = getX;
    function getX(){
        return x;
    }

    this.getY = getY;
    function getY(){
        return y;
    }
	
	this.getWidth = getWidth;
    function getWidth(){
        return width;
    }

    this.getHeight = getHeight;
    function getHeight(){
        return height;
    }
	
	this.applyDamage = applyDamage;
    function applyDamage(damage){
        health = health - damage;
		if(health <= 0){
			destroy();
		}
    }
	
	this.getDead = getDead;
    function getDead(){
        return dead;
    }
	
	this.destroy = destroy;
    function destroy(){
		dead = true;
		score += 100*round;
		kills++;
    }
	
	function resetVelocity(){
		resetXVelocity();
		resetYVelocity();
	}
	
	function resetXVelocity(){
		velX = 0;
	}
	
	function resetYVelocity(){
		velY = 0;
	}

	
	// Updates players position
	this.updateGhost = updateGhost;
	function updateGhost(){
		// Make movement
		if(velX != 0 || velY != 0){
			var nextX = x + velX;
			var nextY = y + velY;
			
			var collision = false;
			
			for(j = 0; j < characters.length; j++){
				if(id != j){
					collision = ghostCollision(nextX, nextY, j);
				}
			}
			if(collision == false){
				y += velY;
				x += velX;
					
				velY *= friction;
				velX *= friction;	
					
				// Since velocity gets infinitely smaller to 0, need to reset it at some point
				if(velX > 0){
					if(velX < acc/2){
						velX = 0;
					}
				}
				else{
					if((-1* velX) < acc/2){
						velX = 0;
					}
				}
				if(velY > 0){
					if(velY < acc/2){
						velY = 0;
					}
				}
				else{
					if((-1* velY) < acc/2){
						velY = 0;
					}
				}
			}
			// Keep the ghosts moving even if they collide
			else{
				if(getX() > player.getX()){
					x+= velX;
				}
				else if(getX() < player.getX()){
					x+= velX;
				}
				if(getY() > player.getY()){
					y+= velY;
				}
				else if(getY() < player.getY()){
					y+= velY;
				}
			}
			
		
		}
	}
	

	
	function attackPlayer(){
		if(!gameOver){
			var hp = player.getHealth();
			hp = hp - damage;
			player.setHealth(hp);
			clearInterval(attackInterval);
			attackInterval = null;
		}
	}
	

	function ghostCollision (nextX, nextY, j){
		if((nextX > characters[j].getX() && nextX < characters[j].getX()+characters[j].getWidth() && nextY > characters[j].getY() && nextY < characters[j].getY()+characters[j].getHeight()) ||
					   (nextX+getWidth() > characters[j].getX() && nextX+getWidth() < characters[j].getX()+characters[j].getWidth() && nextY > characters[j].getY() && nextY < characters[j].getY()+characters[j].getHeight()) ||
					   (nextX+getWidth() > characters[j].getX() && nextX+getWidth() < characters[j].getX()+characters[j].getWidth() && nextY+getHeight() > characters[j].getY() && nextY+getHeight() < characters[j].getY()+characters[j].getHeight()) ||
					   (nextX > characters[j].getX() && nextX < characters[j].getX()+characters[j].getWidth() && nextY+getHeight() > characters[j].getY() && nextY+getHeight() < characters[j].getY()+characters[j].getHeight())){
						if(j == 0){
							// If the player isn't being attacked already by this ghost, start attacking the player
							if(attackInterval == null){
								if(!gameOver){
									attackPlayer();
									attackInterval = setInterval(attackPlayer, 1000);
								}
							}
							
						}
						return true;
					}
					
	}
}