## JFrog Add-on for Bitbucket Cloud
JFrog has developed an add-on for Atlassian’s BitBucket distributed version control system. The add-on integrates BitBucket with JFrog Artifactory and JFrog Bintray to provide a unified dashboard that visualizes the entire release pipeline - from commit to BitBucket triggering the CI server to run a build, to promotion in Artifactory through the quality gates, until it is released for distribution through Bintray.

# Steps to Install JFrog Add-on to Bitbucket Cloud.

Click on link below it will take you to Bitbucket cloud Installation page.
<html>
  <head>
    <link rel="stylesheet" href="https://aui-cdn.atlassian.com/aui-adg/5.9.14/css/aui.min.css" media="all">
  </head>
  <body>
    <a class="aui-button aui-button-primary"
          href="https://bitbucket.org/site/addons/authorize?descriptor_uri=https://bitbucket-connect.jfrog.com/&redirect_uri=https://bitbucket-connect.jfrog.com/atlassian-connect.json">
       <span class="aui-icon aui-icon-small aui-iconfont-bitbucket"></span>
       Install Add-on to your Bitbucket Cloud.
    </a>
  </body>
</html>

#Configure Bamboo User (Mandatory)
![Bamboo User Configuration](https://raw.githubusercontent.com/JFrogDev/bitbucket-bintray-plugin/master/screenshots/bamboo-user.png)

Note: Bamboo should be accessible form outside. As JFrog addo-on is only for Bitbucket Cloud.

#Configure Artifactory User (Mandatory)
![Artifactory User Configuration](https://raw.githubusercontent.com/JFrogDev/bitbucket-bintray-plugin/master/screenshots/artifactory-user.png)

Note: Artifactory should be accessible form outside. You can use also this add-on with AOL(Artifactory Online). JFrog addo-on is only for Bitbucket Cloud.

#Configure Bintray User (Mandatory)
![Artifactory User Configuration](https://raw.githubusercontent.com/JFrogDev/bitbucket-bintray-plugin/master/screenshots/bintray-user.png)

#Associate Bamboo Build
![Associate Bamboo Build](https://raw.githubusercontent.com/JFrogDev/bitbucket-bintray-plugin/master/screenshots/bamboo-build.png)


#Associate Artifactory Build
![Associate Artifactory Build](https://raw.githubusercontent.com/JFrogDev/bitbucket-bintray-plugin/master/screenshots/artifactory-build.png)


#Associate Bintray Package
![Associate Bintray Package](https://raw.githubusercontent.com/JFrogDev/bitbucket-bintray-plugin/master/screenshots/bintray-package.png)

#Dashboard
![Dashboard](https://raw.githubusercontent.com/JFrogDev/bitbucket-bintray-plugin/master/screenshots/dashboard.png)




