// Canvas Rider RC7 by Pete & Maxime, a canvasrider.com exclusive
// Almost entirely deobfuscated, and with a hat instead of a cap!
var PI2 = 2 * Math.PI;
/**
 * @constructor
 * @param {number} x
 * @param {number} y
 */
function Point(x, y) {
  /** @type {number} */
  this.x = x;
  /** @type {number} */
  this.y = y;
}
(function(p) {

  /** @return {Point} */
  p.toPixel = function () {
    return new Point(
      (this.x - track.focus.x) * track.zoom + canvas.width  / 2,
      (this.y - track.focus.y) * track.zoom + canvas.height / 2
    );
  };

  /** @return {Point} */
  p.normalizeToCanvas = function () {
    return new Point(
      (this.x - canvas.width  / 2) / track.zoom + track.focus.x,
      (this.y - canvas.height / 2) / track.zoom + track.focus.y
    );
  };

  /** @return {Point} */
  p.set = function (point) {
    this.x = point.x;
    this.y = point.y;
    
    return this;
  };

  /** @return {Point} */
  p.add = function (point) {
    this.x += point.x;
    this.y += point.y;
    
    return this;
  };
  /** @return {Point} */
  p.sub = function (point) {
    this.x -= point.x;
    this.y -= point.y;
    
    return this;
  };
  /** @return {Point} */
  p.scale = function (factor) {
    this.x *= factor;
    this.y *= factor;

    return this;
  };

  /** @return {Point} */
  p.clone = function () {
    return new Point(this.x, this.y);
  };
  /** @return {Point} */
  p.cloneAdd = function (point) {
    return new Point(this.x + point.x, this.y + point.y);
  };
  /** @return {Point} */
  p.cloneSub = function (point) {
    return new Point(this.x - point.x, this.y - point.y);
  };
  /** @return {Point} */
  p.cloneScale = function (factor) {
    return new Point(this.x * factor, this.y * factor);
  };
  /** @return {Point} */
  p.cloneReciprocalScale = function (factor) {
    return new Point(this.x / factor, this.y / factor);
  };

  /** @return {number} */
  p.dotProduct = function (point) {
    return this.x * point.x + this.y * point.y;
  };

  /** @return {number} */
  p.getLength = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };
  /** @return {number} */
  p.lengthSquared = function () {
    return this.x * this.x + this.y * this.y;
  };

  /** @return {string} */
  p.toString = function () {
    return Math.round(this.x).toString(32) + ' ' + Math.round(this.y).toString(32);
  };

}(Point.prototype));

/**
 * @constructor
 * @param {Point} pos
 * @param {(BMX|MTB|DeadRider)} parent
 */
function BodyPart(pos, parent) {
  /** @type {Point} */
  this.pos  = pos.clone();
  /** @type {Point} */
  this.oldPos      = pos.clone();
  /** @type {Point} */
  this.speed      = new Point(0, 0);
  /** @type {(BMX|MTB|DeadRider)} */
  this.bike = parent;
  /** @type {number} */
  this.size     = 10;
  /** @type {number} */
  this.B6     = 0;
  /** @type {boolean} */
  this.touch     = true;
}
(function(p) {

  /**
   * @param {Point} O
   */
  p.drive = function (O) {
    this.pos.add(O.cloneScale(-O.dotProduct(this.speed) * this.B6));
    this.driving = true;
  };

  p.step = function () {
    this.speed.add(this.bike.gravity);
    this.speed = this.speed.cloneScale(0.99);
    this.pos.add(this.speed);
    this.driving = false;
    if (this.touch) {
      track.touch(this);
    }
    this.speed = this.pos.cloneSub(this.oldPos);
    this.oldPos.set(this.pos);
  };
  
}(BodyPart.prototype));

/** @constructor */
function Wheel(center, parent) {
  this.pos  = center.clone();
  this.oldPos      = center.clone();
  this.speed      = new Point(0, 0);
  this.bike = parent;
  this.size     = 10;
  this.B6     = 0;
  this.touch     = true;
  this.gravity     = true;
  this.rotationSpeed     = 0;
  this.rotateSpeed     = 0;
}
(function(p) {
  
  p.drive = function (O) {
    this.pos.add(O.cloneScale(this.rotateSpeed * this.bike.direction));
    if (this.down) {
      this.pos.add(O.cloneScale(-O.dotProduct(this.speed) * 0.3));
    }
    this.rotationSpeed = O.dotProduct(this.speed) / this.size;
    this.driving = true;
  };
  
  p.step = function () {
    this.speed.add(this.bike.gravity);
    this.speed = this.speed.cloneScale(0.99);
    
    this.pos.add(this.speed);
    this.driving = false;
    if (this.touch) {
      track.touch(this);
    }
    this.speed = this.pos.cloneSub(this.oldPos);
    this.oldPos.set(this.pos);
  };
  
}(Wheel.prototype));

/**
 * @constructor
 * @param {Point} pos
 * @param {object} parent
 */
function Shard(pos, parent) {
  /** @type {Point} */
  this.pos = new Point(pos.x + 5 * (Math.random() - Math.random()), pos.y + 5 * (Math.random() - Math.random()));
  /** @type {Point} */
  this.oldPos = new Point(this.pos.x, this.pos.y);
  /** @type {Point} */
  this.speed = new Point(11 * (Math.random() - Math.random()), 11 * (Math.random() - Math.random()));
  /** @type {object} */
  this.bike = parent;
  /** @type {number} */
  this.size = 2 + Math.random() * 9;
  /** @type {number} */
  this.rotation = Math.random() * 6.2;
  /** @type {number} */
  this.rotationSpeed = Math.random() - Math.random();
  /** @type {number} */
  this.B6 = 0.05;
  /** @type {boolean} */
  this.touch = true;
  /** @type {Array.<number>} */
  this.shape = [1, 0.7, 0.8, 0.9, 0.5, 1, 0.7, 1];
}
(function(p) {

  p.draw = function () {
    this.rotation += this.rotationSpeed;

    var pos = this.pos.toPixel(),
      dist = this.shape[0] * this.size / 2,
      x = pos.x + dist * Math.cos(this.rotation),
      y = pos.y + dist * Math.sin(this.rotation),
      i = 2;
    context.beginPath();
    context.fillStyle = '#000';
    context.moveTo(x, y);

    for (; i < 8; i++) {
      dist = this.shape[i - 1] * this.size / 2;
      x = pos.x + dist * Math.cos(this.rotation + 6.283 * i / 8);
      y = pos.y + dist * Math.sin(this.rotation + 6.283 * i / 8);
      context.lineTo(x, y);
    }
    context.fill();
  };

  /** @param {Point} O */
  p.drive = function (O) {
    this.rotationSpeed = O.dotProduct(this.speed) / this.size;
    this.pos.add(O.cloneScale(-O.dotProduct(this.speed) * this.B6));
    this.rotation += this.rotationSpeed;
    var pos = O.getLength();
    if (pos > 0) {
      var AS = new Point(-O.y / pos, O.x / pos);
      this.oldPos.add(AS.cloneScale(AS.dotProduct(this.speed) * 0.8));
    }
  };
  
  p.step = function () {
    this.speed.add(this.bike.gravity);
    this.speed = this.speed.cloneScale(0.99);
    this.pos.add(this.speed);
    this.driving = false;
    if (this.touch) {
      track.touch(this);
    }
    this.speed = this.pos.cloneSub(this.oldPos);
    this.oldPos.set(this.pos);
  };
  
}(Shard.prototype));

/** @constructor */
function Joint(a, b, parent) {
  this.a = a;
  this.b = b;
  this.bike = parent;
  this.A1 = 40;
  this.length = 40;
  this.BE = 0.5;
  this.BC = 0.7;
}
(function(p) {
  
  p.lean = function (AH, AK) {
    this.length += (this.A1 - AH - this.length) / AK;
  };
  
  p.rotate = function (rad) {
    var AJ = this.b.pos.cloneSub(this.a.pos);
    var DU = new Point(-AJ.y / this.length, AJ.x / this.length);
    this.a.pos.add(DU.cloneScale(rad));
    this.b.pos.add(DU.cloneScale(-rad));
  };
  
  p.step = function () {
    var AJ = this.b.pos.cloneSub(this.a.pos);
    var length = AJ.getLength();
    if (length < 1) {
      return this;
    }
    AJ = AJ.cloneScale(1 / length);
    var DD = AJ.cloneScale((length - this.length) * this.BC);
    var B6 = this.b.speed.cloneSub(this.a.speed).dotProduct(AJ) * this.BE;
    DD.add(AJ.cloneScale(B6));
    this.b.speed.add(DD.cloneScale(-1));
    this.a.speed.add(DD);
    return this;
  };
  
  p.turn = function () {
    var tmp = new Point();
    
    tmp.set(this.a.pos);
    this.a.pos.set(this.b.pos);
    this.b.pos.set(tmp);
    
    tmp.set(this.a.oldPos);
    this.a.oldPos.set(this.b.oldPos);
    this.b.oldPos.set(tmp);
    
    tmp.set(this.a.speed);
    this.a.speed.set(this.b.speed);
    this.b.speed.set(tmp);
    
    tmp = this.a.rotation;
    this.a.rotation = this.b.rotation;
    this.b.rotation = tmp;
  };

  p.getLength = function () {
    return this.b.pos.cloneSub(this.a.pos).getLength();
  };
  
}(Joint.prototype));

