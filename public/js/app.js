$(function() {
    $('.modal-trigger').leanModal({
        complete: function() {
            console.log('Finished!');
        },    
    });
    $('.datepicker').pickadate({
        selectYears: 20,
        selectMonths: true,
        format: 'mmmm \'yy'
            
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

    
    /*
     * Prepares and returns the contents of an InfoWindow about an alumn
     * @param {Object} alumn - The Alumn to make an infowindow for
     * @returns {HTMLNode} The rendered content of an InfoBox
     *
     */
    function prepContent(alumn) {
        var company = "";
        if ( Boolean( alumn.company ) ) {
            company += alumn.company;
        }

        if ( Boolean ( alumn.jobTitle ) ) {
            if ( company.length > 0 ) {
                company += ' - ';
            }
            company += alumn.jobTitle;
        }

        var template = document.getElementById('infoWindow');
        template.content.getElementById('name').textContent = alumn.name;
        template.content.getElementById('company').textContent = company;
        template.content.getElementById('type').textContent = alumn.type; 
        template.content.getElementById('contact').textContent = alumn.contact;
        var rendered = document.importNode(template.content, true);
        return rendered;
    }

    /*
     * Plot of the alumni on the map, and prepare their infowindows
     * @param {Array} alumni - The alumni to plot
     *
     */
    function gotAlumni(alumni) {
        allAlumni = alumni;
        var types = {};
        var companies = {};
        alumni.forEach(function renderAlumn(alumn) {
            if ( alumn.type != undefined ) {
                types[alumn.type] = true;
            }
            if (alumn.company != undefined) {
                companies[alumn.company] = true;
            }
            addMarkerToMap(alumn);
        });
        var jobTypes = Object.keys(types);
        prepFilters(jobTypes, Object.keys(companies));
    }

    function addMarkerToMap(alumn) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(alumn.lat, alumn.lng),
            map: map,
            title: alumn.name,
            alumn: alumn
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
            msg = 'Currently filtering for ' + jobType + ' at all companies';
        }

        $currentlyShowing.text(msg);
        spiderfier.getMarkers().forEach(function (marker) {
            marker.setMap(null);
        });
        spiderfier.clearMarkers();

        alumni.filter(function(alumn) {
            // If we're not currently filtering, accept all
            if ( jobType === null && companyName === null ) {
                return true;
            }

            // If company is correct and we're not filtering by job type
            if ( jobType === null && alumn.company === companyName) {
                return true;
            }

            // If job type is correct and we're not filtering by company
            if ( companyName === null && alumn.type === jobType ) {
                return true;
            }

            // If both company and job type are the same
            if ( companyName === alumn.company && alumn.type === jobType ) {
                return true
            }

            return false;

        }).forEach(function(alumn) {
            addMarkerToMap(alumn);
        });
    }

    function prepFilters(jobTypes, companies) {
        for(var i = 0; i < jobTypes.length; ++i) {
            var type = jobTypes[i];
            $typesFilter.append($('<li><a href="#!" class="typeFilter">' + type + '</a></li>'));
        }

        for(var i = 0; i < companies.length; ++i) {
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
        }
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
