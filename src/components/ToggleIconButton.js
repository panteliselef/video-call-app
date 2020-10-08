import React, { useEffect } from 'react';
import withToggle from '../components/HOC/withToggle';
import MIconButton from '../components/MIconButton';

function ToggleIconButton({ toggle,onToggle, isEnabled, toggleOnIcon, toggleOffIcon, style, toggleOffStyle, ...rest }) {

    const onClick=()=>{
        onToggle(isEnabled);
        toggle();
    }

	return (
		<MIconButton {...rest} style={
            { ...style,
                ...!isEnabled?toggleOffStyle:{}
            }} icon={isEnabled ? toggleOnIcon : toggleOffIcon} onClick={onClick} />
	);
}

export default withToggle(ToggleIconButton);
