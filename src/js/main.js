// Main application variable
var Application = Application ||  {};

//
(function()
{
    Application.body = document.body;
    Application.html = document.documentElement;

    Application.outerWidth = document.getElementsByTagName('body')[0].clientWidth;

    Application.margin = 25;

    Application.protein_type = 3;
    Application.gene_type = 5;
    Application.TimeStep = 21;
    Application.currentTime = 10;

    Application.shiftX = 55;
    Application.shiftY = 25;

    Application.clickedPaIndex = -1;
    Application.clickedPbIndex = -1;
    Application.clickedPcIndex = -1;

    Application.data = {};

    // Control Panel Variables
    Application.show_projectionOneD = true;
    Application.show_projectionTwoD = false;
    Application.show_projectionTwoD_Pab = false;
    Application.show_projectionTwoD_Pac = false;
    Application.show_projectionTwoD_Pbc = false;
    Application.show_projectionTwoD_time = false;
    Application.show_projectionOneD_time = false;
    Application.show_projectionTwoD_3rdP = false;
    Application.show_projectionThreeD = false;
    Application.show_peaks = false;
    Application.show_detailTwoD = false;
    Application.show_qualitative = false;
    Application.show_animation = false;

})();