// ==UserScript==
// @name           Canvasrider Tools
// @namespace      http://forum.canvasrider.com/member8300.html
// @include        http://canvasrider.com/draw
// @match          http://canvasrider.com/draw
// ==/UserScript==
var w = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window),
  // more common names for several CanvasRider classes
  /** @constructor */ Track = w.BI,
  /** @constructor */ Point = w.J,
  /** @constructor */ Line = w.line,
  /** @constructor */ Scenery = w.B5,
  /** @constructor */ GridBox = w.BP,
  /** @constructor */ Bomb = w.B_,
  /** @constructor */ Goal = w.target,
  /** @constructor */ Boost = w.CB,
  /** @constructor */ Gravity = w.CD,
  /** @constructor */ Checkpoint = w.CA,
  /** @constructor */ SlowMotion = w.CL,
  // canvas
  canvas = w.p,
  context = w.B,
  // whether we're dra{w,gg}ing around something
  drawing = false,
  // whether the current thing should be scenery lines or not
  scenery = false,
  // the old document.body cursor style, needed because it is changed when the
  // mouse hovers the left toolbar (but just the canvas and not the img)
  oldCursor,
  // current selected object
  selected,
  // holds all objects created with the extra tools
  additionalItems = [];

/**
 * Selects an object.
 * @param {object} obj
 */
function select(obj) {
  selected && selected.blur();
  obj.$selected = true;
  return selected = obj;
}

/**
 * Pushes a function to be called when the track is drawn.
 * @param {function} fn
 * @param {object=} bind
 */
function onDraw(fn, bind) {
  if (fn) {
    onDraw.fn.push([fn, bind]);
  }
  else {
    for (var i = 0, l = onDraw.fn.length; i < l; i++) {
      onDraw.fn[i][0].call(onDraw.fn[i][1], this);
    }
  }
}
/**
 * Removes a function from the call stack.
 * @param {function} fn The callback to remove
 */
onDraw.rm = function (fn) {
  for (var i = 0, l = onDraw.fn.length; i < l; i++) {
    if (onDraw.fn[i][0] === fn) {
      onDraw.fn.splice(i, 1);
      break;
    }
  }
};
onDraw.fn = [];

/**
 * internal line-adding
 * @param {CRLine} line The line to add.
 * @return {CRLine} The given line.
 */
function reallyAddLine(line) {
  var I, T, l, x, y;
  line.grids || (line.grids = []);
  if (line.length >= 2 && line.length < 100000) {
    I = w.CG(new Point(line.AH.x, line.AH.y), new Point(line.AK.x, line.AK.y), w.C.q);
    for (T = 0, l = I.length; T < l; T++) {
      x = Math.floor(I[T].x / w.C.q);
      y = Math.floor(I[T].y / w.C.q);
      if (w.C.I[x] === undefined) {
        w.C.I[x] = [];
      }
      if (w.C.I[x][y] === undefined) {
        w.C.I[x][y] = new GridBox;
      }
      line.grids.push(w.C.I[x][y]);
      w.C.I[x][y][scenery ? 'AL' : 'AG'].push(line);

      delete w.C.Ax[x + '_' + y];
    }

    // sets snap point for next line
    (scenery ? w.Bg : w.Bf).AN(w.w);
  }
}
/**
 * Generic line-adding, creates a line (X, Y) -> (u, v) and reallyAddsIt.
 * @param {number} X
 * @param {number} Y
 * @param {number} u
 * @param {number} v
 * @param {object=} parent The bigger picture! What special thing this line
 *     may be a part of.
 * @return {CRLine} The added line.
 */
function addLine(X, Y, u, v, parent) {
  var line = new(scenery ? Scenery : Line)(X, Y, u, v);
  line.parent = parent;
  reallyAddLine(line);

  return line;
}
/**
 * Generic object-adding
 * @param {function} Obj The type of object to add.
 * @param {number} x X-coord for the object.
 * @param {number} y Y-coord for the object.
 * @param {number} deg Point-angle.
 * @return {CRItem} The added object.
 */
