import type { ViewMode } from '../../types';
import './ViewModeSelector.css';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const ViewModeSelector = (props: ViewModeSelectorProps) => {
  const modes: { value: ViewMode; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'sql', label: 'SQL Only' },
    { value: 'bound', label: 'Executable SQL' },
    { value: 'table', label: 'Parameter Table' },
  ];

  return (
    <div class="view-mode-selector">
      <label>View Mode:</label>
      <div class="view-mode-buttons">
        {modes.map((mode) => (
          <button
            classList={{ active: props.currentMode === mode.value }}
            onClick={() => props.onModeChange(mode.value)}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ViewModeSelector;