/** @constructor */
function BMX() {
  var last = bmxConstants[bmxConstants.length - 1];
  this.points = [
    this.head       = new BodyPart(new Point(last[0],  last[1]),  this),
    this.backWheel = new Wheel   (new Point(last[6],  last[7]),  this),
    this.frontWheel  = new Wheel   (new Point(last[13], last[14]), this)
  ];

  this.cap = 'hat';
  
  this.head.oldPos = new Point(last[2], last[3]);
  this.head.speed = new Point(last[4], last[5]);
  
  this.backWheel.oldPos = new Point(last[8],  last[9]);
  this.backWheel.speed = new Point(last[10], last[11]);
  this.backWheel.rotateSpeed = last[12];
  
  this.frontWheel.oldPos = new Point(last[15], last[16]);
  this.frontWheel.speed = new Point(last[17], last[18]);
  this.frontWheel.rotateSpeed = last[19];
  
  this.head.size = 14;
  this.head.drive = function () {
    bike.die();
  };
  
  this.backWheel.size = 11.7;
  
  this.frontWheel.size = 11.7;
  
  this.joints = [
    this.headToBack = new Joint(this.head,       this.backWheel, this),
    this.frontToBack = new Joint(this.backWheel, this.frontWheel,  this),
    this.headToFront = new Joint(this.frontWheel,  this.head,       this)
  ];
  
  this.headToBack.A1 = 45;
  this.headToBack.length = last[20];
  this.headToBack.BC = 0.35;
  this.headToBack.BE = 0.3;
  
  this.frontToBack.A1 = 42;
  this.frontToBack.length = last[21];
  this.frontToBack.BC = 0.35;
  this.frontToBack.BE = 0.3;
  
  this.headToFront.A1 = 45;
  this.headToFront.length = last[22];
  this.headToFront.BC = 0.35;
  this.headToFront.BE = 0.3;
  
  this.save = false;
  this.dead = false;
  this.distance = 0;
  this.direction = last[23];
  this.gravity = new Point(last[24], last[25]);
  this.slow = last[26];
  track.targetsReached = last[27];
  for (var i = 0, l = track.objects.length; i < l; i++) {
    track.objects[i].reached = last[28][i];
  }
  this.left = 0;
  this.right = 0;
  this.up = 0;
  this.down = 0;
  this.time = last[29];
  if (this.time) {
    this.left = last[30];
    this.right = last[31];
    this.up = last[32];
    this.down = last[33];
    for (i = 0, l = keys.length; i < l; i++) {
      for (var BJ in keys[i]) {
        if (BJ >= this.time) {
          delete keys[i][BJ];
        }
      }
    }
  }
  else {
    keys = [[], [], [], [], []];
  }
}
(function(p) {
  
  p.turn = function () {
    Ct = turn = false;
    this.direction *= -1;
    this.frontToBack.turn();
    
    var tmp = this.joints[0].length;
    this.headToBack.length = this.joints[2].length;
    this.headToFront.length = tmp;
  };
  
  p.hitTarget = function () {
    this.save = false;
    if (track.numTargets && track.targetsReached === track.numTargets) {
      if (this.time > 5000 && (!track.time || this.time < track.time) && (keys[0].length || keys[1].length) && track.id !== undefined) {
        var pos = document.cookie.indexOf("; ID=");
        if (pos === -1 && !document.cookie.indexOf("ID=")) {
          pos = -2;
        }
        if (pos !== -1) {
          pos += 5;
          var end = document.cookie.indexOf(";", pos);
          if (end === -1) {
            end = document.cookie.length;
          }
          var ID = document.cookie.substring(pos, end);
          if (confirm("You just set a new Track record!\nYour step will be saved for others to enjoy.")) {
            var AT = '';
            for (var BJ = 0; BJ < keys.length; BJ++) {
              for (var Ay in keys[BJ]) {
                if (!isNaN(Ay)) {
                  AT += Ay + ' ';
                }
              }
              AT += ",";
            }
            var request = new XMLHttpRequest();
            request.open("POST", "ghost/save", false);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.setRequestHeader("User-Agent", "CanvasRider");
            request.send("trackID=" + track.id + "&playerID=" + ID + "&vehicle=" + currentBike + "&time=" + this.time + "&controls=" + AT);
          }
        }
        else {
          alert("You just set a new Track record!\nRegister & log in to save your step next time!");
        }
        left = right = up = down = 0;
      }
    }
    else {
      bmxConstants.push([
        this.head.pos.x, this.head.pos.y, this.head.oldPos.x, this.head.oldPos.y, this.head.speed.x, this.head.speed.y,
        this.backWheel.pos.x, this.backWheel.pos.y, this.backWheel.oldPos.x, this.backWheel.oldPos.y, this.backWheel.speed.x, this.backWheel.speed.y, this.backWheel.rotateSpeed,
        this.frontWheel.pos.x, this.frontWheel.pos.y, this.frontWheel.oldPos.x, this.frontWheel.oldPos.y, this.frontWheel.speed.x, this.frontWheel.speed.y, this.frontWheel.rotateSpeed,
        this.joints[0].length, this.joints[1].length, this.joints[2].length,
        this.direction,
        this.gravity.x, this.gravity.y,
        this.slow,
        track.targetsReached,
        [], this.time,
        this.left, this.right, this.up, this.down
      ]);
      for (var j = 0; j < track.objects.length; j++) {
        bmxConstants[bmxConstants.length - 1][28].push(track.objects[j].reached);
      }
      if (ghost) {
        ghostConstants.push(new Array(ghost.points[0].pos.x, ghost.points[0].pos.y, ghost.points[0].oldPos.x, ghost.points[0].oldPos.y, ghost.points[0].speed.x, ghost.points[0].speed.y, ghost.points[1].pos.x, ghost.points[1].pos.y, ghost.points[1].oldPos.x, ghost.points[1].oldPos.y, ghost.points[1].speed.x, ghost.points[1].speed.y, ghost.points[1].rotateSpeed, ghost.points[2].pos.x, ghost.points[2].pos.y, ghost.points[2].oldPos.x, ghost.points[2].oldPos.y, ghost.points[2].speed.x, ghost.points[2].speed.y, ghost.points[2].rotateSpeed, ghost.joints[0].length, ghost.joints[1].length, ghost.joints[2].length, ghost.direction, ghost.gravity.x, ghost.gravity.y, ghost.slow, ghost.left, ghost.right, ghost.up, ghost.down));
      }
    }
  };
  
  p.BS = function () {
    if (turn) {
      this.turn();
    }
    this.backWheel.rotateSpeed += (up - this.points[1].rotateSpeed) / 10;
    if (up) {
      this.distance += this.backWheel.rotationSpeed / 5;
    }
    this.backWheel.down = this.frontWheel.down = down;
    var rotate = left - right;
    this.headToBack.lean(rotate * 5 * this.direction, 5);
    this.headToFront.lean(-rotate * 5 * this.direction, 5);
    this.frontToBack.rotate(rotate / 6);
    if (!rotate && up) {
      this.headToBack.lean(-7, 5);
      this.headToFront.lean(7, 5);
    }
  };
  
  p.draw = function () {
    var backWheel = this.backWheel.pos.toPixel(),
      frontWheel = this.frontWheel.pos.toPixel();
    
    // Wheels
    context.beginPath();
    context.strokeStyle = '#000';
    context.lineWidth = 3.5 * track.zoom;
    // (front wheel)
    context.arc(backWheel.x, backWheel.y, 10 * track.zoom, 0, PI2, true);
    // (back wheel)
    context.moveTo(frontWheel.x + 10 * track.zoom, frontWheel.y);
    context.arc(frontWheel.x, frontWheel.y, 10 * track.zoom, 0, PI2, true);
    context.stroke();
    
    var length = frontWheel.cloneSub(backWheel),
      AC = new Point((frontWheel.y - backWheel.y) * this.direction, (backWheel.x - frontWheel.x) * this.direction),
      crossFrameSaddle = backWheel.cloneAdd(length.cloneScale(0.3)).cloneAdd(AC.cloneScale(0.25)),
      shadowSteer = backWheel.cloneAdd(length.cloneScale(0.84)).cloneAdd(AC.cloneScale(0.42)),
      steer = backWheel.cloneAdd(length.cloneScale(0.84)).cloneAdd(AC.cloneScale(0.37)),
      pedalHinge = backWheel.cloneAdd(length.cloneScale(0.4)).cloneAdd(AC.cloneScale(0.05));
    
    // Frame
    context.beginPath();
    context.lineWidth = 3 * track.zoom;
    context.moveTo(backWheel.x, backWheel.y);
    context.lineTo(crossFrameSaddle.x, crossFrameSaddle.y);
    context.lineTo(shadowSteer.x, shadowSteer.y);
    context.moveTo(steer.x, steer.y);
    context.lineTo(pedalHinge.x, pedalHinge.y);
    context.lineTo(backWheel.x, backWheel.y);
    
    var CY = new Point(6 * Math.cos(this.distance) * track.zoom, 6 * Math.sin(this.distance) * track.zoom),
      pedal = pedalHinge.cloneAdd(CY),
      shadowPedal = pedalHinge.cloneSub(CY),
      saddle = backWheel.cloneAdd(length.cloneScale(0.17)).cloneAdd(AC.cloneScale(0.38)),
      Cg = backWheel.cloneAdd(length.cloneScale(0.3)).cloneAdd(AC.cloneScale(0.45)),
      Ci = backWheel.cloneAdd(length.cloneScale(0.25)).cloneAdd(AC.cloneScale(0.4));
    
    // Saddle
    context.moveTo(pedal.x, pedal.y);
    context.lineTo(shadowPedal.x, shadowPedal.y);
    context.moveTo(saddle.x, saddle.y);
    context.lineTo(Cg.x, Cg.y);
    context.moveTo(pedalHinge.x, pedalHinge.y);
    context.lineTo(Ci.x, Ci.y);
    var backWheelCenter = backWheel.cloneAdd(length.cloneScale(1)).cloneAdd(AC.cloneScale(0)),
      Cl = backWheel.cloneAdd(length.cloneScale(0.97)).cloneAdd(AC.cloneScale(0)),
      CO = backWheel.cloneAdd(length.cloneScale(0.8)).cloneAdd(AC.cloneScale(0.48)),
      CbackWheel = backWheel.cloneAdd(length.cloneScale(0.86)).cloneAdd(AC.cloneScale(0.5)),
      Ck = backWheel.cloneAdd(length.cloneScale(0.82)).cloneAdd(AC.cloneScale(0.65)),
      steerCenter = backWheel.cloneAdd(length.cloneScale(0.78)).cloneAdd(AC.cloneScale(0.67));
    
    // Steering Wheel
    context.moveTo(backWheelCenter.x, backWheelCenter.y);
    context.lineTo(Cl.x, Cl.y);
    context.lineTo(CO.x, CO.y);
    context.lineTo(CbackWheel.x, CbackWheel.y);
    context.lineTo(Ck.x, Ck.y);
    context.lineTo(steerCenter.x, steerCenter.y);
    context.stroke();
    if (this.dead) {
      return;
    }
    var _head = this.head.pos.toPixel();
    AC = _head.cloneSub(backWheel.cloneAdd(length.cloneScale(0.5)));
    var hip = crossFrameSaddle.cloneAdd(length.cloneScale(-0.1)).cloneAdd(AC.cloneScale(0.3)),
      Ar = pedal.cloneSub(hip),
      BA = new Point(Ar.y * this.direction, -Ar.x * this.direction);
    BA = BA.cloneScale(track.zoom * track.zoom);
    var knee = hip.cloneAdd(Ar.cloneScale(0.5)).cloneAdd(BA.cloneScale(200 / Ar.lengthSquared()));
    Ar = shadowPedal.cloneSub(hip);
    BA = new Point(Ar.y * this.direction, -Ar.x * this.direction);
    BA = BA.cloneScale(track.zoom * track.zoom);
    var shadowKnee = hip.cloneAdd(Ar.cloneScale(0.5)).cloneAdd(BA.cloneScale(200 / Ar.lengthSquared()));
    
    // Shadow Leg
    context.beginPath();
    context.lineWidth = 6 * track.zoom;
    context.strokeStyle = "rgba(0, 0, 0, 0.5)";
    context.moveTo(shadowPedal.x, shadowPedal.y);
    context.lineTo(shadowKnee.x, shadowKnee.y);
    context.lineTo(hip.x, hip.y);
    context.stroke();
    // Leg
    context.beginPath();
    context.strokeStyle = '#000';
    context.moveTo(pedal.x, pedal.y);
    context.lineTo(knee.x, knee.y);
    context.lineTo(hip.x, hip.y);
    context.stroke();
    // Body
    var head = crossFrameSaddle.cloneAdd(length.cloneScale(0.05)).cloneAdd(AC.cloneScale(0.9));
    context.beginPath();
    context.lineWidth = 8 * track.zoom;
    context.moveTo(hip.x, hip.y);
    context.lineTo(head.x, head.y);
    context.stroke();
    // Head
    var headCenter = crossFrameSaddle.cloneAdd(length.cloneScale(0.15)).cloneAdd(AC.cloneScale(1.05));
    context.beginPath();
    context.lineWidth = 2 * track.zoom;
    context.moveTo(headCenter.x + 5 * track.zoom, headCenter.y);
    context.arc(headCenter.x, headCenter.y, 5 * track.zoom, 0, PI2, true);
    context.stroke();
    // Cap
    context.beginPath();
    switch (this.cap) {
      case 'cap':
        var Ch = crossFrameSaddle.cloneAdd(length.cloneScale(0.4)).cloneAdd(AC.cloneScale(1.1)),
          Cd = crossFrameSaddle.cloneAdd(length.cloneScale(0.05)).cloneAdd(AC.cloneScale(1.05));
        context.moveTo(Ch.x, Ch.y);
        context.lineTo(Cd.x, Cd.y);
        context.stroke();
        break;
      case 'hat':
        var hatFrontBottom = crossFrameSaddle.cloneAdd(length.cloneScale(0.35)).cloneAdd(AC.cloneScale(1.15)),
          hatBackBottom = crossFrameSaddle.cloneSub(length.cloneScale(0.05)).cloneAdd(AC.cloneScale(1.1)),
          hatFront = crossFrameSaddle.cloneAdd(length.cloneScale(0.25)).cloneAdd(AC.cloneScale(1.13)),
          hatBack = crossFrameSaddle.cloneAdd(length.cloneScale(0.05)).cloneAdd(AC.cloneScale(1.11)),
          hatFrontTop = hatFrontBottom.cloneSub(length.cloneScale(0.1)).add(AC.cloneScale(0.2)),
          hatBackTop = hatBackBottom.cloneAdd(length.cloneScale(0.02)).add(AC.cloneScale(0.2));
        context.moveTo(hatFrontBottom.x, hatFrontBottom.y);
        context.lineTo(hatFront.x, hatFront.y);
        context.lineTo(hatFrontTop.x, hatFrontTop.y);
        context.lineTo(hatBackTop.x, hatBackTop.y);
        context.lineTo(hatBack.x, hatBack.y);
        context.lineTo(hatBackBottom.x, hatBackBottom.y);
        context.fillStyle = '#000';
        context.stroke();
        context.fill();
    }
    length = head.cloneSub(steerCenter);
    AC = new Point(length.y * this.direction, -length.x * this.direction);
    AC = AC.cloneScale(track.zoom * track.zoom);
    var elbow = steerCenter.cloneAdd(length.cloneScale(0.4)).cloneAdd(AC.cloneScale(130 / length.lengthSquared()));
    // Arm
    context.beginPath();
    context.lineWidth = 5 * track.zoom;
    context.moveTo(head.x, head.y);
    context.lineTo(elbow.x, elbow.y);
    context.lineTo(steerCenter.x, steerCenter.y);
    context.stroke();
  };
  
  p.getRider = function () {
    var guy = {},
      frontToBack = this.frontWheel.pos.cloneSub(this.backWheel.pos),
      pos = this.head.pos.cloneSub(this.frontWheel.pos.cloneAdd(this.backWheel.pos).cloneScale(0.5)),
      AS = new Point(frontToBack.y * this.direction, -frontToBack.x * this.direction);
    guy.head = this.backWheel.pos.cloneAdd(frontToBack.cloneScale(0.35)).cloneAdd(pos.cloneScale(1.2));
    guy.hand = guy.shadowHand = this.backWheel.pos.cloneAdd(frontToBack.cloneScale(0.8)).cloneAdd(AS.cloneScale(0.68));
    var N = guy.head.cloneSub(guy.hand);
    N = new Point(N.y * this.direction, -N.x * this.direction);
    guy.elbow = guy.shadowElbow = guy.head.cloneAdd(guy.hand).cloneScale(0.5).cloneAdd(N.cloneScale(130 / N.lengthSquared()));
    guy.hip = this.backWheel.pos.cloneAdd(frontToBack.cloneScale(0.2)).cloneAdd(AS.cloneScale(0.5));
    var R = new Point(6 * Math.cos(this.distance), 6 * Math.sin(this.distance));
    guy.foot = this.backWheel.pos.cloneAdd(frontToBack.cloneScale(0.4)).cloneAdd(AS.cloneScale(0.05)).cloneAdd(R);
    N = guy.hip.cloneSub(guy.foot);
    N = new Point(-N.y * this.direction, N.x * this.direction);
    guy.knee = guy.hip.cloneAdd(guy.foot).cloneScale(0.5).cloneAdd(N.cloneScale(160 / N.lengthSquared()));
    guy.shadowFoot = this.backWheel.pos.cloneAdd(frontToBack.cloneScale(0.4)).cloneAdd(AS.cloneScale(0.05)).cloneSub(R);
    N = guy.hip.cloneSub(guy.shadowFoot);
    N = new Point(-N.y * this.direction, N.x * this.direction);
    guy.shadowKnee = guy.hip.cloneAdd(guy.shadowFoot).cloneScale(0.5).cloneAdd(N.cloneScale(160 / N.lengthSquared()));
    return guy;
  };
  
  p.die = function () {
    this.dead = true;
    this.head.drive = function () {};
    this.backWheel.rotateSpeed = 0;
    this.backWheel.down = false;
    this.frontWheel.down = false;
    this.head.touch = false;
    bike = new DeadBike(this, this.getRider());
    bike.hat = new Shard(this.head.pos.clone(), this);
    bike.hat.speed = this.head.speed.clone();
    bike.hat.size = 10;
    bike.hat.rotationSpeed = 0.1;
  };
  
  p.step = function () {
    if (this.save) {
      this.hitTarget();
    }
    if (left !== this.left) {
      keys[0][this.time] = 1;
      this.left = left;
    }
    if (right !== this.right) {
      keys[1][this.time] = 1;
      this.right = right;
    }
    if (up !== this.up) {
      keys[2][this.time] = 1;
      this.up = up;
    }
    if (down !== this.down) {
      keys[3][this.time] = 1;
      this.down = down;
    }
    if (turn) {
      keys[4][this.time] = 1;
    }
    if (!this.dead) {
      this.BS();
    }
    for (var T = this.joints.length - 1; T >= 0; T--) {
      this.joints[T].step();
    }
    for (var u = this.points.length - 1; u >= 0; u--) {
      this.points[u].step();
    }
    if (this.backWheel.driving && this.frontWheel.driving) {
      this.slow = false;
    }
    if (!this.slow && !this.dead) {
      this.BS();
      for (T = this.joints.length - 1; T >= 0; T--) {
        this.joints[T].step();
      }
      for (u = this.points.length - 1; u >= 0; u--) {
        this.points[u].step();
      }
    }
  };
  
}(BMX.prototype));

/** @constructor */
function BMXGhost(AT) {
  var last = ghostConstants[ghostConstants.length - 1];

  this.cap = 'hat';
  
  this.points = [
    new BodyPart(new Point(last[0], last[1]), this),
    new Wheel(new Point(last[6], last[7]), this),
    new Wheel(new Point(last[13], last[14]), this)
  ];
  this.points[0].oldPos = new Point(last[2], last[3]);
  this.points[0].speed = new Point(last[4], last[5]);
  
  this.points[1].oldPos = new Point(last[8], last[9]);
  this.points[1].speed = new Point(last[10], last[11]);
  this.points[1].rotateSpeed = last[12];
  
  this.points[2].oldPos = new Point(last[15], last[16]);
  this.points[2].speed = new Point(last[17], last[18]);
  this.points[2].rotateSpeed = last[19];
  
  this.head = this.points[0];
  this.head.size = 14;
  this.head.drive = function () {
    ghost = false;
  };
  
  this.backWheel = this.points[1];
  this.backWheel.size = 11.7;
  this.frontWheel = this.points[2];
  this.frontWheel.size = 11.7;
  this.joints = [
    this.headToBack = new Joint(this.points[0], this.points[1], this),
    this.frontToBack = new Joint(this.points[1], this.points[2], this),
    this.headToFront = new Joint(this.points[2], this.points[0], this)
  ];
  
  this.headToBack.A1 = 45;
  this.headToBack.length = last[20];
  this.headToBack.BC = 0.35;
  this.headToBack.BE = 0.3;
  
  this.frontToBack.A1 = 42;
  this.frontToBack.length = last[21];
  this.frontToBack.BC = 0.35;
  this.frontToBack.BE = 0.3;
  
  this.headToFront.A1 = 45;
  this.headToFront.length = last[22];
  this.headToFront.BC = 0.35;
  this.headToFront.BE = 0.3;
  
  this.isGhost = true;
  this.distance = 0;
  this.direction = last[23];
  this.gravity = new Point(last[24], last[25]);
  this.slow = last[26];
  this.left = last[27];
  this.right = last[28];
  this.up = last[29];
  this.down = last[30];
  this.AT = AT;
  this.time = this.AT[5];
}
(function(p) {
  
  p.turn = function () {
    this.direction *= -1;
    this.frontToBack.turn();
    var headToBack = this.joints[0].length;
    this.headToBack.length = this.joints[2].length;
    this.headToFront.length = headToBack;
  };
  
  p.BS = function () {
    this.backWheel.rotateSpeed += (this.up - this.points[1].rotateSpeed) / 10;
    if (this.up) {
      this.distance += this.backWheel.rotationSpeed / 5;
    }
    this.backWheel.down = this.frontWheel.down = this.down;
    var rotate = this.left - this.right;
    this.headToBack.lean(rotate * 5 * this.direction, 5);
    this.headToFront.lean(-rotate * 5 * this.direction, 5);
    this.frontToBack.rotate(rotate / 6);
    if (!rotate && this.up) {
      this.headToBack.lean(-7, 5);
      this.headToFront.lean(7, 5);
    }
  };  
  
  p.draw = function () {
    var backWheel = this.backWheel.pos.toPixel(),
      frontWheel = this.frontWheel.pos.toPixel();

    // Wheels
    context.beginPath();
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.lineWidth = 3.5 * track.zoom;
    // (front wheel)
    context.arc(backWheel.x, backWheel.y, 10 * track.zoom, 0, PI2, true);
    // (back wheel)
    context.moveTo(frontWheel.x + 10 * track.zoom, frontWheel.y);
    context.arc(frontWheel.x, frontWheel.y, 10 * track.zoom, 0, PI2, true);
    context.stroke();
    
    var length = frontWheel.cloneSub(backWheel),
      AC = new Point((frontWheel.y - backWheel.y) * this.direction, (backWheel.x - frontWheel.x) * this.direction),
      crossFrameSaddle = backWheel.cloneAdd(length.cloneScale(0.3)).cloneAdd(AC.cloneScale(0.25)),
      shadowSteer = backWheel.cloneAdd(length.cloneScale(0.84)).cloneAdd(AC.cloneScale(0.42)),
      steer = backWheel.cloneAdd(length.cloneScale(0.84)).cloneAdd(AC.cloneScale(0.37)),
      pedalHinge = backWheel.cloneAdd(length.cloneScale(0.4)).cloneAdd(AC.cloneScale(0.05));

    // Frame
    context.beginPath();
    context.lineWidth = 3 * track.zoom;
    context.moveTo(backWheel.x, backWheel.y);
    context.lineTo(crossFrameSaddle.x, crossFrameSaddle.y);
    context.lineTo(shadowSteer.x, shadowSteer.y);
    context.moveTo(steer.x, steer.y);
    context.lineTo(pedalHinge.x, pedalHinge.y);
    context.lineTo(backWheel.x, backWheel.y);

    var CY = new Point(6 * track.zoom * Math.cos(this.distance), 6 * track.zoom * Math.sin(this.distance));
      pedal = pedalHinge.cloneAdd(CY),
      shadowPedal = pedalHinge.cloneSub(CY),
      saddle = backWheel.cloneAdd(length.cloneScale(0.17)).cloneAdd(AC.cloneScale(0.38)),
      Cg = backWheel.cloneAdd(length.cloneScale(0.3)).cloneAdd(AC.cloneScale(0.45)),
      Ci = backWheel.cloneAdd(length.cloneScale(0.25)).cloneAdd(AC.cloneScale(0.4));

    // Saddle
    context.moveTo(pedal.x, pedal.y);
    context.lineTo(shadowPedal.x, shadowPedal.y);
    context.moveTo(saddle.x, saddle.y);
    context.lineTo(Cg.x, Cg.y);
    context.moveTo(pedalHinge.x, pedalHinge.y);
    context.lineTo(Ci.x, Ci.y);
    var backWheelCenter = backWheel.cloneAdd(length.cloneScale(1)).cloneAdd(AC.cloneScale(0));
    var Cl = backWheel.cloneAdd(length.cloneScale(0.97)).cloneAdd(AC.cloneScale(0));
    var CO = backWheel.cloneAdd(length.cloneScale(0.8)).cloneAdd(AC.cloneScale(0.48));
    var CbackWheel = backWheel.cloneAdd(length.cloneScale(0.86)).cloneAdd(AC.cloneScale(0.5));
    var Ck = backWheel.cloneAdd(length.cloneScale(0.82)).cloneAdd(AC.cloneScale(0.65));
    var steerCenter = backWheel.cloneAdd(length.cloneScale(0.78)).cloneAdd(AC.cloneScale(0.67));

    // Steering Wheel
    context.moveTo(backWheelCenter.x, backWheelCenter.y);
    context.lineTo(Cl.x, Cl.y);
    context.lineTo(CO.x, CO.y);
    context.lineTo(CbackWheel.x, CbackWheel.y);
    context.lineTo(Ck.x, Ck.y);
    context.lineTo(steerCenter.x, steerCenter.y);
    context.stroke();
    
    var h = this.head.pos.toPixel();
    AC = h.cloneSub(backWheel.cloneAdd(length.cloneScale(0.5)));
    var hip = crossFrameSaddle.cloneSub(length.cloneScale(0.1)).cloneAdd(AC.cloneScale(0.3));
    var Ar = pedal.cloneSub(hip);
    var BA = new Point(Ar.y * this.direction, -Ar.x * this.direction);
    BA = BA.cloneScale(track.zoom * track.zoom);
    var knee = hip.cloneAdd(Ar.cloneScale(0.5)).cloneAdd(BA.cloneScale(200 / Ar.lengthSquared()));
    Ar = shadowPedal.cloneSub(hip);
    BA = new Point(Ar.y * this.direction, -Ar.x * this.direction);
    BA = BA.cloneScale(track.zoom * track.zoom);
    var shadowKnee = hip.cloneAdd(Ar.cloneScale(0.5)).cloneAdd(BA.cloneScale(200 / Ar.lengthSquared()));

    // Shadow Leg
    context.beginPath();
    context.lineWidth = 6 * track.zoom;
    context.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    context.moveTo(shadowPedal.x, shadowPedal.y);
    context.lineTo(shadowKnee.x, shadowKnee.y);
    context.lineTo(hip.x, hip.y);
    context.stroke();

    // Leg
    context.beginPath();
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.lineWidth = 6 * track.zoom;
    context.moveTo(pedal.x, pedal.y);
    context.lineTo(knee.x, knee.y);
    context.lineTo(hip.x, hip.y);
    context.stroke();

    // Body
    var head = crossFrameSaddle.cloneAdd(length.cloneScale(0.05)).cloneAdd(AC.cloneScale(0.9));
    context.beginPath();
    context.lineWidth = 8 * track.zoom;
    context.moveTo(hip.x, hip.y);
    context.lineTo(head.x, head.y);
    context.stroke();

    // Cap
    var Bs = crossFrameSaddle.cloneAdd(length.cloneScale(0.15)).cloneAdd(AC.cloneScale(1.05));
    context.beginPath();
    context.lineWidth = 2 * track.zoom;
    switch (this.cap) {
      case 'cap':
        var Ch = crossFrameSaddle.cloneAdd(length.cloneScale(0.4)).cloneAdd(AC.cloneScale(1.1)),
          Cd = crossFrameSaddle.cloneAdd(length.cloneScale(0.05)).cloneAdd(AC.cloneScale(1.05));
        context.moveTo(Ch.x, Ch.y);
        context.lineTo(Cd.x, Cd.y);
        context.stroke();
        break;
      case 'hat':
        var hatFrontBottom = crossFrameSaddle.cloneAdd(length.cloneScale(0.35)).cloneAdd(AC.cloneScale(1.15)),
          hatBackBottom = crossFrameSaddle.cloneSub(length.cloneScale(0.05)).cloneAdd(AC.cloneScale(1.1)),
          hatFront = crossFrameSaddle.cloneAdd(length.cloneScale(0.25)).cloneAdd(AC.cloneScale(1.13)),
          hatBack = crossFrameSaddle.cloneAdd(length.cloneScale(0.05)).cloneAdd(AC.cloneScale(1.11)),
          hatFrontTop = hatFrontBottom.cloneSub(length.cloneScale(0.1)).add(AC.cloneScale(0.2)),
          hatBackTop = hatBackBottom.cloneAdd(length.cloneScale(0.02)).add(AC.cloneScale(0.2));
        context.moveTo(hatFrontBottom.x, hatFrontBottom.y);
        context.lineTo(hatFront.x, hatFront.y);
        context.lineTo(hatFrontTop.x, hatFrontTop.y);
        context.lineTo(hatBackTop.x, hatBackTop.y);
        context.lineTo(hatBack.x, hatBack.y);
        context.lineTo(hatBackBottom.x, hatBackBottom.y);
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.stroke();
        context.fill();
    }
    length = head.cloneSub(steerCenter);
    AC = new Point(length.y * this.direction, -length.x * this.direction);
    AC = AC.cloneScale(track.zoom * track.zoom);
    var CV = steerCenter.cloneAdd(length.cloneScale(0.4)).cloneAdd(AC.cloneScale(130 / length.lengthSquared()));
    // 
    context.beginPath();
    context.lineWidth = 5 * track.zoom;
    context.moveTo(head.x, head.y);
    context.lineTo(CV.x, CV.y);
    context.lineTo(steerCenter.x, steerCenter.y);
    context.stroke();
    context.strokeStyle = '#000';
  };
  
  p.step = function () {
    if (bike.time > this.time) {
      this.step = function () {};
    }
    if (this.AT[0][bike.time]) {
      this.left = this.left ? 0 : 1;
    }
    if (this.AT[1][bike.time]) {
      this.right = this.right ? 0 : 1;
    }
    if (this.AT[2][bike.time]) {
      this.up = this.up ? 0 : 1;
    }
    if (this.AT[3][bike.time]) {
      this.down = this.down ? 0 : 1;
    }
    if (this.AT[4][bike.time]) {
      this.turn();
    }
    this.BS();
    for (var T = this.joints.length - 1; T >= 0; T--) {
      this.joints[T].step();
    }
    for (var u = this.points.length - 1; u >= 0; u--) {
      this.points[u].step();
    }
    if (this.backWheel.driving && this.frontWheel.driving) {
      this.slow = false;
    }
    if (!this.slow) {
      this.BS();
      for (T = this.joints.length - 1; T >= 0; T--) {
        this.joints[T].step();
      }
      for (u = this.points.length - 1; u >= 0; u--) {
        this.points[u].step();
      }
    }
  };
  
}(BMXGhost.prototype));

