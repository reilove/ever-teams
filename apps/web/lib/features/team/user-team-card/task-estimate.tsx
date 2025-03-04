'use client';

import { mergeRefs, secondsToTime } from '@app/helpers';
import { I_TMCardTaskEditHook, I_TeamMemberCardHook } from '@app/hooks';
import { IClassName } from '@app/interfaces';
import { clsxm } from '@app/utils';
import { Text } from 'lib/components';
import { EditIcon, TickSaveIcon } from 'lib/components/svgs';
import { TaskEstimate, TaskProgressBar } from 'lib/features';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';

type Props = IClassName & {
	memberInfo: I_TeamMemberCardHook;
	edition: I_TMCardTaskEditHook;
	activeAuthTask: boolean;
	showTime?: boolean;
	radial?: boolean;
};

export function TaskEstimateInfo({ className, activeAuthTask, showTime = true, radial = false, ...rest }: Props) {
	return (
		<div className={className}>
			<div className="flex items-center flex-col gap-y-[2rem] justify-center">
				{showTime && <TaskEstimateInput {...rest} />}

				<TaskProgressBar
					task={rest.edition.task || rest.memberInfo.memberTask}
					isAuthUser={rest.memberInfo.isAuthUser}
					activeAuthTask={activeAuthTask}
					memberInfo={rest.memberInfo}
					radial={radial}
				/>
			</div>
		</div>
	);
}

function TaskEstimateInput({ memberInfo, edition }: Omit<Props, 'className' | 'activeAuthTask'>) {
	const t = useTranslations();
	const loadingRef = useRef<boolean>(false);
	const task = edition.task || memberInfo.memberTask;

	const hasEditMode = edition.estimateEditMode && task;

	const closeFn = () => {
		setTimeout(() => {
			!loadingRef.current && edition.setEstimateEditMode(false);
		}, 1);
	};
	edition.estimateEditIgnoreElement.onOutsideClick(closeFn);

	const { h, m } = secondsToTime(task?.estimate || 0);

	return (
		<>
			<div
				className={clsxm(!hasEditMode ? ['hidden'] : 'flex items-center')}
				ref={edition.estimateEditIgnoreElement.ignoreElementRef}
			>
				{task && (
					<>
						<TaskEstimate _task={task} loadingRef={loadingRef} closeable_fc={closeFn} />
						<button
							className={`ml-2 ${loadingRef.current && 'hidden'}`}
							onClick={() => task && edition.setEstimateEditMode(false)}
						>
							<TickSaveIcon className="w-5" />
						</button>
					</>
				)}
			</div>

			<div
				className={clsxm(
					'flex space-x-2 items-center font-normal lg:text-sm text-xs',
					hasEditMode && ['hidden']
				)}
			>
				<span className="text-gray-500">{t('common.ESTIMATED')}:</span>
				<Text>
					{h}h {m}m
				</Text>

				{(memberInfo.isAuthUser || memberInfo.isAuthTeamManager) && (
					<button
						ref={mergeRefs([
							edition.estimateEditIgnoreElement.ignoreElementRef,
							edition.estimateEditIgnoreElement.targetEl
						])}
						onClick={() => task && edition.setEstimateEditMode(true)}
					>
						<EditIcon
							className={clsxm(
								'cursor-pointer lg:h-4 lg:w-4 w-2 h-2',
								!task && ['opacity-40 cursor-default'],
								'dark:stroke-[#B1AEBC]'
							)}
						/>
					</button>
				)}
			</div>
		</>
	);
}
