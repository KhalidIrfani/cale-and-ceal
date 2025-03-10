import { Option, Step, ThemeTemplateGroup, useZakeke } from '@zakeke/zakeke-configurator-react';
import { T, useActualGroups, useUndoRedoActions, useUndoRegister } from 'Helpers';
import { Map } from 'immutable';
import { useEffect, useState } from 'react';
import useStore from 'Store';
import styled from 'styled-components';
import savedCompositionsIcon from '../../assets/icons/saved_designs.svg';
import star from '../../assets/icons/star.svg';
import noImage from '../../assets/images/no_image.png';
import Designer from '../layout/Designer';
import DesignsDraftList from '../layout/DesignsDraftList';
import { ItemName, Template, TemplatesContainer } from '../layout/SharedComponents';
import Steps from '../layout/Steps';
import { MenuItem, MobileItemsContainer } from './MobileMenuComponents';
import TemplateGroup from 'components/TemplateGroup';
import { ReactComponent as Label } from '../../assets/icons/tags.svg';
import textIcon from '../../assets/icons/font-solid.svg';

// Styled component for the container of the mobile menu
export const MobileMenuContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	width: 100%;
	position: relative;
	overflow: auto;
	background: #8080803b;
	/* padding:10px; */
`;

// Styled component for the container of the steps
export const StepsMobileContainer = styled.div`
	border-top: 1px #fff solid;
	height: 45px;
`;

// Styled component for the container of the price info text
const PriceInfoTextContainer = styled.div`
	font-size: 14px;
	padding: 0px 10px;
`;

const NewInputTextVertical = styled.input`
    width: 90%;
    height: 36px;
    border-radius: 5px;
    border: 1px solid #C7C7C7;
    font-family: Poppins;
    color: #C7C7C7;
    background: white;
    font-size: 16px;
    position: relative;
    left: 0em;
	&::placeholder {
		font-size: 15px;
		font-family: Poppins;
		color: #C7C7C7;
	}
	&:focus {
		outline-width: 0;
}
	}
		
`;

const ZipperStyleTextLabel = styled.div`
	padding-left: 10px;
	 
	@media (max-width: 1147px) {
		top: 32px !important;
	}
