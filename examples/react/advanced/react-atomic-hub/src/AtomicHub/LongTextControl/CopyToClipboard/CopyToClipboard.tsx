import React, { FunctionComponent } from "react";
import {
	CopyToClipboard as CopyToClipboardComponent,
	Props as CopyToClipboardComponentProps,
} from "react-copy-to-clipboard";

interface Props extends CopyToClipboardComponentProps {
	icon: JSX.Element;
	onCopy?: (text: string) => void;
}

export const CopyToClipboard: FunctionComponent<Props> = (props) => {
	const { icon, onCopy, ...other } = props;
	return (
		<CopyToClipboardComponent
			{...other}
			onCopy={(text) => {
				if (onCopy) onCopy(text);
			}}
		>
			{icon}
		</CopyToClipboardComponent>
	);
};
