// -------- START UTILITIES SECTION --------

console.log("The custom script for the album details page is running")



function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function hideDOMelement(elementId) {
    try {
        let element = document.getElementById(elementId)
        element.style.display = "none";
        // $(`'#${element}'`).tooltip('disable')
    } catch (error) {
        // this element does not exist yere
    }
}

function showDOMelement(elementId) {
    try {
        let element = document.getElementById(elementId)
        element.style.display = "block";
        // $(`#${element}`).tooltip('enable')
    } catch (error) {
        // this element does not exist yere
    }
}

// takes a string thats an html element ID
function toggleDOMelement(content) {
    
    let query = $(`#${content}`); 
    // check if element is Visible
    var isVisible = query.is(':visible');
    
    if (isVisible === true) {
        // element was Visible
        query.hide();
    } else {
        // element was Hidden
        query.show();
    }
}


function toggleContentAndArrows(content, up, down) {
    
    let query = $(`#${content}`); 
    let downArrow = $(`#${down}`); 
    let upArrow = $(`#${up}`); 

    // check if element is Visible
    var isVisible = query.is(':visible');
    
    if (isVisible === true) {
        // element was Visible
        query.css( "display", "none" );
        downArrow.css( "display", "block" );
        upArrow.css( "display", "none" );
    } else {
        // element was Hidden
        query.css( "display", "block" );
        downArrow.css( "display", "none" );
        upArrow.css( "display", "block" );
    }
}

function toggleTracksAndArrows(content, up, down) {
    
    let query = $(`#${content}`); 
    let downArrow = $(`#${down}`); 
    let upArrow = $(`#${up}`); 

    // check if element is Visible
    var isVisible = query.is(':visible');
    
    if (isVisible === true) {
        // element was Visible
        query.css( "display", "none" );
        downArrow.css( "display", "inline-block" );
        upArrow.css( "display", "none" );
    } else {
        // element was Hidden
        query.css( "display", "inline-block" );
        downArrow.css( "display", "none" );
        upArrow.css( "display", "inline-block" );
    }
}

function countInArray(array, item) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === item) {
            count++;
        }
    }
    return count;
}
// -------- END UTILITIES SECTION --------


// This is really messy, but the album Id is stored in the ejs file in a hidden 
// element. It comes in as a string so I'm converting it to a number to use in
// my logic below
var albumId = $(".heres_the_album_id").text();
albumId = parseInt(albumId);
var tagsForThisAlbum;


// this populates the page with all the details
function populateAlbumDetails(albumNumber){

    $.getJSON ( '/albumdetails/json/' + albumNumber, function(rawData) {
        var artist = rawData.data[0].attributes.artistName;
        var album = rawData.data[0].attributes.name;
        var label = rawData.data[0].attributes.recordLabel;
        // the replaceing at the end here is setting the width and height of the image
        var cover = rawData.data[0].attributes.artwork.url.replace('{w}', 450).replace('{h}', 450);
        var applemusicurl = rawData.data[0].attributes.url;
        // calling my makeNiceDate function from below to format the date
        var release = makeNiceDate(rawData.data[0].attributes.releaseDate);
        
        var songObjectArray = rawData.data[0].relationships.tracks.data;
        var songNames = [];

        for (let index = 0; index < songObjectArray.length; index++) {
            let element = songObjectArray[index];
            songNames.push(element.attributes.name);
        }

        $('.albumdetails_details img').attr("src", cover, '<br');
        $('.albumdetails_artist').append(`<span onclick="moreByThisArtist('${artist}')" data-toggle="tooltip" data-placement="right" title="Search This Artist" data-trigger="hover" style="cursor:pointer;">${artist}</span>`);
        $('.albumdetails_artist').append(`<img src="../images/heart-unliked.png" height="30" width="auto" id="add_to_favorites" class="hide_when_logged_out hide_me_details" style="cursor:pointer;" onclick="addToFavoriteAlbums(${albumNumber})" data-toggle="tooltip" title="Add To Favorites" data-trigger="hover">`)
        $('.albumdetails_artist').append(`<img src="../images/heart-liked.png" height="30" width="auto" id="remove_from_favorites" class="hide_when_logged_out hide_me_details" style="cursor:pointer;" onclick="removeFromFavorites(${albumNumber})" data-toggle="tooltip" title="Remove From Favorites" data-trigger="hover">`)
        // $('.albumdetails_album').append(album, '<br/>');
        $('.albumdetails_album').append(`<span id="the_album_name" data-toggle="tooltip" data-placement="right" title="Click to Show Album ID" data-trigger="hover" onclick="showAlbumID()" style="cursor:pointer;">${album}</span><span id="the_album_id" class="text-secondary" data-toggle="tooltip" data-placement="right" title="Select & Copy Album ID" data-trigger="hover" style="display:none;">${albumId}</span>`);

        // adding path to apple music to button
        $('.applemusicurl').attr("href", applemusicurl, '<br>');
        $('.albumdetails_label').append(label, '<br>');
        $('.albumdetails_release').append(release, '<br>');
        
        songNames.forEach(element => {
            $('.song_names').append(`<li>${element}</li>`);
        });
        
    });
};


