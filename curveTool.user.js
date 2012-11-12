// ==UserScript==
// @name           Canvasrider Curve Tool
// @namespace      http://forum.canvasrider.com/member8300.html
// @include        http://canvasrider.com/draw
// @match          http://canvasrider.com/draw
// ==/UserScript==

var w = unsafeWindow,
  // more common names for several CanvasRider classes
  Track = w.BI, Point = w.J,
  Line = w.line, Scenery = w.B5, Grid = w.BP,
  // canvas
  canvas = w.p, context = w.B,
  // reference to old draw function
  _draw = Track.prototype.Am,
  // whether we're dra{w,gg}ing around a curve
  drawing = false,
  // reference to the curve being dragged around
  currentCurve,
  // called on Track draw (used for the blue lines, mostly)
  afterDraw = function () {};

// enhance Track draw function
Track.prototype.Am = function () {
  _draw.call(this);

  // draw unfinished curve
  currentCurve && currentCurve.Am();

  afterDraw();

  // draw curve icon
  // (stroke()s three times for solidness, even if severely antialiased)
  context.beginPath();
  context.moveTo(canvas.width - 22, 6 * 24);
  context.lineTo(canvas.width - 22, 9 * 24);
  context.strokeStyle = '#000';
  context.lineWidth = 1;
  for (var i = 0; i++ < 3;) context.stroke();

  context.moveTo(canvas.width - 20, 8 * 24);
  context.bezierCurveTo(canvas.width - 14, 8.3 * 24, canvas.width - 6, 7.2 * 24, canvas.width - 4,  7.6 * 24);
  
  for (var i = 0; i++ < 3;) context.stroke();

  return this;
};

// Curve while it's being dragged around
function Curve(start, end, scenery) {
  var c = this,
    // references to original functions
    d = c.d = canvas.onmousedown,
    u = c.u = canvas.onmouseup,
    m = c.m = document.onmousemove,
    // selected dragging point
    z,
    o,
    f;

  // .s = start
  c.s = new Point(start.x, start.y);
  // .e = end
  c.e = new Point(end.x, end.y);

  // .p = reference point 1
  c.p = start.add(new Point(10, 30));
  // .q = reference point 2
  c.q = end.add(new Point(-10, 30));

  // .f = finished drawing
  c.f = false;
  // .i = type of curve (scenery | line)
  c.i = scenery === true;
  
  
  canvas.onmousedown = function (e) {
    d(e);

    // finish this curve on rightclick
    if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      z = null;
      return c.finish();
    }

    // sets dragging point. AF is the click position of the cursor,
    // .sub does what its name suggests, .Ae() returns the length
    // of the resulting point, squared. 500 is used in the game as
    // well, for determining if the bike is close to a checkpoint or
    // goal and such.
    if      (w.AF.sub(c.p).Ae() < 500) { z = c.p; }
    else if (w.AF.sub(c.q).Ae() < 500) { z = c.q; }
    else if (w.AF.sub(c.e).Ae() < 500) { z = c.e; }
    else if (w.AF.sub(c.s).Ae() < 500) { z = c.s; }
  };
  
  document.onmousemove = function (e) {
    document.body.style.cursor = 'default';
    m(e);

    // does the dragging of a control point
    // .AN sets the point's position, w is the current mouse position
    if (z) {
      z.AN(w.w);
    }
  };
  
  canvas.onmouseup = function (e) {
    u(e);

    // reset dragging things
    afterDraw = function () {};
    if(z) {
      z = null;
    }
  };
}
(function (p) {
  
  p.finish = function () {

    // restore events
    canvas.onmousedown = this.d;
    document.onmousemove = this.m;
    canvas.onmouseup = this.u;
    canvas.onclick = null;

    this.f = true;
    
    var lines = [], c = this;

    // Bezier function
    function B(t) {
      return {
        x: Math.pow(1 - t, 3) * c.s.x +
           Math.pow(1 - t, 2) * 3 * t   * c.p.x +
           (1 - t) * 3 * Math.pow(t, 2) * c.q.x +
           Math.pow(t, 3) * c.e.x,
        y: Math.pow(1 - t, 3) * c.s.y +
           Math.pow(1 - t, 2) * 3 * t   * c.p.y +
           (1 - t) * 3 * Math.pow(t, 2) * c.q.y +
           Math.pow(t, 3) * c.e.y
      };
    }
    // distance between p and q
    function D(p, q) {
      return p.sub(q).length();
    }

    // total distance between the control points
    var dis = D(c.s, c.p)
            + D(c.p, c.q)
            + D(c.q, c.e),
      // amount of lines we'll assume for the curve
      step = dis / 15,
      // i
      i = 0;
    
    if(step > 30) {
      step = 30;
    }

    step /= dis;

    // compute points for the curve
    for(; i < 1; i += step) {
      lines.push(B(i));
    }
    lines.push(this.e);

    // add lines (copy + pasted from CR source: very ugly)
    for(i = 0; i < lines.length - 1; i++) {
      var X = lines[i].x, Y = lines[i].y, u = lines[i + 1].x, v = lines[i + 1].y,
        line = new (this.i ? Scenery : Line)(X, Y, u, v),
        I, T = 0, l, x, y;
      if (line.length >= 2 && line.length < 100000) {
        I = w.CG(new Point(line.AH.x, line.AH.y), new Point(line.AK.x, line.AK.y), w.C.q);
        for (T = 0, l = I.length; T < l; T++) {
          x = Math.floor(I[T].x / w.C.q);
          y = Math.floor(I[T].y / w.C.q);
          if (w.C.I[x] === undefined) {
            w.C.I[x] = [];
          }
          if (w.C.I[x][y] === undefined) {
            w.C.I[x][y] = new Grid;
          }
          w.C.I[x][y][this.i ? 'AD' : 'AG'].push(line);
          
          delete w.C.Ax[x + '_' + y];
        }
        // sets snap point for next line
        (this.i ? w.Bg : w.Bf).AN(w.w);
      }
    }
    
    currentCurve = null;
    
    return this;
  };
  
  p.Am = function draw() {
    if (this.f) {
      return this;
    }
    
    var s = this.s.o(),
      e = this.e.o(),
      r1 = this.p.o(),
      r2 = this.q.o(),
      z = w.C.H;//, context = w.B;

    // curve
    context.beginPath();
    context.strokeStyle = this.i ? 'grey' : 'black';
    context.lineWidth = 2 * z;
    context.moveTo(s.x, s.y);
    context.bezierCurveTo(r1.x, r1.y, r2.x, r2.y, e.x, e.y);
    context.stroke();

    // control lines
    context.beginPath();
    context.strokeStyle = 'green';
    context.moveTo(s.x, s.y);
    context.lineTo(r1.x, r1.y);
    context.moveTo(e.x, e.y);
    context.lineTo(r2.x, r2.y);
    context.stroke();

    context.globalAlpha = 0.8;

    // reference control points
    context.beginPath();
    context.fillStyle = 'red';
    context.strokeStyle = 'black';
    context.moveTo(r1.x, r1.y);
    context.arc(r1.x, r1.y, 6 * z, 0, Math.PI * 2, false);
    context.moveTo(r2.x, r2.y);
    context.arc(r2.x, r2.y, 6 * z, 0, Math.PI * 2, false);
    context.stroke();
    context.fill();

    // start/endpoint control points
    context.beginPath();
    context.fillStyle = 'yellow';
    context.moveTo(s.x, s.y);
    context.arc(s.x, s.y, 6 * z, 0, Math.PI * 2, false);
    context.moveTo(e.x, e.y);
    context.arc(e.x, e.y, 6 * z, 0, Math.PI * 2, false);
    context.stroke();
    context.fill();

    context.globalAlpha = 1;
    
    return this;
  };
  
}(Curve.prototype));

