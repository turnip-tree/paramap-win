import { createSignal, Show } from 'solid-js';
import type { ViewMode } from './types';
import { useMyBatisParser } from './hooks/useMyBatisParser';
import AppHeader from './components/AppHeader/AppHeader';
import LogInput from './components/LogInput/LogInput';
import SQLResults from './components/SQLResults/SQLResults';
import ErrorMessage from './components/ErrorMessage/ErrorMessage';
import './App.css';

function App() {
  const [logInput, setLogInput] = createSignal('');
  const [viewMode, setViewMode] = createSignal<ViewMode>('bound');
  
  const {
    parsedResults,
    selectedSQLIndex,
    parseLogs,
    selectSQL,
  } = useMyBatisParser();

  const handleConvert = () => {
    parseLogs(logInput());
    // Reset view mode to 'bound' (Executable SQL) on each conversion
    setViewMode('bound');
  };

  return (
    <div class="app-container">
      <AppHeader />

      <div class="main-content">
        <LogInput
          value={logInput()}
          onInput={setLogInput}
          onConvert={handleConvert}
        />

        <Show when={parsedResults().length > 0}>
          <SQLResults
            sqlList={parsedResults()}
            selectedIndex={selectedSQLIndex()}
            viewMode={viewMode()}
            onSelectSQL={selectSQL}
            onViewModeChange={setViewMode}
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