function addObject(Obj, x, y, deg) {
  var obj = new Obj(x, y, deg);
  x = Math.floor(obj.G.x / w.C.q);
  y = Math.floor(obj.G.y / w.C.q);

  w.C.I[x][y].AD.push(obj);

  return obj;
}

function smoothLine(pointList) {
  if (!pointList) {
    return [];
  }
  function actualSpline(t, p_1, p0, p1, p2) {
    return (
      t * ((2 - t) * t - 1) * p_1
      + (t * t * (3 * t - 5) + 2) * p0
      + t * ((4 - 3 * t) * t + 1) * p1
      + (t - 1) * t * t * p2
    ) / 2;
  }
  function spline_4p(t, p_1, p0, p1, p2) {
    return new Point(
      actualSpline(t, p_1.x, p0.x, p1.x, p2.x),
      actualSpline(t, p_1.y, p0.y, p1.y, p2.y)
    );
  }
  
  var points = [], j = 0, l = pointList.length - 1, t,
    p, lastP;
  for(; j < l; j++) {
    for(t = 0; t <= 1; t += 0.1) {
      p = spline_4p(t, pointList[j - 1] || pointList[j], pointList[j], pointList[j + 1], pointList[j + 2] || pointList[j + 1]);
      if (!lastP || p.distanceTo(lastP) > 10) {
        points.push(lastP = p);
      }
    }
  }
  
  return points;
}

function moveCam() {
  var mousePos = w.w.o();
  if (mousePos.x < 50) {
    w.C.A5.x -= 10 / w.C.H;
    w.w.x -= 10 / w.C.H;
  }
  else if (mousePos.x > canvas.width - 50) {
    w.C.A5.x += 10 / w.C.H;
    w.w.x += 10 / w.C.H;
  }
  if (mousePos.y < 50) {
    w.C.A5.y -= 10 / w.C.H;
    w.w.y -= 10 / w.C.H;
  }
  else if (mousePos.y > canvas.height - 50) {
    w.C.A5.y += 10 / w.C.H;
    w.w.y += 10 / w.C.H;
  }
}

