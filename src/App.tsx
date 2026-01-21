import { createSignal, Show } from 'solid-js';
import type { ParserConfig } from './parser';
import { useMyBatisParser } from './hooks/useMyBatisParser';
import AppHeader from './components/AppHeader/AppHeader';
import LogInput from './components/LogInput/LogInput';
import SQLResults from './components/SQLResults/SQLResults';
import ErrorMessage from './components/ErrorMessage/ErrorMessage';
import ParserSettings from './components/ParserSettings';
import './App.css';

function App() {
  const [logInput, setLogInput] = createSignal('');
  
  const {
    parsedResults,
    selectedSQLIndex,
    parseLogs,
    selectSQL,
    parserConfig,
    updateConfig,
    updateParameter,
  } = useMyBatisParser();

  const handleConvert = () => {
    parseLogs(logInput(), parserConfig());
  };

  const handleConfigChange = (config: ParserConfig) => {
    updateConfig(config);
    // 設定変更時にも再パース
    if (logInput().trim()) {
      parseLogs(logInput(), config);
    }
  };

  return (
    <div class="app-container">
      <AppHeader />

      <div class="main-content">
        <ParserSettings
          config={parserConfig()}
          onConfigChange={handleConfigChange}
        />
        <LogInput
          value={logInput()}
          onInput={setLogInput}
          onConvert={handleConvert}
        />

        <Show when={parsedResults().length > 0}>
          <SQLResults
            sqlList={parsedResults()}
            selectedIndex={selectedSQLIndex()}
            onSelectSQL={selectSQL}
            onParameterChange={updateParameter}
          />
        </Show>

        <Show when={parsedResults().length === 0 && logInput().trim().length > 0}>
          <ErrorMessage />
        </Show>
      </div>
    </div>
  );
}

export default App;