/** @constructor */
function MTB() {
  var last = mtbConstants[mtbConstants.length - 1];
  
  this.points = [
    this.head       = new BodyPart(new Point(last[0], last[1]), this),
    this.backWheel = new Wheel(new Point(last[6], last[7]), this),
    this.frontWheel  = new Wheel(new Point(last[13], last[14]), this)
  ];
  this.points[0].oldPos = new Point(last[2], last[3]);
  this.points[0].speed = new Point(last[4], last[5]);
  
  this.points[1].oldPos = new Point(last[8], last[9]);
  this.points[1].speed = new Point(last[10], last[11]);
  this.points[1].rotateSpeed = last[12];
  
  this.points[2].oldPos = new Point(last[15], last[16]);
  this.points[2].speed = new Point(last[17], last[18]);
  this.points[2].rotateSpeed = last[19];
  
  this.head.size = 14;
  this.head.drive = function () {
    bike.die();
  };
  
  this.backWheel.size = 14;
  
  this.frontWheel.size = 14;
  
  this.joints = [
    this.headToBack = new Joint(this.points[0], this.points[1], this),
    this.frontToBack = new Joint(this.points[1], this.points[2], this),
    this.headToFront = new Joint(this.points[2], this.points[0], this)
  ];
  
  this.headToBack.A1 = 47;
  this.headToBack.length = last[20];
  this.headToBack.BC = 0.2;
  this.headToBack.BE = 0.3;
  
  this.frontToBack.A1 = 45;
  this.frontToBack.length = last[21];
  this.frontToBack.BC = 0.2;
  this.frontToBack.BE = 0.3;
  
  this.headToFront.A1 = 45;
  this.headToFront.length = last[22];
  this.headToFront.BC = 0.2;
  this.headToFront.BE = 0.3;
  this.save = false;
  this.dead = false;
  this.distance = 0;
  this.direction = last[23];
  this.gravity = new Point(last[24], last[25]);
  this.slow = last[26];
  track.targetsReached = last[27];
  for (var j = 0; j < track.objects.length; j++) {
    track.objects[j].reached = last[28][j];
  }
  this.left = 0;
  this.right = 0;
  this.up = 0;
  this.down = 0;
  this.time = last[29];
  if (this.time) {
    this.left = last[30];
    this.right = last[31];
    this.up = last[32];
    this.down = last[33];
    for (var BD = 0; BD < keys.length; BD++) {
      for (var BJ in keys[BD]) {
        if (BJ >= this.time) {
          delete keys[BD][BJ];
        }
      }
    }
  }
  else {
    keys = [[], [], [], [], []];
  }
}
(function(p) {
  
  p.turn = function () {
    Ct = turn = false;
    this.direction *= -1;
    this.frontToBack.turn();
    var headToBack = this.joints[0].length;
    this.headToBack.length = this.joints[2].length;
    this.headToFront.length = headToBack;
  };
  
  p.hitTarget = function () {
    this.save = false;
    if (track.numTargets && track.targetsReached === track.numTargets) {
      if (this.time > 5000 && (!track.time || this.time < track.time) && (keys[0].length || keys[1].length) && track.id !== undefined) {
        var pos = document.cookie.indexOf('; ID=');
        if (pos === -1 && !document.cookie.indexOf('ID=')) {
          pos = -2;
        }
        if (pos !== -1) {
          pos += 5;
          var end = document.cookie.indexOf(';', pos);
          if (end === -1) {
            end = document.cookie.length;
          }
          var ID = document.cookie.substring(pos, end);
          if (confirm('You just set a new Track record!!!\nYour step will be saved for others to enjoy.')) {
            var AT = '';
            for (var BJ = 0; BJ < keys.length; BJ++) {
              for (var Ay in keys[BJ]) {
                if (!isNaN(Ay)) {
                  AT += Ay + ' ';
                }
              }
              AT += ",";
            }
            var request = new XMLHttpRequest();
            request.open("POST", "js/save.php", false);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.setRequestHeader("User-Agent", "CanvasRider");
            request.send("trackID=" + track.id + "&playerID=" + ID + "&vehicle=" + currentBike + "&time=" + this.time + "&controls=" + AT);
          }
        }
        else {
          alert('You just set a new Track record!\nRegister & log in to save your step next time!');
        }
        left = right = up = down = 0;
      }
    }
    else {
      mtbConstants.push([
        this.points[0].pos.x, this.points[0].pos.y, this.points[0].oldPos.x, this.points[0].oldPos.y, this.points[0].speed.x, this.points[0].speed.y,
        this.points[1].pos.x, this.points[1].pos.y, this.points[1].oldPos.x, this.points[1].oldPos.y, this.points[1].speed.x, this.points[1].speed.y, this.points[1].rotateSpeed,
        this.points[2].pos.x, this.points[2].pos.y, this.points[2].oldPos.x, this.points[2].oldPos.y, this.points[2].speed.x, this.points[2].speed.y, this.points[2].rotateSpeed,
        this.joints[0].length, this.joints[1].length, this.joints[2].length,
        this.direction, this.gravity.x, this.gravity.y, this.slow,
        track.targetsReached, [], this.time,
        this.left, this.right, this.up, this.down
      ]);
      for (var j = 0; j < track.objects.length; j++) {
        mtbConstants[mtbConstants.length - 1][28].push(track.objects[j].reached);
      }
      if (ghost) {
        ghostConstants.push([
          ghost.points[0].pos.x, ghost.points[0].pos.y, ghost.points[0].oldPos.x, ghost.points[0].oldPos.y, ghost.points[0].speed.x, ghost.points[0].speed.y,
          ghost.points[1].pos.x, ghost.points[1].pos.y, ghost.points[1].oldPos.x, ghost.points[1].oldPos.y, ghost.points[1].speed.x, ghost.points[1].speed.y, ghost.points[1].rotateSpeed,
          ghost.points[2].pos.x, ghost.points[2].pos.y, ghost.points[2].oldPos.x, ghost.points[2].oldPos.y, ghost.points[2].speed.x, ghost.points[2].speed.y, ghost.points[2].rotateSpeed,
          ghost.joints[0].length, ghost.joints[1].length, ghost.joints[2].length,
          ghost.direction, ghost.gravity.x, ghost.gravity.y, ghost.slow,
          ghost.left, ghost.right, ghost.up, ghost.down
        ]);
      }
    }
  };
  
  p.BS = function () {
    if (turn) {
      this.turn();
    }
    this.backWheel.rotateSpeed += (up - this.backWheel.rotateSpeed) / 10;
    if (up) {
      this.distance += this.backWheel.rotationSpeed / 5;
    }
    this.backWheel.down = this.frontWheel.down = down;
    var rotate = left - right;
    this.headToBack.lean(rotate * 5 * this.direction, 5);
    this.headToFront.lean(-rotate * 5 * this.direction, 5);
    this.frontToBack.rotate(rotate / 8);
    if (!rotate && up) {
      this.headToBack.lean(-7, 5);
      this.headToFront.lean(7, 5);
    }
  };
  
  p.draw = function () {
    var M = this.backWheel.pos.toPixel();
    var pos = this.frontWheel.pos.toPixel();
    var AS = this.head.pos.toPixel();
    var L = pos.cloneSub(M);
    var N = new Point((pos.y - M.y) * this.direction, (M.x - pos.x) * this.direction);
    var R = AS.cloneSub(M.cloneAdd(L.cloneScale(0.5)));
    context.beginPath();
    context.strokeStyle = '#000';
    context.lineWidth = 3.5 * track.zoom;
    context.arc(M.x, M.y, 12.5 * track.zoom, 0, PI2, true);
    context.moveTo(pos.x + 12.5 * track.zoom, pos.y);
    context.arc(pos.x, pos.y, 12.5 * track.zoom, 0, PI2, true);
    context.stroke();
    context.beginPath();
    context.fillStyle = 'grey';
    context.moveTo(M.x + 5 * track.zoom, M.y);
    context.arc(M.x, M.y, 5 * track.zoom, 0, PI2, true);
    context.moveTo(pos.x + 4 * track.zoom, pos.y);
    context.arc(pos.x, pos.y, 4 * track.zoom, 0, PI2, true);
    context.fill();
    context.beginPath();
    context.lineWidth = 5 * track.zoom;
    context.moveTo(M.x, M.y);
    context.lineTo(M.x + L.x * 0.4 + N.x * 0.05, M.y + L.y * 0.4 + N.y * 0.05);
    context.moveTo(M.x + L.x * 0.72 + R.x * 0.64, M.y + L.y * 0.72 + R.y * 0.64);
    context.lineTo(M.x + L.x * 0.46 + R.x * 0.4, M.y + L.y * 0.46 + R.y * 0.4);
    context.lineTo(M.x + L.x * 0.4 + N.x * 0.05, M.y + L.y * 0.4 + N.y * 0.05);
    context.stroke();
    context.beginPath();
    context.lineWidth = 2 * track.zoom;
    context.moveTo(M.x + L.x * 0.72 + R.x * 0.64, M.y + L.y * 0.72 + R.y * 0.64);
    context.lineTo(M.x + L.x * 0.43 + N.x * 0.05, M.y + L.y * 0.43 + N.y * 0.05);
    context.moveTo(M.x + L.x * 0.45 + R.x * 0.3, M.y + L.y * 0.45 + R.y * 0.3);
    context.lineTo(M.x + L.x * 0.3 + R.x * 0.4, M.y + L.y * 0.3 + R.y * 0.4);
    context.lineTo(M.x + L.x * 0.25 + R.x * 0.6, M.y + L.y * 0.25 + R.y * 0.6);
    context.moveTo(M.x + L.x * 0.17 + R.x * 0.6, M.y + L.y * 0.17 + R.y * 0.6);
    context.lineTo(M.x + L.x * 0.3 + R.x * 0.6, M.y + L.y * 0.3 + R.y * 0.6);
    var Ap = new Point(6 * Math.cos(this.distance) * track.zoom, 6 * Math.sin(this.distance) * track.zoom);
    context.moveTo(M.x + L.x * 0.43 + N.x * 0.05 + Ap.x, M.y + L.y * 0.43 + N.y * 0.05 + Ap.y);
    context.lineTo(M.x + L.x * 0.43 + N.x * 0.05 - Ap.x, M.y + L.y * 0.43 + N.y * 0.05 - Ap.y);
    context.stroke();
    context.beginPath();
    context.lineWidth = track.zoom;
    context.moveTo(M.x + L.x * 0.46 + R.x * 0.4, M.y + L.y * 0.46 + R.y * 0.4);
    context.lineTo(M.x + L.x * 0.28 + R.x * 0.5, M.y + L.y * 0.28 + R.y * 0.5);
    context.stroke();
    context.beginPath();
    context.lineWidth = 3 * track.zoom;
    context.moveTo(pos.x, pos.y);
    context.lineTo(M.x + L.x * 0.71 + R.x * 0.73, M.y + L.y * 0.71 + R.y * 0.73);
    context.lineTo(M.x + L.x * 0.73 + R.x * 0.77, M.y + L.y * 0.73 + R.y * 0.77);
    context.lineTo(M.x + L.x * 0.7 + R.x * 0.8, M.y + L.y * 0.7 + R.y * 0.8);
    context.stroke();
    if (this.dead) {
      return;
    }
    N = AS.cloneSub(M.cloneAdd(L.cloneScale(0.5)));
    var Aw = M.cloneAdd(L.cloneScale(0.3)).cloneAdd(N.cloneScale(0.25));
    var B2 = M.cloneAdd(L.cloneScale(0.4)).cloneAdd(N.cloneScale(0.05));
    var Bp = B2.cloneAdd(Ap);
    var A6 = B2.cloneSub(Ap);
    var A7 = M.cloneAdd(L.cloneScale(0.67)).cloneAdd(N.cloneScale(0.8));
    var AY = Aw.cloneAdd(L.cloneScale(-0.05)).cloneAdd(N.cloneScale(0.42));
    var Aa = Bp.cloneSub(AY);
    R = new Point(Aa.y * this.direction, -Aa.x * this.direction);
    R = R.cloneScale(track.zoom * track.zoom);
    var CZ = AY.cloneAdd(Aa.cloneScale(0.5)).cloneAdd(R.cloneScale(200 / Aa.lengthSquared()));
    Aa = A6.cloneSub(AY);
    R = new Point(Aa.y * this.direction, -Aa.x * this.direction);
    R = R.cloneScale(track.zoom * track.zoom);
    var CX = AY.cloneAdd(Aa.cloneScale(0.5)).cloneAdd(R.cloneScale(200 / Aa.lengthSquared()));
    context.beginPath();
    context.lineWidth = 6 * track.zoom;
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.moveTo(A6.x, A6.y);
    context.lineTo(CX.x, CX.y);
    context.lineTo(AY.x, AY.y);
    context.stroke();
    context.beginPath();
    context.strokeStyle = '#000';
    context.moveTo(Bp.x, Bp.y);
    context.lineTo(CZ.x, CZ.y);
    context.lineTo(AY.x, AY.y);
    context.stroke();
    var BX = Aw.cloneAdd(L.cloneScale(0.1)).cloneAdd(N.cloneScale(0.95));
    context.beginPath();
    context.lineWidth = 8 * track.zoom;
    context.moveTo(AY.x, AY.y);
    context.lineTo(BX.x, BX.y);
    context.stroke();
    var Bl = Aw.cloneAdd(L.cloneScale(0.2)).cloneAdd(N.cloneScale(1.09));
    var CT = Aw.cloneAdd(L.cloneScale(0.4)).cloneAdd(N.cloneScale(1.15));
    var Ce = Aw.cloneAdd(L.cloneScale(0.1)).cloneAdd(N.cloneScale(1.05));
    context.beginPath();
    context.lineWidth = 2 * track.zoom;
    context.moveTo(Bl.x + 5 * track.zoom, Bl.y);
    context.arc(Bl.x, Bl.y, 5 * track.zoom, 0, PI2, true);
    context.moveTo(CT.x, CT.y);
    context.lineTo(Ce.x, Ce.y);
    context.stroke();
    L = BX.cloneSub(A7);
    N = new Point(L.y * this.direction, -L.x * this.direction);
    N = N.cloneScale(track.zoom * track.zoom);
    var CU = A7.cloneAdd(L.cloneScale(0.3)).cloneAdd(N.cloneScale(80 / L.lengthSquared()));
    context.beginPath();
    context.lineWidth = 5 * track.zoom;
    context.moveTo(BX.x, BX.y);
    context.lineTo(CU.x, CU.y);
    context.lineTo(A7.x, A7.y);
    context.stroke();
  };
  
  p.getRider = function () {
    var rider = {},
      M = this.frontWheel.pos.cloneSub(this.backWheel.pos),
      pos = this.head.pos.cloneSub(this.frontWheel.pos.cloneAdd(this.backWheel.pos).cloneScale(0.5)),
      AS = new Point(M.y * this.direction, -M.x * this.direction);
    rider.head = this.backWheel.pos.cloneAdd(M.cloneScale(0.35)).cloneAdd(pos.cloneScale(1.2));
    rider.hand = rider.shadowHand = this.backWheel.pos.cloneAdd(M.cloneScale(0.8)).cloneAdd(AS.cloneScale(0.68));
    var N = rider.head.cloneSub(rider.hand);
    N = new Point(N.y * this.direction, -N.x * this.direction);
    rider.elbow = rider.shadowElbow = rider.head.cloneAdd(rider.hand).cloneScale(0.5).cloneAdd(N.cloneScale(130 / N.lengthSquared()));
    rider.hip = this.backWheel.pos.cloneAdd(M.cloneScale(0.2)).cloneAdd(AS.cloneScale(0.5));
    var R = new Point(6 * Math.cos(this.distance), 6 * Math.sin(this.distance));
    rider.foot = this.backWheel.pos.cloneAdd(M.cloneScale(0.4)).cloneAdd(AS.cloneScale(0.05)).cloneAdd(R);
    N = rider.hip.cloneSub(rider.foot);
    N = new Point(-N.y * this.direction, N.x * this.direction);
    rider.knee = rider.hip.cloneAdd(rider.foot).cloneScale(0.5).cloneAdd(N.cloneScale(160 / N.lengthSquared()));
    rider.shadowFoot = this.backWheel.pos.cloneAdd(M.cloneScale(0.4)).cloneAdd(AS.cloneScale(0.05)).cloneSub(R);
    N = rider.hip.cloneSub(rider.shadowFoot);
    N = new Point(-N.y * this.direction, N.x * this.direction);
    rider.shadowKnee = rider.hip.cloneAdd(rider.shadowFoot).cloneScale(0.5).cloneAdd(N.cloneScale(160 / N.lengthSquared()));
    return rider;
  };
  
  p.die = function () {
    this.dead = true;
    this.head.drive = function () {};
    this.backWheel.rotateSpeed = 0;
    this.backWheel.down = false;
    this.frontWheel.down = false;
    this.head.touch = false;
    bike = new DeadBike(this, this.getRider());
  };
  
  p.step = function () {
    if (this.save) {
      this.hitTarget();
    }
    if (left !== this.left) {
      keys[0][this.time] = 1;
      this.left = left;
    }
    if (right !== this.right) {
      keys[1][this.time] = 1;
      this.right = right;
    }
    if (up !== this.up) {
      keys[2][this.time] = 1;
      this.up = up;
    }
    if (down !== this.down) {
      keys[3][this.time] = 1;
      this.down = down;
    }
    if (turn) {
      keys[4][this.time] = 1;
    }
    if (!this.dead) {
      this.BS();
    }
    for (var T = this.joints.length - 1; T >= 0; T--) {
      this.joints[T].step();
    }
    for (var u = this.points.length - 1; u >= 0; u--) {
      this.points[u].step();
    }
    if (this.backWheel.driving && this.frontWheel.driving) {
      this.slow = false;
    }
    if (!this.slow && !this.dead) {
      this.BS();
      for (T = this.joints.length - 1; T >= 0; T--) {
        this.joints[T].step();
      }
      for (u = this.points.length - 1; u >= 0; u--) {
        this.points[u].step();
      }
    }
  };
  
}(MTB.prototype));