// enhance Track draw & remove function
(function enhanceTrack(p) {

  var d = p.Am;
  /**
   * Adds the new drawing icons.
   */
  p.Am = function draw() {
    d.call(this);

    onDraw();

    if (drawing && w.V === 'curve') {
      var x = w.AF.o(),
        y = w.w.o();

      context.beginPath();
      context.strokeStyle = '#00f';
      context.lineWidth = w.C.H * 2;
      context.moveTo(x.x, x.y);
      context.lineTo(y.x, y.y);
      context.stroke();
    }

    // draw unfinished circle
    if (w.A0 && w.V === 'circle') {
      moveCam();
      context.beginPath();
      context.strokeStyle = '#00f';
      context.lineWidth = 2 * w.C.H;
      var lastClickPos = w.AF.o(),
        r = Math.abs(mousePos.sub(lastClickPos).length());
      context.moveTo(lastClickPos.x + r, lastClickPos.y);
      context.arc(lastClickPos.x, lastClickPos.y, r, 0, Math.PI * 2);
      context.stroke();
    }
    if (w.A0 && w.V === 'smooth brush') {
      moveCam();
    }
    if (w.A0 && w.V === 'rectangle') {
      var mousePos = w.w.o(),
        lastClickPos = w.AF.o();
      if (mousePos.x < 50) {
        w.C.A5.x -= 10 / w.C.H;
        w.w.x -= 10 / w.C.H;
      }
      else if (mousePos.x > canvas.width - 50) {
        w.C.A5.x += 10 / w.C.H;
        w.w.x += 10 / w.C.H;
      }
      if (mousePos.y < 50) {
        w.C.A5.y -= 10 / w.C.H;
        w.w.y -= 10 / w.C.H;
      }
      else if (mousePos.y > canvas.height - 50) {
        w.C.A5.y += 10 / w.C.H;
        w.w.y += 10 / w.C.H;
      }
      context.strokeStyle = '#00f';
      context.lineWidth = 2 * w.C.H;
      context.strokeRect(lastClickPos.x, lastClickPos.y, mousePos.x - lastClickPos.x, mousePos.y - lastClickPos.y);
    }

    // setup drawing
    context.clearRect(0, 9 * 25, 24, 75);
    context.beginPath();
    // curve box
    context.moveTo(0, 9 * 25);
    context.lineTo(24, 9 * 25);
    context.lineTo(24, 10 * 25);
    context.lineTo(0, 10 * 25);
    // curve icon
    context.moveTo(20, 9.1 * 25);
    context.bezierCurveTo(
      14, 9.9 * 25,
      6, 8.8 * 25,
      4, 9.9 * 25);
    // circle box
    context.moveTo(24, 10 * 25);
    context.lineTo(24, 11 * 25);
    context.lineTo(0, 11 * 25);
    // circle icon
    context.moveTo(19, 10.5 * 25);
    context.arc(12, 10.5 * 25, 7, 0, Math.PI * 2);
    // rect box
    context.moveTo(24, 11 * 25);
    context.lineTo(24, 12 * 25);
    context.lineTo(0, 12 * 25);
    // rect icon
    context.moveTo(4, 11 * 25 + 4);
    context.lineTo(20, 11 * 25 + 4);
    context.lineTo(20, 12 * 25 - 4);
    context.lineTo(4, 12 * 25 - 4);
    context.lineTo(4, 11 * 25 + 4);

    // draw
    context.strokeStyle = '#000';
    context.lineWidth = 1.2;
    context.stroke();

    return this;
  };

  /**
   * Runs through GridBoxes on line p1 -> p2 and processes everything that's
   * scheduled for removal.
   * @param {Point} p1 Start point.
   * @param {Point} p2 End point.
   */
  p.remove = function (p1, p2) {
    if (p2 == undefined) {
      p2 = p1;
    }
    var I = w.CG(p1, p2, this.q);
    for (var T = 0; T < I.length; T++) {
      var x = Math.floor(I[T].x / this.q);
      var y = Math.floor(I[T].y / this.q);
      this.I[x] && this.I[x][y] && this.I[x][y].remove();
      delete this.Ax[x + "_" + y];
    }
  };

}(Track.prototype));

// enhance points with some generic & useful methods
(function enhancePoint(p) {

  /**
   * Calculates the distance from this Point to another Point.
   * @param {Point} p The other point.
   * @return {number} The distance.
   */
  p.distanceTo = function (p) {
    return this.sub(p).length();
  };

  p.clone = function () {
    return new Point(this.x, this.y);
  };

}(Point.prototype));

