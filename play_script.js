$(function() {															// TODO: Is this commenting method good? Or should I change it?
	$("#TextInput").on('change keyup paste', function() {				// Hook the textinput whenever it changes
		var canvas = document.getElementById("Screen"); 				// Get the canvas #inconsistant semicolons
		if (canvas.getContext) { 										// Valid context (Browser can use canvas)
			var ctx = canvas.getContext("2d")							// Get the context
			if(math) {													// Math is loaded, Might not be useful
				try {													// Try/Catch to get syntax errors from the input
					ctx.clearRect(0, 0, canvas.width, canvas.height)	// Clear the canvas
					ctx.beginPath()										// Start a path
					var code = math.compile($("#TextInput").val())		// Compile an equation using Math.js, Compiling is faster than just math.eval'ing every tick
					ctx.moveTo(x, code.eval({x : 0}))					// Move to the first point
					console.log("Starting for loop")					// DEBUG: Speed testing
					var scope = new Object()							// Create a scope for math.js to use when figuring out the equation
					for(var x = 1; x < canvas.width; x += 1) {			// For loop through every x value on the graph
						scope.x = x										// Make sure the scope is accurate
						ctx.lineTo(x, code.eval(scope))					// Pass the scope to the compiled equation, getting the value, and adding it to the line
					}
					console.log("Finished for loop")					// DEBUG: Speed testing
					ctx.stroke()										// Draw the line
					console.log("Finish Drawing")						// DEBUG: Speed testing
					$("#TextError").text("")							// Make sure there's no error being displayed
				} catch (error) {										// If there's an error, we need to know about it
					$("#TextError").text("Invalid Expression!")			// Let the user know there's been an error
					console.log(error)									// Put the error in the console so devs can figure out what the problem is
				}
			}
		}
	})
})