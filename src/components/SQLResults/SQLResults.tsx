import { Show, createSignal } from 'solid-js';
import type { ParsedSQL } from '../../types';
import SQLSelector from '../SQLSelector/SQLSelector';
import ExecutableSQLView from '../ExecutableSQLView/ExecutableSQLView';
import ParameterTable from '../ParameterTable/ParameterTable';
import './SQLResults.css';

interface SQLResultsProps {
  sqlList: ParsedSQL[];
  selectedIndex: number;
  onSelectSQL: (index: number) => void;
  onParameterChange?: (sqlIndex: number, paramIndex: number, value: any) => void;
}

const SQLResults = (props: SQLResultsProps) => {
  const [showParameterTable, setShowParameterTable] = createSignal(false);

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

      <Show when={currentSQL()}>
        {(sql) => (
          <div class={`sql-parameter-container ${showParameterTable() ? 'side-by-side' : 'full-width'}`}>
            <div class="executable-sql-section">
              <ExecutableSQLView
                sql={sql()}
                showParameterTable={showParameterTable()}
                onToggleParameterTable={() => setShowParameterTable(!showParameterTable())}
              />
            </div>

            <Show when={showParameterTable()}>
              <div class="parameter-section">
                <ParameterTable
                  sql={sql()}
                  onParameterChange={props.onParameterChange ? (paramIndex, value) => {
                    props.onParameterChange!(props.selectedIndex, paramIndex, value);
                  } : undefined}
                />
              </div>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
};

export default SQLResults;