/** @constructor */
function MTBGhost(AT) {
  var last = ghostConstants[ghostConstants.length - 1];
  this.points = [
    this.head       = new BodyPart(new Point(last[0],  last[1]),  this),
    this.backWheel = new Wheel   (new Point(last[6],  last[7]),  this),
    this.frontWheel  = new Wheel   (new Point(last[13], last[14]), this)
  ];
  
  this.head.oldPos = new Point(last[2], last[3]);
  this.head.speed = new Point(last[4], last[5]);
  
  this.backWheel.oldPos = new Point(last[8], last[9]);
  this.backWheel.speed = new Point(last[10], last[11]);
  this.backWheel.rotateSpeed = last[12];
  
  this.frontWheel.oldPos = new Point(last[15], last[16]);
  this.frontWheel.speed = new Point(last[17], last[18]);
  this.frontWheel.rotateSpeed = last[19];
  
  this.head.size = 14;
  this.head.drive = function () { ghost = false; };
  
  this.backWheel.size = 14;
  
  this.frontWheel.size = 14;
  this.joints = [
    this.headToBack = new Joint(this.head, this.backWheel, this),
    this.frontToBack = new Joint(this.backWheel, this.frontWheel, this),
    this.headToFront = new Joint(this.frontWheel, this.head, this)
  ];
  
  this.headToBack.A1 = 47;
  this.headToBack.length = last[20];
  this.headToBack.BC = 0.2;
  this.headToBack.BE = 0.3;
  
  this.frontToBack.A1 = 45;
  this.frontToBack.length = last[21];
  this.frontToBack.BC = 0.2;
  this.frontToBack.BE = 0.3;
  
  this.headToFront.A1 = 45;
  this.headToFront.length = last[22];
  this.headToFront.BC = 0.2;
  this.headToFront.BE = 0.3;
  
  this.isGhost = true;
  this.distance = 0;
  this.direction = last[23];
  this.gravity = new Point(last[24], last[25]);
  this.slow = last[26];
  this.left = last[27];
  this.right = last[28];
  this.up = last[29];
  this.down = last[30];
  this.AT = AT;
  this.time = this.AT[5];
}
(function(p) {

  p.turn = function () {
    this.direction *= -1;
    this.frontToBack.turn();
    var headToBack = this.joints[0].length;
    this.headToBack.length = this.joints[2].length;
    this.headToFront.length = headToBack;
  };
  
  p.BS = function () {
    this.backWheel.rotateSpeed += (this.up - this.points[1].rotateSpeed) / 10;
    if (this.up) {
      this.distance += this.backWheel.rotationSpeed / 5;
    }
    this.backWheel.down = this.frontWheel.down = this.down;
    var rotate = this.left - this.right;
    this.headToBack.lean(rotate * 5 * this.direction, 5);
    this.headToFront.lean(-rotate * 5 * this.direction, 5);
    this.frontToBack.rotate(rotate / 8);
    if (!rotate && this.up) {
      this.headToBack.lean(-7, 5);
      this.headToFront.lean(7, 5);
    }
  };
  
  p.draw = function () {
    var M = this.backWheel.pos.toPixel();
    var pos = this.frontWheel.pos.toPixel();
    var AS = this.head.pos.toPixel();
    var L = pos.cloneSub(M);
    var N = new Point((pos.y - M.y) * this.direction, (M.x - pos.x) * this.direction);
    var R = AS.cloneSub(M.cloneAdd(L.cloneScale(0.5)));
    context.beginPath();
    context.strokeStyle = "rgba(0, 0, 0, 0.5)";
    context.lineWidth = 3.5 * track.zoom;
    context.arc(M.x, M.y, 12.5 * track.zoom, 0, PI2, true);
    context.moveTo(pos.x + 12.5 * track.zoom, pos.y);
    context.arc(pos.x, pos.y, 12.5 * track.zoom, 0, PI2, true);
    context.stroke();
    context.beginPath();
    context.fillStyle = "rgba(0, 0, 0, 0.25)";
    context.moveTo(M.x + 5 * track.zoom, M.y);
    context.arc(M.x, M.y, 5 * track.zoom, 0, PI2, true);
    context.moveTo(pos.x + 4 * track.zoom, pos.y);
    context.arc(pos.x, pos.y, 4 * track.zoom, 0, PI2, true);
    context.fill();
    context.beginPath();
    context.lineWidth = 5 * track.zoom;
    context.moveTo(M.x, M.y);
    context.lineTo(M.x + L.x * 0.4 + N.x * 0.05, M.y + L.y * 0.4 + N.y * 0.05);
    context.moveTo(M.x + L.x * 0.72 + R.x * 0.64, M.y + L.y * 0.72 + R.y * 0.64);
    context.lineTo(M.x + L.x * 0.46 + R.x * 0.4, M.y + L.y * 0.46 + R.y * 0.4);
    context.lineTo(M.x + L.x * 0.4 + N.x * 0.05, M.y + L.y * 0.4 + N.y * 0.05);
    context.stroke();
    context.beginPath();
    context.lineWidth = 2 * track.zoom;
    context.moveTo(M.x + L.x * 0.72 + R.x * 0.64, M.y + L.y * 0.72 + R.y * 0.64);
    context.lineTo(M.x + L.x * 0.43 + N.x * 0.05, M.y + L.y * 0.43 + N.y * 0.05);
    context.moveTo(M.x + L.x * 0.45 + R.x * 0.3, M.y + L.y * 0.45 + R.y * 0.3);
    context.lineTo(M.x + L.x * 0.3 + R.x * 0.4, M.y + L.y * 0.3 + R.y * 0.4);
    context.lineTo(M.x + L.x * 0.25 + R.x * 0.6, M.y + L.y * 0.25 + R.y * 0.6);
    context.moveTo(M.x + L.x * 0.17 + R.x * 0.6, M.y + L.y * 0.17 + R.y * 0.6);
    context.lineTo(M.x + L.x * 0.3 + R.x * 0.6, M.y + L.y * 0.3 + R.y * 0.6);
    var Ap = new Point(6 * Math.cos(this.distance) * track.zoom, 6 * Math.sin(this.distance) * track.zoom);
    context.moveTo(M.x + L.x * 0.43 + N.x * 0.05 + Ap.x, M.y + L.y * 0.43 + N.y * 0.05 + Ap.y);
    context.lineTo(M.x + L.x * 0.43 + N.x * 0.05 - Ap.x, M.y + L.y * 0.43 + N.y * 0.05 - Ap.y);
    context.stroke();
    context.beginPath();
    context.lineWidth = track.zoom;
    context.moveTo(M.x + L.x * 0.46 + R.x * 0.4, M.y + L.y * 0.46 + R.y * 0.4);
    context.lineTo(M.x + L.x * 0.28 + R.x * 0.5, M.y + L.y * 0.28 + R.y * 0.5);
    context.stroke();
    context.beginPath();
    context.lineWidth = 3 * track.zoom;
    context.moveTo(pos.x, pos.y);
    context.lineTo(M.x + L.x * 0.71 + R.x * 0.73, M.y + L.y * 0.71 + R.y * 0.73);
    context.lineTo(M.x + L.x * 0.73 + R.x * 0.77, M.y + L.y * 0.73 + R.y * 0.77);
    context.lineTo(M.x + L.x * 0.7 + R.x * 0.8, M.y + L.y * 0.7 + R.y * 0.8);
    context.stroke();
    N = AS.cloneSub(M.cloneAdd(L.cloneScale(0.5)));
    var Aw = M.cloneAdd(L.cloneScale(0.3)).cloneAdd(N.cloneScale(0.25));
    var B2 = M.cloneAdd(L.cloneScale(0.4)).cloneAdd(N.cloneScale(0.05));
    var Bp = B2.cloneAdd(Ap);
    var A6 = B2.cloneSub(Ap);
    var A7 = M.cloneAdd(L.cloneScale(0.67)).cloneAdd(N.cloneScale(0.8));
    var AY = Aw.cloneAdd(L.cloneScale(-0.05)).cloneAdd(N.cloneScale(0.42));
    var Aa = Bp.cloneSub(AY);
    R = new Point(Aa.y * this.direction, -Aa.x * this.direction);
    R = R.cloneScale(track.zoom * track.zoom);
    var CZ = AY.cloneAdd(Aa.cloneScale(0.5)).cloneAdd(R.cloneScale(200 / Aa.lengthSquared()));
    Aa = A6.cloneSub(AY);
    R = new Point(Aa.y * this.direction, -Aa.x * this.direction);
    R = R.cloneScale(track.zoom * track.zoom);
    var CX = AY.cloneAdd(Aa.cloneScale(0.5)).cloneAdd(R.cloneScale(200 / Aa.lengthSquared()));
    context.beginPath();
    context.lineWidth = 6 * track.zoom;
    context.strokeStyle = "rgba(0, 0, 0, 0.25)";
    context.moveTo(A6.x, A6.y);
    context.lineTo(CX.x, CX.y);
    context.lineTo(AY.x, AY.y);
    context.stroke();
    context.beginPath();
    context.strokeStyle = "rgba(0, 0, 0, 0.5)";
    context.moveTo(Bp.x, Bp.y);
    context.lineTo(CZ.x, CZ.y);
    context.lineTo(AY.x, AY.y);
    context.stroke();
    var BX = Aw.cloneAdd(L.cloneScale(0.1)).cloneAdd(N.cloneScale(0.95));
    context.beginPath();
    context.lineWidth = 8 * track.zoom;
    context.moveTo(AY.x, AY.y);
    context.lineTo(BX.x, BX.y);
    context.stroke();
    var Bl = Aw.cloneAdd(L.cloneScale(0.2)).cloneAdd(N.cloneScale(1.09));
    var CT = Aw.cloneAdd(L.cloneScale(0.4)).cloneAdd(N.cloneScale(1.15));
    var Ce = Aw.cloneAdd(L.cloneScale(0.1)).cloneAdd(N.cloneScale(1.05));
    context.beginPath();
    context.lineWidth = 2 * track.zoom;
    context.moveTo(Bl.x + 5 * track.zoom, Bl.y);
    context.arc(Bl.x, Bl.y, 5 * track.zoom, 0, PI2, true);
    context.moveTo(CT.x, CT.y);
    context.lineTo(Ce.x, Ce.y);
    context.stroke();
    L = BX.cloneSub(A7);
    N = new Point(L.y * this.direction, -L.x * this.direction);
    N = N.cloneScale(track.zoom * track.zoom);
    var CU = A7.cloneAdd(L.cloneScale(0.3)).cloneAdd(N.cloneScale(80 / L.lengthSquared()));
    context.beginPath();
    context.lineWidth = 5 * track.zoom;
    context.moveTo(BX.x, BX.y);
    context.lineTo(CU.x, CU.y);
    context.lineTo(A7.x, A7.y);
    context.stroke();
    context.strokeStyle = '#000';
  };
  
  p.step = function () {
    if (bike.time > this.time) {
      this.step = function () {};
    }
    if (this.AT[0][bike.time]) {
      this.left = this.left ? 0 : 1;
    }
    if (this.AT[1][bike.time]) {
      this.right = this.right ? 0 : 1;
    }
    if (this.AT[2][bike.time]) {
      this.up = this.up ? 0 : 1;
    }
    if (this.AT[3][bike.time]) {
      this.down = this.down ? 0 : 1;
    }
    if (this.AT[4][bike.time]) {
      this.turn();
    }
    this.BS();
    for (var T = this.joints.length - 1; T >= 0; T--) {
      this.joints[T].step();
    }
    for (var u = this.points.length - 1; u >= 0; u--) {
      this.points[u].step();
    }
    if (this.backWheel.driving && this.frontWheel.driving) {
      this.slow = false;
    }
    if (!this.slow) {
      this.BS();
      for (T = this.joints.length - 1; T >= 0; T--) {
        this.joints[T].step();
      }
      for (u = this.points.length - 1; u >= 0; u--) {
        this.points[u].step();
      }
    }
  };
  
}(MTBGhost.prototype));