// some more event references
var _down = canvas.onmousedown,
  _up = canvas.onmouseup,
  _move = document.onmousemove,
  _bb = w.BB.onmousedown,
  _key = document.onkeydown;

canvas.onmousedown = function (e) {
  _down(e);
  if(w.V === 'curve') {
    document.body.style.cursor = 'default';
    // if we HAVEN'T yet drawn a curve, but we ARE using the curve tool, and
    // push a mouse button, we start drawing a curve.
    currentCurve || (drawing = true);
  }
};
document.onmousemove = function (e) {
  _move(e);
  if (w.V === 'curve') {
    if (drawing) {
      // very inefficient like this :(
      afterDraw = function () {
        var x = w.AF.o(),
          y = w.w.o();

        context.beginPath();
        context.strokeStyle = '#00f';
        context.lineWidth = w.C.H * 2;
        context.moveTo(x.x, x.y);
        context.lineTo(y.x, y.y);
        context.stroke();
      };
    }
    document.body.style.cursor = 'default';
  }
};
canvas.onmouseup = function (e) {
  if(w.V === 'curve' && !currentCurve && w.AF.sub(w.w).Ae() > 1000) {
    // finished drawing the (random) curve line
    currentCurve = new Curve(w.AF, w.w);
  }
  drawing = false;
  afterDraw = function () {};
  _up(e);
};
canvas.oncontextmenu = function (e) {
  // as right-clicking finishes a curve, the usual right-clicking behavior
  // must be disabled
  e.preventDefault();
  e.stopPropagation();
  return false;
};
document.onkeydown = function (e) {
  _key(e);
  if(e.keyCode === 67) { // C
    w.V = 'curve';
  }
};

w.BB.onmousedown = function (e) {
  _bb(e);
  // click on curve icon
  if(Math.floor((e.clientY - w.BF.offsetTop + w.pageYOffset) / 25) === 7) {
    w.V = 'curve';
  }
};

w.curve = Curve;

// add curve hint text
w.Bh[1][7] = 'bezier curve ( C - draw straight line, drag control points, right-click to confirm )';
