$(".js-example-basic-multiple-limit").select2({
    maximumSelectionLength: 1
});

AJS.$(function () {
    var spinning = false;
    AJS.$('#save-user-credentials').on('click', function () {
        if (!spinning) {
            AJS.$('.button-spinner').spin();
            spinning = true;
        } else {
            AJS.$('.button-spinner').spinStop();
            spinning = false;
        }
    });
});

AJS.$(function () {
    var spinning = false;
    AJS.$('#save-build').on('click', function () {
        if (!spinning) {
            AJS.$('.button-spinner').spin();
            spinning = true;
        } else {
            AJS.$('.button-spinner').spinStop();
            spinning = false;
        }
    });
});


AJS.$(function () {
    var spinning = false;
    AJS.$('#save-package-path').on('click', function () {
        if (!spinning) {
            AJS.$('.button-spinner').spin();
            spinning = true;
        } else {
            AJS.$('.button-spinner').spinStop();
            spinning = false;
        }
    });
});

AJS.$(function () {
    AJS.$('#test-artifactory-connection').on('click', function () {
        var username = AJS.$('#username').val();
        var password = AJS.$('#password').val();
        var url = AJS.$('#url').val();
        AJS.$('.button-spinner').spin();
        AJS.$.ajax({
            url: "testArtifactoryConnection?username=" + username + "&password=" + password + "&url=" + url,
            type: "GET",
            success: function(msg){
                AJS.$('.button-spinner').spinStop();
                alert(msg);
            }
        });
        return false;
    });
});



AJS.$(function () {
    AJS.$('#test-bamboo-connection').on('click', function () {
        var username = AJS.$('#username').val();
        var password = AJS.$('#password').val();
        var url = AJS.$('#url').val();
        var queryString = "username=" + encodeURIComponent(username) +
            "&password=" + encodeURIComponent(password) +
            "&url=" + encodeURIComponent(url);
        AJS.$('.button-spinner').spin();
        AJS.$.ajax({
            url: "testBambooConnection?" + queryString,
            type: "GET",
            success: function(msg){
                AJS.$('.button-spinner').spinStop();
                alert(msg);
            }
        });
        return false;
    });
});
