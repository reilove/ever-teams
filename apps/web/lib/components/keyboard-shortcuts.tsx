/* eslint-disable no-mixed-spaces-and-tabs */
import { HostKeys, HostKeysMapping, useDetectOS, useHotkeys, useModal } from '@app/hooks';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@components/ui/dialog';
import { useCallback } from 'react';
import { Button } from './button';
import { KeyboardLinearIcon } from './svgs';
import { Tooltip } from './tooltip';
import { useTranslations } from 'next-intl';

export function KeyboardShortcuts() {
	const t = useTranslations();
	const { isOpen, closeModal, openModal } = useModal();

	const { os } = useDetectOS();

	const toggle = useCallback(() => {
		if (isOpen) {
			closeModal();
		} else {
			openModal();
		}
	}, [isOpen, closeModal, openModal]);

	// Handling Hotkeys
	useHotkeys(HostKeys.SHORTCUT_LIST, toggle);

	return (
		<>
			<Tooltip label={t('common.KEYBOARD_SHORTCUTS')} placement="auto">
				<Button variant="ghost" className="min-w-0 p-0 m-0" onClick={toggle}>
					<KeyboardLinearIcon className="stroke-dark--theme-light dark:stroke-white w-7 h-7" />
				</Button>
			</Tooltip>

			<Dialog open={isOpen} defaultOpen={isOpen} onOpenChange={toggle}>
				<DialogContent className="border-[#0000001A] dark:border-[#26272C]">
					<DialogHeader className="flex flex-col gap-5">
						<DialogTitle>{t('common.KEYBOARD_SHORTCUTS')}</DialogTitle>
						<DialogDescription className="flex flex-col gap-2">
							{HostKeysMapping.map((item, index) => (
								<div key={index} className="flex flex-col gap-2">
									<p className="text-base font-normal text-black dark:text-light--theme-light">
										{item.heading}
									</p>

									{item.keySequence.map((keySeq, keySeqIndex) => (
										<div
											className="flex flex-row items-center justify-between"
											key={`key-seq-${keySeqIndex}`}
										>
											<div>
												<p className="text-sm font-normal">{keySeq.label}</p>
											</div>
											<div className="flex flex-row gap-2">
												{[...(os === 'Mac' ? keySeq.sequence.MAC : keySeq.sequence.OTHER)].map(
													(label) => (
														<div
															key={label}
															className="border rounded-md py-1 px-3 text-dark-high dark:text-white min-w-[2.5rem] text-center"
														>
															{label}
														</div>
													)
												)}
											</div>
										</div>
									))}

									{/* Divider */}
									{index !== HostKeysMapping.length - 1 && (
										<div className="h-[0.0625rem] bg-[#F2F2F2] dark:bg-[#26272C] w-full mx-auto"></div>
									)}
								</div>
							))}
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</>
	);
}
