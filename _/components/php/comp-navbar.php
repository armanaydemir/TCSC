<nav class="navbar navbar-default navbar-fixed-top navbar-inverse" role="navigation">
    <div class="container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button><!-- button -->
            
        </div> <!--/.nav-collapse -->
        <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav navbar-right">
                <a href="#" class="pull-left logo" style="padding-right:3em;">
                    <img style="max-width:40px;max-height: 40px;margin-top: 5px"src="images/emblem.png" id="logodiv">
                </a>
                <li class="active"><a href="#">Dashboard</a></li>
                <li><a href="#">Stats</a></li>
                <li><a href="#">Team</a></li>
                <!-- perhaps we should move the rules to the settings -->
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                        <img src="images/useridenticon.png" class="img-rounded" alt="id" width="20px" height="20px">
                        <span class="caret"></span>
                    </a>
                    <ul class="dropdown-menu">
                        <li class="dropdown-header">Signed in as "username"</li>
                        <li role="separator" class="divider"></li>
                        <li><a href="#">Your Profile</a></li>
                        <li><a href="#">Help</a></li>
                        <li role="separator" class="divider"></li>
                        <li><a href="#">Settings</a></li>
                        <li role="separator" class="divider"></li>
                        <li><a href="#">Sign Out</a></li>
                    </ul> <!-- dropdown-menu -->
                </li> <!-- dropdown -->
            </ul> <!-- navbar links -->
        </div> <!-- code for collapsable navbar -->
    </div> <!-- container -->
</nav> <!-- navbar -->