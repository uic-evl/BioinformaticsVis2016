// Main application variable
var Application = Application ||  {};

//
(function()
{
    Application.outerWidth = 1580;
    Application.outerHeight = 760;
    Application.margin = 20;

    Application.protein_type = 3;
    Application.gene_type = 5;
    Application.TimeStep = 21;
    Application.currentTime = 10;

    Application.shiftX = 50;
    Application.shiftY = 25;
    
    // main view
    Application.main_width = (Application.outerWidth - Application.margin*3) * 5 / 6;
    Application.main_height =  Application.outerHeight - Application.margin*2;
    

})();