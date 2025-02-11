import { useUndoRegister, useUndoRedoActions, T } from "Helpers";
import { FC } from "react";
import styled from "styled-components";
import { Option, useZakeke, Attribute } from '@zakeke/zakeke-configurator-react';
import Tooltip from "./tooltip";
import { ReactComponent as TickButton } from '../../assets/icons/tick-button.svg';

const OptionContainer = styled.div<{ optionShape: number, selected: boolean, hasDescriptionIcon: boolean }>`
    border: 1px solid lightgray;
    border-radius: 3%;
    background-color: white;
    display:flex;
    flex-flow:column;
    justify-content:center;
    align-items:center;
    cursor:pointer;
    position:relative;
    padding: ${props => props.hasDescriptionIcon ? '26px' : '10px'} 0px 0px 0;
    user-select: none;
    width: 100%;
    min-width: 0;
    box-shadow: 5px 5px 10px 2px rgb(0 0 0 / 31%);

    &:hover {
       background-color: #f5f6f7;
    }

    ${props => props.selected && `
        background-color: #f5f6f7;
    `}
`;

const OptionSelectionDiv = styled.div`
  display: flex;
  justify-content: right;
  align-items: center;
  width: 100%;
  padding-right: 10px;
  position: absolute;
  top: 7px;
`;

const OptionColorTitleDiv = styled.div`
  display: flex;
  justify-content: left;
  padding: 10px 0px;
  font-size: 13px;
  font-weight: 500;
`;


const OptionSelectDiv = styled.div`
width: 100%;
background-color: #bab8b8;
color: black;
font-size: 14px;
text-align: center;
display: flex;
justify-content: center;
padding: 3px;
height: 2em;
align-items: center;
font-weight: 500;


&:hover {
    background-color: #67e008;
    color: #fff;
    font-weight: 600;
}

`;

const OptionIconContainerStyled = styled.div`
   overflow: hidden;
   width: 100%;
//    aspect-ratio: 1;
   padding: 0 10px;
   display: flex;
   justify-content: center;
   align-items: center;
`;

const OptionIconContainer: FC<{
    children?: React.ReactNode
}> = ({ children }) => {
    return <OptionIconContainerStyled>{children}</OptionIconContainerStyled>;
}

const OptionIcon = styled.img<{ optionShape?: boolean }>`
    object-fit: contain;
    width: 100%;
    height: 100%;
    aspect-ratio: 1;

    ${props => props.optionShape && `
        border-radius: 100%;
        object-fit: cover;
    `};
`;

const OptionName = styled.div`
    font-size: 12px;
    text-transform: uppercase;
    margin-top: 7px;
    margin-bottom: 10px;
    padding-bottom: 4px;
    text-align:center;
    overflow:hidden;
    height: 33px;
    text-overflow: ellipsis;
    white-space: normal;
    overflow: hidden;
    width: 100%;

    text-align: center;
    justify-content: center;
    display: flex;
    align-items: center;

    @media (max-width: 1025px) {
        font-size:10px;
        margin-top: 2px;
        text-align:center;
    }

    @media (max-width: 1024px) {
        font-size:10px;
        text-align:center;
    }
`;

const OptIconContainer = styled.div`
    width: 46%;
    aspect-ratio: 1;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const OptionItem: FC<{ selectedAttribute: Attribute | null | undefined, option: Option, hasDescriptionIcon: boolean }> = ({ selectedAttribute, option, hasDescriptionIcon }) => {

    const selectedOptionId: number | null = selectedAttribute?.options.find(opt => opt.selected)?.id ?? null;

    const { selectOption } = useZakeke();
    const undoRegistering = useUndoRegister();
    const undoRedoActions = useUndoRedoActions();

    const handleOptionSelection = (option: Option) => {
        const undo = undoRegistering.startRegistering();
        undoRedoActions.eraseRedoStack();
        undoRedoActions.fillUndoStack({ type: "option", id: selectedOptionId, direction: "undo" });
        undoRedoActions.fillUndoStack({ type: "option", id: option.id, direction: "redo" });

        selectOption(option.id);
        undoRegistering.endRegistering(undo);

        try {
            if ((window as any).algho)
                (window as any).algho.sendUserStopForm(true);
        } catch (e) { }
    }

    return <OptionContainer
        hasDescriptionIcon={hasDescriptionIcon}
        selected={option.selected}
        optionShape={option.attribute.optionShapeType}
        onClick={() => handleOptionSelection(option)}>

        {option.selected && <OptionSelectionDiv> <TickButton /> </OptionSelectionDiv>}
        {/* <OptionColorTitleDiv>COLOR</OptionColorTitleDiv> */}
        <OptionIconContainer>
            {option.description && option.description.length !== 0 &&
                <Tooltip key={"tooltip" + option.guid} optionDescription={option.description} />
            }
            {option.imageUrl && <OptIconContainer><OptionIcon loading="lazy"
                // fetchpriority="low" 
                src={option.imageUrl ?? ""} optionShape={option.attribute.optionShapeType === 2} /></OptIconContainer>}
        </OptionIconContainer>

        {!option.attribute.hideOptionsLabel && <OptionName >{T._d(option.name)}</OptionName>}
        <OptionSelectDiv> SELECT </OptionSelectDiv>
    </OptionContainer>;
}

export default OptionItem;