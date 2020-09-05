import React from 'react';
import '../styles/fonts/font.css'
import styled from 'styled-components'

const Input = styled.input`
    background-color: #F5F6F7;
    border: none;
    padding: 1rem;
    font-size: 1rem;
    font-family: 'Mazzard H';
    font-weight: bold;
    width:100%;
    box-sizing: border-box;
    border-radius: .8rem;
`;

const Label = styled.label`
    font-family: 'Mazzard H';
    font-weight: bold;
    width:100%;
    color: #333;
    margin: 10px 0;
    display: inline-block;
`;

function MInputText({label, value,setter,...rest}) {


    const onChangeValue = (event) => {
        setter(event.target.value);
    }

    return (
        <div style={{boxSizing:'border-box'}}>
        <Label>
            {label}
        </Label>
        <Input {...rest} onChange={onChangeValue}>

        </Input>
        </div>
    )
}

export default MInputText;