// enhance Lines to be selectable and draggable
(function enhanceLine(p) {

  /**
   * Selects this line.
   * @return {Line}
   */
  p.select = function () {
    if (this.parent) {
      this.parent.select();
      return this;
    }

    select(this);

    onDraw(this.Am, this);

    return this.attach().redraw();
  };

  /**
   * Deselects this line.
   * @return {Line}
   */
  p.blur = function () {
    onDraw.rm(this.Am);

    return this.detach().redraw();
  };

  /**
   * Attaches events used by this line.
   * @return {Line}
   */
  p.attach = function () {
    var l = this,
      // references to original functions,
      // .d = down; .u = up; .m = move, .c = click
      d = l.d = canvas.onmousedown,
      u = l.u = canvas.onmouseup,
      m = l.m = document.onmousemove,
      // selected control point
      z;

    canvas.onmousedown = function (e) {
      d(e);

      // stop dragging on rightclick
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        z = null;
        return l.finish();
      }

      // set dragging point. AF is the click position of the cursor,
      // .sub is .cloneSubtract, .Ae() returns the length of the resulting
      // point, squared. 500 is used in the game as well, for determining
      // if the bike is close to a checkpoint or goal and such.
      if (w.AF.sub(l.AH).Ae() < 500) {
        z = l.AH;
      }
      else if (w.AF.sub(l.AK).Ae() < 500) {
        z = l.AK;
      }
    };

    document.onmousemove = function (e) {
      document.body.style.cursor = 'default';
      m(e);

      // does the dragging of a control point
      // .AN sets the point's position, .w is the current mouse position
      if (z) {
        z.AN(w.w);
        l.redraw();
      }
    };

    canvas.onmouseup = function (e) {
      u(e);

      z = null;
    };

    return l;
  };

  /**
   * Restore overwritten events.
   * @return {Line}
   */
  p.detach = function () {
    canvas.onmousedown = this.d;
    document.onmousemove = this.m;
    canvas.onmouseup = this.u;

    return this;
  };

  p.finish = p.blur;

  /**
   * Redraw the line: remove, recalc and add
   * @return {Line}
   */
  p.redraw = function () {
    this.remove = true;
    w.C.remove(this.oldAH || this.AH, this.oldAK || this.AK);
    reallyAddLine(this);

    this.length = (this.BK = this.AK.sub(this.AH)).length();

    this.oldAH = this.AH;
    this.oldAK = this.AK;

    return this;
  };

  /**
   * Gets distance from a point to this line.
   * @param {Point} p
   * @return {number}
   */
  p.distanceTo = function (p) {
    // http://geomalgorithms.com/a02-_lines.html
    var x = p.x,
      y = p.y,
      x0 = this.AH.x,
      y0 = this.AH.y,
      x1 = this.AK.x,
      y1 = this.AK.y;
    return Math.abs(x * (y0 - y1) + y * (x1 - x0) + (x0 * y1 - x1 * y0))
         / Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
  };

  /**
   * I .Am keeping the game's minified naming convention here :)
   * Draws this line.
   * @return {Line}
   */
  p.Am = function draw() {
    var l = this,
      a = this.AH.o(), // .o = getPixel
      b = this.AK.o(),
      z = w.C.H; // .H = .zoom

    // start/endpoint control points
    context.beginPath();
    context.lineWidth = 2 * z;
    context.globalAlpha = 0.8;
    context.fillStyle = 'yellow';
    context.strokeStyle = 'black';
    context.moveTo(a.x, a.y);
    context.arc(a.x, a.y, 6 * z, 0, Math.PI * 2, false);
    context.moveTo(b.x, b.y);
    context.arc(b.x, b.y, 6 * z, 0, Math.PI * 2, false);
    context.stroke();
    context.fill();

    context.globalAlpha = 1;

    return this;
  };

}(Line.prototype));

(function enhanceGridBox(p) {

  /**
   * Selects the element closest to the cursor, if it is within reach.
   * @param {Point} p Cursor.
   * @return {GridBox}
   */
  p.select = function (p) {
    var arr = [].concat(this.AD).concat(this.AL).concat(this.AG),
      i = 0,
      l = arr.length;
    for (; i < l; i++) {
      if (arr[i].distanceTo && arr[i].distanceTo(p) < 15 && arr[i].select) {
        arr[i].select();
        return this;
      }
    }

    if (selected) {
      selected.blur();
    }

    return this;
  };

}(GridBox.prototype));

function ITEM(cls) {
  var p = cls.prototype;

  /**
   * Selects this item.
   * @return {Object}
   */
  p.select = function () {
    select(this);

    onDraw(this.Am, this);

    return this.attach().redraw();
  };

  p.blur = function () {
    onDraw.rm(this.Am);

    if (selected === this) {
      selected = null;
    }

    this.$selected = false;

    return this.detach().redraw();
  };

  p.detach = function () {
    // restore events
    this.d && (canvas.onmousedown = this.d);
    this.m && (document.onmousemove = this.m);
    this.u && (canvas.onmouseup = this.u);

    return this;
  };

  p.finish = p.blur;

  p.removeLines = function () {
    var t = this,
      i = 0,
      l = t.lines.length;
    for (; i < l; i++) {
      t.lines[i].remove = true;
    }
    for (i = 0, l = t.grids.length; i < l; i++) {
      t.grids[i].remove();
    }
    w.C.Ax = {};

    return t;
  };

  p.redraw = function () {
    return this.removeLines().putLines();
  };

  p.distanceTo = function (p) {
    var t = this,
      dist = Infinity,
      i = 0,
      l = t.lines.length;

    for (; i < l; i++) {
      dist = Math.min(dist, t.lines[i].distanceTo(p));
    }

    return dist;
  };
}

