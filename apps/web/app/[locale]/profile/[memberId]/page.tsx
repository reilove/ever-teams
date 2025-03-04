'use client';

/* eslint-disable no-mixed-spaces-and-tabs */
import { imgTitle } from '@app/helpers';
import { useAuthenticateUser, useOrganizationTeams, useTimer, useUserProfilePage } from '@app/hooks';
import { ITimerStatusEnum, OT_Member } from '@app/interfaces';
import { clsxm, isValidUrl } from '@app/utils';
import clsx from 'clsx';
import { withAuthentication } from 'lib/app/authenticator';
import { Avatar, Breadcrumb, Container, Text, VerticalSeparator } from 'lib/components';
import { ArrowLeft } from 'lib/components/svgs';
import { TaskFilter, Timer, TimerStatus, UserProfileTask, getTimerStatusValue, useTaskFilter } from 'lib/features';
import { MainHeader, MainLayout } from 'lib/layout';
import Link from 'next/link';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import stc from 'string-to-color';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { fullWidthState } from '@app/stores/fullWidth';
import { ScreenshootTab } from 'lib/features/activity/screenshoots';
import { AppsTab } from 'lib/features/activity/apps';
import { VisitedSitesTab } from 'lib/features/activity/visited-sites';
import { activityTypeState } from '@app/stores/activity-type';

type FilterTab = 'Tasks' | 'Screenshots' | 'Apps' | 'Visited Sites';

const Profile = React.memo(function ProfilePage({ params }: { params: { memberId: string } }) {
	const profile = useUserProfilePage();
	const { user } = useAuthenticateUser();
	const { isTrackingEnabled, activeTeam } = useOrganizationTeams();
	const fullWidth = useRecoilValue(fullWidthState);
	const [activityFilter, setActivityFilter] = useState<FilterTab>('Tasks');
	const setActivityTypeFilter = useSetRecoilState(activityTypeState);

	const hook = useTaskFilter(profile);
	const canSeeActivity = profile.userProfile?.id === user?.id || user?.role?.name?.toUpperCase() == 'MANAGER';

	const t = useTranslations();
	const breadcrumb = [
		{ title: activeTeam?.name || '', href: '/' },
		{ title: JSON.parse(t('pages.profile.BREADCRUMB')) || '', href: `/profile/${params.memberId}` }
	];

	const activityScreens = {
		Tasks: <UserProfileTask profile={profile} tabFiltered={hook} />,
		Screenshots: <ScreenshootTab />,
		Apps: <AppsTab />,
		'Visited Sites': <VisitedSitesTab />
	};

	const profileIsAuthUser = useMemo(() => profile.isAuthUser, [profile.isAuthUser]);
	const hookFilterType = useMemo(() => hook.filterType, [hook.filterType]);

	const changeActivityFilter = useCallback(
		(filter: FilterTab) => {
			setActivityFilter(filter);
		},
		[setActivityFilter]
	);

	React.useEffect(() => {
		setActivityTypeFilter((prev) => ({
			...prev,
			member: profile.member ? profile.member : null
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profile.member]);

	return (
		<>
			<MainLayout showTimer={!profileIsAuthUser && isTrackingEnabled}>
				<MainHeader fullWidth={fullWidth} className={clsxm(hookFilterType && ['pb-0'], 'pb-2', 'pt-20')}>
					{/* Breadcrumb */}
					<div className="flex items-center gap-8">
						<Link href="/">
							<ArrowLeft className="w-6 h-6" />
						</Link>

						<Breadcrumb paths={breadcrumb} className="text-sm" />
					</div>

					{/* User Profile Detail */}
					<div className="flex flex-col items-center justify-between py-5 md:py-10 md:flex-row">
						<UserProfileDetail member={profile.member} />

						{profileIsAuthUser && isTrackingEnabled && (
							<Timer
								className={clsxm(
									'p-5 rounded-2xl shadow-xlcard',
									'dark:border-[0.125rem] dark:border-[#28292F]',
									'dark:bg-[#1B1D22]'
								)}
							/>
						)}
					</div>

					{/* TaskFilter */}
					<TaskFilter profile={profile} hook={hook} />
				</MainHeader>
				{/* Divider */}
				<div className="h-0.5 bg-[#FFFFFF14]"></div>
				{hook.tab == 'worked' && canSeeActivity && (
					<Container fullWidth={fullWidth} className="py-8">
						<div className={clsxm('flex  justify-start items-center gap-4')}>
							{Object.keys(activityScreens).map((filter, i) => (
								<div key={i} className="flex cursor-pointer justify-start items-center gap-4">
									{i !== 0 && <VerticalSeparator />}
									<div
										className={clsxm(
											'text-gray-500',
											activityFilter == filter && 'text-black dark:text-white'
										)}
										onClick={() => changeActivityFilter(filter as FilterTab)}
									>
										{filter}
									</div>
								</div>
							))}
						</div>
					</Container>
				)}

				<Container fullWidth={fullWidth} className="mb-10">
					{activityScreens[activityFilter] ?? null}
				</Container>
			</MainLayout>
		</>
	);
});

function UserProfileDetail({ member }: { member?: OT_Member }) {
	const user = useMemo(() => member?.employee.user, [member?.employee.user]);
	const userName = `${user?.firstName || ''} ${user?.lastName || ''}`;
	const imgUrl = user?.image?.thumbUrl || user?.image?.fullUrl || user?.imageUrl;
	const imageUrl = useMemo(() => imgUrl, [imgUrl]);
	const size = 100;
	const { timerStatus } = useTimer();
	const timerStatusValue: ITimerStatusEnum = useMemo(() => {
		return getTimerStatusValue(timerStatus, member, false);
	}, [timerStatus, member]);

	return (
		<div className="flex items-center mb-4 space-x-4 md:mb-0">
			<div
				className={clsx(
					` w-[100px] h-[100px]`, // removed the size variable from width and height, as passing variables is not supported by tailwind
					'flex justify-center items-center relative',
					'rounded-full text-white',
					'shadow-md text-7xl dark:text-6xl font-thin font-PlusJakartaSans ',
					!imageUrl && 'dark:border-[0.375rem] dark:border-[#26272C]'
				)}
				style={{
					backgroundColor: `${stc(userName)}80`
				}}
			>
				{imageUrl && isValidUrl(imageUrl) ? (
					<Avatar
						size={size}
						className="relative dark:border-[0.375rem] dark:border-[#26272C]"
						imageUrl={imageUrl}
						alt={userName}
						imageTitle={userName.charAt(0)}
					>
						<TimerStatus
							status={timerStatusValue}
							className="absolute z-20 bottom-3 right-[10%] -mb-5 border-[0.2956rem] border-white dark:border-[#26272C]"
							tooltipClassName="mt-24 dark:mt-20 mr-3"
						/>
					</Avatar>
				) : (
					<>
						{imgTitle(userName).charAt(0)}
						<TimerStatus
							status={timerStatusValue}
							className="absolute z-20 border-[0.2956rem] border-white dark:border-[#26272C]"
							tooltipClassName="absolute -bottom-[0.625rem] dark:-bottom-[0.75rem] right-[10%] w-[1.875rem] h-[1.875rem] rounded-full"
						/>
					</>
				)}
			</div>

			<div className="flex flex-col gap-3.5">
				<Text.Heading as="h3" className="text-2xl md:text-4xl">
					{user?.firstName} {user?.lastName}
				</Text.Heading>
				<Text className="text-lg text-gray-500">{user?.email}</Text>
			</div>
		</div>
	);
}

export default withAuthentication(Profile, { displayName: 'ProfilePage' });
