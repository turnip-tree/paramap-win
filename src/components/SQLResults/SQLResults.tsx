import { Show } from 'solid-js';
import type { ParsedSQL, ViewMode } from '../../types';
import ViewModeSelector from '../ViewModeSelector/ViewModeSelector';
import SQLSelector from '../SQLSelector/SQLSelector';
import ExtractedSQLView from '../ExtractedSQLView/ExtractedSQLView';
import ExecutableSQLView from '../ExecutableSQLView/ExecutableSQLView';
import ParameterTable from '../ParameterTable/ParameterTable';
import './SQLResults.css';

interface SQLResultsProps {
  sqlList: ParsedSQL[];
  selectedIndex: number;
  viewMode: ViewMode;
  onSelectSQL: (index: number) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

const SQLResults = (props: SQLResultsProps) => {
  const currentSQL = (): ParsedSQL | null => {
    return props.sqlList[props.selectedIndex] || null;
  };

  return (
    <div class="results-section">
      <Show when={props.sqlList.length > 1}>
        <SQLSelector
          sqlList={props.sqlList}
          selectedIndex={props.selectedIndex}
          onSelect={props.onSelectSQL}
        />
      </Show>

      <ViewModeSelector
        currentMode={props.viewMode}
        onModeChange={props.onViewModeChange}
      />

      <Show when={currentSQL()}>
        {(sql) => (
          <>
            <Show when={props.viewMode === 'all' || props.viewMode === 'sql'}>
              <ExtractedSQLView sql={sql()} />
            </Show>

            <Show when={props.viewMode === 'all' || props.viewMode === 'bound'}>
              <ExecutableSQLView sql={sql()} />
            </Show>

            <Show when={props.viewMode === 'all' || props.viewMode === 'table'}>
              <ParameterTable sql={sql()} />
            </Show>
          </>
        )}
      </Show>
    </div>
  );
};

export default SQLResults;