/**
 * THIS! IS!.. a curve!
 * @param {Point} start Starting point.
 * @param {Point} end Ending point.
 * @param {bool=} scenery If this's a scenery line.
 * @constructor
 */
function Curve(start, end, scenery) {
  var c = this;

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

  c.lines = [];
  c.grids = [];
}
ITEM(Curve);
(function (p) {

  p.attach = function () {
    var c = this,
      // references to original functions,
      // .d = down; .u = up; .m = move
      d = c.d = canvas.onmousedown,
      u = c.u = canvas.onmouseup,
      m = c.m = document.onmousemove,
      // selected control point
      z;
    canvas.onmousedown = function (e) {
      d(e);

      // finish this curve on rightclick
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        z = null;
        return c.finish();
      }

      // set dragging point
      if (w.AF.sub(c.p).Ae() < 500) {
        z = c.p;
      }
      else if (w.AF.sub(c.q).Ae() < 500) {
        z = c.q;
      }
      else if (w.AF.sub(c.e).Ae() < 500) {
        z = c.e;
      }
      else if (w.AF.sub(c.s).Ae() < 500) {
        z = c.s;
      }
    };

    document.onmousemove = function (e) {
      document.body.style.cursor = 'default';
      m(e);

      // drag the control point
      if (z) {
        z.AN(w.w);
        c.redraw();
      }
    };

    canvas.onmouseup = function (e) {
      u(e);

      z = null;
    };

    return c;
  };

  p.putLines = function () {
    var lines = [],
      grids = [],
      c = this,
      i;

    // Bezier function
    function B(t) {
      return {
        x: Math.pow(1 - t, 3) * c.s.x + Math.pow(1 - t, 2) * 3 * t * c.p.x + (1 - t) * 3 * Math.pow(t, 2) * c.q.x + Math.pow(t, 3) * c.e.x,
        y: Math.pow(1 - t, 3) * c.s.y + Math.pow(1 - t, 2) * 3 * t * c.p.y + (1 - t) * 3 * Math.pow(t, 2) * c.q.y + Math.pow(t, 3) * c.e.y
      };
    }
    // distance between p and q
    function D(p, q) {
      return p.sub(q).length(); // = p.cloneSubtract(q).length()
    }

    // total distance between the control points
    var dis = D(c.s, c.p) + D(c.p, c.q) + D(c.q, c.e),
      // amount of lines we'll assume for the curve
      step = dis / 15,
      p, lastP;

    if (step > 30) {
      step = 30;
    }

    step /= dis;

    // compute points for the curve and add lines
    function add(i) {
      p = B(i);
      line = addLine(lastP.x, lastP.y, p.x, p.y, c);
      lines.push(line);
      grids = grids.concat(line.grids);
      lastP = p;
    }
    lastP = B(0);
    for (i = step; i < 1; i += step) {
      add(i);
    }
    add(1);

    c.lines = lines;
    c.grids = grids;

    return c;
  };

  p.Am = function draw() {
    var c = this,
      s = c.s.o(),
      e = c.e.o(),
      r1 = c.p.o(),
      r2 = c.q.o(),
      z = w.C.H;

    context.lineWidth = 2 * z;

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

    return c;
  };

}(Curve.prototype));

