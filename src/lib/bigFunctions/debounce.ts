
//TypeScript DebounceFunction
type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): DebouncedFunction<T> {
	let timeout: ReturnType<typeof setTimeout>;
	return function executedFunction(this: unknown, ...args: Parameters<T>) {
		const later = () => {
			timeout = undefined!;
			func.apply(this, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}