/** @constructor */
function DeadRider(guy) {
  this.dead = true;
  var U = new Point(0, 0),
    i = 0, l = 0;
  this.direction = 1;
  
  this.points = [
    this.head        = new BodyPart(U, this),
    this.hip         = new BodyPart(U, this),
    this.elbow       = new BodyPart(U, this),
    this.shadowElbow = new BodyPart(U, this),
    this.hand        = new BodyPart(U, this),
    this.shadowHand  = new BodyPart(U, this),
    this.knee        = new BodyPart(U, this),
    this.shadowKnee  = new BodyPart(U, this),
    this.foot        = new BodyPart(U, this),
    this.shadowFoot  = new BodyPart(U, this)
  ];
  
  this.joints = [
    new Joint(this.head,  this.hip, this),
    new Joint(this.head,  this.elbow, this),
    new Joint(this.elbow, this.hand, this),
    new Joint(this.head,  this.shadowElbow, this),
    new Joint(this.shadowElbow, this.shadowHand, this),
    new Joint(this.hip,  this.knee, this),
    new Joint(this.knee, this.foot, this),
    new Joint(this.hip,  this.shadowKnee, this),
    new Joint(this.shadowKnee, this.shadowFoot, this)
  ];
  
  for (i = 0, l = this.points.length; i < l; i++) {
    this.points[i].size = 3;
    this.points[i].B6 = 0.05;
  }
  
  this.head.size = this.hip.size = 8;
  for (i = 0, l = this.joints.length; i < l; i++) {
    this.joints[i].BC = 0.4;
    this.joints[i].BE = 0.7;
  }
  
  for (i in guy) if (guy.hasOwnProperty(i)) {
    this[i].pos.set(guy[i]);
  }
}
(function(p) {
  
  p.draw = function () {
    var head = this.head.pos.toPixel(),
      elbow = this.elbow.pos.toPixel(),
      hand = this.hand.pos.toPixel(),
      shadowElbow = this.shadowElbow.pos.toPixel(),
      shadowHand = this.shadowHand.pos.toPixel(),
      knee = this.knee.pos.toPixel(),
      foot = this.foot.pos.toPixel(),
      shadowKnee = this.shadowKnee.pos.toPixel(),
      shadowFoot = this.shadowFoot.pos.toPixel(),
      hip = this.hip.pos.toPixel();
    
    context.lineWidth = 5 * track.zoom;
    context.strokeStyle = 'rgba(0,0,0,0.5)';
    // Shadow Arm
    context.beginPath();
    context.moveTo(head.x, head.y);
    context.lineTo(shadowElbow.x, shadowElbow.y);
    context.lineTo(shadowHand.x, shadowHand.y);
    // Shadow Leg
    context.moveTo(hip.x, hip.y);
    context.lineTo(shadowKnee.x, shadowKnee.y);
    context.lineTo(shadowFoot.x, shadowFoot.y);
    context.stroke();
    
    context.strokeStyle = '#000';
    // Arm
    context.beginPath();
    context.moveTo(head.x, head.y);
    context.lineTo(elbow.x, elbow.y);
    context.lineTo(hand.x, hand.y);
    // Leg
    context.moveTo(hip.x, hip.y);
    context.lineTo(knee.x, knee.y);
    context.lineTo(foot.x, foot.y);
    context.stroke();
    
    // Body
    context.beginPath();
    context.lineWidth = 8 * track.zoom;
    context.moveTo(hip.x, hip.y);
    context.lineTo(head.x, head.y);
    context.stroke();
    
    // Head
    head.add(head.cloneSub(hip).cloneScale(0.25));
    context.beginPath();
    context.lineWidth = 2 * track.zoom;
    context.moveTo(head.x + 5 * track.zoom, head.y);
    context.arc(head.x, head.y, 5 * track.zoom, 0, PI2, true);
    context.stroke();
    
    var A6 = head.cloneSub(hip),
      A7 = new Point(A6.y, -A6.x),
      AY = new Point(0, 0),
      Aa = new Point(0, 0);
    if (this.direction === 1) {
      AY = head.cloneAdd(A7.cloneScale(0.15)).cloneAdd(A6.cloneScale(-0.05));
      Aa = head.cloneAdd(A7.cloneScale(-0.35)).cloneAdd(A6.cloneScale(0.15));
    }
    else {
      AY = head.cloneAdd(A7.cloneScale(-0.15)).cloneAdd(A6.cloneScale(0.15));
      Aa = head.cloneAdd(A7.cloneScale(0.35)).cloneAdd(A6.cloneScale(-0.05));
    }
    AY = head.cloneAdd(A7.cloneScale(0.15 * this.direction)).cloneAdd(A6.cloneScale(-0.05));
    Aa = head.cloneAdd(A7.cloneScale(-0.35 * this.direction)).cloneAdd(A6.cloneScale(0.15));
    
    // Cap
    //~ context.beginPath();
    //~ context.moveTo(AY.x, AY.y);
    //~ context.lineTo(Aa.x, Aa.y);
    //~ context.stroke();
  };
  
  p.step = function () {
    for (var i = this.joints.length - 1; i >= 0; i--) {
      this.joints[i].step();
    }
    for (i = this.points.length - 1; i >= 0; i--) {
      this.points[i].step();
    }
  };
  
  p.pull = function (upperForce, lowerForce) {
    upperForce.scale(0.7);
    lowerForce.scale(0.7);
    var i, l, len, upper, lower;
    for (i = 0, l = this.joints.length; i < l; i++) {
      len = this.joints[i].getLength();
      if(len > 20) {
        len = 20;
      }
      this.joints[i].A1 = this.joints[i].length = len;
    }
    for (i = 1; i < 5; i++) {
      this.joints[i].A1 = 13;
      this.joints[i].length = 13;
    }
    upper = [this.head,  this.elbow, this.shadowElbow, this.hand, this.shadowHand],
    lower = [this.hip, this.knee, this.shadowKnee, this.foot, this.shadowFoot];
    for (i = 0, l = upper.length; i < l; i++) {
      upper[i].oldPos = upper[i].pos.cloneSub(upperForce);
    }
    for (i = 0, l = lower.length; i < l; i++) {
      lower[i].oldPos = lower[i].pos.cloneSub(lowerForce);
    }
    for (i = this.points.length - 1; i >= 0; i--) {
      this.points[i].speed.set(this.points[i].pos.cloneSub(this.points[i].oldPos));
      this.points[i].speed.x += Math.random() - Math.random();
      this.points[i].speed.y += Math.random() - Math.random();
    }
  };
  
}(DeadRider.prototype));

/** @constructor */
function DeadBike(bike, guy) {
  this.dead = true;
  this.rider = new DeadRider(guy);
  this.rider.pull(bike.head.speed, bike.backWheel.speed);
  this.rider.direction = bike.direction;
  this.rider.gravity = bike.gravity;
  this.gravity = bike.gravity;
  this.time = bike.time;
  this.head = this.rider.head;
  this.bike = bike;
}
(function(p) {
  
  p.draw = function () {
    this.bike.draw();
    this.rider.draw();
    if (this.hat) {
      this.hat.draw();
    }
  };
  
  p.step = function () {
    this.bike.step();
    this.rider.step();
    if (this.hat) {
      this.hat.step();
    }
  };
  
}(DeadBike.prototype));

/** @constructor */
function Remains(pos, gravity, time) {
  this.dead = true;
  this.rotateSpeed = 30 + 20 * Math.random();
  this.pointsf = 0;
  this.pieces = [
    new Shard(pos, this),
    new Shard(pos, this),
    new Shard(pos, this),
    new Shard(pos, this),
    new Shard(pos, this)
  ];
  this.pos = pos.clone();
  this.gravity = gravity;
  this.time = time;
  this.head = new BodyPart(pos, this);
  this.head.speed.x = 20;
}
(function(p) {
  
  p.draw = function () {
    var i, l;
    if (this.rotateSpeed > 0) {
      this.rotateSpeed -= 10;
      var center = this.pos.toPixel(),
        angle = Math.random() * PI2,
        dist = this.rotateSpeed / 2,
        x = center.x + dist * Math.cos(angle),
        y = center.y + dist * Math.sin(angle);
      context.beginPath();
      context.fillStyle = '#ff0';
      context.moveTo(x, y);
      for (i = 1; i < 16; i++) {
        dist = (this.rotateSpeed + 30 * Math.random()) / 2;
        x = center.x + dist * Math.cos(angle + PI2 * i / 16);
        y = center.y + dist * Math.sin(angle + PI2 * i / 16);
        context.lineTo(x, y);
      }
      context.fill();
    }
    for (i = 0, l = this.pieces.length; i < l; i++) {
      this.pieces[i].draw();
    }
  };
  
  p.step = function () {
    for (var i = this.pieces.length - 1; i >= 0; i--) {
      this.pieces[i].step();
    }
  };
  
}(Remains.prototype));

/** @constructor */
function Target(x, y) {
  this.pos = new Point(x, y);
  this.reached = false;
}
(function(p) {
  
  p.draw = function () {
    context.beginPath();
    context.fillStyle = this.reached ? "#FFFFAA" : "#FFFF00";
    context.lineWidth = 2 * track.zoom;
    context.moveTo(this.pos.toPixel().x + 7 * track.zoom, this.pos.toPixel().y);
    context.arc(this.pos.toPixel().x, this.pos.toPixel().y, 7 * track.zoom, 0, PI2, true);
    context.fill();
    context.stroke();
  };
  
  p.touch = function (part) {
    if (!this.reached && part.pos.cloneSub(this.pos).lengthSquared() < 500 && !part.bike.isGhost) {
      this.reached = true;
      track.targetsReached++;
      if (track.numTargets && track.targetsReached === track.numTargets) {
        part.bike.save = true;
      }
    }
  };
  
  p.checkDelete = function (eraserPoint) {
    if (eraserPoint.cloneSub(this.pos).getLength() < eraserSize + 7) {
      track.numTargets--;
      this.remove = true;
      track.remove(this.pos);
    }
  };
  
  p.toString = function () {
    return 'T ' + this.pos.x.toString(32) + ' ' + this.pos.y.toString(32);
  };
}(Target.prototype));

/** @constructor */
function Checkpoint(x, y) {
  this.pos = new Point(x, y);
  this.reached = false;
}
(function(p) {
  
  p.draw = function () {
    context.beginPath();
    context.fillStyle = this.reached ? '#aaf' : '#00f';
    context.moveTo(this.pos.toPixel().x + 7 * track.zoom, this.pos.toPixel().y);
    context.arc(this.pos.toPixel().x, this.pos.toPixel().y, 7 * track.zoom, 0, PI2, true);
    context.fill();
    context.stroke();
  };
  
  p.touch = function (part) {
    if (!this.reached && part.pos.cloneSub(this.pos).lengthSquared() < 500 && !part.bike.isGhost) {
      this.reached = true;
      part.bike.save = true;
    }
  };
  
  p.checkDelete = function (eraserPoint) {
    if (eraserPoint.cloneSub(this.pos).getLength() < eraserSize + 7) {
      this.remove = true;
      track.remove(this.pos);
    }
  };
  
  p.toString = function () {
    return 'C ' + this.pos.x.toString(32) + ' ' + this.pos.y.toString(32);
  };

}(Checkpoint.prototype));

/** @constructor */
function Boost(x, y, rotation) {
  this.rotation = rotation;
  var rad = this.rotation * Math.PI / 180;
  this.pos = new Point(x, y);
  this.direction = new Point(-Math.sin(rad), Math.cos(rad));
}
(function(p) {
  
  p.draw = function () {
    context.beginPath();
    context.fillStyle = '#ff0';
    context.save();
    context.translate(this.pos.toPixel().x, this.pos.toPixel().y);
    context.rotate(this.rotation * Math.PI / 180);
    context.moveTo(-7 * track.zoom, -10 * track.zoom);
    context.lineTo(0, 10 * track.zoom);
    context.lineTo(7 * track.zoom, -10 * track.zoom);
    context.lineTo(-7 * track.zoom, -10 * track.zoom);
    context.fill();
    context.stroke();
    context.restore();
  };
  
  p.touch = function (part) {
    if (part.pos.cloneSub(this.pos).lengthSquared() < 1000) {
      for (var u = 0; u < part.bike.points.length; u++) {
        part.bike.points[u].pos.add(this.direction);
      }
    }
  };

  p.checkDelete = function (eraserPoint) {
    if (eraserPoint.cloneSub(this.pos).getLength() < eraserSize + 7) {
      this.remove = true;
      track.remove(this.pos);
    }
  };
  
  p.toString = function () {
    return "B " + this.pos.x.toString(32) + ' ' + this.pos.y.toString(32) + ' ' + (this.rotation - 180).toString(32);
  };
  
}(Boost.prototype));

/** @constructor */
function Gravity(x, y, rotation) {
  this.rotation = rotation;
  var rad = this.rotation * Math.PI / 180;
  this.pos = new Point(x, y);
  this.direction = new Point(-0.3 * Math.sin(rad), 0.3 * Math.cos(rad));
}
(function(p) {
  
  p.draw = function () {
    context.beginPath();
    context.fillStyle = '#0f0';
    context.save();
    context.translate(this.pos.toPixel().x, this.pos.toPixel().y);
    context.rotate(this.rotation * Math.PI / 180);
    context.moveTo(-7 * track.zoom, -10 * track.zoom);
    context.lineTo(0, 10 * track.zoom);
    context.lineTo(7 * track.zoom, -10 * track.zoom);
    context.lineTo(-7 * track.zoom, -10 * track.zoom);
    context.fill();
    context.stroke();
    context.restore();
  };
  
  p.touch = function (part) {
    if (part.pos.cloneSub(this.pos).lengthSquared() < 1000) {
      part.bike.gravity.set(this.direction);
    }
  };
  
  p.checkDelete = function (eraserPoint) {
    if (eraserPoint.cloneSub(this.pos).getLength() < eraserSize + 7) {
      this.remove = true;
      track.remove(this.pos);
    }
  };
  
  p.toString = function () {
    return 'G ' + this.pos.x.toString(32) + ' ' + this.pos.y.toString(32) + ' ' + (this.rotation - 180).toString(32);
  };
  
}(Gravity.prototype));

/** @constructor */
function SlowMo(x, y) {
  this.pos = new Point(x, y);
}
(function(p) {
  
  p.draw = function () {
    context.beginPath();
    context.moveTo(this.pos.toPixel().x + 7 * track.zoom, this.pos.toPixel().y);
    context.arc(this.pos.toPixel().x, this.pos.toPixel().y, 7 * track.zoom, 0, PI2, true);
    context.stroke();
  };
  
  p.touch = function (part) {
    if (part.pos.cloneSub(this.pos).lengthSquared() < 500) {
      part.bike.slow = true;
    }
  };
  
  p.checkDelete = function (eraserPoint) {
    if (eraserPoint.cloneSub(this.pos).getLength() < eraserSize + 7) {
      this.remove = true;
      track.remove(this.pos);
    }
  };
  
  p.toString = function () {
    return 'S ' + this.pos.x.toString(32) + ' ' + this.pos.y.toString(32);
  };
  
}(SlowMo.prototype));

/** @constructor */
function Bomb(x, y) {
  this.pos = new Point(x, y);
}
(function(p) {
  
  p.draw = function () {
    context.beginPath();
    context.fillStyle = '#f00';
    context.moveTo(this.pos.toPixel().x + 7 * track.zoom, this.pos.toPixel().y);
    context.arc(this.pos.toPixel().x, this.pos.toPixel().y, 7 * track.zoom, 0, PI2, true);
    context.fill();
    context.stroke();
  };
  
  p.touch = function (part) {
    if (part.pos.cloneSub(this.pos).lengthSquared() < 500 && !part.bike.isGhost) {
      bike = new Remains(this.pos, bike.gravity, bike.time);
    }
  };
  
  p.checkDelete = function (eraserPoint) {
    if (eraserPoint.cloneSub(this.pos).getLength() < eraserSize + 7) {
      this.remove = true;
      track.remove(this.pos);
    }
  };
  
  p.toString = function () {
    return 'O ' + this.pos.x.toString(32) + ' ' + this.pos.y.toString(32);
  };
  
}(Bomb.prototype));

/** @constructor */
function Line(x1, y1, x2, y2) {
  this.a = new Point(x1, y1);
  this.b = new Point(x2, y2);
  this.vector = this.b.cloneSub(this.a);
  this.length = this.vector.getLength();
  this.remove = false;
}
(function(p) {
  
  p.custDraw = function (context, CI, CP) {
    context.beginPath();
    context.moveTo(this.a.x * track.zoom - CI, this.a.y * track.zoom - CP);
    context.lineTo(this.b.x * track.zoom - CI, this.b.y * track.zoom - CP);
    context.stroke();
  };
  
  p.touch = function (object) {
    if (this.touched) {
      return this;
    }
    this.touched = true;
    var pos = object.pos,
      AS = object.speed,
      L = object.size,
      N = new Point(0, 0),
      R = 0,
      Ap = pos.cloneSub(this.a),
      Aw = Ap.dotProduct(this.vector) / this.length / this.length;
    if (Aw >= 0 && Aw <= 1) {
      var B2 = (Ap.x * this.vector.y - Ap.y * this.vector.x) * ((Ap.x - AS.x) * this.vector.y - (Ap.y - AS.y) * this.vector.x) < 0 ? -1 : 1;
      N = Ap.cloneSub(this.vector.cloneScale(Aw));
      R = N.getLength();
      if (R < L || B2 < 0) {
        pos.add(N.cloneScale((L * B2 - R) / R));
        object.drive(new Point(-N.y / R, N.x / R));
        return this;
      }
    }
    if (Aw * this.length < -L || Aw * this.length > this.length + L) {
      return this;
    }
    var Bp = Aw > 0 ? this.b : this.a;
    N = pos.cloneSub(Bp);
    R = N.getLength();
    if (R < L) {
      pos.add(N.cloneScale((L - R) / R));
      object.drive(new Point(-N.y / R, N.x / R));
      return this;
    }
  };
  
  p.checkDelete = function (eraserPoint) {
    var C4 = eraserPoint.cloneSub(this.a);
    var B8 = C4.dotProduct(this.vector.cloneReciprocalScale(this.length));
    var Bi = new Point(0, 0);
    if (B8 <= 0) {
      Bi.set(this.a);
    }
    else if (B8 >= this.length) {
      Bi.set(this.b);
    }
    else {
      Bi.set(this.a.cloneAdd(this.vector.cloneReciprocalScale(this.length).cloneScale(B8)));
    }
    var DA = eraserPoint.cloneSub(Bi);
    if (DA.getLength() <= eraserSize) {
      this.remove = true;
      track.remove(this.a, this.b);
    }
    return this;
  };
  
  p.getEnd = function () {
    this.B9 = true;
    var end = ' ' + this.b,
      next = track.grid[Math.floor(this.b.x / track.gridSize)][Math.floor(this.b.y / track.gridSize)].search(this.b, 'line');
    if (next !== undefined) {
      end += next.getEnd();
    }
    return end;
  };
  
}(Line.prototype));

