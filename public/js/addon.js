$(".js-example-basic-multiple-limit").select2({
    maximumSelectionLength: 1
});



//alert($("#select-build").val());
//AJS.$(function() {
//    AJS.$('#trigger').on('click', function() {
//        location.reload();
//    });
//});

AJS.$(function() {
    var spinning = false;
    AJS.$('#save-user-credentials').on('click', function() {
        if (!spinning) {
            AJS.$('.button-spinner').spin();
            spinning = true;
        } else {
            AJS.$('.button-spinner').spinStop();
            spinning = false;
        }
    });
});

AJS.$(function() {
    var spinning = false;
    AJS.$('#save-build').on('click', function() {
        if (!spinning) {
            AJS.$('.button-spinner').spin();
            spinning = true;
        } else {
            AJS.$('.button-spinner').spinStop();
            spinning = false;
        }
    });
});



AJS.$(function() {
    var spinning = false;
    AJS.$('#save-package-path').on('click', function() {
        if (!spinning) {
            AJS.$('.button-spinner').spin();
            spinning = true;
        } else {
            AJS.$('.button-spinner').spinStop();
            spinning = false;
        }
    });
});