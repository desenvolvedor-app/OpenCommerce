import { Button } from '../ui/button';

export function ThemeToggle() {
    return (
        <div className="flex items-center space-x-2">
            <Button
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-700"
                onClick={() => {
                    document.documentElement.classList.toggle('dark');
                }}
            >
                Toggle Theme
            </Button>
        </div>
    );
}