// THIS! IS!.. a rectangle!
function Rect(start, end, scenery) {
  var r = this;

  r.s = new Point(start.x, start.y);
  r.e = new Point(end.x, end.y);

  r.i = scenery === true;

  r.lines = [];
  r.grids = [];
}
ITEM(Rect);
(function (p) {

  p.attach = function () {
    var r = this,
      // references to original functions,
      // .d = down; .u = up; .m = move
      d = r.d = canvas.onmousedown,
      u = r.u = canvas.onmouseup,
      m = r.m = document.onmousemove,
      // selected control point
      z;
    canvas.onmousedown = function (e) {
      d(e);

      // finish this curve on rightclick
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        z = null;
        return r.finish();
      }

      // set dragging point
      if (w.AF.sub(r.s).Ae() < 500) {
        z = r.s;
      }
      else if (w.AF.sub(r.e).Ae() < 500) {
        z = r.e;
      }
    };

    document.onmousemove = function (e) {
      document.body.style.cursor = 'default';
      m(e);

      // drag the control point
      if (z) {
        z.AN(w.w);
        r.redraw();
      }
    };

    canvas.onmouseup = function (e) {
      u(e);

      z = null;
    };

    return r;
  };

  p.putLines = function () {
    var r = this,
      lines = [],
      grids = [],
      t1 = new Point(r.s.x, r.e.y),
      t2 = new Point(r.e.x, r.s.y),
      ps = [r.s, t1, r.e, t2, r.s],
      i = 0,
      l = ps.length - 1,
      line;

    for (; i < l; i++) {
      lines.push(line = addLine(ps[i].x, ps[i].y, ps[i + 1].x, ps[i + 1].y, r));
      grids = grids.concat(line.grids);
    }

    r.lines = lines;
    r.grids = grids;

    return r;
  };

  p.Am = function draw() {
    var r = this,
      s = r.s.o(), // .o = getPixel
      e = r.e.o(),
      z = w.C.H; // .H = .zoom

    // start/endpoint control points
    context.beginPath();
    context.lineWidth = 2 * z;
    context.globalAlpha = 0.8;
    context.fillStyle = 'yellow';
    context.strokeStyle = 'black';
    context.moveTo(s.x, s.y);
    context.arc(s.x, s.y, 6 * z, 0, Math.PI * 2, false);
    context.moveTo(e.x, e.y);
    context.arc(e.x, e.y, 6 * z, 0, Math.PI * 2, false);
    context.stroke();
    context.fill();

    context.globalAlpha = 1;

    return r;
  };

}(Rect.prototype));

