import "./DarkPlayer.scss";
import React, { Component } from "react";
import { Pause, Play } from "./Buttons"
import StatusPill from "./StatusPill.js";
import videojs from "video.js";

import dayjs from "dayjs";
import AdvancedFormat from 'dayjs/plugin/advancedFormat' // load on demand
dayjs.extend(AdvancedFormat) // use plugin
const { location = {} } = window;
const { pathname = "/" } = location;

const streamName = pathname.slice(1, pathname.length)
let defaultSource = `http://127.0.0.1:8887/${streamName}/index.m3u8`;
const testing = window.location.origin.includes("localhost");
if (!testing) {
  defaultSource = `${window.location.origin}/hls/${streamName}.m3u8`;
}


const TopBar = (props) => {
	const { invisible, duration } = props;
	return (
		<div className={`top centered ${invisible && "invisible"}`}>
			<div className="left datum-container centered">
				<span className="title">Duration</span>
				<span className="datum">{sToDuration(duration)}</span>
			</div>
			<div className="right datum-container centered">
				<span className="title">Status</span>
				<span className="datum"><StatusPill {...props} /></span>
			</div>
		</div>
	)
}

const BottomBar = (props) => {
	const { streamError } = props;
	return (
		<div className={`bottom centered`}>
			<div className="datum-container centered">
				{streamError && <a href="mailto:graham@gramrphone.live" className="title support">Support</a>}
			</div>
		</div>
	)
}


const Button = ({disabled = false, onClick, isPlaying}) => {
	return (
		<div onClick={onClick} className={`circle-container centered ${disabled && "disabled"}`}>
			{isPlaying ? <Pause width="15" height="19"/> : <Play />}
		</div>	
	)
}

const Info = () => {
	return (
		<div className='info-row centered'>
			<span className="date">{streamName}</span>
			<span className="text">{dayjs().format('MMMM DD, YYYY')}</span>
		</div> 
	)
}

class DarkPlayer extends Component {

	state = {
		disabled: true,
		loading: true,
		streamError: false,
		isPlaying: false,
		duration: 0,
	}

	streamsTested = 0;
	player = null;

	componentDidMount() {
		this.testStream();
	}

	testStream = () => {
	  const request = new Request(defaultSource);
	  try {
	    fetch(request)
	      .then(this.handlePlaylistResponse)
	      .catch(this.handlePlaylistResponse)
	  } catch (e) {
	    console.warn("testStream", e);
	    this.handlePlaylistResponse();
	  }
	}

	handlePlaylistResponse = (response = {}) => {
	    const validStatus = response.status; 
	    switch (validStatus) {
	      case 200: 
	        this.setState({
	        	disabled: false,
	        	loading: false 
	        })
	        this.startPlayer();
	        break;
	      case 404: 
	      	if (this.streamsTested < 20) {

	      		setTimeout(this.testStream, 1000)
	      		this.streamsTested++
	      	} else {
	      		this.setState({
		        	loading: false,
		        	streamError: true,
	        	})
	      	}

	        break;
	      default: 
	      	this.setState({
	        	loading: false,
	        	streamError: true,
	        })
	        console.warn("Unhandled response status: ", response.message);
	        const responseMessage = response.message;
	        
	        if (responseMessage === "Failed to fetch") {
	          console.warn("Failed to fetch, server is probably down")
	        }
	        break;
	    }
	}

	startPlayer = () => {
		const playerReady = () => {
		  this.loadSource(defaultSource);
		}
		this.setupPlayer(playerReady);
	}

	setupPlayer(playerReady) {
		const {videoNode} = this.props;
		if (!videoNode) return;
		const videoJSOptions = {
		  controls: false,
		  autoplay: false,
		  withCredentials: false,
		  sources: []
		}
		// instantiate Video.js
		this.player = videojs(videoNode, videoJSOptions, playerReady);
		this.player.isAudio(true);
		// TODO look up the preload attribute
		this.player.playsinline(true);
		this.checkTime();
	}

	loadSource(sourceUrl) {
		if (this.player) {
		  try {
		    this.player.src({
		        src: sourceUrl,
		        type: 'application/x-mpegURL'
		    })
		  } catch (e) {
		    console.warn("Error setting source");
		  }
		} else {
		  console.warn("Call setupPlayer() before loading a source")
		}
	}

	handleButtonClick = () => {
		const { isPlaying } = this.state
		this.setState({
			isPlaying: !isPlaying
		})
		if (this.player) {
			isPlaying ? this.player.pause() : this.player.play()
		}
	}

	checkTime = () => {
		const { player } = this;
		if (player) {
			const duration = player.currentTime();
			this.setState({
				duration: Math.floor(duration)
			})
		} 	
		var t = setTimeout(() => this.checkTime(player), 1000);
	}

	render() {
		const { disabled } = this.state;
		return (
			<div className={`dark-mode-container centered`}>
				<TopBar {...this.state} />
				<div className={`middle centered ${disabled && "disabled"}`}>
					<Info {...this.state}/>
					<Button {...this.state} onClick={this.handleButtonClick}/>
				</div>	
				<BottomBar {...this.state} />
			</div>
		)
	}
}


class App extends Component {
	state = {
		videoNode: null
	}

	setRef = (videoNode) => {
		if (!this.setVideoNode) {
		  this.setVideoNode = true;
		  this.setState({videoNode})
		}
	}

	render() {
		return (
			<div className="dark-mode-container centered">
				<DarkPlayer videoNode={this.state.videoNode} />
				<audio ref={this.setRef} className="video-js"></audio>
			</div>
		)
	}
}

// To have leading zero digits in strings.
function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

// ms to time/duration
const sToDuration = function(seconds){
    var hh = Math.floor(seconds / 3600);
    const mm = Math.floor(seconds / 60) % 60;
    const ss = Math.floor(seconds) % 60;
    return pad(hh,2)+':'+pad(mm,2)+':'+pad(ss,2);
}

export default App