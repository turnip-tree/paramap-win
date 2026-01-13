import { For } from 'solid-js';
import type { ParsedSQL } from '../../types';
import { formatParameterDisplay } from '../../utils/formatUtils';
import './ParameterTable.css';

interface ParameterTableProps {
  sql: ParsedSQL;
}

const ParameterTable = (props: ParameterTableProps) => {
  return (
    <div class="output-section">
      <h2 class="section-title">Parameter Mapping</h2>
      <div class="table-container">
        <table class="parameter-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Placeholder Context</th>
              <th>Value</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.sql.parameters}>
              {(param) => (
                <tr>
                  <td class="number-cell">{param.index}</td>
                  <td class="context-cell">
                    <code>{param.placeholderContext}</code>
                  </td>
                  <td class="value-cell">
                    <code>{formatParameterDisplay(param.value)}</code>
                  </td>
                  <td class="type-cell">{param.type}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParameterTable;
