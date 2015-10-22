/*global math*/
var DrawingFunction = false;
var ObstacleArguments = new Object() // OOP FTW

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
Entity.prototype.Radius = 50

function Setup() {
    $("#graph-holder").children().css({
        "position": "absolute",
        "left": "0",
        "top": "0",
        "width": "720",
        "height": "480"
    })
    GenerateObstacles("#obstacle-graph", 5, 50, 10)
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
            DrawingFunction = true
            AttemptGraph(math.compile($("#textinput").val()), $("#animated-graph")[0].getContext("2d"), $("#obstacle-graph")[0].getContext("2d").getImageData(0, 0, $("#obstacle-graph").width(), $("#obstacle-graph").height()))
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
                obj.x = 0
                ctx.beginPath()
                ctx.strokeStyle = "lightgray"
                ctx.moveTo(0, canvas.height - code.eval(obj))
    	        for(var x = 1; x < canvas.width; x++) {
                    obj.x = x
             	    ctx.lineTo(x, canvas.height - code.eval(obj))
             	    if(code.eval(obj) >= canvas.height) {
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
            return true
        }
        e += de
        while(e >= 0.5) {
            if(CheckCollision(collisiondata, x, y)) {
                return true
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
function AttemptGraph(code, ctx, collisiondata, x) {
    if(typeof x === 'undefined') x = 0;
    $("#textinput").html("")
    var width = ctx.canvas.clientWidth
    var height = ctx.canvas.clientHeight
    if(x > 0) {
        ctx.beginPath()
        ctx.strokeStyle = "black"
        var obj = new Object()
        obj.x = x - 1
        var y1 = height - code.eval(obj)
        obj.x++
        var y2 = height - code.eval(obj)
        if(CheckLineCollision(collisiondata, x-1, math.floor(y1), x, math.floor(y2))) {
            DrawingFunction = false;
            console.log("Collision at: " + x.toString() + " " + y2.toString())
            return;
        }
        ctx.moveTo(x - 1, y1)
        ctx.lineTo(x, y2)
        ctx.stroke()
    } else {
        ctx.beginPath()
        ctx.strokeStyle = "black"
        ctx.moveTo(0, height - code.eval({x:0}))
        ctx.lineTo(1, height - code.eval({x:1}))
        ctx.stroke()
    }
    var t = new Object()
    t.x = x
    if(x <= width && code.eval(t) <= height) {
        setTimeout(function() {
            AttemptGraph(code, ctx, collisiondata, x+1)
        }, 3)
    } else {
        DrawingFunction = false
    }
}