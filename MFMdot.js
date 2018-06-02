(function(){
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

$(document).ready(function(){

   // Action for clicking on #instructionBoxButton
   $('#instructionBoxButton').click(function(){
      $('#instructionBox').hide();
      $('#footnoteBox').hide();
      pause = false;
   });

   // Action for clicking on #conversationBoxButton
   $('#conversationBoxButton').click(function(){
      j ++;
      advanceConversation()
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
function instructions_obj(x,y,width,height,color,text,open,name){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
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
  width: 21,
  height: 75,
  speed: 3,
  velY: 0,
  jumping: false,
  grounded: false,
  frames: 6,
  imgOffsetX: 0,
  imgOffsetY: 0
},
elvis = {
  name: "elvis",
  goingRight: true,
  caught: true,
  x: player.x-50,
  y:height-80,
  width: 27,
  height: 30,
  frames: 3,
  imgOffsetX: 0,
  imgOffsetY: 0
},
georgia = {
  name: "georgia",
  x: -390,
  y: 60,
  width: 21,
  height: 69,
  direction: "l",
  caught: false,
  jumping: false,
  frames: 6,
  imgOffsetX: 0,
  imgOffsetY: 0
},
/*ground = {
  x: 0,
  y: 500,
  width: width,
  height: 30
},*/

keys = [],
//friction = 0.8,
gravity = 0.2;

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

var people = [];
people.push({name:"georgia2", x:0, y:150, width:13, height:69, num:0});

var boxes = [];
boxes.push( new box(6500,200,30,30)  ); // courthouse platform
boxes.push( new box(6600,270,500,20) ); //courthouse base

boxes.push( new box(150,180,30,30)   );
boxes.push( new box(250,180,30,30)   );
boxes.push( new box(-150,220,230,40)   );


boxes.push( new box(-340,250,130,20)  ); //tree platforms
boxes.push( new box(-330,130,7,120)   ); //trunk
boxes.push( new box(-385,125,70,7)    ); //top branch
boxes.push( new box(-324,170,20,7)    ); //bottom branch

boxes.push( new box(305,150,60,60)   ); //player platform

if(georgia.caught){
  boxes.push(new box(420,280,100,60)); //road home
  boxes.push(new box(600,260,200,20));
  boxes.push(new box(970,280,5400,20));
}

//create random trees
var trees = [];
var backgroundTrees = [];
var treeCount = 50;
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
    x: Math.random()*6000,
    y: -100,
    width: Math.random()*(90-40)+40,
    height: treeHeight,
    rotation: treeRot
  });
}

for(i=0; i<backgroundTreeCount; i++){
  var treeHeight = Math.random()*(height*3-height*2)+height*2;
  var treeColor = Math.random()*(.7-.1)+.1;
  backgroundTrees.push({
    name: "treeTrunk",
    x: Math.random()*6000,
    y: -100,
    width: Math.random()*(90-40)+40,
    height: treeHeight,
    color: treeColor,
    rotation: treeRot
  })
}

var treeOffset=1;

instruction0 = "Welcome to <br><br><b>Karen and Georgia Versus the Metagame</b><br><br>By <span onclick='showFootnote(0)'>Julia Uhr<sup>1</sup></span><br><span onclick='showFootnote(1)'>Craig Schwartz<sup>2</sup></span><br>and <span onclick='showFootnote(2)'>David Ortolano<sup>3</sup></span><br><br>Inspired by<br><span onclick='showFootnote(3)'><i>My Favorite Murder</i><sup>4</sup></span><br><br>"
instruction1 = "this is the second instruction (index 1)"
instruction2 = "this is the 3rd instruction (index 2)"
instruction3 = "this is the 4th instruction (index 3)"
instruction4 = "this is the 5th instruction (index 4)"
instruction5 = "this is the 6th instruction (index 5)"
instruction6 = "this is the 7th instruction (index 6)"
instruction7 = "this is the 8th instruction (index 7)"
instruction8 = "this is the 9th instruction (index 8)"

var footnotes = [];
footnotes.push("1<hr>Programmer, attorney, PhD candidate in philosophy at the University of Colorado<br><br>contact: julia.uhr@colorado.edu")
footnotes.push("2<hr>Research meteorologist at the National Center for Atmospheric Research")
footnotes.push("3<hr>Performer, founder and executive producer of the Boulder International Fringe Festival")
footnotes.push("4<hr>A true crime comedy podcast hosted by Karen Kilgariff and Georgia Hardstark, available at myfavoritemurder.com")

var instructions = [];
instructions.push( new instructions_obj(-100,10,46,53,"yellow",[instruction0],false,"envelope") ); //instruction 0

instructions.push( new instructions_obj(-800,170,46,53,"yellow",[instruction1],false,"envelope") );
instructions.push( new instructions_obj(-800,30,46,53,"yellow",[instruction2],false,"envelope") );
instructions.push( new instructions_obj(-1005,70,46,53,"yellow",[instruction3],false,"envelope") );
instructions.push( new instructions_obj(-805,70,46,53,"yellow",[instruction4],false,"envelope") );
instructions.push( new instructions_obj(-1910,70,46,53,"yellow",[instruction6],false,"envelope") );
instructions.push( new instructions_obj(-2805,70,46,53,"yellow",[instruction8],false,"envelope") );

//instructions.push( new instructions_obj(-300,0,46,53,"green",[instruction8],false,"georgia") );    // CSS testing for conversations

var conversations = [];
var nConversations = 9; // total number of conversations
for ( var i = 0; i < nConversations-1 ; i++){
  conversations.push([])
}

///////function conversations_obj(speaker,text,open){
//conversation 0
conversations[0].push( new conversations_obj("karen","text1",false) );
conversations[0].push( new conversations_obj("georgia","text2",false) );
conversations[0].push( new conversations_obj("karen","text3",false) );
conversations[0].push( new conversations_obj("georgia","text4",false) );
conversations[0].push( new conversations_obj("karen","text5",false) );

//conversation 1
conversations[1].push( new conversations_obj("craig","text4",false) );
conversations[1].push( new conversations_obj("julia","text5",false) );
conversations[1].push( new conversations_obj("craig","text6",false) );

//intitalize some variables
var originX = 0;
var parallaxX = 0;
var originy = 0;
var right_button_count = 0;
var origin = 0;
var gap_length = 180;
var frameCount = 0;
var box_color = 250;
canvas.width = width;
canvas.height = height;
var box_width = 25;
//var falling_speed = 5;
var pause = false;
var j = 0; //global counter
var k = 0; //another global counter

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
for(var i=0; i<boxes.length; i++){
  movingObjects.push(boxes[i]);
}
for(i=0; i<trees.length; i++){
  movingObjects.push(trees[i]);
}
for(i=0; i<instructions.length; i++){
  movingObjects.push(instructions[i]);
}
for(i=0; i<people.length; i++){
  movingObjects.push(people[i]);
}
if(!georgia.caught){
  movingObjects.push(georgia);
}
for(i=0; i<movingObjects.length; i++){
  movingObjects[i].originX = movingObjects[i].x;
}
for(i=0; i<backgroundTrees.length; i++){
  backgroundTrees[i].originX = backgroundTrees[i].x;
}

//begin update function
function update() {
  frameCount++;

  //return to begining when you fall
  if(player.y > height){
    if(originX < -12){
      originX += 12;
    }else if(originX > 12){
      originX -= 12;
    }else{
      var done1 = true;
      //originX = 0;
      //player.y = -50;
      //player.x = width/2+10;
      //player.velY = 0;
    }
    if(parallaxX < -6){
      parallaxX += 6;
    }else if(parallaxX > 6){
      parallaxX -= 6;
    }else/* if(originX !== 0)*/{
      var done2 = true;
      /*parallaxX = 0;
      originX = 0;
      player.y = -50;
      player.x = width/2+10;
      player.velY = 0;*/
    }
    if(done1 && done2){
      parallaxX = 0;
      originX = 0;
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

  for(i=0; i<movingObjects.length; i++){
    movingObjects[i].x = originX+movingObjects[i].originX;
  }
  for(i=0; i<backgroundTrees.length; i++){
    backgroundTrees[i].x = parallaxX+backgroundTrees[i].originX;
  }

  player.velY += gravity;

  ctx.clearRect(0, 0, width, height);
  //ctx.beginPath();

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
      elvis.y = georgia.y+(georgia.height-elvis.height);
    }
    if(player.x>georgia.x){
      georgia.goingRight = true;
    }else{
      georgia.goingRight = false;
    }
  }

  if(elvis.caught){
    elvis.x = georgia.x - 70;
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

  requestAnimationFrame(update);

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

  for(i=0; i<trees.length; i++){
    draw(trees[i]);
  }
  for (var i=0; i<instructions.length; i++) {
    draw(instructions[i]);
  }

  for(i=0; i<people.length; i++){
    draw(people[i]);
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
  for (var i = 0; i < boxes.length; i++) {
    boxes[i].name = "box";
    draw(boxes[i]);
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
      document.getElementById("instructionBoxText").innerHTML = instructions[i].text[0];
      document.getElementById("instructionBoxButton").style.display = 'block';
    }
  }


  // CSS testing for conversations
    /*var dir = colCheck(player, instructions[instructions.length-1]);
    if (dir === "t") {
      player.grounded = true;
      player.jumping = false;
      conversations[0][0].open = true;  // can only be true for one instruction at a time
    }*/

   // note that j is initialzed to 0 as a global variable, and augmented and reset to 0 by buttons
   for (var i = 0; i < conversations.length ; i++){
     var dir = colCheck(player, conversations[i]);
     if (dir === "t") {
       player.jumping = false;
       //conversations[i].name = "envelopeOpen";
       conversations[i][0].open = true;  // can only be true for one instruction at a time
     }
      if ( conversations[i][0].open ){
         k = i // set global variable k for use in advanceConversation and jQuery when clicking #conversationBoxButton
         conversations[i][0].open = false;
  	 pause = true;
         advanceConversation()  // j = 0 initially
      }
   }

} //end of update function

function advanceConversation(){

   var numExchanges = conversations[k].length;  // the number of exchanges in this conversation

   if ( j < numExchanges ){
      document.getElementById("conversationBox").style.display = 'block';
      document.getElementById("conversationBoxButton").style.display = 'block';
      document.getElementById("conversationBoxText").innerHTML = conversations[k][j].speaker+' '+conversations[k][j].text;
      document.getElementById("headPic").innerHTML = '<img src="'+conversations[k][j].speaker.toLowerCase()+'Head.png" width="50px" style="float:left">';
      if(conversations[k][j].speaker.toLowerCase() === "karen"){
	 document.getElementById("headPic").style.float="left";
      }else{
	 document.getElementById("headPic").style.float="right";
      }
   } else {
      document.getElementById("conversationBox").style.display = 'none'; // $('#conversationBox').hide();
      document.getElementById("footnoteBox").style.display = 'none';
      j = 0;
      pause = false;
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
    if(frameCount%7===0){
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
  update();
});
