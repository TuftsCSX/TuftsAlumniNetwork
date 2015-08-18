$(function() {
    $('.modal-trigger').leanModal();
    $('.datepicker').pickadate({
        selectYears: 20,
        selectMonths: true,
        format: 'mmmm \'yy',
        hiddenName: true,
        formatSubmit: 'mm/dd/yyyy'

    }); 
    var mapOptions = {
        center: { lat: 42.3601, lng: -71.0589 },
        zoom: 5,
        disableDefaultUI: true,
        panControl: true,
        zoomControl: true,
        
    };
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    var spiderfier = prepSpiderfier(map);
    var openWindow = null;
    var $typesFilter = $('#types-dropdown');
    var $companyFilter = $('#company-dropdown');
    var jobType = null;
    var companyName = null;
    var allAlumni = null;
    var $currentlyShowing = $('#currentlyShowing');

    $('#resetFilters').click(function(e) {
        jobType = null;
        companyName = null;
        showAlumni(allAlumni);
    });

    $.get('/api/alumni', gotAlumni);

    function getCompanyOrSchool( alumn ) {
        var company = "";
        if ( Boolean( alumn.companyName ) ) {
            company += alumn.companyName;
        }

        if ( Boolean ( alumn.jobTitle ) ) {
            if ( company.length > 0 ) {
                company += ' - ';
            }
            company += alumn.jobTitle;
        }

        if ( company === '' ) {
            company = alumn.academiaWhere;
        }

        if ( company === '' ) {
            company = 'Other';
        }
        
        return company;
    }

    function getNameAndGradYear( alumn ) {
        var name = alumn.displayName;
        if ( alumn.gradYear ) {
            var gradYear = new Date(alumn.gradYear).getFullYear();
            name += ' c/o ' + gradYear;
        }

        return name;
    }

    function getWhatAlumnIsDoing( alumn ) {
        if ( Boolean( alumn.jobWhat ) ) {
            return alumn.jobWhat;
        } else if ( Boolean( alumn.academiaWhat ) ) {
            return alumn.academiaWhat;
        } else if ( Boolean( alumn.otherWhat ) ) {
            return alumn.otherWhat;
        } else {
            return '';
        }
    }
    
    /*
     * Prepares and returns the contents of an InfoWindow about an alumn
     * @param {Object} alumn - The Alumn to make an infowindow for
     * @returns {HTMLNode} The rendered content of an InfoBox
     *
     */
    function prepContent(alumn) {

        var template = document.getElementById('infoWindow');
        template.content.getElementById('displayName').textContent = getNameAndGradYear( alumn );
        template.content.getElementById('company').textContent = getCompanyOrSchool( alumn );
        template.content.getElementById('type').textContent = getAlumnType( alumn ); 
        template.content.getElementById('contact').textContent = alumn.email;
        template.content.getElementById('doing').textContent = getWhatAlumnIsDoing( alumn );
        var rendered = document.importNode(template.content, true);
        return rendered;
    }

    function getAlumnType( alumn ) {
        if ( Boolean( alumn.companyName ) ) {
            return 'Industry'; 
        } else if ( Boolean ( alumn.academiaWhere ) ) {
            return 'Academia';
        } else {
            return 'Other';
        }
    }
    /*
     * Plot of the alumni on the map, and prepare their infowindows
     * @param {Array} alumni - The alumni to plot
     *
     */
    function gotAlumni(alumni) {
        console.log(alumni);
        allAlumni = alumni;
        var types = {};
        var companies = {};
        alumni.forEach(function renderAlumn(alumn) {
            types[ getAlumnType( alumn ) ] = true;
            if ( Boolean( alumn.companyName ) ) {
                companies[alumn.companyName] = true;
            }
            if ( Boolean( alumn.academiaWhere ) ) {
                companies[alumn.academiaWhere] = true;
            }
            addMarkerToMap(alumn);
        });
        var jobTypes = Object.keys(types);
        prepFilters(jobTypes, Object.keys(companies));
    }

    function addMarkerToMap(alumn) {
        var alumnType = getAlumnType( alumn );
        var markerIconColor = 'yellow';
        if ( alumnType == 'Industry' ) {
            markerIcon = 'purple';
        } else if ( alumnType == 'Academia' ) {
            markerIconColor = 'green';
        }
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(alumn.lat, alumn.lng),
            map: map,
            title: alumn.name,
            alumn: alumn,
            icon: 'http://maps.google.com/mapfiles/ms/icons/' + markerIconColor + '-dot.png'
        });
        spiderfier.addMarker(marker);
    }

    function showAlumni(alumni) {
        closeInfoWindow(openWindow);
        console.log("Filtering for: ", jobType, companyName);
        var msg = 'Currently showing all alumni';
        if (jobType !== null && companyName !== null) {
            msg = 'Currently filtering for ' + jobType + ' positions at ' + companyName;
        } else if ( companyName !== null ) {
            msg = 'Currently filtering for all job types at ' + companyName;
        } else if ( jobType !== null ) {
            msg = 'Currently filtering for ' + jobType + ' at all companies and schools';
        }

        $currentlyShowing.text(msg);
        spiderfier.getMarkers().forEach(function (marker) {
            marker.setMap(null);
        });
        spiderfier.clearMarkers();

        alumni.filter(function(alumn) {

            var alumnType = getAlumnType( alumn );
            // If we're not currently filtering, accept all
            if ( jobType === null && companyName === null ) {
                return true;
            }

            // If company is correct and we're not filtering by job type
            if ( jobType === null && ( companyName === alumn.companyName || companyName == alumn.academiaWhere ) ) {
                return true;
            }

            // If job type is correct and we're not filtering by company
            if ( companyName === null && jobType === alumnType ) {
                return true;
            }

            // If both company and job type are the same
            if ( ( companyName === alumn.companyName || companyName == alumn.academiaWhere ) && jobType === alumnType ) {
                return true;
            }

            return false;

        }).forEach(function(alumn) {
            addMarkerToMap(alumn);
        });
    }

    function prepFilters(jobTypes, companies) {
        var i = 0;
        for(i = 0; i < jobTypes.length; ++i) {
            var type = jobTypes[i];
            $typesFilter.append($('<li><a href="#!" class="typeFilter">' + type + '</a></li>'));
        }

        for(i = 0; i < companies.length; ++i) {
            var company = companies[i];
            $companyFilter.append($('<li><a href="#!" class="companyFilter">' + company + '</a></li>'));
        }


        $('.typeFilter').click(function(e) {
            var msg = this.text;
            console.log('Setting jobType to', msg);
            if (msg === 'Show All') {
                jobType = null;
            } else {
                jobType = this.text;
            }
            showAlumni(allAlumni);
        });

        $('.companyFilter').click(function(e) {
            var msg = this.text;
            console.log('Setting companyName to', msg);
            if (msg === 'Show All') {
                companyName = null;
            } else {
                companyName = this.text;
            }
            showAlumni(allAlumni);
        });

    }

    /* 
     * Prepare the Marker Spiderfier for the map
     * @param {Object} map - The google map to attach the spiderfier to
     * @returns {Object} The prepared spiderfier, ready to have markers added to it.
     *
     */
    function prepSpiderfier(map) {
        var spiderfyOptions = {
            keepSpiderfied: true,
            legWeight: 5,
        };
        var preppedSpiderfier = new OverlappingMarkerSpiderfier(map, spiderfyOptions);
        preppedSpiderfier.addListener('click', function(marker, event) {
            closeInfoWindow(openWindow);

            var infowindow = new InfoBox({
                content: prepContent(marker.alumn),
                closeBoxMargin: "12px 4px 2px 2px",
                closeBoxUrl: "//www.google.com/intl/en_us/mapfiles/close.gif",
            });

            infowindow.open(map, marker);
            openWindow = infowindow;
        });

        preppedSpiderfier.addListener('spiderfy', function(markers) {
            closeInfoWindow(openWindow);
        });

        preppedSpiderfier.addListener('unspiderfy', function(markers) {
            closeInfoWindow(openWindow);
        });

        return preppedSpiderfier;
    }

    /* 
     * Close an infoWindow if it exists
     * @param {Object} infoWindow - the infoWindow to close
     *
     */
    function closeInfoWindow(infoWindow) {
        if ( Boolean( infoWindow ) ) {
            infoWindow.close();
        }
    }
});