`;

// MobileMenu component that represents the mobile menu where
// the customer can select the attributes and options
const MobileMenu = () => {
	const {
		isSceneLoading,
		templates,
		currentTemplate,
		setCamera,
		setTemplate,
		sellerSettings,
		selectOption,
		draftCompositions,
		setItemText,
		items
	} = useZakeke();
	const {
		selectedGroupId,
		setSelectedGroupId,
		selectedAttributeId,
		setSelectedAttributeId,
		selectedStepId,
		setSelectedStepId,
		isUndo,
		isRedo,
		setSelectedTemplateGroupId,
		selectedTemplateGroupId,
		lastSelectedItem,
		setLastSelectedItem
	} = useStore();
	const [scrollLeft, setScrollLeft] = useState<number | null>(null);
	const [optionsScroll, setOptionsScroll] = useState<number | null>(null);
	const [attributesScroll, setAttributesScroll] = useState<number | null>(null);
	const [isTemplateEditorOpened, setIsTemplateEditorOpened] = useState(false);
	const [isDesignsDraftListOpened, setisDesignsDraftListOpened] = useState(false);
	const [isTemplateGroupOpened, setIsTemplateGroupOpened] = useState(false);
	const [isStartRegistering, setIsStartRegistering] = useState(false);
	const [customTextMessage, setCustomTextMessage] = useState('' as string);
	const [isZipperPopupOpen, setIsZipperPopupOpen] = useState(false);
	const [zipperSelection, setZipperSelection] = useState<{
		attributeName: string | null;
		optionName: string | null;
	}>({ attributeName: null, optionName: null });

	const undoRegistering = useUndoRegister();
	const undoRedoActions = useUndoRedoActions();

	const actualGroups = useActualGroups() ?? [];

	const selectedGroup = selectedGroupId ? actualGroups.find((group) => group.id === selectedGroupId) : null;
	const selectedStep = selectedGroupId
		? actualGroups.find((group) => group.id === selectedGroupId)?.steps.find((step) => step.id === selectedStepId)
		: null;
	const currentAttributes = selectedStep ? selectedStep.attributes : selectedGroup ? selectedGroup.attributes : [];
	const currentTemplateGroups = selectedStep
		? selectedStep.templateGroups
		: selectedGroup
			? selectedGroup.templateGroups
			: [];

	const currentItems = [...currentAttributes, ...currentTemplateGroups].sort(
		(a, b) => a.displayOrder - b.displayOrder
	);

	const selectedAttribute = currentAttributes
		? currentAttributes.find((attr) => attr.id === selectedAttributeId)
		: null;

	const selectedTemplateGroup = currentTemplateGroups
		? currentTemplateGroups.find((templGr) => templGr.templateGroupID === selectedTemplateGroupId)
		: null;

	const selectedOptionName = selectedAttribute
		? selectedAttribute.options.find((options) => options.selected === true)
		: null;

	const options = selectedAttribute?.options ?? [];
	const groupIndex = actualGroups && selectedGroup ? actualGroups.indexOf(selectedGroup) : 0;

	const [lastSelectedSteps, setLastSelectedSteps] = useState(Map<number, number>());


	const setItemTextNew = (value: string) => {
		const inputText = value;
		const formattedText = inputText.split('').join('\n'); // Add a new line after each character
		// handleItemPropChange?.(obj, 'text', formattedText);
		setCustomTextMessage(value);

		if (items) {
			const guidNo = items.find(({ name }) => name.toLowerCase().match(/zip*/));
			if (guidNo) setItemText(guidNo?.guid, formattedText);
		}
	};

	const handleNextGroup = () => {
		if (selectedGroup) {
			if (groupIndex < actualGroups.length - 1) {
				const nextGroup = actualGroups[groupIndex + 1];
				handleGroupSelection(nextGroup.id);
			}
		}
	};

	const handlePreviousGroup = () => {
		if (selectedGroup) {
			if (groupIndex > 0) {
				let previousGroup = actualGroups[groupIndex - 1];
				handleGroupSelection(previousGroup.id);

				// Select the last step
				if (previousGroup.steps.length > 0)
					handleStepSelection(previousGroup.steps[previousGroup.steps.length - 1].id);
			}
		}
	};

	const handleStepChange = (step: Step | null) => {
		if (step) handleStepSelection(step.id);
	};

	const handleGroupSelection = (groupId: number | null) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (groupId && selectedGroupId !== groupId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'group', id: selectedGroupId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'group', id: groupId, direction: 'redo' });
		}

		setSelectedGroupId(groupId);
	};

	const handleStepSelection = (stepId: number | null) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (selectedStepId !== stepId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'step', id: selectedStepId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'step', id: stepId ?? null, direction: 'redo' });
		}

		setSelectedStepId(stepId);

		const newStepSelected = lastSelectedSteps.set(selectedGroupId!, stepId!);
		setLastSelectedSteps(newStepSelected);
	};

	const handleAttributeSelection = (attributeId: number) => {
		setIsStartRegistering(undoRegistering.startRegistering());

		if (attributeId && selectedAttributeId !== attributeId && !isUndo && !isRedo) {
			undoRedoActions.eraseRedoStack();
			undoRedoActions.fillUndoStack({ type: 'attribute', id: selectedAttributeId, direction: 'undo' });
			undoRedoActions.fillUndoStack({ type: 'attribute', id: attributeId, direction: 'redo' });
		}

		setSelectedAttributeId(attributeId);
		setLastSelectedItem({ type: 'attribute', id: attributeId });
	};

	const handleTemplateGroupSelection = (templateGroupId: number | null) => {
		setSelectedTemplateGroupId(templateGroupId);
		setLastSelectedItem({ type: 'template-group', id: templateGroupId });
		setIsTemplateGroupOpened(true);
	};

	const isCustomZipperPullsSelected =
		((selectedOptionName?.name === 'Custom Zipper Pulls' || selectedOptionName?.name === 'Custom Zipper') &&
			selectedAttribute?.name === 'Zipper Style') ||
		((zipperSelection.optionName === 'Custom Zipper Pulls' || zipperSelection.optionName === 'Custom Zipper') &&
			zipperSelection.attributeName === 'Zipper Style');


	const isOpenJacketSelected = selectedOptionName?.name === 'Open Jacket';

	const handleOptionSelection = (option: Option) => {
		const undo = undoRegistering.startRegistering();
		undoRedoActions.eraseRedoStack();
		undoRedoActions.fillUndoStack({
			type: 'option',
			id: options.find((opt) => opt.selected)?.id ?? null,
			direction: 'undo'
		});
		undoRedoActions.fillUndoStack({ type: 'option', id: option.id, direction: 'redo' });

		selectOption(option.id);
		undoRegistering.endRegistering(undo);

		if (
			(option.name === 'Custom Zipper Pulls' || option.name === 'Custom Zipper') &&
			selectedAttribute?.name === 'Zipper Style'
		) {
			setIsZipperPopupOpen(true);
			setZipperSelection({
				attributeName: selectedAttribute.name,
				optionName: option.name
			});
		} else if (option.name === 'Open Jacket') {
			// Clear zipper selection when Open Jacket is selected
			setZipperSelection({ attributeName: null, optionName: null });
		} else {
			// Clear zipper selection for other options if needed
			setZipperSelection({ attributeName: null, optionName: null });
		}

		try {
			if ((window as any).algho) (window as any).algho.sendUserStopForm(true);
		} catch (e) { }
	};


	const setTemplateByID = async (templateID: number) => await setTemplate(templateID);
	// Initial template selection
	useEffect(() => {
		if (templates.length > 0 && !currentTemplate) setTemplateByID(templates[0].id);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templates]);

	// auto-selection if there is only 1 group
	useEffect(() => {
		if (actualGroups && actualGroups.length === 1 && actualGroups[0].id === -2) return;
		else if (actualGroups && actualGroups.length === 1 && !selectedGroupId) setSelectedGroupId(actualGroups[0].id);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [actualGroups, selectedGroupId]);

	// Reset attribute selection when group selection changes
	useEffect(() => {
		if (selectedGroup && selectedGroup.id !== -2) {
			if (selectedGroup.steps.length > 0) {
				if (lastSelectedSteps.get(selectedGroupId!))
					handleStepSelection(lastSelectedSteps.get(selectedGroupId!)!);
				else {
					handleStepSelection(selectedGroup.steps[0].id);
					if (
						selectedGroup.steps[0].attributes.length === 1 &&
						selectedGroup.steps[0].templateGroups.length === 0
					)
						handleAttributeSelection(selectedGroup.steps[0].attributes[0].id);
					else if (
						selectedGroup.steps[0].templateGroups.length === 1 &&
						selectedGroup.steps[0].attributes.length === 0
					)
						handleTemplateGroupSelection(selectedGroup.steps[0].templateGroups[0].templateGroupID);
				}
			} else {
				handleStepSelection(null);
				if (selectedGroup.attributes.length === 1 && selectedGroup.templateGroups.length === 0)
					handleAttributeSelection(selectedGroup.attributes[0].id);
				else if (selectedGroup.templateGroups.length === 1 && selectedGroup.attributes.length === 0)
					handleTemplateGroupSelection(selectedGroup.templateGroups[0].templateGroupID);
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGroup?.id]);

	useEffect(() => {
		if (selectedGroup?.id === -2) {
			setIsTemplateEditorOpened(true);
		}
	}, [selectedGroup?.id]);

	useEffect(() => {
		if (selectedGroup?.id === -3) {
			setisDesignsDraftListOpened(true);
		}
	}, [selectedGroup?.id]);

	// Camera
	useEffect(() => {
		if (!isSceneLoading && selectedGroup && selectedGroup.cameraLocationId) {
			setCamera(selectedGroup.cameraLocationId, true);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGroup?.id, isSceneLoading]);

	useEffect(() => {
		if (selectedGroup && selectedGroup.steps.length > 0) {
			if (
				selectedGroup.steps.find((step) => step.id === selectedStep?.id) &&
				selectedGroup.steps.find((step) => step.id === selectedStep?.id)?.attributes.length === 1 &&
				selectedGroup.steps.find((step) => step.id === selectedStep?.id)?.templateGroups.length === 0
			)
				handleAttributeSelection(
					selectedGroup.steps!.find((step) => step.id === selectedStep?.id)!.attributes[0].id
				);
			else setSelectedAttributeId(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedStep?.id]);

	useEffect(() => {
		if (isStartRegistering) {
			undoRegistering.endRegistering(false);
			setIsStartRegistering(false);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isStartRegistering]);

	const obj = {
		constraints: null,
		fillColor: '#287fb9',
		fontFamily: 'Adamina',
		fontSize: 48,
		fontWeight: 'normal normal',
		guid: '',
		isTextOnPath: false,
		name: '',
		text: customTextMessage
	} as { text: string; fontFamily: string };

	return (
		<MobileMenuContainer>
			{sellerSettings && sellerSettings.priceInfoText && (
				<PriceInfoTextContainer dangerouslySetInnerHTML={{ __html: sellerSettings.priceInfoText }} />
			)}

			{selectedGroup && selectedGroup.id !== -2 && selectedGroup.steps && selectedGroup.steps.length > 0 && (
				<StepsMobileContainer>
					<Steps
						key={'steps-' + selectedGroup?.id}
						hasNextGroup={groupIndex !== actualGroups.length - 1}
						hasPreviousGroup={groupIndex !== 0}
						onNextStep={handleNextGroup}
						onPreviousStep={handlePreviousGroup}
						currentStep={selectedStep}
						steps={selectedGroup.steps}
						onStepChange={handleStepChange}
					/>
				</StepsMobileContainer>
			)}
			{selectedGroup == null && (
				<MobileItemsContainer
					isLeftArrowVisible
					isRightArrowVisible
					scrollLeft={scrollLeft ?? 0}
					onScrollChange={(value) => setScrollLeft(value)}
				>
					{actualGroups
						.filter((group) => {
							// Logic for showing/hiding Custom Tag
							const shouldHideCustomTag = isCustomZipperPullsSelected && !isOpenJacketSelected;
							const shouldShowCustomTag = isOpenJacketSelected || (!isCustomZipperPullsSelected && group.name === 'Custom Tag');
							if (group.name === 'Custom Tag') {
								return shouldShowCustomTag;
							}
							return true; // Show all other groups regardless
						})
						.map((group) => {
							if (group)
								return (
									<MenuItem
										key={group.guid}
										group={true}
										imageUrl={
											group.imageUrl && group.imageUrl !== ''
												? group.id === -3
													? savedCompositionsIcon
													: group.imageUrl
												: group.id === -2
													? textIcon
													: star
										}
										label={group.name ? T._d(group.name) : T._('Customize', 'Composer')}
										onClick={() => handleGroupSelection(group.id)}
									/>
								);
							else return null;
						})}
				</MobileItemsContainer>
			)}
			{/* <AttributesContainer > */}
			{selectedGroup && selectedGroup.id === -2 && templates.length > 1 && (
				<TemplatesContainer>
					{templates.map((template) => (
						<Template
							key={template.id}
							selected={currentTemplate === template}
							onClick={async () => {
								await setTemplate(template.id);
							}}
						>
							{T._d(template.name)}
						</Template>
					))}
				</TemplatesContainer>
			)}
			{selectedGroup && (
				<div style={{ fontSize: "18px", fontWeight: "bold", color: "black", textAlign: "center", padding: "5px 0 3px 0" }}>
					{selectedGroup?.name}
				</div>
			)}

			{selectedGroup && (
				<MobileItemsContainer
					isLeftArrowVisible
					isRightArrowVisible
					scrollLeft={attributesScroll ?? 0}
					onScrollChange={(value) => setAttributesScroll(value)}
				>
					{/* Attributes */}
					{selectedGroup &&
						!selectedAttributeId &&
						!selectedTemplateGroupId &&
						currentItems &&
						currentItems.map((item) => {
							if (!(item instanceof ThemeTemplateGroup))
								return (
									<MenuItem
										group={false}

										selected={item.id === selectedAttributeId}
										key={item.guid}
										onClick={() => handleAttributeSelection(item.id)}
										images={item.options
											.slice(0, 4)
											.map((x) => (x.imageUrl ? x.imageUrl : noImage))}
										label={T._d(item.name)}
										isRound={item.optionShapeType === 2}
									>
										<ItemName> {T._d(item.name).toUpperCase()} </ItemName>
									</MenuItem>
								);
							else
								return (
									<MenuItem
										group={false}

										selected={item.templateGroupID === selectedTemplateGroupId}
										key={item.templateGroupID}
										onClick={() => handleTemplateGroupSelection(item.templateGroupID)}
										imageUrl={noImage}
										label={T._d(item.name)}
										isRound={false}
									>
										<ItemName> {T._d(item.name).toUpperCase()} </ItemName>
									</MenuItem>
								);
						})}
					{/* </CarouselContainer> */}

					{/* Options */}
					<MobileItemsContainer
						isLeftArrowVisible={options.length !== 0}
						isRightArrowVisible={options.length !== 0}
						scrollLeft={optionsScroll ?? 0}
						onScrollChange={(value) => setOptionsScroll(value)}
					>
						{lastSelectedItem?.type === "attribute" ? (
							<>
								{selectedAttribute &&
									selectedAttribute.options.map(
										(option) =>
											option.enabled && (
												<MenuItem
													isRound={selectedAttribute.optionShapeType === 2}
													description={option.description}
													selected={option.selected}
													imageUrl={option.imageUrl ?? ""}
													label={T._d(option.name)}
													hideLabel={selectedAttribute.hideOptionsLabel}
													key={option.guid}
													onClick={() => {
														handleOptionSelection(option);
														if (option.name === "Custom Zipper Pulls" || option.name === "Custom Zipper") {
															setIsZipperPopupOpen(true);
														}
													}}
												/>
											)
									)}
							</>
						) : (
							selectedTemplateGroup &&
							isTemplateGroupOpened && (
								<TemplateGroup
									key={selectedTemplateGroupId}
									templateGroup={selectedTemplateGroup!}
									isMobile
									onCloseClick={() => {
										setIsTemplateGroupOpened(false);
										handleTemplateGroupSelection(null);
										handleGroupSelection(null);
									}}
								/>
							)
						)}
					</MobileItemsContainer>

					{/* ✅ Modal for Custom Zipper Pulls */}
					{isZipperPopupOpen && (
						<div className="modal-overlay" onClick={() => setIsZipperPopupOpen(false)}>
							<div className="modal-content" onClick={(e) => e.stopPropagation()}>
								<ZipperStyleTextLabel className="ZipperStyleTextLabel">
									<div className="zipper-custom-input-title">ZIPPER CUSTOM</div>
									<div>
										<div
											style={{
												position: 'absolute',
												top: '2.7em',
												right: '30px',
												padding: '5px',
												zIndex: '2'
											}}
										>
											<Label />
										</div>

										<NewInputTextVertical
											placeholder=" Enter label"
											className={`input-box ${(selectedOptionName?.name === "Custom Zipper Pulls" || selectedOptionName?.name === "Custom Zipper") &&
													selectedAttribute?.name.toLowerCase() === "zipper style"
													? "show"
													: "hide"
												}`}
											value={customTextMessage}
											onChange={(e) => {
												if (e.target.value.length < 6) setItemTextNew(e.target.value);
											}}
										/>
										<div className="zipper-custom-sub-input-title">(Max 5 character)</div>
										<button onClick={() => setIsZipperPopupOpen(false)} className="close-button">
											Close
										</button>
									</div>
								</ZipperStyleTextLabel>
							</div>
						</div>
					)}

				</MobileItemsContainer>
			)}

			{/* Designer / Customizer */}
			{selectedGroup?.id === -2 && isTemplateEditorOpened && (
				<Designer
					onCloseClick={() => {
						setIsTemplateEditorOpened(false);
						handleGroupSelection(null);
					}}
				/>
			)}

			{/* Saved Compositions */}
			{draftCompositions && selectedGroup?.id === -3 && isDesignsDraftListOpened && (
				<DesignsDraftList
					onCloseClick={() => {
						setIsTemplateEditorOpened(false);
						handleGroupSelection(null);
					}}
				/>
			)}
		</MobileMenuContainer>
	);
};

export default MobileMenu;
