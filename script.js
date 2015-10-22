/*global math*/
$(function() {
$("#textinput").on('change keyup paste', function() {
    var canvas = $("#screen")[0]
    if(canvas.getContext) {
        var ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, canvas.width, canvas.height) // Under normal conditions this is how the graph will be cleared
        canvas.width = canvas.width // In jsfiddle this seems to be the only way to clear the canvas

        try {
            var pointListDiv = document.getElementById("values");//set up a div to push values out to for debugging
            var pointList = "" // string containing values that will be pushed to the div
            var code = math.compile($("#textinput").val())
            var obj = new Object()
            obj.x = 0
            ctx.moveTo(0, canvas.height - code.eval(obj))

            for(var x = 0; x <= canvas.width; x++) {
                var shouldBreak = false; //bool to break out of the loop when the edge is hit
                obj.x = x
                var yValue = (code.eval(obj));

                if(yValue < -.1){//When the number gets enourmous (+-100000000000000ish) it doesn't graph at all, and you never see negative vals anyways, so set it to -1 if it is under -.1
                    yValue = -1;
                    shouldBreak = true;//Don't break yet because it hasn't graphed the final point...
                }
                else if(yValue > canvas.height + .1){
                    yValue = canvas.height + 1;
                    shouldBreak = true;
                }
                pointList += "<br />(" + x + ", " + yValue + ")";
                ctx.lineTo(x, canvas.height - yValue)
                if(shouldBreak){
                    break; //break if it went out of bounds
                }
            }
            pointListDiv.innerHTML = pointList;
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
