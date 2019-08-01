import "./DarkPlayer.scss";
import React, { Component } from "react";
import { Pause } from "./Buttons"
import StatusPill from "./StatusPill.js";

const TopBar = ({invisible}) => {
	return (
		<div className={`top centered ${invisible && "invisible"}`}>
			<div className="left datum-container centered">
				<span className="title">Duration</span>
				<span className="datum">4:20</span>
			</div>
			<div className="right datum-container centered">
				<span className="title">Status</span>
				<span className="datum"><StatusPill /></span>
			</div>
		</div>
	)
}

const Button = () => {
	return (
		<div className="circle-container centered">
			<Pause width="15" height="19"/>
		</div>	
	)
}

const Info = () => {
	const { location = {} } = window;
	let { pathname = "/" } = location;

	pathname = pathname.slice(1, pathname.length)

	return (
		<div className='info-row'>
			{pathname} is live
		</div>
	)
}

class DarkPlayer extends Component {
	render() {
		return (
			<div className="dark-mode-container centered">
				<TopBar />
				<div className="middle centered">
					<Info/>
					<Button/>
				</div>	
				<TopBar invisible />
			</div>
		)
	}
}

export default DarkPlayer