function showAlbumID() {
    $('#the_album_id').tooltip('disable')
    showDOMelement("the_album_id")
    hideDOMelement("the_album_name")
    setTimeout(showAlbumName, 7000)
}

function showAlbumName() {
    $('#the_album_name').tooltip('disable')
    showDOMelement("the_album_name")
    hideDOMelement("the_album_id")
}

// I'm using this variable and function to reformat the date provided in Apple's API
// into a fully written-out and formated date
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function makeNiceDate(uglyDate) {
    let year = uglyDate.slice(0, 4);
    let day = uglyDate.slice(8, 10);
    let uglyMonth = uglyDate.slice(5, 7); 
    let niceMonth = months[uglyMonth-1];
    return(`${niceMonth} ${day}, ${year}`);
};

function replaceUnderscoreWithBackSlash(str) {
    return str.replace(/_/g, "/");
};

// this populates the Tags card with any tags stored in the mongodb database
// and retrieved by the router stored at the URL listed with the album number
function populateTags(albumNumber) {
    var noAuthors = false

    $.getJSON ( '/albumdetails/database/' + albumNumber, function(rawData) {
        if (typeof(rawData[0]) != "undefined") {
            // clear default no-tags notice if tags exist
            $(".tag_results").text('');
            $(".tag_search_button").html('<a href="" onclick="tagSearch()" class="btn btn-sm btn-outline-secondary tag_search_button hide_when_logged_out" style="display:none;">Search<span class="button_text"> by Selected Tags</span></a>');
            var tags = rawData[0].tags;
            var authors = rawData[0].createdBy;

            if (tags.length < 1) {
                // hide entire tags box if no tags exist
                // $('.tags_card').hide();
            } else {
                for (let index = 0; index < tags.length; index++) {
                    var element = tags[index];
                    var author;
    
                    try {
                        author = authors[index];
                        if (author == "Joshua Jones") {
                            author = "Ol5d5mjWi9eQ7HoANLhM4OFBnso2";
                        }
                    } catch (error) {
                        // error should only fire on older structures where there is no author field
                        author = "Ol5d5mjWi9eQ7HoANLhM4OFBnso2";
                    }
             
                    element = replaceUnderscoreWithBackSlash(element)
                    // creating a unique tag for each element, solving the problem of number tags not allowed
                    // by adding some letters to the start of any tag that can be converted to a number
                    // then using a regular expression to remove all spaces and special characters in each tag
                    if (parseInt(element)) {
                        var addLetters = "tag_";
                        var tagName = addLetters.concat(element).replace(/[^A-Z0-9]+/ig,'');
                    } else {                  
                        var tagName = element.replace(/[^A-Z0-9]+/ig,'');
                    }

                    // Here we add the tags as elements on the DOM, with an onclick function that uses a unique
                    // tag to toggle a badge-success class name and change the color
                    $('.tag_results').append(`<a href="" onclick="changeClass(${tagName})" id="${tagName}" class="badge badge-light album_details_tags author-${author}">${element}</a>  `);               
                }
                $('.album_details_tags').hide();
            }  
        }
    })
};


// this function is avaiable onclick for all the tags it will toggle
// between two boostrap classes to change the color of selected tags
// it takes in the unique tag ID assigned to eatch badge durring
// creation so that only the desired badge toggles colors
function changeClass(tagName) {
    event.preventDefault();
    // clear warning label
    $('.warning_label').text('');
    var thisTag = document.getElementById(tagName.id);
    thisTag.classList.toggle("badge-primary");
    thisTag.classList.toggle("selected_tag");
    thisTag.classList.toggle("badge-light");
    // see below
    addToTagArray(thisTag.innerHTML);
};


// this function creates an array and adds or removes tags as the
// applicable tag badges are clicked
var selectedTags = [];
function addToTagArray(tag) {
    // this conditional returns -1 value if tag is not in array
    if ($.inArray(tag, selectedTags) === -1) {
        selectedTags.push(tag);
    } else {
        // cant use pop because it removes last item only
        // this finds the item being clicked and uses that
        // index with splice() to remove 1 item only
        let index = selectedTags.indexOf(tag)
        selectedTags.splice(index, 1);
    };
};

// This section handles favorite albums functionality
var myFavoriteAlbums;

function updateFavoriteAlbums() {
    dbRefrence = firebase.database().ref().child(userID + "/My Favorites");
    dbRefrence.on('value', snap => {
        // if value is null, this makes myFavoriteAlbums an empty string
        myFavoriteAlbums = snap.val() || [];
        checkForDuplicates();
    });
}

