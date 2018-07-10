// --------- START UTILITIES --------
console.log('The custom script for album connections update page is running');

function hideDOMelement(elementId) {
    try {
        let element = document.getElementById(elementId)
        element.style.display = "none";
    } catch (error) {
        // this element does not exist yere
    }
}

function showDOMelement(elementId) {
    try {
        let element = document.getElementById(elementId)
        element.style.display = "block";
    } catch (error) {
        // this element does not exist yere
    }
}

var isEqual = function (value, other) {
// source: https://gomakethings.com/check-if-two-arrays-or-objects-are-equal-with-javascript/
	// Get the value type
	var type = Object.prototype.toString.call(value);

	// If the two objects are not the same type, return false
	if (type !== Object.prototype.toString.call(other)) return false;

	// If items are not an object or array, return false
	if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

	// Compare the length of the length of the two items
	var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
	var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
	if (valueLen !== otherLen) return false;

	// Compare two items
	var compare = function (item1, item2) {

		// Get the object type
		var itemType = Object.prototype.toString.call(item1);

		// If an object or array, compare recursively
		if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
			if (!isEqual(item1, item2)) return false;
		}

		// Otherwise, do a simple comparison
		else {

			// If the two items are not the same type, return false
			if (itemType !== Object.prototype.toString.call(item2)) return false;

			// Else if it's a function, convert to a string and compare
			// Otherwise, just compare
			if (itemType === '[object Function]') {
				if (item1.toString() !== item2.toString()) return false;
			} else {
				if (item1 !== item2) return false;
			}

		}
	};

	// Compare properties
	if (type === '[object Array]') {
		for (var i = 0; i < valueLen; i++) {
			if (compare(value[i], other[i]) === false) return false;
		}
	} else {
		for (var key in value) {
			if (value.hasOwnProperty(key)) {
				if (compare(value[key], other[key]) === false) return false;
			}
		}
	}

	// If nothing failed, return true
	return true;
};

// --------- END UTILITIES --------



// ----- START FIREBASE ALBUM CONNECTIONS SECTION ------
// will include json object of all connections for this album
var connectedAlbums = []; 
var seccondConnectedAlbums = [];
// will be an array of just album id's connected to this album
var directConnections = []; 

function updateConnectedAlbums() {
    var dbRefrence3 = database2.ref().child(albumId);
    dbRefrence3.on('value', snap => {
        connectedAlbums = snap.val() || [];

        findDirectConnections();
    });
}

function checkSecondConnections(method, connectedAlbumId) {
    if (method == "add") { pathAlbumId = newAlbumId }
    if (method == "delete") { pathAlbumId = connectedAlbumId }

    var dbRefrence4 = database2.ref().child(pathAlbumId);
    dbRefrence4.once('value').then(function(snapshot) {
        seccondConnectedAlbums = snapshot.val() || [];
        
        if (method == "add") { addSecondConnection(); }

        if (method == "delete") { removeSecondConnection(connectedAlbumId); }
    });   
}

// ----- END FIREBASE ALBUM CONNECTIONS SECTION ------


// drills through full connectedAlbums array to pull out direct connections
function findDirectConnections() {
    directConnections = [];
    
    if (connectedAlbums.length != 0) {
        for (let index = 0; index < connectedAlbums.length; index++) {
            var connectionObject = connectedAlbums[index];
            
            // avoids js errors for undefined values
            // only shows connections formed by this user
            if (connectionObject != undefined & connectionObject.author == userID) {

                directConnections.push(connectionObject.connection)
            }
        }
    }
    populateConnections();
}

