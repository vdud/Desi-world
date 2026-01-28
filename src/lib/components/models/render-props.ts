export type RenderProps<TRef = any> = {
	fallback?: () => any;
	error?: (args: { error: unknown }) => any;
	children?: (args: { ref: TRef }) => any;
	ref?: TRef;
};
