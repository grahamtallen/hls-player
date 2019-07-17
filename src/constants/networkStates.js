//https://docs.videojs.com/player#networkState
/*

NETWORK_EMPTY (numeric value 0) The element has not yet been initialised. All attributes are in their initial states.
NETWORK_IDLE (numeric value 1) The element's resource selection algorithm is active and has selected a resource, but it is not actually using the network at this time.
NETWORK_LOADING (numeric value 2) The user agent is actively trying to download data.
NETWORK_NO_SOURCE (numeric value 3) The element's resource selection algorithm is active, but it has not yet found a resource to use.

*/


export const NETWORK_STATES = {
	0: "NETWORK_EMPTY",
	1: "NETWORK_IDLE",
	2: "NETWORK_LOADING",
	3: "NETWORK_NO_SOURCE",
}