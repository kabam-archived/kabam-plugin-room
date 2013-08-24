kabam-plugin-room
========================

Kabam plugin for chat/discussions room.
The room is something like a comments list in facebook under private foto.'
If user have enough rights to join room, he can join room, that he can read/post messages to this room,


This plugin creates new restfull api with this routes, only accessible by authenticated user.


GET /api/rooms
========================
JSON object of all rooms this user can subscribe

GET /api/myRooms?limit=10&offset=0
========================
JSON object of all rooms this user is subscribed.
Some other get parameters to filter rooms can be used


GET /api/rooms/:roomName?limit=10&offset=0
========================
JSON object of room - name, description, recent comments


POST /api/rooms/:roomName/subscribe
========================
Subscribe to this room


POST /api/rooms/:roomName/unsubscribe
========================
Unsubscribe to this room

POST /api/rooms/:roomName
========================
Send message to room, mandatory parameter - `message`

POST /api/rooms
========================
If current user have enought rights (have permission of `roomCreator`, for example), this route creates new room,
where current user is administrator.

PUT /api/rooms/:roomName
========================
This route can update room parameters (name, motd) if user have enought rights

DELETE /api/rooms/:roomName
========================
If current user have enough rights (have permission of `roomCreator`, for example), this route creates destroys
this room


POST /api/rooms/:roomName/invite
========================
If current user have enought rights (have permission of `roomCreator` or is room admin, for example), this route
invites new member to this room. Mandatory post parameter is invitier login or email


POST /api/rooms/:roomName/ban
========================
If current user have enought rights (have permission of `roomCreator` or is room admin, for example), this route
bans  member from this room. Mandatory post parameter is invitier login or email



Emiting events
========================

User is notified on new messages in rooms he subsribed
Events are emitted for every room action


THis plugin exports

1. Mongoose model
2. application route

Disclaimer
============
For recent moment this is just a blueprint for plugin