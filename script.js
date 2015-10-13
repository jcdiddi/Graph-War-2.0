/*global math*/
var DrawingFunction = false;
$(function() {
    $("#textinput").keypress(function (e) {
        console.log("Oi, a thing happened!")
        if(e.keyCode == 13) {
            DrawingFunction = true
            SlowGraph(math.compile($("#textinput").val()), $("#screen")[0].getContext("2d"), $("#screen")[0].width, $("#screen")[0].height)
        }
    })
    $("#textinput").on('change keyup paste', function(e) {
        var canvas = $("#screen")[0]
        if(canvas.getContext && !DrawingFunction) {
   	    	var ctx = canvas.getContext("2d")
            ctx.clearRect(0, 0, canvas.width, canvas.height) // Under normal conditions this is how the graph will be cleared
            try {
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
function SlowGraph(code, ctx, width, height, x) {
    if(typeof x === 'undefined') x = 0;
    $("#textinput").html("")
    if(x > 0) {
        ctx.beginPath()
        ctx.strokeStyle = "black"
        var obj = new Object()
        obj.x = x - 1
        ctx.moveTo(x - 1, height - code.eval(obj))
        obj.x++
        ctx.lineTo(x, height - code.eval(obj))
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
            SlowGraph(code, ctx, width, height, x+1)
        }, 3)
    } else {
        DrawingFunction = false
    }
}