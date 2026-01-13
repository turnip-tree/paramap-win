import { createSignal } from 'solid-js';
import { parseMyBatisLogs } from '../parser';
import type { ParsedSQL } from '../types';

/**
 * MyBatisログのパース処理を管理するカスタムフック
 */
export function useMyBatisParser() {
  const [parsedResults, setParsedResults] = createSignal<ParsedSQL[]>([]);
  const [selectedSQLIndex, setSelectedSQLIndex] = createSignal(0);

  /**
   * ログテキストをパースしてSQLを抽出
   */
  const parseLogs = (logText: string): void => {
    if (!logText.trim()) {
      setParsedResults([]);
      return;
    }

    const results = parseMyBatisLogs(logText);
    setParsedResults(results);
    
    if (results.length > 0) {
      setSelectedSQLIndex(0);
    }
  };

  /**
   * 現在選択されているSQLを取得
   */
  const getCurrentSQL = (): ParsedSQL | null => {
    const results = parsedResults();
    const index = selectedSQLIndex();
    return results[index] || null;
  };

  /**
   * SQLの選択インデックスを設定（範囲チェック付き）
   */
  const selectSQL = (index: number): void => {
    const results = parsedResults();
    if (index >= 0 && index < results.length) {
      setSelectedSQLIndex(index);
    }
  };

  return {
    parsedResults,
    selectedSQLIndex,
    parseLogs,
    getCurrentSQL,
    selectSQL,
  };
}
