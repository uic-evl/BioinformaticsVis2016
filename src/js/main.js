// Main application variable
var Application = Application ||  {};

//
(function()
{
    var body = document.body,
        html = document.documentElement;

    Application.outerWidth = document.getElementsByTagName('body')[0].clientWidth;

    Application.outerHeight = Math.max( body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight );

    Application.margin = 20;

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

    // main view
    Application.main_width = (Application.outerWidth - Application.margin*3) * 5 / 6;
    Application.main_height =  (Application.outerHeight - Application.margin) / 2 ;


    // Control Panel Variables
    Application.show_projectionOneD = true;
    Application.show_projectionTwoD = false;
    Application.show_projectionTwoD_Pab = false;
    Application.show_projectionTwoD_Pac = false;
    Application.show_projectionTwoD_Pbc = false;
    Application.show_projectionTwoD_time = false;
    Application.show_projectionTwoD_3rdP = false;
    Application.show_projectionThreeD = false;
    Application.show_peaks = false;
    Application.show_detailTwoD = false;

})();