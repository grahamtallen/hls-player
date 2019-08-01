import "./DarkPlayer.scss";
import React, { Component } from "react";
import { Pause } from "./Buttons"
import StatusPill from "./StatusPill.js";
import dayjs from "dayjs";
import AdvancedFormat from 'dayjs/plugin/advancedFormat' // load on demand
dayjs.extend(AdvancedFormat) // use plugin


const TopBar = ({invisible, connectedToStream}) => {
	let statusProps = {};
	if (!connectedToStream) {
		statusProps = {
			color: "#ffeb3b",
			text: "loading"
		}
	}
	return (
		<div className={`top centered ${invisible && "invisible"}`}>
			<div className="left datum-container centered">
				<span className="title">Duration</span>
				<span className="datum">4:20</span>
			</div>
			<div className="right datum-container centered">
				<span className="title">Status</span>
				<span className="datum"><StatusPill {...statusProps} /></span>
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
		<div className='info-row centered'>
			<span className="date">{pathname}</span>
			<span className="text">{dayjs().format('MMMM DD, YYYY')}</span>
		</div> 
	)
}

class DarkPlayer extends Component {

	state = {
		connectedToStream: false
	}

	render() {
		return (
			<div className="dark-mode-container centered">
				<TopBar {...this.state} />
				<div className="middle centered">
					<Info {...this.state}/>
					<Button {...this.state}/>
				</div>	
				<TopBar invisible  {...this.state}/>
			</div>
		)
	}
}

export default DarkPlayer