// drills through directConnections to pull out connected albums and show them on the page
function populateConnections() {
    $(".connection_results").text('');

    if (directConnections.length != 0) {
        showDOMelement("connections_card");

        for (let index = 0; index < directConnections.length; index++) {
            let connection = directConnections[index];

            if (connection != albumId) {
                $.getJSON ( '/albumdetails/json/' + parseInt(connection), function(rawData) {
                    var cover = rawData.data[0].attributes.artwork.url.replace('{w}', 75).replace('{h}', 75);
                    $('.connection_results').append(`<tr><td><a href="/albumdetails/${connection}"><img class="small_cover" src="${cover}"></a></td><td><a href="" onclick="deleteConnection(${connection})">Delete</a></td></tr>`)
                });
            }            
        }
    }
}

var isDelete = false;
var newAlbumId;

function newConnection() {
    if ($('#new_connection').val() != ''){
        newAlbumId = parseInt($('#new_connection').val());
        isDelete = false;

        $.getJSON ( '/albumdetails/json/' + parseInt(newAlbumId), function(rawData) {
            // check if this is a valid album id
            // rawData.errors returns undefined if there are no errors
            // rawData.data returns undefined if there are no albums
            if (rawData.data) {
                isValidAlbum = true
            } else {
                isValidAlbum = false
            }
        }).then(function(){
            if (isValidAlbum) {
                if (newAlbumId != albumId) { createConnection(newAlbumId, isDelete); }
                else { alert("You cannot connect an album to itself.") }
            } else {
                alert("Sorry, Apple says that's not an album ID.")
            }
        })

        $('#new_connection').val('');
    } else {
        // console.log("Connection field is blank")
    }
}

function deleteConnection(connectedAlbum) {
    event.preventDefault()
    var confirmation = confirm('Are you sure you want to delete a connection?');
    if (confirmation === true) {
        isDelete = true;
        createConnection(connectedAlbum, isDelete);
    }
}

function createConnection(newAlbumId, isDelete) {
    let newConnection = {
        "author" : userID,
        "connection" : newAlbumId
    }
    let duplicate = false

    if (directConnections.length != 0) {
        for (let index = 0; index < directConnections.length; index++) {
           let connection = directConnections[index];
           if (connection == newAlbumId) { duplicate = true }
        }
    }
    // if this is a delete request, call removeConnection
    if (isDelete == true) { removeConnection(newConnection, newAlbumId); return; }

    // if this is an add requrest and it is not aduplicate clal addConnection
    if (duplicate == false && isDelete == false) { addConnection(newConnection); return; }

    // only duplicate add requests should hit this branch
    else { alert("You've already created this connection.") }
}

function addConnection(newConnection) {
    connectedAlbums.push(newConnection);
    database2.ref().child(albumId).set(connectedAlbums).then(function() { checkSecondConnections("add", newAlbumId) })
}

function addSecondConnection() {

    let secondNewConnection = { "author" : userID, "connection" : albumId }
    seccondConnectedAlbums.push(secondNewConnection);
    database2.ref().child(newAlbumId).set(seccondConnectedAlbums);
}

// need to find a way to recieve this connected album id here
function removeSecondConnection(connectedAlbum) {
    var index
    let connection = { "author" : userID, "connection" : albumId }

    for (let j = 0; j < seccondConnectedAlbums.length; j++) {
        let element = seccondConnectedAlbums[j];

        if (isEqual(element, connection) == true) { 
            index = seccondConnectedAlbums.indexOf(element) 
        }
    }

    seccondConnectedAlbums.splice(index, 1);
    database2.ref().child(connectedAlbum).set(seccondConnectedAlbums);
}

function removeConnection(connection, connectedAlbumId) {
    var index

    for (let j = 0; j < connectedAlbums.length; j++) {
        let element = connectedAlbums[j];

        if (isEqual(element, connection) == true) { 
            index = connectedAlbums.indexOf(element) 
        }
    }

    connectedAlbums.splice(index, 1);
    database2.ref().child(albumId).set(connectedAlbums).then(function() { checkSecondConnections("delete", connectedAlbumId) })
}

// function updateConnectionDatabase(pathAlbum, connectionObject) {

//     database2.ref().child(pathAlbum).set(connectionObject)
// }