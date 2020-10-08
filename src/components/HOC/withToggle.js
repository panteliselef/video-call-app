import React, { useState } from 'react';

const withToggle = (Component) => (props) => {
	const [ isEnabled, setEnabled ] = useState(true);

	const toggle = () => {
		setEnabled(!isEnabled);
	};

	return <Component {...props} toggle={toggle} isEnabled={isEnabled} />;
};

export default withToggle