/** @constructor */
function Scenery(x1, y1, x2, y2) {
  this.a = new Point(x1, y1);
  this.b = new Point(x2, y2);
  this.vector = this.b.cloneSub(this.a);
  this.length = this.vector.getLength();
  this.remove = false;
}
(function(p) {
  
  p.custDraw = function (graphic, CI, CP) {
    graphic.beginPath();
    graphic.moveTo(this.a.x * track.zoom - CI, this.a.y * track.zoom - CP);
    graphic.lineTo(this.b.x * track.zoom - CI, this.b.y * track.zoom - CP);
    graphic.stroke();
  };
  
  p.checkDelete = function (eraserPoint) {
    var C4 = eraserPoint.cloneSub(this.a);
    var B8 = C4.dotProduct(this.vector.cloneReciprocalScale(this.length));
    var Bi = new Point(0, 0);
    if (B8 <= 0) {
      Bi.set(this.a);
    }
    else if (B8 >= this.length) {
      Bi.set(this.b);
    }
    else {
      Bi.set(this.a.cloneAdd(this.vector.cloneReciprocalScale(this.length).cloneScale(B8)));
    }
    var DA = eraserPoint.cloneSub(Bi);
    if (DA.getLength() <= eraserSize) {
      this.remove = true;
      track.remove(this.a, this.b);
    }
  };
  
  p.getEnd = function () {
    this.B9 = true;
    var end = ' ' + this.b.x.toString(32) + ' ' + this.b.y.toString(32);
    var next = track.grid[Math.floor(this.b.x / track.gridSize)][Math.floor(this.b.y / track.gridSize)].search(this.b, 'sline');
    if (next !== undefined) {
      end += next.getEnd();
    }
    return end;
  };
  
}(Scenery.prototype));

/** @constructor */
function LineSet() {
  this.lines = [];
  this.scenery = [];
  this.objects = [];
}
(function(p) {
  
  p.touch = function (part) {
    for (var P = this.lines.length - 1; P >= 0; P--) {
      this.lines[P].touch(part);
    }
    if (!part.bike.dead) {
      for (var j = this.objects.length - 1; j >= 0; j--) {
        this.objects[j].touch(part);
      }
    }
    return this;
  };
  
  p.untouch = function () {
    for (var i = 0, l = this.lines.length; i < l; i++) {
      this.lines[i].touched = false;
    }
    return this;
  };
  
  p.remove = function () {
    for (var i = 0, l = this.lines.length; i < l; i++) {
      if (this.lines[i] && this.lines[i].remove) {
        this.lines.splice(i, 1);
        i--;
      }
    }
    for (i = 0, l = this.scenery.length; i < l; i++) {
      if (this.scenery[i].remove) {
        this.scenery.splice(i, 1);
        i--;
      }
    }
    for (i = 0, l = this.objects.length; i < l; i++) {
      if (this.objects[i].remove !== undefined) {
        this.objects.splice(i, 1);
        i--;
      }
    }
    return this;
  };
  
  p.search = function (U, type) {
    var i = 0, l;
    if (type === 'sline') {
      for (l = this.scenery.length; i < l; i++) {
        if (this.scenery[i].a.x === U.x && this.scenery[i].a.y === U.y && this.scenery[i].B9 === undefined) {
          return this.scenery[i];
        }
      }
    }
    else {
      for (l = this.lines.length; i < l; i++) {
        if (this.lines[i].a.x === U.x && this.lines[i].a.y === U.y && this.lines[i].B9 === undefined) {
          return this.lines[i];
        }
      }
    }
  };
  
}(LineSet.prototype));

function gridSpread(_from, _to, q) {
  var lines = [],
    from = new Point(_from.x, _from.y),
    factor = (_to.y - _from.y) / (_to.x - _from.x),
    direction = new Point(_from.x < _to.x ? 1 : -1, _from.y < _to.y ? 1 : -1),
    i = 0;
  lines.push(_from);
  while (i < 5000) {
    if (Math.floor(from.x / q) === Math.floor(_to.x / q) && Math.floor(from.y / q) === Math.floor(_to.y / q)) {
      break;
    }
    var to1 = new Point();
    if (direction.x < 0) {
      to1.x = Math.round(Math.ceil((from.x + 1) / q + direction.x) * q) - 1;
    }
    else {
      to1.x = Math.round(Math.floor(from.x / q + direction.x) * q);
    }
    to1.y = Math.round(_from.y + (to1.x - _from.x) * factor);
    var to2 = new Point();
    if (direction.y < 0) {
      to2.y = Math.round(Math.ceil((from.y + 1) / q + direction.y) * q) - 1;
    }
    else {
      to2.y = Math.round(Math.floor(from.y / q + direction.y) * q);
    }
    to2.x = Math.round(_from.x + (to2.y - _from.y) / factor);
    // Take the shortest line piece
    if (Math.pow(to1.x - _from.x, 2) + Math.pow(to1.y - _from.y, 2) < Math.pow(to2.x - _from.x, 2) + Math.pow(to2.y - _from.y, 2)) {
      from = to1;
      lines.push(to1);
    }
    else {
      from = to2;
      lines.push(to2);
    }
    i++;
  }
  return lines;
}

