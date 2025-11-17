import { useState } from "react";

interface ColorCustomizerProps {
    onColorChange: (colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
    }) => void;
}

const ColorCustomizer = ({ onColorChange }: ColorCustomizerProps) => {
    const [colors, setColors] = useState({
        primary: '#3b82f6',    // blue-600
        secondary: '#8b5cf6',  // purple-600
        accent: '#10b981',     // green-500
        background: '#000000'  // black
    });

    const [isOpen, setIsOpen] = useState(false);

    const handleColorChange = (colorType: keyof typeof colors, value: string) => {
        const newColors = { ...colors, [colorType]: value };
        setColors(newColors);
        onColorChange(newColors);
        
        // Apply colors to CSS variables
        document.documentElement.style.setProperty(`--custom-${colorType}`, value);
    };

    const presetThemes = [
        { name: 'Professional Blue', primary: '#3b82f6', secondary: '#1e40af', accent: '#10b981', background: '#000000' },
        { name: 'Modern Purple', primary: '#8b5cf6', secondary: '#6366f1', accent: '#ec4899', background: '#000000' },
        { name: 'Classic Green', primary: '#10b981', secondary: '#059669', accent: '#3b82f6', background: '#000000' },
        { name: 'Bold Red', primary: '#ef4444', secondary: '#dc2626', accent: '#f59e0b', background: '#000000' },
        { name: 'Dark Mode', primary: '#6366f1', secondary: '#8b5cf6', accent: '#10b981', background: '#1f2937' },
    ];

    const applyPreset = (theme: typeof presetThemes[0]) => {
        setColors(theme);
        onColorChange(theme);
        Object.entries(theme).forEach(([key, value]) => {
            if (key !== 'name') {
                document.documentElement.style.setProperty(`--custom-${key}`, value);
            }
        });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-900 rounded-lg shadow-md px-4 py-2 flex items-center gap-2 hover:shadow-lg transition-shadow border border-gray-800"
                title="Customize Colors"
            >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span className="text-sm font-medium text-white">Customize Colors</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-gray-900 rounded-lg shadow-xl p-6 z-50 min-w-[320px] border border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Color Customization</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Preset Themes */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Preset Themes</label>
                        <div className="grid grid-cols-2 gap-2">
                            {presetThemes.map((theme) => (
                                <button
                                    key={theme.name}
                                    onClick={() => applyPreset(theme)}
                                    className="p-3 border border-gray-700 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left bg-gray-800"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-1">
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.primary }}></div>
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.secondary }}></div>
                                            <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.accent }}></div>
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium text-gray-300">{theme.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Color Pickers */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Primary Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={colors.primary}
                                    onChange={(e) => handleColorChange('primary', e.target.value)}
                                    className="w-12 h-12 rounded cursor-pointer border border-gray-700"
                                />
                                <input
                                    type="text"
                                    value={colors.primary}
                                    onChange={(e) => handleColorChange('primary', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Secondary Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={colors.secondary}
                                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                                    className="w-12 h-12 rounded cursor-pointer border border-gray-700"
                                />
                                <input
                                    type="text"
                                    value={colors.secondary}
                                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Accent Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={colors.accent}
                                    onChange={(e) => handleColorChange('accent', e.target.value)}
                                    className="w-12 h-12 rounded cursor-pointer border border-gray-700"
                                />
                                <input
                                    type="text"
                                    value={colors.accent}
                                    onChange={(e) => handleColorChange('accent', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Background Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={colors.background}
                                    onChange={(e) => handleColorChange('background', e.target.value)}
                                    className="w-12 h-12 rounded cursor-pointer border border-gray-700"
                                />
                                <input
                                    type="text"
                                    value={colors.background}
                                    onChange={(e) => handleColorChange('background', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            const defaultColors = {
                                primary: '#3b82f6',
                                secondary: '#8b5cf6',
                                accent: '#10b981',
                                background: '#000000'
                            };
                            setColors(defaultColors);
                            onColorChange(defaultColors);
                            Object.entries(defaultColors).forEach(([key, value]) => {
                                document.documentElement.style.setProperty(`--custom-${key}`, value);
                            });
                        }}
                        className="mt-4 w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium border border-gray-700"
                    >
                        Reset to Default
                    </button>
                </div>
            )}
        </div>
    );
};

export default ColorCustomizer;

