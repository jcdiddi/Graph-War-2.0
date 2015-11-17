/*global math*/
var DrawingFunction = false;
var ObstacleArguments = new Object() // OOP FTW
var MyPlayerID = 0; // Until we get actual networking in place, the player will always be ID=0

var PlayerTurn = 0; // The player turn

// We might want to put some of this stuff into an encapsulating object so it's not all in global
// But that's not my business (Drinks apple juice as a muppet)
var Entities = []
var Teams = {
    Orange: 0,
    Blue: 1
}
function Entity(x, y, team) {
    this.x = x
    this.y = y
    this.team = team
    this.dead = false
}
Entity.prototype.Radius = 10
Entity.prototype.GetPlayerColor = function() {
    var isOrange = this.team == Teams.Orange
    if(this.dead) {
        return isOrange ? "red" : "purple"
    } else {
        return isOrange ? "orange" : "blue"
    }
}
function DistanceToPoints(x1, y1, x2, y2) {
    return math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
}
// Returns the index that was collided with, or -1 if there were none
function CheckEntityCollision(x, y, entarray) {
    if(typeof entarray === 'undefined') {
        entarray = Entities
    }
    for(var i = 0; i < entarray.length; i++) {
        var ent = entarray[i]
        if(DistanceToPoints(x, y, ent.x, ent.y) < ent.Radius) {
            return i
        }
    }
    return -1
}
// Same as the collision lower, built for entities.
// Implementation of Bresenham's Line Algorithm
// https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
function CheckEntityLineCollision(x1, y1, x2, y2) {
    var dx = x2 - x1
    var dy = y2 - y1
    var error = 0
    var de = Math.abs(dy / dx)
    var y = y1
    var yd
    if (y2 - y1 > 0) {
        yd = 1
    } else {
        yd = -1
    }
    for(var x = x1; x <= x2; x++) {
        var ent = CheckEntityCollision(x, y)
        if(ent >= 0) {
            return ent
        }
        error += de
        while(error >= 0.5) {
            ent = CheckEntityCollision(x, y)
            if(ent >= 0) {
                return ent
            }
            y += yd
            error--
        }
    }
    return -1
}
function DrawEntities() {
    var ctx = $("#player-graph")[0].getContext("2d")
    for(var i = 0; i < Entities.length; i++) {
        var ent = Entities[i]
        ctx.beginPath()
        ctx.arc(ent.x, ent.y, ent.Radius, 0, 2 * math.PI, false)
        ctx.fillStyle = ent.GetPlayerColor()
        ctx.fill()
    }
}
// Generates the lines for the background image
// scaleX and scaleY are how many lines to put on each axis
function GenerateBackgroundGraph(scaleX, scaleY) {
    var ctx = $("#background-graph")[0].getContext("2d")
    var width = ctx.canvas.width
    var height = ctx.canvas.height
    var lineLengthPercent = .05
    ctx.clearRect(0, 0, width, height) // Hopefully this works
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    var xd = width / 2 / (scaleX + 1) // Incrementally how far apart each spacing line needs to be
    var yd = height / 2 / (scaleY + 1) // Same
    var hwidth = width / 2
    var hheight = height / 2
    var pwidth = height * (lineLengthPercent / 2)
    var pheight = width * (lineLengthPercent / 2)
    for(var i = 1; i <= scaleX; i++) {
        ctx.moveTo(hwidth + (xd * i), hheight - pheight)
        ctx.lineTo(hwidth + (xd * i), hheight + pheight)
        ctx.moveTo(hwidth - (xd * i), hheight - pheight)
        ctx.lineTo(hwidth - (xd * i), hheight + pheight)
    }
    for(var i = 1; i <= scaleY; i++) {
        ctx.moveTo(hwidth - pwidth, hheight + (yd * i))
        ctx.lineTo(hwidth + pwidth, hheight + (yd * i))
        ctx.moveTo(hwidth - pwidth, hheight - (yd * i))
        ctx.lineTo(hwidth + pwidth, hheight - (yd * i))
    }
    ctx.stroke()
}
function Setup() {
    $("#graph-holder").children().css({
        "position": "absolute",
        "left": "0",
        "top": "0",
        "width": "720",
        "height": "480"
    })
    // Attach a handler to the graph so we can display peoples positions
    $("#player-graph").mousemove(function(e) {
        // Localize the x and y from the event so it's relative to the element and not the page
        var me = $(this).offset()
        var x = e.pageX - me.left
        var y = e.pageY - me.top
        var ent = CheckEntityCollision(x, y)
        if(ent > -1) { // If there's an entity under the mouse
            console.log("Entity under mouse: " + ent.toString())
        }
    })
    GenerateBackgroundGraph(2, 2)
    GenerateObstacles("#obstacle-graph", 5, 50, 10)
    // Lazily set up entities for testing stuff, probably want to
    // Attach these to network things or something else 
    for(var i = 0; i < 3; i++) {
        Entities.push(new Entity(math.floor(math.random(720)), math.floor(math.random(480)), Teams.Blue))
        Entities.push(new Entity(math.floor(math.random(720)), math.floor(math.random(480)), Teams.Orange))
    }
    DrawEntities()
}
function GenerateObstacles(canvas, minradius, maxradius, amount) {
    // This can probably be improved using some javascript magic, but I'm lazy.
    if(typeof canvas == 'undefined') {
        canvas = ObstacleArguments.canvas
        minradius = ObstacleArguments.minradius
        maxradius = ObstacleArguments.maxradius
        amount = ObstacleArguments.amount
    } else {
        ObstacleArguments.canvas = canvas
        ObstacleArguments.minradius = minradius
        ObstacleArguments.maxradius = maxradius
        ObstacleArguments.amount = amount
    }
    var width = $(canvas).width()
    var height = $(canvas).height()
    var ctx = $(canvas)[0].getContext("2d")
    ctx.clearRect(0, 0, width, height)
    for(var i = 0; i < amount; i++) {
        ctx.beginPath()
        ctx.arc(Math.random() * width, Math.random() * height, Math.floor((Math.random() * (maxradius - minradius)) + minradius), 0, Math.PI * 2, false)
        ctx.fill()
    }
}
$(function() {
    Setup()
    $("#textinput").keypress(function (e) {
        console.log("Oi, a thing happened!")
        if(e.keyCode == 13) {
            if(!DrawingFunction && PlayerTurn == MyPlayerID) {
                DrawingFunction = true
                $("#textinput").attr("disabled", "disabled")
                var canvas = $("#obstacle-graph")[0]
                AttemptGraph(math.compile($("#textinput").val()), $("#animated-graph")[0].getContext("2d"), canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height), false, Entities[MyPlayerID].y, Entities[MyPlayerID].x)
            }
        }
    })
    $("#textinput").on('change keyup paste', function(e) {
        var canvas = $("#preview-graph")[0]
        if(canvas.getContext && !DrawingFunction) {
   	    	var ctx = canvas.getContext("2d")
            ctx.clearRect(0, 0, canvas.width, canvas.height) // Under normal conditions this is how the graph will be cleared
            try {
				var pointListDiv = document.getElementById("values");//set up a div to push values out to for debugging
            	var pointList = "" // string containing values that will be pushed to the div
                var code = math.compile($("#textinput").val())
                var obj = new Object()
                var xoffset = Entities[MyPlayerID].x
                var yoffset = Entities[MyPlayerID].y
                obj.x = 0
                ctx.beginPath()
                ctx.strokeStyle = "lightgray"
                ctx.moveTo(xoffset, (canvas.height - code.eval(obj)) - (canvas.height - yoffset))
    	        for(var x = 1; x < canvas.width - xoffset; x++) {
                    obj.x = x
                    var y = code.eval(obj)
             	    ctx.lineTo(x + xoffset, (canvas.height - y) - (canvas.height - yoffset))
             	    if((canvas.height - y) - (canvas.height - yoffset) >= canvas.height || (canvas.height - y) - (canvas.height - yoffset) <= 0) {
                        break
                    }
                }
                ctx.stroke()
                $("#error").text("  ")
            } catch (error) {
                $("#error").text("Invalid Equation!")
                console.log(error)
            }
        }
    })
})
// Returns false or true if there is a collision on the line in the collisiondata context
// collisiondata being an imagedata created by createImageData()
function CheckLineCollision(collisiondata, x1, y1, x2, y2) {
    var dx = x2 - x1
    var dy = y2 - y1
    var e = 0
    var de = Math.abs(dy / dx)
    var y = y1
    var yd
    if (y2 - y1 > 0) {
        yd = 1
    } else {
        yd = -1
    }
    for(var x = x1; x <= x2; x++) {
        if(CheckCollision(collisiondata, x, y)) {
            return {"x" :x, "y":y}
        }
        e += de
        while(e >= 0.5) {
            if(CheckCollision(collisiondata, x, y)) {
                return {"x" :x, "y":y}
            }
            y += yd
            e--
        }
    }
    return false
}
function CheckCollision(collisiondata, x, y) {
    return collisiondata.data[((y * collisiondata.width) + x) * 4 + 3] > 128 
}
function AttemptGraph(code, ctx, collisiondata, team, reverse, y, xoffset, x, first) {
    if(typeof x === 'undefined') x = 0
    if(typeof y === 'undefined') y = 0
    if(typeof xoffset === 'undefined') xoffset = 0
    if(typeof reverse === 'undefined') reverse = false
    if(typeof first === 'undefined') first = true
    if(typeof team === 'undefined') team = -1
    $("#textinput").html("")
    var width = ctx.canvas.clientWidth
    var height = ctx.canvas.clientHeight
    if(first) {
        var tempctx = $("#temp-graph")[0].getContext("2d")
        tempctx.drawImage(ctx.canvas, 0, 0)
        ctx.clearRect(0, 0, width, height)
        ctx.save()
        ctx.globalAlpha = 0.5
        ctx.drawImage(tempctx.canvas, 0, 0)
        ctx.restore()
        tempctx.clearRect(0, 0, width, height)
    }
    var hit = false
    if(x + xoffset > 0 || xoffset - x > 0)  {
        ctx.beginPath()
        ctx.strokeStyle = "black"
        var obj = new Object()
        obj.x = x - 1
        var y1 = (height - code.eval(obj)) - (height - y)
        obj.x++
        var y2 = (height - code.eval(obj)) - (height - y)
        var res = 0
        if(reverse) {
            res = CheckLineCollision(collisiondata, xoffset - x, math.floor(y1), xoffset - x + 1, math.floor(y2))
        } else {
            res = CheckLineCollision(collisiondata, x - 1 + xoffset, math.floor(y1), x + xoffset, math.floor(y2))
        }
        if(res != false) {
            DrawingFunction = false;
            console.log("Collision at: " + res.x.toString() + " " + res.y.toString())
            var obstctx = $("#obstacle-graph")[0].getContext("2d")
            obstctx.save()
            obstctx.globalCompositeOperation = "destination-out"
            obstctx.beginPath()
            obstctx.arc(res.x, res.y, 20, 0, 2 * math.PI, false)
            obstctx.fill()
            obstctx.restore()
            y2 = res.y
            hit = true
        }
        var ent = 0
        if (reverse) 
            ent = CheckEntityLineCollision(xoffset - x, math.floor(y1), xoffset - x + 1, math.floor(y2))
        else
            ent = CheckEntityLineCollision(x - 1 + xoffset, math.floor(y1), x + xoffset, math.floor(y2))
        if (ent >= 0 && !hit) {
            DrawingFunction = false
            var entity = Entities[ent]
            console.log("Entity Collision at:" + entity.x.toString() + " " + entity.y.toString())
            entity.dead = true
            DrawEntities()
        }
        if(reverse) {
            ctx.moveTo(xoffset - x + 1, y1)
            ctx.lineTo(xoffset - x, y2)
        } else {
            ctx.moveTo(x - 1 + xoffset, y1)
            ctx.lineTo(x + xoffset, y2)
        }
        ctx.stroke()
    } else if (x + xoffset == width) {
        ctx.beginPath()
        ctx.strokeStyle = "black"
        ctx.moveTo(width, height - code.eval({x:width - 1}))
        ctx.lineTo(width - 1, height - code.eval({x:width - 2}))
        ctx.stroke()
    } else {
        ctx.beginPath()
        ctx.strokeStyle = "black"
        ctx.moveTo(0, height - code.eval({x:0}) + y)
        ctx.lineTo(1, height - code.eval({x:1}) + y)
        ctx.stroke()
    }
    var t = {"x" : x}
    var q = (height - code.eval(t)) - (height - y)
    if(((x + xoffset <= width && !reverse) || (xoffset - x >= 0 && reverse)) && q <= height && q >= 0 && !hit) {
        setTimeout(function() {
            AttemptGraph(code, ctx, collisiondata, reverse, y, xoffset, x + 1, false)
        }, 3)
    } else {
        DrawingFunction = false
        $("#textinput").removeAttr("disabled")
        console.log({x:x + xoffset, y:q})
    }
}
