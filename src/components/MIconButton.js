import React from 'react'
import styled from 'styled-components'

import '../styles/fonts/font.css'
import Icon from "@mdi/react";


const Button = styled.button`
    font-family: 'Mazzard H';
    font-weight: bold;
    border: 0;
    cursor: pointer;
    margin: 0;
    display: inline-flex;
    outline: 0;
    padding: 0;
    position: relative;
    align-items: center;
    user-select: none;
    border-radius: 0;
    vertical-align: middle;
    -moz-appearance: none;
    justify-content: center;
    text-decoration: none;
    background-color: transparent;
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
    font-size: 1rem;
    padding: 1rem;
    border-radius: .8rem;
    width: 60px;
    background-color: #07C5B9;
    line-height:1.8;
    background-color: #E6F8FB;
    color: #fff;
    color: #07C5B9;
    letter-spacing:1px;
`


function MIconButton({ children, icon, color, ...rest }) {

    return (
        
            <Button {...rest}>
                <Icon path={icon} size={1}/>
            </Button>
    )
}

export default MIconButton;