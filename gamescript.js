$(document).ready(function() {
    
    $("#input-function").on("change keydown paste", function() {
      
        try {
            var input = math.eval($("#input-function").val());
            $(".math-error");
            $(".action-fire").prop("disabled", false);
            $("#input-function").css('color', 'black');
        }
        catch (error)
        {
            var errorString = error.toString();
            var trimmedError = errorString.substring(errorString.indexOf(":") + 1);
            
            console.log(error.toString());
            
            $(".math-error").text(trimmedError.toString());
            $(".action-fire").prop("disabled", true);
            $("#input-function").css('color', 'red');
        }
        
    });
    
    var preview = $(".preview");
    
    preview.data("enabled", true);
    preview.text("Preview Enabled");
    preview.css("background-color", "#0080FF");
    preview.click(function() {
        if (preview.data("enabled")) {
            preview.data("enabled", false);
            preview.text("Preview Disabled");
            preview.css("background-color", "#FF8000");
        }
        else {
            preview.data("enabled", true);
            preview.text("Preview Enabled");
            preview.css("background-color", "#0080FF");
        }
    });
    
});

function gameSettings() {
    alert("This will launch an in-game settings window.");
}
function quit() {
    var q = confirm("Press OK to quit, press cancel to continue playing.");
    if (q == true) {
        alert("You quit the game.");
    }
}
function help() {
    alert("Displays help information.")
}
function functions() {
    alert("Please select the function you want to insert:\nabs()\nlog()\netc...");
}