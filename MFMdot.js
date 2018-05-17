(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

// Define a "box" object
function box(x,y,width,height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

// Define a "coins_obj" object
function coins_obj(x,y,width,height,color,count){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.count = count;
}

var canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  width = 500,
  height = 300,
  player = {
    x: width / 2,
    y: 0,
    width: 5,
    height: 5,
    speed: 3,
    velX: 0,
    velY: 0,
    jumping: false,
    grounded: false
  },
  guy = {
    x: -75,
    y: 120,
    width: 5,
    height: 5,
    direction: "l",
    count: 0
  },
  //wall in front of client
  wall = {
    x: -60,
    y: -100,
    width: 10,
    height: 225,
    color: "transparent"
  },
  ground = {
    x: 0,
    y: 500,
    width: width,
    height: 30
  },
  elevator = {
    x: 100,
    y: 495,
    width: 40,
    height: 40,
    at_top: 0
  },
  briefcase = {
    x: 2900,
    y: 370,
    width: 20,
    height: 12,
    count: 0
  },

  keys = [],
  friction = 0.8,
  gravity = 0.2;

//court house door
door = {
  x: 6835,
  y: 175,
  width: 50,
  height: 75,
  color: "transparent"
};

//put random leaves on the tree
var leaves = []
for (i = 0; i < 12; i++) {
  leaves.push({
    x: Math.random() * (10 - -70) + -70,
    y: Math.random() * (140 - 40) + 40,
    size: Math.random() * (50 - 20) + 20
  });
}

var boxes = [];
boxes.push( new box(6500,200,30,30)  ); // courthouse platform
boxes.push( new box(6600,270,500,20) ); //courthouse base
boxes.push( new box(-40,250,130,15)  ); //tree platforms
boxes.push( new box(150,180,30,30)   );
boxes.push( new box(-30,130,7,120)   ); //trunk
boxes.push( new box(-85,125,70,7)    ); //top branch
boxes.push( new box(-24,170,20,7)    ); //bottom branch
boxes.push( new box(215,150,60,60)   ); //player platform

var courthouse = [];
courthouse.push( new box(6700,68,320,20)  ); //roof
courthouse.push( new box(6740,46,240,20)  );
courthouse.push( new box(6780,24,160,20)  );
courthouse.push( new box(6700,100,20,170) ); //pillars...left pillar
courthouse.push( new box(6690,90,40,10)   );
courthouse.push( new box(6690,260,40,10)  );
courthouse.push( new box(6800,100,20,170) ); //2nd from left pillar
courthouse.push( new box(6790,90,40,10)   );
courthouse.push( new box(6790,260,40,10)  );
courthouse.push( new box(6900,100,20,170) ); //2nd from right pillar
courthouse.push( new box(6890,90,40,10  ) );
courthouse.push( new box(6890,260,40,10)  );
courthouse.push( new box(7000,100,20,170) ); //right pillar
courthouse.push( new box(6990,90,40,10)   );
courthouse.push( new box(6990,260,40,10)  );

//create random clouds
var clouds = []
for (i = 0; i < 50; i++) {
  clouds.push({
    x: Math.random() * (7000 - 0) + 0,
    y: Math.random() * (height - -20) + -20,
    width: Math.random() * (60 - 10) + 40,
    height: Math.random() * (30 - 10) + 40
  });
}

var coins = [];
coins.push( new coins_obj(260,70,10,10,"yellow",0) ); //coin1
coins.push( new coins_obj(50,170,10,10,"yellow",0) ); //coin2
coins.push( new coins_obj(-40,30,10,10,"yellow",0) ); //coin3
coins.push( new coins_obj(1005,70,10,10,"yellow",0) ); //coin4
coins.push( new coins_obj(705,70,10,10,"yellow",0) ); //coin5
coins.push( new coins_obj(door.x - 180,175,10,10,"yellow",0) ); //coin6
coins.push( new coins_obj(1910,70,10,10,"yellow",0) ); //coin7
coins.push( new coins_obj(briefcase.x - 30,briefcase.y + 40,10,10,"yellow",0) ); //coin8
coins.push( new coins_obj(2805,70,10,10,"yellow",0) ); //coin9

//intitalize some variables
var originx = 0;
var originy = 0;
var right_button_count = 0;
var right_button_count = 0;
var origin = 0;
var gap_length = 180;
var frame_count = 0;
var coin_count = 0;
var box_color = 250;
canvas.width = width;
canvas.height = height;
var box_width = 25;
var falling_speed = 5;

//if player has already gone through coins 1-3, set them to off
if (wall.x < -60) {
  coins[0].count = 4;
  coins[1].count = 3;
  coins[2].count = 7;
}
//if player has already gone through coin 4, set it to off
if (gap_length < 180) {
  coins[3].count = 7;
  coins[4].count = 2;
}
//if door is visible, set coins 6 and 7 to off
if (door.color !== "transparent") {
  coins[5].count = 2;
  coins[6].count = 7;
}
//if gravity is lower, set coin 8 to off
if (gravity < .2) {
  coins[7].count = 3;
}

//begin update function
function update() {
  frame_count++;

  // check keys
  if (keys[38] || keys[32]) {
    // up arrow or space
    if (!player.jumping && player.grounded) {
      player.jumping = true;
      player.grounded = false;
      player.velY = -player.speed * 2;
    }
  }

  //put a gap in the path every 50 blocks
  next_blockx = boxes[boxes.length - 1].x + boxes[boxes.length - 1].width - 2;
  if (boxes.length % 50 === 0) {
    next_blockx = next_blockx + gap_length;
  }
  next_blocky = boxes[boxes.length - 1].y;

  var box_height = (Math.random() * (160 - 50) + 50) - box_width;

  if (keys[39]) {
    // right arrow
    if (player.x > 249) {
      guy.direction = "l";
      originx = originx - 2;
      right_button_count++;
      for (var i = 0; i < boxes.length; i++) {
        boxes[i].x = boxes[i].x - 2;
      }
      for (var i = 0; i < coins.length; i++) {
        coins[i].x = coins[i].x - 2;
      }
      for (var i = 0; i < courthouse.length; i++) {
        courthouse[i].x = courthouse[i].x - 2;
      }
      for (var i = 0; i < clouds.length; i++) {
        clouds[i].x = clouds[i].x - 1;
      }
      for (var i = 0; i < leaves.length; i++) {
        leaves[i].x = leaves[i].x - 2;
      }
      guy.x = guy.x - 2;
      door.x = door.x - 2;
      elevator.x = elevator.x - 2;
      wall.x = wall.x - 2;
      briefcase.x = briefcase.x - 2;
      if (boxes.length < 245 && right_button_count % 12 === 0 && guy.count > 0 && originx < 0 && player.y < 260) {
        boxes.push( new box(next_blockx,next_blocky,box_width,box_height) ); 
   //   boxes.push({
   //     x: next_blockx,
   //     y: next_blocky,
   //     width: box_width,
   //     height: box_height,
   //   });
      }
    } else {
      player.x++
    }
  }

  if (keys[37]) {
    // left arrow
    if (player.x < 251) {
      guy.direction = "r";
      originx = originx + 2;
      for (var i = 0; i < boxes.length; i++) {
        boxes[i].x = boxes[i].x + 2;
      }
      for (var i = 0; i < coins.length; i++) {
        coins[i].x = coins[i].x + 2;
      }
      for (var i = 0; i < courthouse.length; i++) {
        courthouse[i].x = courthouse[i].x + 2;
      }
      for (var i = 0; i < clouds.length; i++) {
        clouds[i].x = clouds[i].x + 1;
      }
      for (var i = 0; i < leaves.length; i++) {
        leaves[i].x = leaves[i].x + 2;
      }
      guy.x = guy.x + 2;
      door.x = door.x + 2;
      elevator.x = elevator.x + 2;
      wall.x = wall.x + 2;
      briefcase.x = briefcase.x + 2;
    } else {
      player.x--;
    }
  }

  player.velX *= friction;
  player.velY += gravity;

  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();

  //blue sky background
  ctx.beginPath();
  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, width, height);

  //falling
  if (player.y > height - player.height - 5) {
    if (originy > -200) {
      originy -= falling_speed;
      for (i = 0; i < boxes.length; i++) {
        boxes[i].y -= falling_speed;
      }
      for (i = 0; i < leaves.length; i++) {
        leaves[i].y -= falling_speed;
      }
      for (i = 0; i < coins.length; i++) {
        coins[i].y -= falling_speed;
      }
      for (i = 0; i < courthouse.length; i++) {
        courthouse[i].y -= falling_speed;
      }
      for (i = 0; i < clouds.length; i++) {
        clouds[i].y -= falling_speed;
      }
      guy.y -= falling_speed;
      elevator.y -= falling_speed;
      ground.y -= falling_speed;
      player.y -= falling_speed;
      door.y -= falling_speed;
      briefcase.y -= falling_speed;
      wall.y -= falling_speed;
    }
  }

  player.grounded = false;

  for (var i = 0; i < boxes.length; i++) {
    if ((boxes[i].x + boxes[i].width > 0) && (boxes[i].x < width)) {
      ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
      var dir = colCheck(player, boxes[i]);
      if (dir === "l" || dir === "r") {
        player.velX = 0;
        player.jumping = false;
      } else if (dir === "b") {
        player.grounded = true;
        player.jumping = false;
      } else if (dir === "t") {
        player.velY *= -1;
      }
    }
  }

  ctx.rect(wall.x, wall.y, wall.width, wall.height);
  ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
  var dir = colCheck(player, wall);
  if (dir === "l" || dir === "r") {
    player.velX = 0;
    player.jumping = false;
  } else if (dir === "b") {
    player.grounded = true;
    player.jumping = false;
  } else if (dir === "t") {
    player.velY *= -1;
  }

  var dir = colCheck(player, ground);
  if (dir === "b") {
    player.grounded = true;
    player.jumping = false;
  }

  //make the elevator go up and down
  ctx.fillStyle = "blue";
  ctx.fillRect(elevator.x, elevator.y, elevator.width, elevator.height);
  ctx.fillRect(elevator.x + 5, elevator.y + 30, elevator.width - 10, 20);
  ctx.fillRect(elevator.x, elevator.y - 60, elevator.width, 5);
  ctx.fillRect(elevator.x + elevator.width / 2, elevator.y - 70, 3, 10);
  ctx.fillStyle = "rgba(0,0,0,.2)";
  ctx.fillRect(elevator.x, elevator.y - 55, elevator.width, 55);
  var dir = colCheck(player, elevator);
  if (dir === "b") {
    player.grounded = true;
    player.jumping = false;
    elevator.at_top++;
  }
  if (elevator.at_top > 0 && originy < 0) {
    for (i = 0; i < boxes.length; i++) {
      boxes[i].y += .5;
    }
    for (i = 0; i < leaves.length; i++) {
      leaves[i].y += .5;
    }
    for (i = 0; i < courthouse.length; i++) {
      courthouse[i].y += .5;
    }
    for (i = 0; i < clouds.length; i++) {
      clouds[i].y += .5;
    }
    for (i = 0; i < coins.length; i++) {
      coins[i].y += .5;
    }
    guy.y += .5;
    elevator.y -= .5;
    originy += .5;
    ground.y += .5;
    door.y += .5;
    briefcase.y += .5;
    wall.y += .5;
  }
  if (originy === 0 || elevator.y === originy + 50) {
    elevator.at_top = 0;
  }
  if (elevator.at_top === 0 && elevator.y - originy < 495) {
    elevator.y++;
  }
  ctx.fillStyle = "transparent";

  //check if player is colliding with coins
  for (i = 0; i < coins.length; i++) {
    var dir = colCheck(player, coins[i]);
    if (dir === "t") {
      player.grounded = true;
      player.jumping = false;
      coin_count++;
      coins[i].count++;
    }
  }

  //check if player has collided with guy. if so, guy follows him.
  var dir = colCheck(player, guy);
  if ((dir === "t") || (dir === "b") || (dir === "r") || (dir === "l")) {
    guy.count++;
  }
  if (guy.count > 0) {
    guy.y = player.y - 15;
    if (guy.direction === "l") {
      guy.x = player.x - 15;
    } else if (guy.direction === "r") {
      guy.x = player.x + 15;
    }
  }

  var dir = colCheck(player, briefcase);
  if ((dir === "t") || (dir === "b") || (dir === "r") || (dir === "l")) {
    briefcase.count++;
  }

  // check if player is coliding with the door. if so, check if guy is with him. if so, check if door is invisible. if not, end game.
  var dir = colCheck(player, door);
  if ((dir === "t") || (dir === "b") || (dir === "r") || (dir === "l")) {
    if (guy.count > 0) {
      if (door.color !== "transparent") {
        if (briefcase.count > 0) {
          ctx.fillStyle = "white";
          ctx.fillRect(20, 20, width - 40, height - 40);
          ctx.font = "18px Helvetica";
          ctx.fillStyle = "black";
          ctx.fillText("Congratulations!", 40, 60);
          ctx.fillText("You got your client to the court house on time.", 40, 80);
          ctx.fillText("Unfortunately, he has been convicted of", 40, 120);
          ctx.fillText("second degree murder.", 40, 140);
          ctx.fillText("But you did your best,", 40, 160);
          ctx.fillText("so you should feel good about that!", 40, 180);
          ctx.fillText("And seriously, think about what internet values", 40, 220);
          ctx.fillText("you think society needs to preserve.", 40, 240);
          exit();
        }
      }
    }
  }

  if (player.grounded) {
    player.velY = 0;
  }

  player.x += player.velX;
  player.y += player.velY;

  requestAnimationFrame(update);

  for (var i = 0; i < clouds.length; i++) {
    ctx.fillStyle = "rgba(255,255,255,.3)"
    ctx.fillRect(clouds[i].x, clouds[i].y, clouds[i].width, clouds[i].height);
    ctx.fillRect(clouds[i].x - clouds[i].width / 2, clouds[i].y + clouds[i].height / 2, clouds[i].width * 2, clouds[i].height);

  }

  for (var i = 0; i < coins.length; i++) {
    ctx.fillStyle = coins[i].color;
    ctx.fillRect(coins[i].x, coins[i].y, coins[i].width, coins[i].height);
    ctx.fillStyle = "orange";
    ctx.fillRect(coins[i].x + 2, coins[i].y + 2, coins[i].width - 4, coins[i].height - 4);
  }

  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillRect(guy.x, guy.y, guy.width, guy.height);

  for (var i = 0; i < courthouse.length; i++) {
    ctx.fillStyle = "grey";
    ctx.fillRect(courthouse[i].x - 2, courthouse[i].y - 2, courthouse[i].width + 4, courthouse[i].height + 4);
    ctx.fillStyle = "white";
    ctx.fillRect(courthouse[i].x, courthouse[i].y, courthouse[i].width, courthouse[i].height);
  }

  for (var i = 0; i < boxes.length; i++) {
    var box_color = (250 - i);
    ctx.fillStyle = "brown";
    ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
    ctx.fillStyle = "rgb(0," + box_color + ", 0)";
    ctx.fillRect(boxes[i].x + 2, boxes[i].y + 2, boxes[i].width - 7, boxes[i].height - 7);
  }

  for (var i = 0; i < leaves.length; i++) {
    ctx.fillStyle = "rgba(0,100,50,.5)";
    ctx.fillRect(leaves[i].x, leaves[i].y, leaves[i].size, leaves[i].size);
  }

  //fill in courthouse door
  ctx.fillStyle = door.color;
  ctx.fillRect(door.x, door.y, door.width, door.height);

  //fill in wall
  ctx.fillStyle = wall.color;
  ctx.fillRect(wall.x, wall.y, wall.width, wall.height);

  //fill in briefcase
  if (briefcase.count < 1) {
    ctx.fillStyle = "black";
    ctx.fillRect(briefcase.x, briefcase.y, briefcase.width, briefcase.height);
    ctx.fillRect(briefcase.x + 5, briefcase.y - 6, 10, 3);
    ctx.fillRect(briefcase.x + 5, briefcase.y - 6, 2, 10);
    ctx.fillRect(briefcase.x + 13, briefcase.y - 6, 2, 10);
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(30, 30, briefcase.width, briefcase.height);
    ctx.fillRect(30 + 5, 30 - 6, 10, 3);
    ctx.fillRect(30 + 5, 30 - 6, 2, 10);
    ctx.fillRect(30 + 13, 30 - 6, 2, 10);
  }

  //font style for coins
  ctx.font = "bold 16px Helvetica";
  ctx.fillStyle = "black";

  //text for coin 1
  if (coins[0].count === 1) {
    ctx.fillText("The pathetic dot is controlled by several outside forces...", 20, 60);
  } else if (coins[0].count === 2) {
    ctx.fillText("Specifically laws, social norms, and the physical", 20, 60);
    ctx.fillText("architecture of the world.", 20, 80);
  } else if (coins[0].count === 3) {
    ctx.fillText("Computer code is part of the architecture of the world.", 20, 60);
    ctx.fillText("Accordingly, code controls the dot's behavior.", 20, 80);
  } else if (coins[0].count === 4) {
    coins[0].color = "grey";
  } else if (coins[0].count > 4) {
    coins[0].count = 0;
  }
  if (coins[0].count === 0) {
    coins[0].color = "yellow";
  }

  //text for coin 2

  if (coins[1].count === 1) {
    ctx.fillText("Your client is hiding in a tree.", 20, 60);
  } else if (coins[1].count === 2) {
    ctx.fillText("The objective of this game is to fetch him down", 20, 60);
    ctx.fillText("and bring him to the court house in time for his", 20, 80);
    ctx.fillText("arraignment.", 20, 100);
  } else if (coins[1].count === 3) {
    coins[1].color = "grey";
  } else if (coins[1].count > 3) {
    coins[1].count = 0;
  }
  if (coins[1].count === 0) {
    coins[1].color = "yellow";
  }

  //text for coin 3

  if (coins[2].count === 1) {
    ctx.fillText("The code will not allow you to reach your client.", 20, 60);
  } else if (coins[2].count === 2) {
    ctx.fillText("The invisible hand of cyberspace has placed an", 20, 60);
    ctx.fillText("invisible wall between you and him.", 20, 80);
  } else if (coins[2].count === 3) {
    ctx.fillText("To remove the wall, you must change the code.", 20, 60);
  } else if (coins[2].count === 4) {
    ctx.fillText("Look in the javascript box to the left and scroll to line 31.", 20, 60);
    ctx.fillText("It says: x: -60", 20, 80);
  } else if (coins[2].count === 5) {
    ctx.fillText("Change -60 to -100.", 20, 60);
    ctx.fillText("This will move the wall left 40 pixels.", 20, 80);
  } else if (coins[2].count === 6) {
    ctx.fillText("Now click the RUN button in the upper left corner", 20, 60);
    ctx.fillText("to restart the game, then click on the game to activate it.", 20, 80);
  } else if (coins[2].count === 7) {
    coins[2].color = "grey";
  } else if (coins[2].count > 7) {
    coins[2].count = 0;
  }
  if (coins[2].count === 0) {
    coins[2].color = "yellow";
  }

  //text for coin 4

  if (coins[3].count === 1) {
    ctx.fillText("This gap is too big to jump across.", 20, 60);
  } else if (coins[3].count === 2) {
    ctx.fillText("Yet again the code of the game is constraining", 20, 60);
    ctx.fillText("your actions.", 20, 80);
  } else if (coins[3].count === 3) {
    ctx.fillText("To make the gap smaller, scroll to line 337 in the", 20, 60);
    ctx.fillText("javascript box on the left.", 20, 80);
  } else if (coins[3].count === 4) {
    ctx.fillText("It says:", 20, 60);
    ctx.fillText("var gap_length = 180;", 20, 80);
  } else if (coins[3].count === 5) {
    ctx.fillText("Change the 180 at the end of the line to 100.", 20, 60);
  } else if (coins[3].count === 6) {
    ctx.fillText("Now click the RUN button in the upper left corner", 20, 60);
    ctx.fillText("to restart. Then click back in the game window.", 20, 80);
  } else if (coins[3].count === 7) {
    coins[3].color = "grey";
  } else if (coins[3].count > 7) {
    coins[3].count = 0;
  }
  if (coins[3].count === 0) {
    coins[3].color = "yellow";
  }

  //text for coin 5

  if (coins[4].count === 1) {
    ctx.fillText("To make sure your client stays with you the next time", 20, 60);
    ctx.fillText("you restart the game, go to line 27 and change the 0 to a 1.", 20, 80);
  } else if (coins[4].count === 2) {
    coins[4].color = "grey";
  } else if (coins[4].count > 2) {
    coins[4].count = 0;
  }
  if (coins[4].count === 0) {
    coins[4].color = "yellow";
  }

  //text for coin 6

  if (coins[5].count === 1) {
    ctx.fillText("The court house door is invisible.", 20, 60);
    ctx.fillText("Change the door's color to enter.", 20, 80);
  } else if (coins[5].count === 2) {
    coins[5].color = "grey";
  } else if (coins[5].count > 2) {
    coins[5].count = 0;
  }
  if (coins[5].count === 0) {
    coins[5].color = "yellow";
  }

  //text for coin 7

  if (coins[6].count === 1) {
    ctx.fillText("The code of the game constrains your", 20, 60);
    ctx.fillText("actions in the game, which is relatively", 20, 80);
    ctx.fillText("unoffensive, at least in a moral sense.", 20, 100);
  } else if (coins[6].count === 2) {
    ctx.fillText("But the broader code of the internet", 20, 60);
    ctx.fillText("can determine your actions in real life.", 20, 80);
  } else if (coins[6].count === 3) {
    ctx.fillText("Code allows you to order shoes online", 20, 60);
    ctx.fillText("without worrying about your credit card being stolen.", 20, 80);
  } else if (coins[6].count === 4) {
    ctx.fillText("But it also makes your copyrights very", 20, 60);
    ctx.fillText("difficult to enforce.", 20, 80);
  } else if (coins[6].count === 5) {
    ctx.fillText("Are you okay with coders telling you what to do?", 20, 60);
  } else if (coins[6].count === 6) {
    ctx.fillText("Because right now, coders decide what the internet looks like.", 20, 60);
    ctx.fillText("Wouldn't you rather have a say?", 20, 80);
  } else if (coins[6].count === 7) {
    coins[6].color = "grey";
  } else if (coins[6].count > 7) {
    coins[6].count = 0;
  }
  if (coins[6].count === 0) {
    coins[6].color = "yellow";
  }

  //text for coin 8

  if (coins[7].count === 1) {
    ctx.fillText("You can't jump high enough to reach your briefcase.", 20, 60);
  } else if (coins[7].count === 2) {
    ctx.fillText("Find the gravity variable in the code and lower it", 20, 60);
    ctx.fillText("so you can jump higher.", 20, 80);
  } else if (coins[7].count === 3) {
    coins[7].color = "grey";
  } else if (coins[7].count > 3) {
    coins[7].count = 0;
  }
  if (coins[7].count === 0) {
    coins[7].color = "yellow";
  }

  //text for coin 9

  if (coins[8].count === 1) {
    ctx.fillText("Before you go to the courthouse, you need to", 20, 60);
    ctx.fillText("find your briefcase.", 20, 80);
  } else if (coins[8].count === 2) {
    ctx.fillText("It is full of important and privileged information.", 20, 60);
  } else if (coins[8].count === 3) {
    coins[8].color = "grey";
  } else if (coins[8].count > 3) {
    coins[8].count = 0;
  }
  if (coins[8].count === 0) {
    coins[8].color = "yellow";
  }

  //starting instructions
  if (coins[0].count === 0) {
    ctx.font = "bold 18px Helvetica";
    ctx.fillStyle = "black";
    if (frame_count < 150) {
      ctx.fillText("The Pathetic Dot", 70, 100);
    } else if (frame_count < 300) {
      ctx.fillText("Use arrow keys to move and jump.", 70, 100);
    } else if (frame_count < 450) {
      ctx.fillText("Yellow squares contain new information...", 70, 100);
    } else if (frame_count < 600) {
      ctx.fillText("...Bump them for instructions.", 70, 100);
    }
  }

} //end of update function

function colCheck(shapeA, shapeB) {
  // get the vectors to check against
  var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
    vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
    // add the half widths and half heights of the objects
    hWidths = (shapeA.width / 2) + (shapeB.width / 2),
    hHeights = (shapeA.height / 2) + (shapeB.height / 2),
    colDir = null;

  // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
  if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
    // figures out on which side we are colliding (top, bottom, left, or right)
    var oX = hWidths - Math.abs(vX),
      oY = hHeights - Math.abs(vY);
    if (oX >= oY) {
      if (vY > 0) {
        colDir = "t";
        shapeA.y += oY;
      } else {
        colDir = "b";
        shapeA.y -= oY;
      }
    } else {
      if (vX > 0) {
        colDir = "l";
        shapeA.x += oX;
      } else {
        colDir = "r";
        shapeA.x -= oX;
      }
    }
  }
  return colDir;
}

document.body.addEventListener("keydown", function(e) {
  keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
});

window.addEventListener("load", function() {
  update();
});