/** @constructor */
function Track(ID) {
  var rawTrack, i, j, k, l, m, n, line, x, y, I, rawLine;
  
  this.grid = [];
  this.gridSize = 100;
  this.cache = [];
  this.zoom = 0.6;
  this.id = ID;
  context.fillText('Loading track... Please wait.', 36, 16);
  this.focus = new Point(0, 0);
  if (this.id === undefined) {
    rawTrack = '-18 1i 18 1i##';
    toolbar2.style.display = 'block';
    currentTool = 'line';
  }
  else if (this.id.length > 7) {
    rawTrack = this.id;
    this.id = undefined;
    toolbar2.style.display = 'block';
    currentTool = 'line';
  }
  else {
    var request = new XMLHttpRequest();
    request.open('POST', 'tracks/load', false);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.send('id=' + this.id);
    rawTrack = request.responseText;
  }
  var hashSplit = rawTrack.split('#'),
    lines = hashSplit[0].split(',');
  for (i = 0, l = lines.length; i < l; i++) {
    rawLine = lines[i].split(' ');
    if (rawLine.length > 3) {
      for (k = 0, m = rawLine.length - 2; k < m; k += 2) {
        line = new Line(
          parseInt(rawLine[k], 32), parseInt(rawLine[k + 1], 32),
          parseInt(rawLine[k + 2], 32), parseInt(rawLine[k + 3], 32)
        );
        if (line.length >= 2 && line.length < 100000) {
          I = gridSpread(line.a.clone(), line.b.clone(), this.gridSize);
          for (j = 0, n = I.length; j < n; j++) {
            x = Math.floor(I[j].x / this.gridSize);
            y = Math.floor(I[j].y / this.gridSize);
            if (!this.grid[x]) {
              this.grid[x] = [];
            }
            if (!this.grid[x][y]) {
              this.grid[x][y] = new LineSet(x, y);
            }
            this.grid[x][y].lines.push(line);
          }
        }
      }
    }
  }
  var scenery = hashSplit[1].split(',');
  for (i = 0, l = scenery.length; i < l; i++) {
    rawLine = scenery[i].split(' ');
    if (rawLine.length > 3) {
      for (k = 0, m = rawLine.length - 2; k < m; k += 2) {
        line = new Scenery(
          parseInt(rawLine[k], 32), parseInt(rawLine[k + 1], 32),
          parseInt(rawLine[k + 2], 32), parseInt(rawLine[k + 3], 32)
        );
        if (line.length >= 2 && line.length < 100000) {
          I = gridSpread(line.a.clone(), line.b.clone(), this.gridSize);
          for (j = 0, n = I.length; j < n; j++) {
            x = Math.floor(I[j].x / this.gridSize);
            y = Math.floor(I[j].y / this.gridSize);
            if (this.grid[x] === undefined) {
              this.grid[x] = [];
            }
            if (this.grid[x][y] === undefined) {
              this.grid[x][y] = new LineSet();
            }
            this.grid[x][y].scenery.push(line);
          }
        }
      }
    }
  }
  this.numTargets = 0;
  this.targetsReached = 0;
  this.objects = [];
  var objects = hashSplit[2].split(','), item;
  for (i = 0, l = objects.length; i < l; i++) {
    var rawCoords = objects[i].split(' ');
    if (rawCoords.length > 2) {
      x = parseInt(rawCoords[1], 32);
      y = parseInt(rawCoords[2], 32);
      switch (rawCoords[0]) {
      case 'T':
        item = new Target(x, y);
        this.numTargets++;
        this.objects.push(item);
        break;
      case 'C':
        item = new Checkpoint(x, y);
        this.objects.push(item);
        break;
      case 'B':
        item = new Boost(x, y, parseInt(rawCoords[3], 32) + 180);
        break;
      case 'G':
        item = new Gravity(x, y, parseInt(rawCoords[3], 32) + 180);
        break;
      case 'O':
        item = new Bomb(x, y);
        break;
      case 'S':
        item = new SlowMo(x, y);
        break;
      default:
        ;
      }
      if (item) {
        x = Math.floor(x / this.gridSize);
        y = Math.floor(y / this.gridSize);
        if (this.grid[x] === undefined) {
          this.grid[x] = [];
        }
        if (this.grid[x][y] === undefined) {
          this.grid[x][y] = new LineSet(x, y);
        }
        this.grid[x][y].objects.push(item);
      }
    }
  }
  if (hashSplit[3] === 'MTB' || hashSplit[3] === 'BMX' || hashSplit[3] === 'SKT') {
    currentBike = hashSplit[3];
    this.time = hashSplit[4] !== '' ? hashSplit[4] : false;
  }
  else {
    this.time = hashSplit[3] !== '' ? hashSplit[3] : false;
  }
}
(function(p) {
  
  p.popCheckpoint = function () {
    if (bmxConstants.length > 1) {
      bmxConstants.pop();
    }
    if (mtbConstants.length > 1) {
      mtbConstants.pop();
    }
    if (ghost && ghostConstants.length > 1) {
      ghostConstants.pop();
    }
  };
  
  p.restart = function () {
    this.resetCheckpoints();
    paused = false;
    bike = new (currentBike === 'BMX' ? BMX : MTB)();
    focus = bike.head;
    if (ghost) {
      ghost = this.AT[6] === 'BMX' ? new BMXGhost(this.AT) : new MTBGhost(this.AT);
      if (ghostConstants.length === 1 && !up) {
        focus = ghost.head;
      }
    }
    if (this.id !== 'banner') {
      this.focus = new Point(bike.head.pos.x, bike.head.pos.y);
    }
  };
  
  p.reset = function () {
    bmxConstants = [[
      0, -1, 0, -1, 0, 0, -21, 38, -21, 38, 0, 0, 0, 21, 38, 21, 38, 0, 0, 0, 45, 42, 45, 1, 0, 0.3, false, 0, [], 0
    ]];
    mtbConstants = [[
      2, -3, 2, -3, 0, 0, -23, 35, -23, 35, 0, 0, 0, 23, 35, 23, 35, 0, 0, 0, 47, 45, 45, 1, 0, 0.3, false, 0, [], 0
    ]];
    if (ghost) {
      ghostConstants = (this.AT[6] === 'BMX' ? bmxConstants : mtbConstants).clone();
    }
    this.restart();
  };
  
  p.resetCheckpoints = function () {
    for (var x in this.grid) if(this.grid.hasOwnProperty(x)) {
      for (var y in this.grid[x]) if(this.grid[x].hasOwnProperty(y)) {
        for (var i = 0, l = this.grid[x][y].objects.length; i < l; i++) {
          if (this.grid[x][y].objects[i].reached !== undefined) {
            this.grid[x][y].objects[i].reached = false;
          }
        }
      }
    }
  };
  
  p.touch = function (part) {
    var x = Math.floor(part.pos.x / this.gridSize - 0.5),
      y = Math.floor(part.pos.y / this.gridSize - 0.5);
    if (this.grid[x] !== undefined) {
      if (this.grid[x][y] !== undefined) {
        this.grid[x][y].untouch();
      }
      if (this.grid[x][y + 1] !== undefined) {
        this.grid[x][y + 1].untouch();
      }
    }
    if (this.grid[x + 1] !== undefined) {
      if (this.grid[x + 1][y] !== undefined) {
        this.grid[x + 1][y].untouch();
      }
      if (this.grid[x + 1][y + 1] !== undefined) {
        this.grid[x + 1][y + 1].untouch();
      }
    }
    if (this.grid[x] !== undefined && this.grid[x][y] !== undefined) {
      this.grid[x][y].touch(part);
    }
    if (this.grid[x + 1] !== undefined) {
      if (this.grid[x + 1][y] !== undefined) {
        this.grid[x + 1][y].touch(part);
      }
      if (this.grid[x + 1][y + 1] !== undefined) {
        this.grid[x + 1][y + 1].touch(part);
      }
    }
    if (this.grid[x] !== undefined && this.grid[x][y + 1] !== undefined) {
      this.grid[x][y + 1].touch(part);
    }
    return this;
  };
  
  p.draw = function () {
    if (focus && this.id !== 'banner') {
      this.focus.add(focus.pos.cloneSub(this.focus).cloneReciprocalScale(5));
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    if(this.bg) {
      context.speedlobalAlpha = 0.7;
      this.bg.draw();
      context.speedlobalAlpha = 1;
    }
    context.lineWidth = Math.max(2 * this.zoom, 0.5);
    if (snapFromPrevLine && (currentTool === 'line' || currentTool === 'scenery line' || currentTool === 'brush' || currentTool === 'scenery brush')) {
      var norm = mousePos.toPixel();
      if (norm.x < 50) {
        track.focus.x -= 10 / this.zoom;
        mousePos.x -= 10 / this.zoom;
      }
      else if (norm.x > canvas.width - 50) {
        track.focus.x += 10 / this.zoom;
        mousePos.x += 10 / this.zoom;
      }
      if (norm.y < 50) {
        track.focus.y -= 10 / this.zoom;
        mousePos.y -= 10 / this.zoom;
      }
      else if (norm.y > canvas.height - 50) {
        track.focus.y += 10 / this.zoom;
        mousePos.y += 10 / this.zoom;
      }
      context.beginPath();
      context.strokeStyle = '#f00';
      context.moveTo(lastClick.toPixel().x, lastClick.toPixel().y);
      context.lineTo(mousePos.toPixel().x, mousePos.toPixel().y);
      context.stroke();
    }
    var center = new Point(0, 0).normalizeToCanvas(),
      border = new Point(canvas.width, canvas.height).normalizeToCanvas();
    center.x = Math.floor(center.x / this.gridSize);
    center.y = Math.floor(center.y / this.gridSize);
    border.x = Math.floor(border.x / this.gridSize);
    border.y = Math.floor(border.y / this.gridSize);
    var DI = [], i, l, x, y;
    for (x = center.x; x <= border.x; x++) {
      for (y = center.y; y <= border.y; y++) {
        if (this.grid[x] !== undefined && this.grid[x][y] !== undefined) {
          if (this.grid[x][y].lines.length > 0 || this.grid[x][y].scenery.length > 0) {
            DI[x + '_' + y] = 1;
            if (this.cache[x + '_' + y] === undefined) {
              var el = this.cache[x + '_' + y] = document.createElement('canvas');
              el.width = this.gridSize * this.zoom;
              el.height = this.gridSize * this.zoom;
              var graphic = el.getContext('2d');
              graphic.lineCap = 'round';
              graphic.lineWidth = Math.max(2 * this.zoom, 0.5);
              graphic.strokeStyle = '#aaa';
              for (i = 0, l = this.grid[x][y].scenery.length; i < l; i++) {
                this.grid[x][y].scenery[i].custDraw(graphic, x * this.gridSize * this.zoom, y * this.gridSize * this.zoom);
              }
              graphic.strokeStyle = '#000';
              if (shadeLines) {
                graphic.shadowOffsetX = 2;
                graphic.shadowOffsetY = 2;
                graphic.shadowBlur = Math.max(2, 10 * this.zoom);
                graphic.shadowColor = '#000';
              }
              for (i = 0, l = this.grid[x][y].lines.length; i < l; i++) {
                this.grid[x][y].lines[i].custDraw(this.cache[x + '_' + y].getContext('2d'), x * this.gridSize * this.zoom, y * this.gridSize * this.zoom);
              }
            }
            context.drawImage(
              this.cache[x + '_' + y],
              Math.floor(canvas.width  / 2 - this.focus.x * this.zoom + x * this.gridSize * this.zoom),
              Math.floor(canvas.height / 2 - this.focus.y * this.zoom + y * this.gridSize * this.zoom)
            );
          }
          context.strokeStyle = '#000';
          for (i = 0, l = this.grid[x][y].objects.length; i < l; i++) {
            this.grid[x][y].objects[i].draw();
          }
        }
      }
    }
    for (var Ay in this.cache) {
      if (DI[Ay] === undefined) {
        delete this.cache[Ay];
      }
    }
    if (canvas.width === 250) {
      return;
    }
    if (currentTool !== 'camera' && !focus) {
      switch (currentTool) {
      case 'line':  case 'scenery line':
      case 'brush': case 'scenery brush':
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = '#000';
        x = mousePos.toPixel().x;
        y = mousePos.toPixel().y;
        context.moveTo(x - 10, y);
        context.lineTo(x + 10, y);
        context.moveTo(x, y + 10);
        context.lineTo(x, y - 10);
        context.stroke();
        break;
      case 'eraser':
        context.beginPath();
        context.fillStyle = '#ffb6c1';
        context.arc(mousePos.toPixel().x, mousePos.toPixel().y, (eraserSize - 1) * this.zoom, 0, PI2, true);
        context.fill();
        break;
      case 'goal': case 'checkpoint': case 'bomb':
        context.beginPath();
        context.fillStyle = currentTool === 'goal' ? '#ff0' : currentTool === 'checkpoint' ? '#00f' : '#f00';
        context.arc(mousePos.toPixel().x, mousePos.toPixel().y, 7 * this.zoom, 0, PI2, true);
        context.fill();
        context.stroke();
        break;
      case 'boost': case 'gravity':
        context.beginPath();
        context.fillStyle = currentTool === 'boost' ? '#ff0' : '#0f0';
        context.save();
        if (!snapFromPrevLine) {
          context.translate(mousePos.toPixel().x, mousePos.toPixel().y);
        }
        else {
          context.translate(lastClick.toPixel().x, lastClick.toPixel().y);
          context.rotate(Math.atan2(-(mousePos.x - lastClick.x), mousePos.y - lastClick.y));
        }
        context.moveTo(-7 * track.zoom, -10 * track.zoom);
        context.lineTo(0, 10 * track.zoom);
        context.lineTo(7 * track.zoom, -10 * track.zoom);
        context.lineTo(-7 * track.zoom, -10 * track.zoom);
        context.fill();
        context.stroke();
        context.restore();
        break;
      default:
        ;
      }
    }
    context.beginPath();
    context.fillStyle = '#ff0';
    context.lineWidth = 1;
    context.arc(40, 12, 3.5, 0, PI2, true);
    context.fill();
    context.stroke();
    context.beginPath();
    context.lineWidth = 10;
    context.strokeStyle = '#fff';
    context.fillStyle = '#000';
    var text = '';
    if (paused) {
      text = 'Game paused';
    }
    else if (bike.dead) {
      text = 'Press ENTER to restart' + (bmxConstants.length + mtbConstants.length > 1 ? ' or BACKSPACE to cancel Checkpoint' : '');
    }
    else if (this.id === undefined || this.id === 'banner') {
      text = 'CANVAS RIDER RC7';
      if (this.id === undefined) {
        if (gridDetail === 10 && (currentTool === 'line' || currentTool === 'scenery line' || currentTool === 'brush' || currentTool === 'scenery brush')) {
          text += ' - Grid ';
        }
        text += ' - ' + currentTool;
        if (currentTool === 'brush' || currentTool === 'scenery brush') {
          text += ' ( size ' + drawingSize + ' )';
        }
      }
      if (label && label[0] && !label[1]) {
        text = 'CANVAS RIDER RC7';
      }
    }
    else {
      var minutes = Math.floor(bike.time / 60000),
        seconds = Math.floor(bike.time % 60000 / 1000),
        millis = Math.floor((bike.time - minutes * 60000 - seconds * 1000) / 100);
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      if (seconds < 10) {
        seconds = '0' + seconds;
      }
      var text = minutes + ':' + seconds + '.' + millis;
    }
    if (label && !label[0] && !label[1]) {
      text += ' - ' + (paused ? 'Unpause' : 'Pause') + ' ( SPACE )';
    }
    context.strokeText(': ' + this.targetsReached + ' / ' + this.numTargets + '  -  ' + text, 50, 16);
    context.fillText(': ' + this.targetsReached + ' / ' + this.numTargets + '  -  ' + text, 50, 16);
    if (label) {
      if (!label[0]) {
        context.strokeText(label[2], 36, 15 + label[1] * 25);
        context.fillText(label[2], 36, 15 + label[1] * 25);
      }
      else {
        context.textAlign = 'right';
        if (document.documentElement.offsetHeight <= window.innerHeight) {
          context.strokeText(label[2], canvas.width - 36, 15 + label[1] * 25);
          context.fillText(label[2], canvas.width - 36, 15 + label[1] * 25);
        }
        else {
          context.strokeText(label[2], canvas.width - 51, 15 + label[1] * 25);
          context.fillText(label[2], canvas.width - 51, 15 + label[1] * 25);
        }
        context.textAlign = 'left';
      }
    }
    return this;
  };
  
  p.checkDelete = function (eraserPoint) {
    var x = Math.floor(eraserPoint.x / this.gridSize - 0.5),
      y = Math.floor(eraserPoint.y / this.gridSize - 0.5),
      Ix = this.grid[x],
      Ix1 = this.grid[x + 1],
      Ixy, Ixy1, Ix1y, Ix1y1,
      i, l;
    if (Ix !== undefined) {
      Ixy  = Ix[y];
      Ixy1 = Ix[y + 1];
      if (Ixy !== undefined) {
        for (i = 0, l = Ixy.lines.length; i < l; i++) {
          Ixy.lines[i].checkDelete(eraserPoint);
        }
        for (i = 0, l = Ixy.scenery.length; i < l; i++) {
          Ixy.scenery[i].checkDelete(eraserPoint);
        }
        for (i = 0, l = Ixy.objects.length; i < l; i++) {
          Ixy.objects[i].checkDelete(eraserPoint);
        }
      }
      if (Ixy1 !== undefined) {
        for (i = 0, l = Ixy1.lines.length; i < l; i++) {
          Ixy1.lines[i].checkDelete(eraserPoint);
        }
        for (i = 0, l = Ixy1.scenery.length; i < l; i++) {
          Ixy1.scenery[i].checkDelete(eraserPoint);
        }
        for (i = 0, l = Ixy1.objects.length; i < l; i++) {
          Ixy1.objects[i].checkDelete(eraserPoint);
        }
      }
    }
    if (Ix1 !== undefined) {
      Ix1y = Ix1[y];
      Ix1y1 = Ix1[y + 1]
      if (Ix1y !== undefined) {
        for (i = 0, l = Ix1y.lines.length; i < l; i++) {
          Ix1y.lines[i].checkDelete(eraserPoint);
        }
        for (i = 0, l = Ix1y.scenery.length; i < l; i++) {
          Ix1y.scenery[i].checkDelete(eraserPoint);
        }
        for (i = 0, l = Ix1y.objects.length; i < l; i++) {
          Ix1y.objects[i].checkDelete(eraserPoint);
        }
      }
      if (Ix1y1 !== undefined) {
        for (i = 0, l = Ix1y1.lines.length; i < l; i++) {
          Ix1y1.lines[i].checkDelete(eraserPoint);
        }
        for (i = 0, l = Ix1y1.scenery.length; i < l; i++) {
          Ix1y1.scenery[i].checkDelete(eraserPoint);
        }
        for (i = 0, l = Ix1y1.objects.length; i < l; i++) {
          Ix1y1.objects[i].checkDelete(eraserPoint);
        }
      }
    }
    for (i = 0, l = this.objects.length; i < l; i++) {
      if (this.objects[i].remove !== undefined) {
        this.objects.splice(i--, 1);
      }
    }
  };
  
  p.remove = function (Av, BZ) {
    if (BZ === undefined) {
      BZ = Av;
    }
    var I = gridSpread(Av, BZ, this.gridSize);
    for (var i = 0, l = I.length; i < l; i++) {
      var x = Math.floor(I[i].x / this.gridSize),
        y = Math.floor(I[i].y / this.gridSize);
      this.grid[x][y].remove();
      delete this.cache[x + '_' + y];
    }
  };
  
  p.shortenLastLineSet = function () {
    if (currentTool === 'scenery line' || currentTool === 'scenery brush') {
      var x = Math.floor(lastScenery.x / this.gridSize),
        y = Math.floor(lastScenery.y / this.gridSize),
        line = this.grid[x][y].scenery[this.grid[x][y].scenery.length - 1];
      if (line && line.b.x === Math.round(lastScenery.x) && line.b.y === Math.round(lastScenery.y)) {
        line.remove = true;
        lastScenery.set(line.a);
        this.remove(line.a, line.b);
      }
      else {
        alert('No more scenery line to erase!');
      }
    }
    else {
      var x = Math.floor(lastForeground.x / this.gridSize),
        y = Math.floor(lastForeground.y / this.gridSize),
        line = this.grid[x][y].lines[this.grid[x][y].lines.length - 1];
      if (line !== undefined && line.b.x === Math.round(lastForeground.x) && line.b.y === Math.round(lastForeground.y)) {
        line.remove = true;
        lastForeground.set(line.a);
        this.remove(line.a, line.b);
      }
      else {
        alert('No more line to erase!');
      }
    }
  };
  
  p.toString = function () {
    var lines = '',
      scenery = '',
      objects = '';
    for (var x in this.grid) {
      for (var y in this.grid[x]) if(this.grid[x][y].lines) {
        for (var P = 0; P < this.grid[x][y].lines.length; P++) {
          if (this.grid[x][y].lines[P].B9 === undefined) {
            lines += this.grid[x][y].lines[P].a + this.grid[x][y].lines[P].getEnd() + ',';
          }
        }
        for (var v = 0; v < this.grid[x][y].scenery.length; v++) {
          if (this.grid[x][y].scenery[v].B9 === undefined) {
            scenery += this.grid[x][y].scenery[v].a + this.grid[x][y].scenery[v].getEnd() + ',';
          }
        }
        for (var j = 0; j < this.grid[x][y].objects.length; j++) {
          objects += this.grid[x][y].objects[j] + ',';
        }
      }
    }
    for (var x in this.grid) {
      for (var y in this.grid[x]) if(this.grid[x][y].lines) {
        for (var P = 0; P < this.grid[x][y].lines.length; P++) {
          this.grid[x][y].lines[P].B9 = undefined;
        }
        for (var v = 0; v < this.grid[x][y].scenery.length; v++) {
          this.grid[x][y].scenery[v].B9 = undefined;
        }
      }
    }
    return lines.substr(0, lines.length - 1) + '#'
         + scenery.substr(0, scenery.length - 1) + '#'
         + objects.substr(0, objects.length - 1) + '#'
         + currentBike;
  };
  
}(Track.prototype));

if (!document.createElement('canvas').getContext) {
  location.href = 'http://canvasrider.com/error';
}

var canvas = document.getElementById('canvas_rider'),
  context = canvas.getContext('2d');
context.lineCap = 'round';
context.lineJoin = 'round';
context.font = '8px eiven';

context.setPixel = function(x, y, c) {
  var o = context.fillStyle;
  context.fillStyle = c;
  context.beginPath();
  context.moveTo(x, y);
  context.arc(x, y, 2, 0, PI2, false);
  context.fill();
  context.fillStyle = o;
};

var track, paused = false, currentBike = 'BMX',
  bmxConstants = [[
    0, -1, 0, -1, 0, 0, -21, 38, -21, 38, 0, 0, 0, 21, 38, 21, 38, 0, 0, 0, 45, 42, 45, 1, 0, 0.3, false, 0, [], 0
  ]],
  mtbConstants = [[
    2, -3, 2, -3, 0, 0, -23, 35, -23, 35, 0, 0, 0, 23, 35, 23, 35, 0, 0, 0, 47, 45, 45, 1, 0, 0.3, false, 0, [], 0
  ]],
  ghostConstants,
  keys = [[], [], [], [], []],
  left = 0, right = 0, up = 0, down = 0,
  turn = 0,
  Ct = true,
  focus, bike,
  snapFromPrevLine = false,
  lastClick = new Point(40, 50), mousePos = new Point(0, 0),
  ghost = false,
  drawingSize = 20, eraserSize = 15,
  shift = false,
  currentTool = 'camera', lastTool = 'camera',
  backToLastTool = false,
  label = false,
  gridDetail = 1,
  intv, instances = [],
  shadeLines = false,
  hints = [
    ['', 'Restart ( ENTER )', 'Cancel Checkpoint ( BACKSPACE )', '', 'Switch bike ( B - Arrows to control, Z to turn )', '', 'Enable line shading', 'Enable fullscreen ( F )'],
    ['Brush ( A - Hold to snap, hold & scroll to adjust size )', 'Scenery brush ( S - Hold to snap, hold & scroll to adjust size )', 'Lines ( backWheel - Hold to snap )', 'Scenery lines ( W - Hold to snap )', 'Eraser ( E - Hold & scroll to adjust size )', 'Camera ( R - Release or press again to switch back, scroll to zoom )', 'Enable grid snapping ( G )', '', 'Goal', 'Checkpoint', 'Boost', 'Gravity modifier', 'Bomb', '', 'Shorten last set of lines ( Z )']
  ],
  lastForeground = new Point(40, 50),
  lastScenery = new Point(-40, 50),
  trackcode = document.getElementById("trackcode"),
  charcount = document.getElementById("charcount"),
  contentElement = document.getElementById('content'),
  newButton = document.getElementById('new'),
  loadButton = document.getElementById('load'),
  saveButton = document.getElementById('save'),
  uploadButton = document.getElementById('upload'),
  toolbar1 = document.getElementById('toolbar1'),
  toolbar2 = document.getElementById('toolbar2');

toolbar1.style.top = canvas.offsetTop + 'px';
toolbar1.style.left = canvas.offsetLeft + 'px';
toolbar1.style.display = 'block';

toolbar2.style.top = canvas.offsetTop + 'px';
toolbar2.style.left = canvas.offsetLeft + canvas.width - 22 + 'px';

function canvas_ride(id) {
  track = new Track(id);
  bike = new (currentBike === 'BMX' ? BMX : MTB);
  focus = bike.head;
  instances.push(step);
}

intv = setInterval(function () {
  instances.forEach(function (fn) { fn.call() });
}, 40);

function step() {
  if (!paused) {
    bike.step();
    if (ghost) {
      ghost.step();
    }
  }
  track.draw();
  bike.draw();
  if (ghost) {
    ghost.draw();
  }
  if (!paused) {
    bike.time += 40;
  }
}

function watchGhost(ID) {
  var request = new XMLHttpRequest();
  request.open("POST", "js/load.php", false);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.send("track=" + track.id + "&ghost=" + ID);
  var ghostCode = request.responseText,
    CJ = ghostCode.split(',');
  track.AT = [[], [], [], [], [], CJ[5], CJ[6]];
  for (var BD = 0, DT, Ay; BD < CJ.length - 2; BD++) {
    DT = CJ[BD].split(' ');
    for (Ay = 0; Ay < DT.length - 1; Ay++) {
      track.AT[BD][DT[Ay]] = 1;
    }
  }
  ghost = CJ[5];
  track.reset();
}

function switchBikes() {
  currentBike = currentBike === 'BMX' ? 'MTB' : 'BMX';
  track.reset();
}

function toggleFullscreen() {
  if (canvas.width === 700) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.border = 'none';
    if (document.documentElement.offsetHeight <= window.innerHeight) {
      toolbar2.style.left = canvas.width - 24 + 'px';
    }
    else {
      toolbar2.style.left = canvas.width - 39 + 'px';
    }
    label[2] = hints[0][7] = 'Disable fullscreen ( ESC or F )';
    window.scrollTo(0, 0);
    canvas.style.zIndex = 3;
    toolbar1.style.zIndex = toolbar2.style.zIndex = 4;
  }
  else {
    canvas.width = 700;
    canvas.height = 400;
    canvas.style.position = 'static';
    canvas.style.border = '1px solid black';
    toolbar2.style.left = canvas.offsetLeft + canvas.width - 22 + 'px';
    label[2] = hints[0][7] = 'Enable fullscreen ( F )';
    canvas.style.zIndex = 2;
    toolbar1.style.zIndex = toolbar2.style.zIndex = 2;
  }
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.font = '8px eiven';
  toolbar1.style.top = toolbar2.style.top = canvas.offsetTop + 'px';
  toolbar1.style.left = canvas.offsetLeft + 'px';
}

