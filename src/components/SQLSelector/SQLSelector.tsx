import { For } from 'solid-js';
import type { ParsedSQL } from '../../types';
import './SQLSelector.css';

interface SQLSelectorProps {
  sqlList: ParsedSQL[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const SQLSelector = (props: SQLSelectorProps) => {
  return (
    <div class="sql-selector">
      <label>Select SQL:</label>
      <select
        value={props.selectedIndex}
        onChange={(e) => props.onSelect(parseInt(e.currentTarget.value))}
      >
        <For each={props.sqlList}>
          {(_, index) => (
            <option value={index()}>SQL #{index() + 1}</option>
          )}
        </For>
      </select>
    </div>
  );
};

export default SQLSelector;
