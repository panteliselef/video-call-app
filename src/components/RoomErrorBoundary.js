import React from 'react';

import { Link} from 'react-router-dom';

class RoomErrorBoundary extends React.Component {
	constructor(props) {
        super(props);
        console.log(props);
		this.state = { 
            hasError: false,
            roomId: props.match.params.roomId
         };
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.log("ROOM ERROR",error,errorInfo)
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return (
                <React.Fragment>
                    <h1>Something went wrong.</h1>
                    <button>
                        <Link to={`/${this.state.roomId}`}></Link>
                    </button>
                </React.Fragment>
            );
		}

		return this.props.children;
	}
}

export default RoomErrorBoundary;