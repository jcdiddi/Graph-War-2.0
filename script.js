/*global math*/
$(function() {
$("#textinput").on('change keyup paste', function() {
    var canvas = $("#screen")[0]
    if(canvas.getContext) {
   		var ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, canvas.width, canvas.height) // Under normal conditions this is how the graph will be cleared
        canvas.width = canvas.width // In jsfiddle this seems to be the only way to clear the canvas
        try {
            var code = math.compile($("#textinput").val())
            var obj = new Object()
            obj.x = 0
            ctx.moveTo(0, canvas.height - code.eval(obj))
    	    for(var x = 0; x <= canvas.width; x++) {
                obj.x = x
             	ctx.lineTo(x, canvas.height - code.eval(obj))   
            }
    	    ctx.stroke()
            ctx.closePath()
            $("#error").text("  ")
        } catch (error) {
            $("#error").text("Invalid Equation!")
            console.log(error)
        }
    }
})
})