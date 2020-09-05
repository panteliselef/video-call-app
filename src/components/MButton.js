import React from 'react'
import '../styles/fonts/font.css'
import styled from 'styled-components'
import AppleIcon from '@material-ui/icons/Apple';
import Icon from "@mdi/react";


const Button = styled.button`
    font-family: 'Mazzard H';
    font-weight: bold;
    color: #333;
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
    min-width:200px;
    background-color: #07C5B9;
    line-height:1.8;
    background-color: #E6F8FB;
    color: #fff;
    color: #07C5B9;
    letter-spacing:1px;
`

const PrimaryButton = styled(Button)`
    background-color: black;
    color: #fff;
`;


function MButton({ children, startIcon, color, ...rest }) {

    return (
        color === "primary" ?
            <Button {...rest}>
                {
                    startIcon && <Icon path={startIcon} title="Google" size={1} style={{ marginRight: '30px' }} />
                }
                {children}
            </Button>
            :
            <PrimaryButton {...rest}>
                {
                    startIcon && <Icon path={startIcon} title="Google" size={1} style={{ marginRight: '30px' }} />
                }
                {children}
            </PrimaryButton>

    )
}

export default MButton;