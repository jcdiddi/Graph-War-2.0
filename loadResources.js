$(function(){
    loadResource("#mainNav", "navBar.html");
    loadResource(".footer", "footer.html");
    loadResource("#logo", "logo.html");
    loadResource("#aboutMessageBG", "aboutMessage.html");
    loadResource("#preSettings", "settings.html");
});

function loadResource(idClass, file){
    theFile = "resources/" + file;
    try{
        $(idClass).load(theFile);
    }
    catch(error){
        console.log(error);
    }
}