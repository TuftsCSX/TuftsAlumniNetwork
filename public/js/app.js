$(function() {
    var mapOptions = {
        center: { lat: 42.3601, lng: -71.0589 },
        zoom: 5
    };
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    var spiderfier = prepSpiderfier(map);
    var openWindow = null;

    $.get('/api/alumni', gotAlumni);
    
    /*
     * Prepares and returns the contents of an InfoWindow about an alumn
     * @param {Object} alumn - The Alumn to make an infowindow for
     * @returns {HTMLNode}
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
     * @param {Object} alumni - The alumni to plot
     *
     */
    function gotAlumni(alumni) {
        alumni.forEach(function renderAlumn(alumn) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(alumn.lat, alumn.lng),
                map: map,
                title: alumn.name,
                alumn: alumn
            });
            spiderfier.addMarker(marker);
        });
    }

    /* 
     * Prepare the Marker Spiderfier for the map
     * @param {Object} map - The google map to attach the spiderfier to
     * @returns {Object} The prepared spiderfier, ready to have markers added to it.
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