// THIS! IS!.. a rectangle!
function Circle(point, side, scenery) {
  var c = this;

  c.p = new Point(point.x, point.y);
  c.e = new Point(side.x, side.y);

  c.i = scenery === true;

  c.lines = [];
  c.grids = [];
}
ITEM(Circle);
(function (p) {

  p.attach = function () {
    var c = this,
      // references to original functions,
      // .d = down; .u = up; .m = move
      d = c.d = canvas.onmousedown,
      u = c.u = canvas.onmouseup,
      m = c.m = document.onmousemove,
      // selected control point
      z;
    canvas.onmousedown = function (e) {
      d(e);

      // finish this curve on rightclick
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        z = null;
        return c.finish();
      }

      // set dragging point
      if      (w.AF.sub(c.p).Ae() < 500) { z = c.p; }
      else if (w.AF.sub(c.e).Ae() < 500) { z = c.e; }
    };

    document.onmousemove = function (e) {
      document.body.style.cursor = 'default';
      m(e);

      // drag the control point
      if (z) {
        z.AN(w.w);
        c.redraw();
      }
    };

    canvas.onmouseup = function (e) {
      u(e);

      z = null;
    };

    return r;
  };

  p.putLines = function () {
    var c = this,
      lines = [],
      grids = [],
      s = new Point(c.p.x, c.p.y),
      e = new Point(c.e.x, c.e.y),
      line,
      radius = s.sub(e).length(),
      pi2 = Math.PI * 2,
      i = 0,
      step = Math.PI / Math.pow(radius, 0.6), // .sqrt is *just* a little too long
      l = pi2 - step;
    for (; i <= l; i += step) {
      lines.push(line =
        addLine(Math.round(radius * Math.cos(i) + s.x),
                Math.round(radius * Math.sin(i) + s.y),
                Math.round(radius * Math.cos(i + step) + s.x),
                Math.round(radius * Math.sin(i + step) + s.y),
                c)
      );
      grids = grids.concat(line.grids);
    }
    lines.push(line =
      addLine(Math.round(radius * Math.cos(i) + s.x),
              Math.round(radius * Math.sin(i) + s.y),
              Math.round(radius + s.x),
              Math.round(s.y),
              c)
    );
    grids = grids.concat(line.grids);

    c.lines = lines;
    c.grids = grids;

    return c;
  };

  p.Am = function draw() {
    var c = this,
      s = c.p.o(), // .o = getPixel
      e = c.e.o(),
      z = w.C.H; // .H = .zoom

    // start/endpoint control points
    context.beginPath();
    context.lineWidth = 2 * z;
    context.globalAlpha = 0.8;
    context.fillStyle = 'yellow';
    context.strokeStyle = 'black';
    context.moveTo(s.x, s.y);
    context.arc(s.x, s.y, 6 * z, 0, Math.PI * 2, false);
    context.moveTo(e.x, e.y);
    context.arc(e.x, e.y, 6 * z, 0, Math.PI * 2, false);
    context.stroke();
    context.fill();

    context.strokeStyle = 'grey';
    context.beginPath();
    context.moveTo(s.x, s.y);
    context.lineTo(e.x, e.y);
    context.stroke();

    context.globalAlpha = 1;

    return c;
  };

}(Circle.prototype));

function SmoothBrush(points, scenery) {
  var b = this;

  b.p = points;

  b.i = scenery === true;

  b.lines = [];
  b.grids = [];
}
ITEM(SmoothBrush);
(function (p) {

  p.add = function (p) {
    p instanceof Point ? this.p.push(p) : (this.p = this.p.concat(p));

    return this;
  };

  p.attach = function () {
    var b = this,
      // references to original functions,
      // .d = down; .u = up; .m = move
      u = b.u = canvas.onmouseup,
      m = b.m = document.onmousemove;
    
    document.onmousemove = function (e) {
      document.body.style.cursor = 'crosshair';
      m(e);

      // drag the control point
      b.redraw();
    };

    canvas.onmouseup = function (e) {
      u(e);
      b.add(w.w.clone()).finish();
    };

    return b;
  };

  p.putLines = function () {
    var b = this,
      lines = [],
      grids = [],
      smooth = smoothLine(b.p),
      i = 0, l = smooth.length - 1,
      lastP = smooth.shift();
    for (; i < l; i++) {
      lines.push(line =
        addLine(lastP.x, lastP.y,
                lastP.x = smooth[i].x, lastP.y = smooth[i].y,
                b)
      );
      grids = grids.concat(line.grids);
    }

    b.lines = lines;
    b.grids = grids;

    return b;
  };

  p.Am = function draw() {
    return this;
  };

}(SmoothBrush.prototype));

// some more event references
var _down = canvas.onmousedown,
  _up = canvas.onmouseup,
  _move = document.onmousemove,
  _key = document.onkeydown;