document.onkeydown = function (event) {
  switch (event.keyCode) {
  case 8:
    // backspace
    if (canvas.width !== 250) {
      event.preventDefault();
    }
    track.popCheckpoint();
    track.restart();
    break;
  case 13:
    // enter
    event.preventDefault();
    track.restart();
    break;
  case 37:
    // left
    event.preventDefault();
    focus = bike.head;
    left = 1;
    break;
  case 39:
    // right
    event.preventDefault();
    focus = bike.head;
    right = 1;
    break;
  case 38:
    // up
    event.preventDefault();
    focus = bike.head;
    up = 1;
    break;
  case 40:
    // down
    event.preventDefault();
    focus = bike.head;
    down = 1;
    break;
  case 109:
    // minus
    if (track.zoom > 0.2) {
      track.zoom = Math.round(track.zoom * 10 - 2) / 10;
      track.cache = {};
    }
    break;
  case 107:
    // plus
    if (track.zoom < 4) {
      track.zoom = Math.round(track.zoom * 10 + 2) / 10;
      track.cache = {};
    }
    break;
  case 90:
    // Z
    if (!focus && track.id === undefined) {
      track.shortenLastLineSet();
    }
    else if (Ct) {
      turn = 1;
    }
    break;
  case 32:
    // space
    if (canvas.width !== 250) {
      event.preventDefault();
    }
    paused = !paused;
    break;
  default:
    ;
  }
  if (track.id === undefined) {
    switch (event.keyCode) {
    case 65:
      // A
      if (currentTool !== 'brush') {
        currentTool = 'brush';
        document.body.style.cursor = 'none';
        shift = true;
      }
      else if (!snapFromPrevLine) {
        snapFromPrevLine = true;
        lastClick.set(lastForeground);
        shift = true;
      }
      break;
    case 83:
      // S
      if (currentTool !== 'scenery brush') {
        currentTool = 'scenery brush';
        document.body.style.cursor = 'none';
        shift = true;
      }
      else if (!snapFromPrevLine) {
        snapFromPrevLine = true;
        lastClick.set(lastScenery);
        shift = true;
      }
      break;
    case 81:
      // Q
      if (currentTool !== 'line') {
        currentTool = 'line';
        document.body.style.cursor = 'none';
      }
      else if (!snapFromPrevLine) {
        snapFromPrevLine = true;
        lastClick.set(lastForeground);
        shift = true;
      }
      break;
    case 87:
      // W
      if (currentTool !== 'scenery line') {
        currentTool = 'scenery line';
        document.body.style.cursor = 'none';
      }
      else if (!snapFromPrevLine) {
        snapFromPrevLine = true;
        lastClick.set(lastScenery);
        shift = true;
      }
      break;
    case 69:
      // E
      currentTool = 'eraser';
      document.body.style.cursor = 'none';
      shift = true;
      break;
    case 82:
      // R
      if (currentTool !== 'camera') {
        lastTool = currentTool;
        currentTool = 'camera';
        document.body.style.cursor = 'move';
      }
      else {
        backToLastTool = true;
      }
      break;
    default:
      ;
    }
  }
};
document.onkeypress = function (event) {
  switch (event.keyCode) {
  case 13:
    // enter
  case 37:
    // left
  case 39:
    // right
  case 38:
    // up
  case 40:
    // down
    event.preventDefault();
    break;
  case 8:
    // backspace
  case 32:
    // space
    if (canvas.width !== 250) {
      event.preventDefault();
    }
    break;
  default:
    ;
  }
};
document.onkeyup = function (event) {
  switch (event.keyCode) {
  case 70:
  case 27:
    // esc, f
    toggleFullscreen();
    break;
  case 66:
    // B
    switchBikes();
    break;
  case 37:
    left = 0;
    break;
  case 39:
    right = 0;
    break;
  case 38:
    up = 0;
    break;
  case 40:
    down = 0;
    break;
  case 90:
    // Z
    Ct = true;
    break;
  case 71:
    // grid snapping (pos)
    if (gridDetail === 1) {
      gridDetail = 10;
      hints[1][6] = "Disable grid snapping ( G )";
    }
    else {
      gridDetail = 1;
      hints[1][6] = "Enable grid snapping ( G )";
    }
    break;
  case 82:
    // R (camera toggle)
    if (backToLastTool) {
      currentTool = lastTool;
      document.body.style.cursor = 'none';
      backToLastTool = false;
    }
    break;
  case 49:
    // 1
  case 50:
    // 2
  case 51:
    // 3
  case 52:
    // 4
  case 53:
    // 5
    if (track.id !== undefined) {
      watchGhost(event.keyCode - 48);
    }
    break;
  case 81:
    // backWheel
  case 87:
    // W
  case 69:
    // E
  case 83:
    // S
  case 65:
    // A
    if (shift) {
      shift = false;
      snapFromPrevLine = false;
    }
    break;
  default:
    ;
  }
};
toolbar1.onmousemove = function (event) {
  var pos = Math.floor((event.clientY - toolbar1.offsetTop + window.pageYOffset) / 25);
  label = [0, pos, hints[0][pos]];
};
toolbar2.onmousemove = function (event) {
  var pos = Math.floor((event.clientY - toolbar2.offsetTop + window.pageYOffset) / 25);
  label = [1, pos, hints[1][pos]];
  if (pos === 14) {
    if (currentTool === 'sline' || currentTool === 'sbrush') {
      label[2] = 'Shorten last set of scenery lines ( Z )';
    }
  }
};
toolbar1.onmousedown = function (event) {
  focus = false;
  switch (Math.floor((event.clientY - toolbar1.offsetTop + window.pageYOffset) / 25) + 1) {
  case 1:
    paused = !paused;
    break;
  case 3:
    track.popCheckpoint();
  case 2:
    track.restart();
    break;
  case 5:
    switchBikes();
    break;
  case 7:
    if (!shadeLines) {
      shadeLines = true;
      label[2] = hints[0][6] = "Disable line shading";
    }
    else {
      shadeLines = false;
      label[2] = hints[0][6] = "Enable line shading";
    }
    track.cache = [];
    break;
  case 8:
    toggleFullscreen();
    break;
  default:
    ;
  }
};
toolbar2.onmousedown = function (event) {
  if (track.id !== undefined) return false;
  focus = false;
  switch (Math.floor((event.clientY - toolbar1.offsetTop + window.pageYOffset) / 25) + 1) {
  case 1:
    currentTool = 'brush';
    break;
  case 2:
    currentTool = 'scenery brush';
    break;
  case 3:
    currentTool = 'line';
    break;
  case 4:
    currentTool = 'scenery line';
    break;
  case 5:
    currentTool = 'eraser';
    break;
  case 6:
    currentTool = 'camera';
    break;
  case 7:
    if (gridDetail === 1) {
      gridDetail = 10;
      label[2] = hints[1][6] = "Disable grid snapping ( G )";
    }
    else {
      gridDetail = 1;
      label[2] = hints[1][6] = "Enable grid snapping ( G )";
    }
    break;
  case 9:
    currentTool = 'goal';
    break;
  case 10:
    currentTool = 'checkpoint';
    break;
  case 11:
    currentTool = 'boost';
    break;
  case 12:
    currentTool = 'gravity';
    break;
  case 13:
    currentTool = 'bomb';
    break;
  case 14: currentTool = 'curve'; break;
  case 15:
    track.shortenLastLineSet();
    break;
  default:
    ;
  }
};
canvas.onmouseover = function () {
  label = false;
  document.body.style.cursor = currentTool === 'camera' ? 'move' : 'none';
};
canvas.onmousedown = function (event) {
  snapFromPrevLine = true;
  focus = false;
  if (!shift) {
    lastClick.set(mousePos);
  }
  switch (currentTool) {
  case 'curve':
    
    break;
  case 'boost':
  case 'gravity':
    document.body.style.cursor = 'crosshair';
    break;
  case 'eraser':
    track.checkDelete(mousePos);
    break;
  case 'goal':
    var item = new Target(lastClick.x, lastClick.y);
    track.numTargets++;
    track.objects.push(item);
    break;
  case 'checkpoint':
    var item = new Checkpoint(lastClick.x, lastClick.y);
    track.objects.push(item);
    break;
  case 'bomb':
    var item = new Bomb(lastClick.x, lastClick.y);
    break;
  case 'brush':
  case 'scenery brush':
    if (shift) {
      if (currentTool === 'brush') {
        var P = new Line(lastClick.x, lastClick.y, mousePos.x, mousePos.y);
      }
      else {
        var P = new Scenery(lastClick.x, lastClick.y, mousePos.x, mousePos.y);
      }
      if (P.length >= 2 && P.length < 100000) {
        var I = gridSpread(new Point(P.a.x, P.a.y), new Point(P.b.x, P.b.y), track.gridSize);
        for (var T = 0; T < I.length; T++) {
          var x = Math.floor(I[T].x / track.gridSize);
          var y = Math.floor(I[T].y / track.gridSize);
          if (track.grid[x] === undefined) {
            track.grid[x] = [];
          }
          if (track.grid[x][y] === undefined) {
            track.grid[x][y] = new LineSet;
          }
          if (currentTool === 'brush') {
            track.grid[x][y].lines.push(P);
          }
          else {
            track.grid[x][y].scenery.push(P);
          }
          delete track.cache[x + '_' + y];
        }
        if (currentTool === 'brush') {
          lastForeground.set(mousePos);
        }
        else {
          lastScenery.set(mousePos);
        }
        lastClick.set(mousePos);
      }
    }
    shift = false;
    snapFromPrevLine = true;
    break;
  default:
    ;
  }
  if (item !== undefined) {
    var x = Math.floor(item.pos.x / track.gridSize);
    var y = Math.floor(item.pos.y / track.gridSize);
    if (track.grid[x] === undefined) {
      track.grid[x] = [];
    }
    if (track.grid[x][y] === undefined) {
      track.grid[x][y] = new LineSet(x, y);
    }
    track.grid[x][y].objects.push(item);
  }
};
document.onmousemove = function (event) {
  var line, I, i, x, y, l;
  if (currentTool !== 'camera') {
    focus = false;
  }
  mousePos = new Point(
    event.clientX - canvas.offsetLeft,
    event.clientY - canvas.offsetTop + window.pageYOffset
  ).normalizeToCanvas();
  if (currentTool !== 'eraser') {
    mousePos.x = Math.round(mousePos.x / gridDetail) * gridDetail;
    mousePos.y = Math.round(mousePos.y / gridDetail) * gridDetail;
  }
  if (snapFromPrevLine) {
    if (currentTool === 'camera') {
      track.focus.add(lastClick.cloneSub(mousePos));
      mousePos.set(lastClick);
    }
    else if (currentTool === 'eraser') {
      track.checkDelete(mousePos);
    }
    else if (!shift && (currentTool === 'brush' || currentTool === 'scenery brush') && lastClick.cloneSub(mousePos).getLength() >= drawingSize) {
      if (currentTool === 'brush') {
        line = new Line(lastClick.x, lastClick.y, mousePos.x, mousePos.y);
      }
      else {
        line = new Scenery(lastClick.x, lastClick.y, mousePos.x, mousePos.y);
      }
      I = gridSpread(line.a.clone(), line.b.clone(), track.gridSize);
      for (i = 0, l = I.length; i < l; i++) {
        x = Math.floor(I[i].x / track.gridSize),
        y = Math.floor(I[i].y / track.gridSize);
        if (track.grid[x] === undefined) {
          track.grid[x] = [];
        }
        if (track.grid[x][y] === undefined) {
          track.grid[x][y] = new LineSet;
        }
        if (currentTool === 'brush') {
          track.grid[x][y].lines.push(line);
        }
        else {
          track.grid[x][y].scenery.push(line);
        }
        delete track.cache[x + '_' + y];
      }
      if (currentTool === 'brush') {
        lastForeground.set(mousePos);
      }
      else {
        lastScenery.set(mousePos);
      }
      lastClick.set(mousePos);
    }
  }
};
canvas.onmouseup = function () {
  var P, I, T, x, y, Item, item;
  if (snapFromPrevLine) {
    if (currentTool === 'line' || currentTool === 'scenery line' || currentTool === 'brush' || currentTool === 'scenery brush') {
      if (currentTool === 'line' || currentTool === 'brush') {
        P = new Line(lastClick.x, lastClick.y, mousePos.x, mousePos.y);
      }
      else {
        P = new Scenery(lastClick.x, lastClick.y, mousePos.x, mousePos.y);
      }
      if (P.length >= 2 && P.length < 100000) {
        I = gridSpread(new Point(P.a.x, P.a.y), new Point(P.b.x, P.b.y), track.gridSize);
        for (T = 0; T < I.length; T++) {
          x = Math.floor(I[T].x / track.gridSize);
          y = Math.floor(I[T].y / track.gridSize);
          if (track.grid[x] === undefined) {
            track.grid[x] = [];
          }
          if (track.grid[x][y] === undefined) {
            track.grid[x][y] = new LineSet;
          }
          if (currentTool === 'line' || currentTool === 'brush') {
            track.grid[x][y].lines.push(P);
          }
          else {
            track.grid[x][y].scenery.push(P);
          }
          delete track.cache[x + '_' + y];
        }
        if (currentTool === 'line' || currentTool === 'brush') {
          lastForeground.set(mousePos);
        }
        else {
          lastScenery.set(mousePos);
        }
        lastClick.set(mousePos);
      }
    }
    else if (currentTool === 'boost' || currentTool === 'gravity') {
      document.body.style.cursor = 'none';
      Item = currentTool === 'boost' ? Boost : Gravity;
      item = new Item(
        lastClick.x, lastClick.y,
        Math.round(Math.atan2(-(mousePos.x - lastClick.x), mousePos.y - lastClick.y) * 180 / Math.PI)
      );
      x = Math.floor(item.pos.x / track.gridSize);
      y = Math.floor(item.pos.y / track.gridSize);
      if (track.grid[x] === undefined) {
        track.grid[x] = [];
      }
      if (track.grid[x][y] === undefined) {
        track.grid[x][y] = new LineSet(x, y);
      }
      track.grid[x][y].objects.push(item);
    }
  }
};
document.onmouseup = function () {
  if (!shift) {
    snapFromPrevLine = false;
  }
};
canvas.onmouseout = function () {
  document.body.style.cursor = 'default';
};

newButton && (newButton.onclick = function () {
  if (confirm('Do you really want to start a new track?')) {
    track = new Track();
    charcount.innerHTML = 'trackcode';
    trackcode.value = null;
    track.reset();
  }
});
loadButton && (loadButton.onclick = function () {
  if (trackcode.value.length > 10) {
    track = new Track(trackcode.value);
    charcount.innerHTML = "Trackcode";
    trackcode.value = null;
    track.reset();
  }
  else {
    alert("No trackcode to load!");
  }
});
saveButton && (saveButton.onclick = function () {
  if (track.id === undefined) {
    trackcode.value = track.toString();
    trackcode.select();
    charcount.innerHTML = "Trackcode - " + Math.round(trackcode.value.length / 1000) + "k - CTRL + C to copy";
  }
});
uploadButton && (uploadButton.onclick = function () {
  var match = /ID=([0-9a-f]+)/.exec(document.cookie);
  if (match) {
    var userHash = match[1],
      trackcode = track.toString();
    if (true || trackcode.length > 2000) {
      paused = true;
      currentTool = 'camera';
      canvas.width = 250;
      canvas.height = 150;
      toolbar1.style.display = 'none';
      toolbar2.style.display = 'none';
      context.lineCap = 'round';
      context.lineJoin = 'round';
      document.getElementById('track_menu').style.display = 'none';
      var input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('id', 'name');
      input.setAttribute('size', 18);
      input.setAttribute('maxlength', 20);
      input.addEventListener('keypress', function(e) {
        e.stopPropagation();
      }, false);
      var submit = document.createElement('input');
      submit.setAttribute('type', 'submit');
      submit.setAttribute('value', 'SAVE NAME & THUMBNAIL');
      submit.onclick = function () {
        var image = canvas.toDataURL('image/png');
        if (image === 'asdf') {
          alert('The thumbnail is blank!\nDrag & fit an interesting part of your track inside.');
          return false;
        }
        var name = input.value;
        if (name.length < 4) {
          alert('The track name is too short!');
          return false;
        }
        if (!/^[\w\s]+$/.test(name)) {
          alert('No special characters allowed in the track name!');
          return false;
        }
        submit.disabled = 'disabled';
        var request = new XMLHttpRequest();
        request.open('POST', 'tracks/save', false);
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        request.send('u=' + userHash + '&n=' + name + '&c=' + trackcode);
        var trackID = request.responseText;
        if (trackID === '') {
          alert('Your track was refused.');
          return false;
        }
        request = new XMLHttpRequest();
        request.open('POST', 'tracks/thumbnail/' + trackID, false);
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        request.send(image.replace('data:image/png;base64,', 'i='));
        location.href = 'tracks/' + trackID;
      };
      var nameContainer = document.createElement('div');
      nameContainer.appendChild(input);
      nameContainer.appendChild(document.createTextNode(' '));
      nameContainer.appendChild(submit);
      contentElement.insertBefore(nameContainer, canvas.nextSibling);
      var adjust = document.createElement('div');
      adjust.style.color = canvas.style.borderColor = '#f00';
      adjust.innerHTML = 'Use your mouse to drag & fit an interesting part of your track in the thumbnail<br/><br/>';
      contentElement.insertBefore(adjust, canvas);
    }
    else {
      alert('Sorry, but your track must be bigger or more detailed.');
      return false;
    }
  }
});

function onScroll(event) {
  if (track.id !== 'banner') {
    event.preventDefault();
    if (shift) {
      if (currentTool === 'eraser') {
        if ((event.detail > 0 || event.wheelDelta < 0) && eraserSize > 5) {
          eraserSize -= 5;
        }
        else if ((event.detail < 0 || event.wheelDelta > 0) && eraserSize < 40) {
          eraserSize += 5;
        }
      }
      else if (currentTool === 'brush' || currentTool === 'scenery brush') {
        if ((event.detail > 0 || event.wheelDelta < 0) && drawingSize > 4) {
          drawingSize -= 8;
        }
        else if ((event.detail < 0 || event.wheelDelta > 0) && drawingSize < 200) {
          drawingSize += 8;
        }
      }
    }
    else {
      if ((event.detail > 0 || event.wheelDelta < 0) && track.zoom > 0.2) {
        track.zoom = Math.round(track.zoom * 10 - 2) / 10;
      }
      else if ((event.detail < 0 || event.wheelDelta > 0) && track.zoom < 4) {
        track.zoom = Math.round(track.zoom * 10 + 2) / 10;
      }
      track.cache = [];
    }
    var Cw = new Point(
      event.clientX - canvas.offsetLeft,
      event.clientY - canvas.offsetTop + window.pageYOffset
    ).normalizeToCanvas();
    if (!focus) {
      track.focus.add(mousePos.cloneSub(Cw));
    }
  }
}
canvas.addEventListener('DOMMouseScroll', onScroll, false);
canvas.addEventListener('mousewheel', onScroll, false);

window['canvas_ride'] = canvas_ride;

