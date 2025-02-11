import { useZakeke } from '@zakeke/zakeke-configurator-react';
import { T } from 'Helpers';
import { FC, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ReactComponent as CheckSolid } from '../../assets/icons/check-circle-solid_1.svg';
import { Icon } from 'components/Atomic';
import useStore from 'Store';

const LoadingLabel = styled.div`
	color: #000;
	font-size: 12px;
	font-style: normal;
	font-weight: 700;
	line-height: 16px;
`;

const LoaderContainer = styled.div<{ $isMobile: boolean }>`
	height: 3px;
	width: ${(props) => (props.$isMobile ? '250px' : '100%')};
	border-radius: 4px;
	margin: 0 auto;
	background-color: #dbe2e6;
`;

const LoadingPercentageLabel = styled.span`
	color: #8fa4ae;
	font-weight: 400;
	font-size: 12px;
	line-height: 16px;
	font-style: normal;
`;

const LoadingPercentageandIconContainer = styled.div`
	display: flex;
	justify-content: space-between;
`;

const CheckIcon = styled(Icon)`
	cursor: unset;
	color: #008556;
`;

const LoaderFill = styled.div<{ $completed: number; $bgColor: string; $isCompleted: boolean }>`
	height: 100%;
	width: ${(props) => `${props.$completed}%`};
	background-color: ${(props) => (props.$isCompleted ? '#008556' : props.$bgColor)};
	border-radius: 4px;
	transition: width 0.5s ease-in-out;
`;

const VideoPlayer = styled.video`
	width: 100%;
	height: 60vh;

	@media (max-width: 768px) {
		height: auto;
	}
`;

const ProgressBar: FC<{ $flagStartLoading: boolean; $bgColor: string; $completed: number }> = ({
	$flagStartLoading,
	$bgColor,
	$completed
}) => {
	const { isSceneLoading } = useZakeke();
	const { isMobile } = useStore();
	const videoRef = useRef<HTMLVideoElement | null>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (video) {
			video.muted = true;
			video.play();

			const handleVideoEnd = () => {
				console.log('Video has played completely at least once.');
				video.play();
			};

			video.addEventListener('ended', handleVideoEnd);

			return () => {
				video.removeEventListener('ended', handleVideoEnd);
			};
		}
	}, []);

	return (
		<div>
			<VideoPlayer ref={videoRef} id="myVideo">
				<source src="/loading.mp4" type="video/mp4" />
				Your browser does not support the video tag.
			</VideoPlayer>
			{/* <LoadingLabel>
				{isSceneLoading ? T._('Loading your product...', 'Composer') : T._('Loading complete.', 'Composer')}
			</LoadingLabel> */}
			<LoaderContainer $isMobile={isMobile}>
				<LoaderFill
					$completed={!isSceneLoading && $flagStartLoading ? 100 : $completed}
					$bgColor={$bgColor}
					$isCompleted={!isSceneLoading && $flagStartLoading}
				/>
				<LoadingPercentageandIconContainer>
					<LoadingPercentageLabel>
						{isSceneLoading ? T._('In progress | ', 'Composer') + `${$completed}%` : '100%'}
					</LoadingPercentageLabel>
					{!isSceneLoading && (
						<CheckIcon>
							<CheckSolid />
						</CheckIcon>
					)}
				</LoadingPercentageandIconContainer>
			</LoaderContainer>
		</div>
	);
};

export default ProgressBar;