canvas.onmousedown = function (e) {
  // click on an icon
  if (e.clientX - canvas.offsetLeft + w.pageXOffset < 25) {
    var i = Math.floor((e.clientY - canvas.offsetTop + w.pageYOffset) / 25);
    if (i === 9) {
      w.V = 'curve';
    }
    else if (i === 10) {
      w.V = 'circle';
    }
    else if (i === 11) {
      w.V = 'rectangle';
    }
    else if (i === 12) {
      w.V = 'cursor';
    }
    return drawing = false;
  }

  _down(e);
  if (w.V === 'curve') {
    document.body.style.cursor = 'default';
    // if we HAVEN'T yet drawn a curve, but we ARE using the curve tool, and
    // push a mouse button, we start drawing a curve.
    selected || (drawing = true);
  }
  else if (w.V === 'circle' || w.V === 'rectangle') {
    document.body.style.cursor = 'default';
    drawing = true;
  }
  else if (w.V === 'smooth brush') {
    document.body.style.cursor = 'crosshair';
    drawing = true;
    additionalItems.push(new SmoothBrush([ w.AF.clone() ]).select());
  }
};
canvas.onmousemove = function (e) {
  if (e.clientX - canvas.offsetLeft + w.pageXOffset < 25) {
    if (canvas.style.cursor !== 'default') {
      oldCursor = canvas.style.cursor;
      canvas.style.cursor = 'default';
    }
  }
  else if (canvas.style.cursor === 'default') {
    canvas.style.cursor = oldCursor;
  }

  /*RM*/
  if (w.V === 'cursor') document.body.style.cursor = 'default'
};
canvas.onclick = function (e) {
  if (w.V === 'cursor') {
    var coord = w.w,
      x = Math.floor(coord.x / w.C.q),
      y = Math.floor(coord.y / w.C.q);

    w.C.I[x] && w.C.I[x][y] && w.C.I[x][y].select(coord);
  }
};
document.onmousemove = function (e) {
  _move(e);
  if (w.V === 'curve' || w.V === 'circle' || w.V === 'rectangle') {
    document.body.style.cursor = 'default';
  }

  if (w.V === 'smooth brush') {
    document.body.style.cursor = 'crosshair';
    if (!w.shift && selected instanceof SmoothBrush) {
      if (selected.p[selected.p.length - 1].distanceTo(w.w) >= 3 * w.CF) {
        selected.add(w.w.clone());
        if (scenery) {
          w.Bg.AN(w.w);
        }
        else {
          w.Bf.AN(w.w);
        }
      }
    }
  }
};
canvas.onmouseup = function (e) {
  if (drawing && !selected) {
    if (w.V === 'curve' && w.AF.sub(w.w).Ae() > 1000) {
      // finished drawing the (random) curve line
      additionalItems.push(new Curve(w.AF, w.w).select());
    }
    else if (w.V === 'circle' && w.AF.sub(w.w).Ae() > 200) {
      // finished drawing the circle
      additionalItems.push(new Circle(w.AF, w.w).putLines());
      //~ var center = {
        //~ x: w.AF.x,
        //~ y: w.AF.y
      //~ }, radius = w.AF.sub(w.w).length(),
        //~ pi2 = Math.PI * 2;
      //~ //center.x += radius;
      //~ var amount = pi2 * radius * radius / (radius * radius * 0.1),
        //~ i = 0,
        //~ step = pi2 / amount,
        //~ lines = [],
        //~ l = pi2 - step;
      //~ for (; i <= l; i += step) {
        //~ addLine(Math.round(radius * Math.cos(i) + center.x),
        //~ Math.round(radius * Math.sin(i) + center.y),
        //~ Math.round(radius * Math.cos(i + step) + center.x),
        //~ Math.round(radius * Math.sin(i + step) + center.y),
        //~ i + Math.PI / 2);
      //~ }
      //~ addLine(Math.round(radius * Math.cos(i) + center.x),
      //~ Math.round(radius * Math.sin(i) + center.y),
      //~ Math.round(radius + center.x),
      //~ Math.round(center.y),
      //~ pi2);
    }
    else if (w.V === 'rectangle' && w.AF.sub(w.w).Ae() > 100) {
      additionalItems.push(new Rect(w.AF, w.w).putLines());
    }
    drawing = false;
  }
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
  if (e.keyCode === 67) { // C
    w.V = 'curve';
  }
  else if (e.keyCode === 111) { // O
    w.V = 'circle';
  }
  else if (e.keyCode === 84) { // T
    w.V = 'rectangle';
  }
};

w.curve = Curve;

// add curve hint text
w.Bh[1][7] = 'bezier curve ( C - draw straight line, drag control points, right-click to confirm )';
