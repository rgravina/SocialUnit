/**
 * Hello, World
 * This JavaScript file is for Canvas view.
 */

function createParams() {

  //create new data data request
  var req = opensocial.newDataRequest();
  //param to get viewer
  req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER), 'viewer');

  //create params 
  var params = {};
  //get viewers friends
  params[opensocial.IdSpec.Field.USER_ID] = opensocial.IdSpec.PersonId.VIEWER;
  params[opensocial.IdSpec.Field.GROUP_ID] = 'FRIENDS';
  var idSpec = opensocial.newIdSpec(params);
  req.add(req.newFetchPeopleRequest(idSpec), 'friends');
  return req;
}

function displayFriends(data) {

    var viewer = data.get('viewer').getData();
    //update DOM
    document.getElementById('viewer').innerHTML = viewer.getId();
    var friends = data.get('friends').getData();
    document.getElementById('friends').innerHTML = '';
    friends.each(function(friend) {
      document.getElementById('friends').innerHTML += '<li>' + friend.getId() + '</li>';
    });

    //adjust height
    gadgets.window.adjustHeight();

}

// TODO: Write the code for Canvas view.
function fetchPeople() {
  
  var req = createParams();
  req.send(displayFriends);

}