function showAllTags() {
    event.preventDefault()   
    // console.log("show all tags called") 
    allTagsNoFilter();
    $('#show_all_tags').show()
    $('#show_only_my_tags').hide()
    $('#tags_modifier').html('All ');
    sessionStorage.setItem('tags', 'All Tags');
    clearTagArray()
}

function showOnlyMyTags() {
    event.preventDefault()  
    // console.log("show my tags called")  
    filterDisplayedTags()
    $('#show_all_tags').hide()
    $('#show_only_my_tags').show()
    $('#tags_modifier').html('My ');
    sessionStorage.setItem('tags', 'My Tags');
    clearTagArray()
}

function clearTagArray() {
    event.preventDefault();
    $('.warning_label').html('');
    
    if ($( ".selected_tag" ).length > 0) {
        $( ".selected_tag" ).toggleClass( "badge-primary" );
        $( ".selected_tag" ).toggleClass( "badge-light" );
        $( ".selected_tag" ).toggleClass( "selected_tag" );

        selectedTags = [];
    }
    // else {
    //     $('.warning_label').text('');
    //     $('.warning_label').text('No tags have been selected.');
    // }
};

function deDupAllTags(){
    let allAlbumTags = $('.album_details_tags')
    let allTagIDs = []
    let duplicateTagIDs = []
    for (let index = 0; index < allAlbumTags.length; index++) {
        let element = allAlbumTags[index].id;
        allTagIDs.push(element)
    }

    for (let index = 0; index < allTagIDs.length; index++) {
        let element = allTagIDs[index];
        if (countInArray(allTagIDs, element) > 1) {
            duplicateTagIDs.push(index)
        }     
    }
    
    for (let index = 0; index < duplicateTagIDs.length; index++) {
        let j = duplicateTagIDs[index];
        let elem = allAlbumTags[j].classList.contains(`author-${userID}`)
        if (elem == false) {
            allAlbumTags[j].remove()
        } 
    }
}


// consider renaming this function
// hit .js error when ID's were not on page yet
function checkForDuplicates() {  
    if (myFavoriteAlbums.indexOf(albumId) == -1) {
        // remove_from_favorites.style.display = "none";
        // add_to_favorites.style.display = "inline";
        $('#add_to_favorites').removeClass('hide_me_details');
        $('#remove_from_favorites').addClass('hide_me_details');
    } else {
        // add_to_favorites.style.display = "none";
        // remove_from_favorites.style.display = "inline";
        $('#remove_from_favorites').removeClass('hide_me_details');
        $('#add_to_favorites').addClass('hide_me_details');
    }
}

function addToFavoriteAlbums(newAlbum) {
    // console.log("add to favorite albums called")

    myFavoriteAlbums.push(newAlbum);


    updateDatabase();
    checkForDuplicates();
}

function removeFromFavorites(newAlbum) {
    let index = myFavoriteAlbums.indexOf(newAlbum);
    myFavoriteAlbums.splice(index, 1);
    updateDatabase();
    checkForDuplicates();
}

function updateDatabase() {
    // console.log("update database called")
    firebase.database().ref(userID).set({
        "My Favorites": myFavoriteAlbums
    });
}


// calling populateAlbumDetails and populateTags to fill the page
populateAlbumDetails(albumId);
populateTags(albumId);
// setTimeout(function(){ populateTags(albumId); }, 2000);

function checkUserDisplayPrefrences() {
    // Get saved data from sessionStorage
    var whatTagsToShow = sessionStorage.getItem('tags');
    deDupAllTags()

    if (whatTagsToShow == 'My Tags') {
        // console.log("I'm only going to show your tags")
        $('#show_all_tags').hide()
        $('#tags_modifier').html('My ');
    } else if (whatTagsToShow == 'All Tags') {
        // console.log("I'm going to show all tags")
        $('#show_only_my_tags').hide()
        $('#tags_modifier').html('All ');
        showAllTags();
    } else {
        // do nothing
    }
}

// called by the search button on tags card
function tagSearch() {
    event.preventDefault();

    if (selectedTags.length > 0) {
        var win = window.location = (`/search/tags/${selectedTags}`);
    }  else {
        $('.warning_label').html('');
        $('.warning_label').html('<br/>Select one or more tags to preform a tag-search.');
    }
};

function moreByThisArtist(artist) {
    sessionStorage.setItem('artist', artist);
    window.location.href = '/search'
}

function scrollDown() {
    if (isTouchDevice == true & screen.width < 570) {
        window.scrollTo(0,document.body.scrollHeight)
    }
}


// ------------- start tooltips section -----------
var isTouchDevice = false

$(function () {
    setTimeout(function(){ 
        if ("ontouchstart" in document.documentElement) {
            isTouchDevice = true
        }
        
        if(isTouchDevice == false) {
            $('[data-toggle="tooltip"]').tooltip()
        }
    }, 1000);
})
// combine with data-trigger="hover" in html element 
// for desired behavior
// -------------- end tooltips section --------------