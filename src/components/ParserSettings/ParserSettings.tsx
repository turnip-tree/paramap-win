import { createSignal, Show } from 'solid-js';
import type { ParserConfig } from '../../parser';
import './ParserSettings.css';

interface ParserSettingsProps {
  config: ParserConfig;
  onConfigChange: (config: ParserConfig) => void;
}

const ParserSettings = (props: ParserSettingsProps) => {
  const [isExpanded, setIsExpanded] = createSignal(false);
  const [preparingPrefix, setPreparingPrefix] = createSignal(props.config.preparingPrefix);
  const [parametersPrefix, setParametersPrefix] = createSignal(props.config.parametersPrefix);

  const handlePreparingChange = (value: string) => {
    setPreparingPrefix(value);
    props.onConfigChange({
      preparingPrefix: value,
      parametersPrefix: parametersPrefix(),
    });
  };

  const handleParametersChange = (value: string) => {
    setParametersPrefix(value);
    props.onConfigChange({
      preparingPrefix: preparingPrefix(),
      parametersPrefix: value,
    });
  };

  const handleReset = () => {
    const defaultConfig = {
      preparingPrefix: 'Preparing:',
      parametersPrefix: 'Parameters:',
    };
    setPreparingPrefix(defaultConfig.preparingPrefix);
    setParametersPrefix(defaultConfig.parametersPrefix);
    props.onConfigChange(defaultConfig);
  };

  return (
    <div class="parser-settings">
      <button
        class="settings-toggle"
        onClick={() => setIsExpanded(!isExpanded())}
        type="button"
      >
        <span class="settings-icon">{isExpanded() ? '▼' : '▶'}</span>
        パーサー設定
      </button>

      <Show when={isExpanded()}>
        <div class="settings-content">
          <div class="settings-row">
            <label for="preparing-prefix" class="settings-label">
              Preparing プレフィックス:
            </label>
            <input
              id="preparing-prefix"
              type="text"
              class="settings-input"
              value={preparingPrefix()}
              onInput={(e) => handlePreparingChange(e.currentTarget.value)}
              placeholder="Preparing:"
            />
          </div>

          <div class="settings-row">
            <label for="parameters-prefix" class="settings-label">
              Parameters プレフィックス:
            </label>
            <input
              id="parameters-prefix"
              type="text"
              class="settings-input"
              value={parametersPrefix()}
              onInput={(e) => handleParametersChange(e.currentTarget.value)}
              placeholder="Parameters:"
            />
          </div>

          <div class="settings-row">
            <button
              class="settings-reset-button"
              onClick={handleReset}
              type="button"
            >
              デフォルトに戻す
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default ParserSettings;
