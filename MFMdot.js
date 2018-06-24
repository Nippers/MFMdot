/*(function(){
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();*/

$(document).ready(function(){
   // Action for clicking on #instructionBoxButton
   $('#instructionBoxButton').click(function(){
      $('#instructionBox').hide();
      $('#footnoteBox').hide();
      pause = false;
   });
   // Action for clicking on #conversationBoxButton
   $('#conversationBoxButton').click(function(){
      innerConversationCount ++;
      advanceConversation();
   });
    // See https://stackoverflow.com/questions/10920355/attaching-click-event-to-a-jquery-object-not-yet-added-to-the-dom
    // for how to use jquery for attaching something that doesn't yet exsit on the DOM
    // Trick is to attach to document or a parent element already on the DOM
});

// Define a "box" object
function box(x,y,width,height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

// Define a "instructions_obj" object
function instructions_obj(x,y,width,height,text,open,name){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    //this.color = color;
    this.text = text;
    this.open  = open;
    this.name = name;
}

// Define a "conversations_obj" object
function conversations_obj(speaker,text,open,name){
   this.speaker = speaker;
   this.text = text;
   this.open = open;
   this.name = name;
}

var canvas=document.getElementById("canvas");
var width = 600;
var height = 300;
canvas.width = width*2;
canvas.height = height*2;
canvas.style.width = "600px";
canvas.style.height = "300px";
var ctx = canvas.getContext("2d");
ctx.scale(2,2);



var player = {
  name: "karen",
  goingRight: true,
  x: width / 2,
  y: 0,
  width: 23,
  height: 94,
  speed: 2,
  velY: 0,
  jumping: false,
  grounded: false,
  frames: 5,
  imgOffsetX: 0,
  imgOffsetY: 0
},
elvis = {
  name: "elvis",
  goingRight: true,
  caught: false,
  x: player.x-50,
  y:height-80,
  width: 27,
  height: 30,
  frames: 3,
  imgOffsetX: 0,
  imgOffsetY: 0
},
georgia = {
  name: "georgia3",
  x: -390,
  y: 20,
  width: 0,
  height: 0,
  direction: "r",
  caught: true,
  jumping: false,
  frames: 5,
  imgOffsetX: 0,
  imgOffsetY: 0
},

keys = [],
gravity = 0.1;

var fluff = [];
for(i=0; i<50; i++){
  fluff.push({
    on: false,
    name: "fluff",
    x: Math.random()*width,
    y: height,
    width:3,
    height:3,
    speed: Math.random()+.1
  })
}


var checkpoints = [];
checkpoints.push({name:"lampPost", x:1200, y:90, width:60, height:190});

var people = [];
people.push({name:"georgiaSitting", x:-450, y:-15, width:56, height:65, num:0});
people.push({name:"grasshopper", x:1100, y:100, width:96, height:45, num:0});

//people.push({name:"hazmatGuy", x:700, y:145, width:57, height:115, num:0, frames:2, goingRight:true, imgOffsetX:0, leftX:500, rightX:900});

var boxes = [];
boxes.push( new box(6500,200,30,30)  ); // courthouse platform
boxes.push( new box(6600,270,500,20) ); //courthouse base

boxes.push( new box(150,180,30,30)   );
boxes.push( new box(250,180,30,30)   );
boxes.push( new box(-150,220,230,40) );


boxes.push( new box(-340,250,130,20)  ); //tree platforms
boxes.push( new box(-330,50,15,200)   ); //trunk
boxes.push( new box(-450,50,120,7)    ); //top branch
boxes.push( new box(-315,120,20,7)    ); //middle branch
boxes.push( new box(-315,180,40,7)    ); //bottom branch

var leaves = [];
leaves.push({name:"leaves", x:-530, y:-50, width:200, height:200});
leaves.push({name:"leaves", x:-320, y:120, width:100, height:100});
boxes.push( new box(305,150,60,60)   ); //player platform

boxes.push( new box(-840,250,430,20)  ); //tree platforms
boxes.push( new box(-830,50,15,200)   ); //trunk
boxes.push( new box(-950,50,120,7)    ); //top branch
boxes.push( new box(-815,120,20,7)    ); //middle branch
boxes.push( new box(-815,180,40,7)    ); //bottom branch

if(georgia.caught){
  boxes.push(new box(420,280,100,60)); //road home
  boxes.push(new box(600,260,200,20));
  boxes.push(new box(970,280,5400,20));
}


//create random trees
var trees = [];
var backgroundTrees = [];
var treeCount = 20;
var backgroundTreeCount = 100;

for (i=0; i<treeCount; i++){
  var treeHeight = Math.random()*(height*3-height*2)+height*2;
  if(i%5===0){
    var treeRot = Math.random()*(8+8)-8;
  }else{
    var treeRot = 0;
  }
  trees.push({
    name: "treeTrunk",
    x: Math.random()*(1000+1500)-1500,
    y: -100,
    width: Math.random()*(90-40)+40,
    height: treeHeight,
    rotation: treeRot
  });
}

for(i=0; i<backgroundTreeCount; i++){
  var treeHeight = Math.random()*(height*3-height*2)+height*2;
  var treeColor = .3;//Math.random()*(.7-.1)+.1;
  backgroundTrees.push({
    name: "treeTrunk",
    x: Math.random()*(1000+1500)-1500,
    y: -100,
    width: Math.random()*(90-40)+40,
    height: treeHeight,
    color: treeColor,
    rotation: treeRot
  })
}
var treeOffset=1;

var corn = [];
for(i=0; i<100; i++){
  h = Math.random()*(150-70)+70;
  n = Math.random();
  if(n>.3){
    n = "corn";
  }else{
    n = "corn2";
  }
  corn.push({
    name: n,
    x: i*25+1000,
    y:280-h,
    width: h/2,
    height:h
  });
}

//var instructionText = [];
var instruction0 = "Welcome to <br><br><b>Karen and Georgia Versus the Metagame</b><br><br>By <span onclick='showFootnote(0)'>Julia Uhr<sup>1</sup></span><br><span onclick='showFootnote(1)'>Craig Schwartz<sup>2</sup></span><br>and <span onclick='showFootnote(2)'>David Ortolano<sup>3</sup></span><br><br>Inspired by<br><span onclick='showFootnote(3)'><i>My Favorite Murder</i><sup>4</sup></span>"
var instruction1 = "Karen and Georgia,<br>You are in a game."

var footnotes = [];
footnotes.push("1<hr>Programmer, attorney, PhD candidate in philosophy at the University of Colorado<br><br>contact: julia.uhr@colorado.edu")
footnotes.push("2<hr>Research meteorologist at the National Center for Atmospheric Research")
footnotes.push("3<hr>Performer, founder and executive producer of the Boulder International Fringe Festival")
footnotes.push("4<hr>A true crime comedy podcast hosted by Karen Kilgariff and Georgia Hardstark, available at <a href='https://www.myfavoritemurder.com/' target='_blank'>myfavoritemurder.com</a>")

var instructions = [];
instructions.push( new instructions_obj(-100,10,46,53,instruction0,false,"envelope"));
instructions.push( new instructions_obj(-700,30,46,53,instruction1,false,"envelope"));


var conversations = [];
var nConversations = 9; // total number of conversations
for ( var i = 0; i < nConversations-1 ; i++){
  conversations.push([]);
}

//conversation 0
conversations[0].push( new conversations_obj("karen","1. Georgia! What are you doing in this tree?",false) );
conversations[0].push( new conversations_obj("georgia","2. Karen! You found me!",false) );
conversations[0].push( new conversations_obj("karen","3. Let's get out of here. The forest is creepy AF after dark.",false) );
conversations[0].push( new conversations_obj("georgia","4. I can't leave without Elvis. He wandered off somewhere.",false) );
conversations[0].push( new conversations_obj("karen","5. Fine. Let's go find Elvis.",false) );

//conversation 1
conversations[1].push( new conversations_obj("grasshopper","text1",false) );
conversations[1].push( new conversations_obj("karen","text2",false) );
conversations[1].push( new conversations_obj("grasshopper","text3",false) );

//intitalize some variables
var originX = 0;
var originY = 0;
var parallaxX = 0;
var originy = 0;
var right_button_count = 0;
var origin = 0;
var gap_length = 180;
var frameCount = 0;
var box_color = 250;
canvas.width = width;
canvas.height = height;
//var box_width = 25;
//var falling_speed = 5;
var pause = false;
var innerConversationCount = 0; //global counter
var outterConversationCount = 0; //another global counter

var checkpoint = 0;
if(checkpoint === 1){
  originX = -800;
}
//if player has already gone through instruction 4, set it to off
/*if (gap_length < 180) {
  instructions[3].count = 7;
  instructions[4].count = 2;
}*/

//if gravity is lower, set instruction 8 to off
/*if (gravity < .2) {
  instructions[7].count = 3;
}*/

var movingObjects = [];
for(i=0; i<trees.length; i++){
  movingObjects.push(trees[i]);
}
for(i=0; i<corn.length; i++){
  movingObjects.push(corn[i]);
}
for(var i=0; i<leaves.length; i++){
  movingObjects.push(leaves[i]);
}
for(var i=0; i<boxes.length; i++){
  movingObjects.push(boxes[i]);
  boxes[i].name = "box";
}
for(i=0; i<instructions.length; i++){
  movingObjects.push(instructions[i]);
}
for(i=0; i<people.length; i++){
  movingObjects.push(people[i]);
}
for(i=0; i<checkpoints.length; i++){
  movingObjects.push(checkpoints[i]);
  //checkpoints[i].originX = checkpoints[i].x;
}
if(!georgia.caught){
  movingObjects.push(georgia);
}
for(i=0; i<movingObjects.length; i++){
  movingObjects[i].originX = movingObjects[i].x;
  movingObjects[i].originY = movingObjects[i].y;
}

for(i=0; i<backgroundTrees.length; i++){
  backgroundTrees[i].originX = backgroundTrees[i].x;
}

//begin update function
function update() {
  frameCount++;

  //return to begining when you fall
  if(player.y > height){
    var originSpeed = player.speed*4
    var parallaxSpeed = Math.ceil(player.speed/2)*4
    if(parallaxX < 0-parallaxSpeed){
      parallaxX += parallaxSpeed;
    }else if(parallaxX > parallaxSpeed){
      parallaxX -= parallaxSpeed;
    }else{
      parallaxX = 0;
    }
    if(originX < 0-originSpeed){
      originX += originSpeed;
    }else if(originX > originSpeed){
      originX -= originSpeed;
    }else{
      originX = 0;
      //player.y = -50;
      //player.x = width/2+10;
      //player.velY = 0;
    }
    if(originX===0 && parallaxX===0){
      player.y = -50;
      player.x = width/2+10;
      player.velY = 0;
    }
  }

  // up arrow or space key
  if ( (keys[38] || keys[32]) && !pause ) {
    if (!player.jumping && player.grounded){
      player.jumping = true;
      //georgia.jumping = true;
      player.grounded = false;
      player.velY = -player.speed*2;
    }
  }
  //right arrow key
  if (keys[39] && !pause){
    if(!player.goingRight){
      player.goingRight = true;
    }
    if(player.x > width-200) {
      originX -= player.speed;
      parallaxX -= Math.ceil(player.speed/2);
    }else{
      player.x += player.speed;
    }
  }
//left arrow key
  if (keys[37] && !pause){
    if(player.goingRight){
      player.goingRight = false;
    }
    if(player.x < 160){
      originX += player.speed;
      parallaxX += Math.ceil(player.speed/2);
    }else{
      player.x -= player.speed;
    }
  }

  if(player.grounded){
    if(player.y<50){
      originY += 5;
      player.y += 5;
    }else if((player.y+player.height)>height-50){
      originY -= 5;
      player.y -= 5;
    }
  }
  for(i=0; i<movingObjects.length; i++){
    movingObjects[i].x = originX+movingObjects[i].originX;
    movingObjects[i].y = originY+movingObjects[i].originY;
  }

  for(i=0; i<backgroundTrees.length; i++){
    backgroundTrees[i].x = parallaxX+backgroundTrees[i].originX;
  }

  player.velY += gravity;

  ctx.clearRect(0, 0, width, height);

  player.grounded = false;

  for (var i = 0; i < boxes.length; i++) {
    if ((boxes[i].x + boxes[i].width > 0) && (boxes[i].x < width)) {
      var dir = colCheck(player, boxes[i]);
      if (dir === "l" || dir === "r") {
        player.jumping = false;
        //georgia.jumping = false;
      } else if (dir === "b") {
        player.grounded = true;
        player.jumping = false;
        //georgia.jumping = false;
      } else if (dir === "t") {
        player.velY *= -1;
      }
    }
  }

//sky gradient background
  var grd = ctx.createLinearGradient(0,0,0,height);
  grd.addColorStop(0,"#ccffff");
  grd.addColorStop(1,"#336699");
  ctx.fillStyle = grd;
  ctx.fillRect(0,0,width,height);



  //check if player has collided with georgia. if so, georgia follows her.
  /*if(!georgia.caught){
    var dir = colCheck(player, georgia);
    if (dir === "l") {
      georgia.caught = true;
    }
  }*/

  if (georgia.caught){
    georgia.x = width/2;
    if(player.grounded){
      georgia.y = player.y+(player.height-georgia.height);
      //elvis.y = georgia.y+(georgia.height-elvis.height);
    }
    if(player.x>georgia.x){
      georgia.goingRight = true;
    }else{
      georgia.goingRight = false;
    }
  }

  if(elvis.caught){
    elvis.x = georgia.x - 70;
    elvis.y = georgia.y+(georgia.height-elvis.height);
    if(player.x > elvis.x){
      elvis.goingRight = true;
    }else{
      elvis.goingRight = false;
    }
  }


  if (player.grounded) {
    player.velY = 0;
  }

  player.y += player.velY;

  //requestAnimationFrame(update);

  for(i=0; i<backgroundTrees.length; i++){
    //ctx.save();
    ctx.globalAlpha = backgroundTrees[i].color;
    //ctx.rotate(trees[i].rotation * Math.PI/180);
    draw(backgroundTrees[i]);
    ctx.globalAlpha = 1;
    //ctx.restore();
  }
  if(fluff.on){
    for(i=0; i<fluff.length; i++){
      if(fluff[i].y>-20){
        fluff[i].y -= fluff[i].speed;
      }else{
        fluff[i].y=height;
      }
      draw(fluff[i]);
    }
  }

  for(i=0; i<movingObjects.length; i++){
    draw(movingObjects[i]);
  }


  if(player.jumping){
    player.imgOffsetX = player.width*player.frames;
    //georgia.imgOffsetX = georgia.width*georgia.frames;
    draw(player);
    draw(georgia);
    draw(elvis);
  }else if(keys[37] || keys[39]){
    animate(player);
    //animate(georgia);
    //animate(elvis);
  }else{
    player.imgOffsetX = 0;
    georgia.imgOffsetX = 0;
    draw(player);
    draw(georgia);
    draw(elvis);
  }
  if(keys[37] || keys[39]){
    animate(georgia);
    animate(elvis);
  }

  // display instruction text if one of the instructions is open
  for (var i = 0; i < instructions.length; i++){
    var dir = colCheck(player, instructions[i]);
    if (dir === "t") {
      player.jumping = false;
      instructions[i].name = "envelopeOpen";
      instructions[i].open = true;  // can only be true for one instruction at a time
    }
    if (instructions[i].open){
      instructions[i].open = false;
      pause = true;
      document.getElementById("instructionBox").style.display = 'block';
      document.getElementById("instructionBoxText").innerHTML = instructions[i].text;
      document.getElementById("instructionBoxButton").style.display = 'block';
    }
  }

  /*for(i=0;i<people.length;i++){
    dir = colCheck(player, people[i]);
    if(dir === "l" || dir === "r"){
      document.getElementById("conversationBox").style.display = 'block';
    }
  }*/

  // CSS testing for conversations
    /*var dir = colCheck(player, instructions[instructions.length-1]);
    if (dir === "t") {
      player.grounded = true;
      player.jumping = false;
      conversations[0][0].open = true;  // can only be true for one instruction at a time
    }*/

   // note that j is initialzed to 0 as a global variable, and augmented and reset to 0 by buttons
   for (i = 0; i < people.length ; i++){
     var dir = colCheck(player, people[i]);
     if (dir === "l" || dir === "r") {
       player.jumping = false;
       //conversations[i].name = "envelopeOpen";
       conversations[i][0].open = true;  // can only be true for one instruction at a time
     }
      if (conversations[i][0].open ){
         outterConversationCount = i // set global variable k for use in advanceConversation and jQuery when clicking #conversationBoxButton
         conversations[i][0].open = false;
  	 pause = true;
    advanceConversation()  // j = 0 initially
      }
   }

} //end update function

function advanceConversation(){
  //innerConversationCount ++;
   var numExchanges = conversations[outterConversationCount].length;  // the number of exchanges in this conversation

   if ( innerConversationCount < numExchanges ){
      document.getElementById("conversationBox").style.display = 'block';
      document.getElementById("conversationBoxButton").style.display = 'block';
      document.getElementById("conversationBoxText").innerHTML = conversations[outterConversationCount][innerConversationCount].text;
      document.getElementById("headPic").innerHTML = '<img src="'+conversations[outterConversationCount][innerConversationCount].speaker.toLowerCase()+'Head.png" width="50px" style="float:left">';
      if(conversations[outterConversationCount][innerConversationCount].speaker.toLowerCase() === "karen"){
	 document.getElementById("headPic").style.float="left";
      }else{
	 document.getElementById("headPic").style.float="right";
      }
   } else {
      document.getElementById("conversationBox").style.display = 'none'; // $('#conversationBox').hide();
      document.getElementById("footnoteBox").style.display = 'none';
      innerConversationCount = 0;
      pause = false;
      /*if(k===0){
        people[k].width = 0;
        people[k].height = 0;
        people[k].originY = -1000;
        georgia.width = 32;
        georgia.height = 92;
        georgia.caught = true;
      }*/
   }
}

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

function animate(pic){
  if(pic.goingRight){
    pic.imgOffsetY = 0;
  }else{
    pic.imgOffsetY = pic.height;
  }
  if(pic.jumping){
    pic.imgOffsetX = pic.width*pic.frames;
  }else{
    if(frameCount%12===0){
      if(pic.imgOffsetX<(pic.width*(pic.frames-1))){
        pic.imgOffsetX += pic.width;
      }else{
        pic.imgOffsetX = 0;
      }
    }
  }
  draw(pic);
}

function draw(pic){
  var img = document.getElementById(pic.name);
  if(typeof(pic.frames) === 'number'){
    ctx.drawImage(img,pic.imgOffsetX,pic.imgOffsetY,pic.width,pic.height,pic.x,pic.y,pic.width,pic.height);
  }else{
    ctx.drawImage(img,pic.x,pic.y,pic.width,pic.height);
  }
}

function move(pic){
  if(pic.goingRight){
    if(pic.x < originX+pic.rightX){
      pic.originX ++;
    }else{
      pic.goingRight = false;
    }
  }else{
    if(pic.x > originX+pic.leftX){
      pic.originX --;
    }else{
      pic.goingRight = true;
    }
  }
}

function showFootnote(num){
  var footnote = document.getElementById("footnoteBox");
  footnote.innerHTML = footnotes[num];
  if(footnote.style.display !== "block"){
    footnote.style.display = "block";
  }//else{
    //footnote.style.display = "none";
  //}
}


document.body.addEventListener("keydown", function(e) {
  keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
});

window.addEventListener("load", function() {
  setInterval(update, 16);
});
