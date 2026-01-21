import { For, createSignal } from 'solid-js';
import type { ParsedSQL, ParsedParameter } from '../../types';
import { formatParameterDisplay } from '../../utils/formatUtils';
import './ParameterTable.css';

interface ParameterTableProps {
  sql: ParsedSQL;
  onParameterChange?: (index: number, value: any) => void;
}

const ParameterTable = (props: ParameterTableProps) => {
  const [editingIndex, setEditingIndex] = createSignal<number | null>(null);
  const [editValue, setEditValue] = createSignal<string>('');

  const handleValueClick = (param: ParsedParameter) => {
    setEditingIndex(param.index);
    setEditValue(String(param.value === null ? '' : param.value));
  };

  const handleValueChange = (newValue: string) => {
    setEditValue(newValue);
  };

  const handleValueBlur = (param: ParsedParameter) => {
    const newValue = parseValueFromInput(editValue(), param.type);
    if (props.onParameterChange) {
      props.onParameterChange(param.index - 1, newValue);
    }
    setEditingIndex(null);
  };

  const handleValueKeyDown = (e: KeyboardEvent, param: ParsedParameter) => {
    if (e.key === 'Enter') {
      handleValueBlur(param);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  const parseValueFromInput = (input: string, type: string): any => {
    const trimmed = input.trim();
    if (trimmed === '' || trimmed.toLowerCase() === 'null') {
      return null;
    }

    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('integer') || lowerType.includes('int')) {
      const parsed = parseInt(trimmed, 10);
      return isNaN(parsed) ? trimmed : parsed;
    }
    
    if (lowerType.includes('bigdecimal') || lowerType.includes('decimal') || lowerType.includes('double') || lowerType.includes('float')) {
      const parsed = parseFloat(trimmed);
      return isNaN(parsed) ? trimmed : parsed;
    }
    
    if (lowerType.includes('boolean') || lowerType.includes('bool')) {
      return trimmed.toLowerCase() === 'true';
    }
    
    // String type - remove quotes if present
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1);
    }
    
    return trimmed;
  };

  return (
    <div class="output-section">
      <div class="table-container">
        <table class="parameter-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Placeholder</th>
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
                    {editingIndex() === param.index ? (
                      <input
                        type="text"
                        class="parameter-input"
                        value={editValue()}
                        onInput={(e) => handleValueChange(e.currentTarget.value)}
                        onBlur={() => handleValueBlur(param)}
                        onKeyDown={(e) => handleValueKeyDown(e, param)}
                        autofocus
                      />
                    ) : (
                      <code
                        class="parameter-value-editable"
                        onClick={() => handleValueClick(param)}
                        title="クリックして編集"
                      >
                        {formatParameterDisplay(param.value)}
                      </code>
                    )}
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
