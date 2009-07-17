SocialUnit adds Screw.Unit testing support for OpenSocial gadgets.

This is currently in proof of concept stage only, so you're unlikely to be able to use it as is yet. But if you'd like to hack on it, that's great!

The goal is to create a minimal OpenSocial container in Javascript, which can take and return sample data for you to use in tests. We are basing this on the JSON-RPC container provided in the Shindig distribution, which is about 400 lines. So we believe this is doable... anyone with more knowledge on container implementation feel free to comment!

Currently, calls to the gadgets API don't work.

# Notes

It is currently incomplete, contains hardcoded sample data and has plenty of copy-pasted code from the Shindig project. Apologies to the authors of the JsonRpcContainer - the code in there now is essentially a copy-paste of this code (for the moment). 

# Thanks to

* Yoichiro Tanaka - for pointing us towards the Shindig Javascript code and the JsonRpcContainer, and hosting the OpenSocial Hackathon where we started this project.
